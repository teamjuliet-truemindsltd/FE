import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Loader, ChevronLeft, Calendar, FileText, Video, Type, ChevronDown, ChevronRight, CheckCircle, Upload, FileCheck, MessageSquare, Plus, User, Send } from 'lucide-react';
import { coursesService, type Course, type CourseModule } from '../services/coursesService';
import { lessonsService, type Lesson, ContentType } from '../services/lessonsService';
import { enrollmentsService } from '../services/enrollmentsService';
import { assignmentsService, type Assignment, type Submission } from '../services/assignmentsService';
import { collaborationService, type Discussion } from '../services/collaborationService';
import { useAuthStore } from '../contexts/authContext';
import AppLayout from '../components/layout/AppLayout';
import { apiClient } from '../lib/apiClient';
import { Certificate } from '../components/ui/Certificate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ModuleWithLessons extends CourseModule {
  lessons: Lesson[];
  loadingLessons: boolean;
}

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscussionsLoading, setIsDiscussionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null); // Store active enrollment
  const [enrolled, setEnrolled] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'curriculum' | 'assignments' | 'discussions'>('curriculum');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
      if (user) {
        checkEnrollment(id);
      }
    }
  }, [id, user]);

  const fetchCourseDetails = async (courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const [courseData, modulesData, assignmentsData] = await Promise.all([
        coursesService.getCourseById(courseId),
        coursesService.getModules(courseId).catch(() => []),
        assignmentsService.getAssignmentsByCourse(courseId).catch(() => []),
      ]);

      setCourse(courseData);
      setModules(modulesData.map(m => ({ ...m, lessons: [], loadingLessons: false })));
      setAssignments(assignmentsData);

      if (modulesData.length > 0) {
        setExpandedModules(new Set([modulesData[0].id]));
        loadLessonsForModule(modulesData[0].id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load course details';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnrollment = async (courseId: string) => {
    if (!user) {
      setEnrolled(false);
      return;
    }
    try {
      const enrollments = await enrollmentsService.getUserEnrollments();
      const currentEnrollment = enrollments.find((e: any) => e.courseId === courseId);
      setEnrollment(currentEnrollment || null);
      setEnrolled(!!currentEnrollment);

      if (currentEnrollment && assignments.length > 0) {
        fetchUserSubmissions(assignments);
      }
    } catch {
      // Fail silently
    }
  };

  const fetchUserSubmissions = async (assignmentsList: Assignment[]) => {
    const subs: Record<string, Submission> = {};
    await Promise.all(assignmentsList.map(async (as) => {
      const sub = await assignmentsService.getMySubmission(as.id);
      if (sub) subs[as.id] = sub;
    }));
    setUserSubmissions(subs);
  };

  useEffect(() => {
    if (enrolled && assignments.length > 0) {
      fetchUserSubmissions(assignments);
    }
  }, [enrolled, assignments]);

  const loadLessonsForModule = async (moduleId: string) => {
    try {
      setModules(prev =>
        prev.map(m => m.id === moduleId ? { ...m, loadingLessons: true } : m)
      );
      
      const lessonsData = await lessonsService.getLessonsByModule(moduleId);
      
      setModules(prev =>
        prev.map(m => m.id === moduleId ? { ...m, lessons: lessonsData, loadingLessons: false } : m)
      );
    } catch (err) {
      console.error(`Failed to load lessons for module ${moduleId}:`, err);
      setModules(prev =>
        prev.map(m => m.id === moduleId ? { ...m, loadingLessons: false } : m)
      );
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
        loadLessonsForModule(moduleId);
      }
      return next;
    });
  };

  const handleEnrollCourse = async () => {
    if (!user) {
      // Redirect guests to login
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }
    if (!course) return;
    try {
      setEnrolling(true);
      await enrollmentsService.enrollInCourse(course.id);
      setEnrolled(true);
      // Refresh course data to get modules/lessons
      fetchCourseDetails(course.id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enroll';
      alert(errorMsg);
    } finally {
      setEnrolling(false);
    }
  };

  const downloadCertificate = async () => {
    if (!enrollment || !course || !user) return;
    setDownloadingCert(true);
    try {
      const element = document.getElementById('certificate-container');
      if (!element) return;
      
      const canvas = await html2canvas(element, { 
        scale: 3,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1056, 816],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 1056, 816);
      pdf.save(`${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      alert('Could not generate certificate at this time.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleFileUpload = async (assignmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(assignmentId);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ url: string }>('/media/upload/assignment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const submission = await assignmentsService.submitWork({
        assignmentId,
        contentUrl: response.data.url
      });

      setUserSubmissions(prev => ({ ...prev, [assignmentId]: submission }));
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert('Failed to upload assignment. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(null);
    }
  };

  const fetchDiscussions = async (courseId: string) => {
    try {
      setIsDiscussionsLoading(true);
      const data = await collaborationService.getAllDiscussions(courseId);
      setDiscussions(data);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setIsDiscussionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discussions' && id) {
      fetchDiscussions(id);
    }
  }, [activeTab, id]);

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newDiscussion.title.trim() || !newDiscussion.content.trim()) return;

    try {
      setIsPostingDiscussion(true);
      const discussion = await collaborationService.createDiscussion({
        ...newDiscussion,
        courseId: id
      });
      setDiscussions(prev => [discussion, ...prev]);
      setNewDiscussion({ title: '', content: '' });
      setShowDiscussionForm(false);
      alert('Discussion posted!');
    } catch (err) {
      alert('Failed to post discussion.');
    } finally {
      setIsPostingDiscussion(false);
    }
  };

  const getContentIcon = (type?: ContentType) => {
    switch (type) {
      case ContentType.VIDEO: return <Video className="w-4 h-4 text-primary-teal" />;
      case ContentType.DOCUMENT: return <FileText className="w-4 h-4 text-emerald-400" />;
      case ContentType.TEXT: return <Type className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-foreground/40" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-primary-teal animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !course) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Course not found'}</p>
          <Link to="/courses" className="text-primary-teal hover:opacity-80 mt-4 inline-block text-sm font-semibold">
            ← Back to Courses
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-2 text-sm text-foreground/40 mb-6">
        <Link to="/courses" className="hover:text-primary-teal transition flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Courses
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary-teal to-deep-teal relative flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white/10" />
              {enrolled && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-full shadow-lg">
                  <CheckCircle className="w-4 h-4" />
                  Enrolled
                </div>
              )}
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">{course.title}</h1>
              <p className="text-foreground/60 leading-relaxed mb-6">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-xl text-foreground/70">
                  <Calendar className="w-4 h-4 text-primary-teal" />
                  Updated {new Date(course.updatedAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-xl text-foreground/70">
                  <BookOpen className="w-4 h-4 text-primary-teal" />
                  {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === 'curriculum' ? 'text-primary-teal' : 'text-foreground/40 hover:text-foreground'
              }`}
            >
              Curriculum
              {activeTab === 'curriculum' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-teal rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === 'assignments' ? 'text-primary-teal' : 'text-foreground/40 hover:text-foreground'
              }`}
            >
              Assignments
              {activeTab === 'assignments' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-teal rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === 'discussions' ? 'text-primary-teal' : 'text-foreground/40 hover:text-foreground'
              }`}
            >
              Discussions
              {activeTab === 'discussions' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-teal rounded-t-full" />
              )}
            </button>
          </div>

          <div className="bg-surface rounded-2xl p-8 border border-border">
            {activeTab === 'curriculum' && (
              <>
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary-teal" />
                  Course Curriculum
                </h2>

                {modules.length === 0 ? (
                  <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed border-border">
                    <BookOpen className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                    <h3 className="text-foreground font-bold mb-2">Curriculum Reserved</h3>
                    <p className="text-foreground/40 max-w-sm mx-auto mb-8">
                      {enrolled 
                        ? 'The instructor is currently preparing the module content.' 
                        : 'Enroll to access the full curriculum and all course resources.'}
                    </p>
                    {!enrolled && (
                      <button 
                        onClick={handleEnrollCourse}
                        className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((mod, idx) => {
                      const isExpanded = expandedModules.has(mod.id);
                      return (
                        <div key={mod.id} className="border border-border rounded-2xl overflow-hidden bg-background">
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center gap-4 p-5 hover:bg-foreground/5 transition text-left"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary-teal/10 text-primary-teal flex items-center justify-center font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-foreground font-bold truncate">{mod.title}</h3>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-foreground/30 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-foreground/30 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="border-t border-border bg-surface/50 p-4 space-y-3">
                              {mod.loadingLessons ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader className="w-6 h-6 text-primary-teal animate-spin" />
                                </div>
                              ) : mod.lessons.length === 0 ? (
                                <p className="text-foreground/30 text-sm text-center py-4 italic">
                                  Module content arriving soon
                                </p>
                              ) : (
                                mod.lessons.map((lesson, lIdx) => (
                                  <Link
                                    key={lesson.id}
                                    to={enrolled ? `/lessons/${lesson.id}` : '#'}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition ${
                                      enrolled
                                        ? 'hover:bg-primary-teal/10 group cursor-pointer'
                                        : 'cursor-not-allowed opacity-40'
                                    }`}
                                  >
                                    <div className="p-2 bg-foreground/5 rounded-lg group-hover:bg-primary-teal/20 transition-colors">
                                      {getContentIcon(lesson.contentType)}
                                    </div>
                                    <span className="text-foreground/70 font-medium text-sm flex-1 group-hover:text-primary-teal transition-colors">{lesson.title}</span>
                                    <span className="text-foreground/30 text-xs">Section {lIdx + 1}</span>
                                  </Link>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'assignments' && (
              <>
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary-teal" />
                  Course Projects
                </h2>

                {assignments.length === 0 ? (
                  <div className="text-center py-16 bg-background rounded-2xl border-2 border-dashed border-border">
                    <FileText className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                    <h3 className="text-foreground font-bold mb-2">Projects Reserved</h3>
                    <p className="text-foreground/40 max-w-sm mx-auto mb-8">
                      {enrolled 
                        ? 'Project briefs will be released by the instructor soon.' 
                        : 'Enroll to access hands-on projects, assignments, and practical challenges.'}
                    </p>
                    {!enrolled && (
                      <button 
                        onClick={handleEnrollCourse}
                        className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {assignments.map((as) => {
                      const submission = userSubmissions[as.id];
                      return (
                        <div key={as.id} className="bg-background border border-border rounded-2xl p-6">
                          <div className="flex items-start justify-between gap-6 mb-6">
                            <div>
                              <h3 className="text-foreground font-bold text-xl mb-2">{as.title}</h3>
                              <p className="text-foreground/50 text-sm leading-relaxed">{as.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-primary-teal font-bold text-lg">{as.points} Points</div>
                              <div className="text-foreground/30 text-xs mt-1 font-medium">Due {new Date(as.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>

                          {!enrolled ? (
                            <div className="bg-surface rounded-xl p-4 text-center text-foreground/40 text-xs border border-dashed border-border font-medium">
                              Enroll in the course to view and submit this assessment
                            </div>
                          ) : submission ? (
                            <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                  <FileCheck className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div>
                                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">Successfully Submitted</div>
                                  <a href={submission.contentUrl} target="_blank" rel="noopener noreferrer" className="text-foreground/40 text-xs hover:text-primary-teal transition font-medium">Review Submission</a>
                                </div>
                              </div>
                              <div className="text-right">
                                {submission.status === 'GRADED' ? (
                                  <>
                                    <div className="text-foreground font-bold text-lg">{submission.grade} <span className="text-foreground/30 text-sm">/ {as.points}</span></div>
                                    <div className="text-foreground/40 text-xs italic mt-1">"{submission.feedback || 'Excellent work.'}"</div>
                                  </>
                                ) : (
                                  <div className="text-primary-teal text-xs font-bold bg-primary-teal/10 px-4 py-1.5 rounded-full">Grading in Progress</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <label className={`w-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer transition-all ${
                                isUploading === as.id ? 'border-primary-teal/50 bg-primary-teal/5' : 'border-border hover:border-primary-teal/50 hover:bg-primary-teal/5'
                              }`}>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => handleFileUpload(as.id, e)}
                                  disabled={isUploading !== null}
                                />
                                {isUploading === as.id ? (
                                  <>
                                    <Loader className="w-10 h-10 text-primary-teal animate-spin mb-3" />
                                    <span className="text-primary-teal font-bold">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-10 h-10 text-foreground/20 mb-3 group-hover:text-primary-teal transition-colors" />
                                    <span className="text-foreground font-bold text-lg">Submit Your Project</span>
                                    <span className="text-foreground/40 text-xs mt-2 font-medium">Drop files or click to upload (PDF, DOCX, ZIP)</span>
                                  </>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'discussions' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-primary-teal" />
                    Community Insights
                  </h2>
                  <button
                    onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Start Topic
                  </button>
                </div>

                {showDiscussionForm && (
                  <form onSubmit={handleCreateDiscussion} className="bg-background border border-primary-teal/30 rounded-2xl p-6 mb-10 space-y-5 animate-in slide-in-from-top-4 duration-300">
                    <div>
                      <label className="block text-sm font-bold text-foreground/70 mb-2">Topic Heading</label>
                      <input
                        type="text"
                        value={newDiscussion.title}
                        onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="What's on your mind?"
                        className="w-full px-5 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-teal transition shadow-sm font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-foreground/70 mb-2">Message</label>
                      <textarea
                        value={newDiscussion.content}
                        onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Detailed explanation or question..."
                        rows={4}
                        className="w-full px-5 py-3 bg-surface border border-border rounded-xl text-foreground focus:outline-none focus:border-primary-teal transition shadow-sm resize-none font-medium"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDiscussionForm(false)}
                        className="px-6 py-2 text-foreground/40 hover:text-foreground transition text-xs font-bold"
                      >
                        Discard
                      </button>
                      <button
                        type="submit"
                        disabled={isPostingDiscussion}
                        className="flex items-center gap-2 px-8 py-2.5 btn-primary disabled:opacity-50 rounded-xl text-xs font-bold"
                      >
                        {isPostingDiscussion ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Post to Community
                      </button>
                    </div>
                  </form>
                )}

                {isDiscussionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-primary-teal animate-spin" />
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-20 bg-background rounded-2xl border-2 border-dashed border-border">
                    <MessageSquare className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
                    <h3 className="text-foreground font-bold mb-2">Insights Private</h3>
                    <p className="text-foreground/40 max-w-sm mx-auto mb-8">
                      {enrolled 
                        ? 'Connect with peers. This space is waiting for the first conversation.' 
                        : 'Join the course to share insights, ask questions, and grow with the community.'}
                    </p>
                    {!enrolled && (
                      <button 
                        onClick={handleEnrollCourse}
                        className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discussions.map((disc) => (
                      <Link
                        key={disc.id}
                        to={`/discussions?id=${disc.id}`}
                        className="block group bg-background border border-border rounded-2xl p-6 hover:border-primary-teal/40 hover:shadow-xl hover:shadow-primary-teal/5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <h3 className="text-foreground font-bold text-lg group-hover:text-primary-teal transition mb-2 tracking-tight">{disc.title}</h3>
                            <p className="text-foreground/50 text-sm line-clamp-2 leading-relaxed">{disc.content}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-teal/10 text-primary-teal text-[10px] font-black uppercase tracking-widest rounded-lg mb-3">
                              Thread
                              <ChevronRight className="w-3 h-3" />
                            </div>
                            <div className="text-foreground/30 text-[10px] flex items-center justify-end gap-1.5 font-bold">
                              <Calendar className="w-3 h-3" />
                              {new Date(disc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border/50 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-teal/10 border border-primary-teal/20 flex items-center justify-center text-[10px] font-bold text-primary-teal uppercase">
                            {disc.user?.firstName?.charAt(0) || <User className="w-4 h-4" />}
                          </div>
                          <span className="text-foreground/40 text-xs font-semibold">
                            By <span className="text-foreground">{disc.user ? `${disc.user.firstName} ${disc.user.lastName}` : `User #${disc.createdBy}`}</span>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-2xl p-8 border border-border sticky top-24">
            {enrolled ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-foreground font-bold text-xl">Member Access</h3>
                  <p className="text-foreground/40 text-sm mt-1">
                    {enrollment?.isCompleted ? 'You have graduated from this course!' : 'Review your progress or continue learning.'}
                  </p>
                </div>
                
                {enrollment?.isCompleted && (
                  <button
                    onClick={downloadCertificate}
                    disabled={downloadingCert}
                    className="block w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-2xl text-white font-bold text-center shadow-xl shadow-emerald-500/20 transition-all mb-4"
                  >
                    {downloadingCert ? 'Generating...' : 'Download Certificate 🏆'}
                  </button>
                )}

                <Link
                  to="/my-courses"
                  className="block w-full py-4 btn-primary rounded-2xl text-white font-bold text-center shadow-xl shadow-primary-teal/20 transition-all"
                >
                  Go to Classroom
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleEnrollCourse}
                  disabled={enrolling || (!!user && Number(course.instructorId) === Number(user.id))}
                  className="w-full py-5 btn-primary disabled:opacity-50 rounded-[24px] font-bold text-lg shadow-2xl shadow-primary-teal/20 transition-all"
                >
                  {!user ? 'Sign In to Begin' : (Number(course.instructorId) === Number(user.id) ? 'Instructor View' : (enrolling ? 'Setting up access...' : 'Join Course'))}
                </button>
                {Number(course.instructorId) === Number(user?.id) && (
                  <p className="text-center text-foreground/30 text-xs mt-4 font-medium uppercase tracking-widest">
                    Course Creator Mode
                  </p>
                )}
              </>
            )}

            <hr className="border-border/50 my-6" />

            <div>
              <h4 className="text-foreground font-bold mb-4 text-xs uppercase tracking-widest opacity-40">At a glance:</h4>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-center gap-3 text-foreground/60">
                  <BookOpen className="w-4 h-4 text-primary-teal" />
                  {modules.length} Detailed Modules
                </li>
                <li className="flex items-center gap-3 text-foreground/60">
                  <FileText className="w-4 h-4 text-primary-teal" />
                  {assignments.length} Project Assignments
                </li>
                <li className="flex items-center gap-3 text-foreground/60">
                  <Calendar className="w-4 h-4 text-primary-teal" />
                  Lifetime Community Access
                </li>
              </ul>
            </div>
          </div>

          {course.instructor && (
            <div className="bg-surface rounded-2xl p-8 border border-border">
              <h4 className="text-foreground/30 text-xs font-black uppercase tracking-widest mb-6">Facilitator</h4>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-teal to-deep-teal flex items-center justify-center text-lg font-bold text-white shadow-lg">
                  {course.instructor.firstName?.charAt(0)}{course.instructor.lastName?.charAt(0)}
                </div>
                <div>
                  <h5 className="text-foreground font-bold text-lg">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </h5>
                  <p className="text-foreground/40 text-sm font-medium">Verified Expert</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Certificate for Rendering */}
      {enrollment?.isCompleted && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <Certificate
            studentName={`${user?.firstName} ${user?.lastName}`}
            courseName={course.title}
            dateCompleted={new Date(enrollment.completedAt).toLocaleDateString()}
            certificateId={enrollment.certificateId}
          />
        </div>
      )}

    </AppLayout>
  );
};

export default CourseDetailsPage;
