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
  const [enrolled, setEnrolled] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'curriculum' | 'assignments' | 'discussions'>('curriculum');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
      checkEnrollment(id);
    }
  }, [id]);

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
    try {
      const enrollments = await enrollmentsService.getUserEnrollments();
      const isEnrolled = enrollments.some(e => e.courseId === courseId);
      setEnrolled(isEnrolled);

      if (isEnrolled && assignments.length > 0) {
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
      case ContentType.VIDEO: return <Video className="w-4 h-4 text-blue-400" />;
      case ContentType.DOCUMENT: return <FileText className="w-4 h-4 text-emerald-400" />;
      case ContentType.TEXT: return <Type className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !course) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Course not found'}</p>
          <Link to="/courses" className="text-blue-400 hover:text-blue-300 mt-4 inline-block text-sm font-semibold">
            ← Back to Courses
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/courses" className="hover:text-white transition flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Courses
        </Link>
        <span>/</span>
        <span className="text-white font-medium truncate">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50">
            <div className="h-48 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 relative flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white/20" />
              {enrolled && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4" />
                  Enrolled
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-3">{course.title}</h1>
              <p className="text-slate-300 leading-relaxed mb-4">{course.description}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 rounded-full text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Updated {new Date(course.updatedAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 rounded-full text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === 'curriculum' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Curriculum
              {activeTab === 'curriculum' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === 'assignments' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Assignments
              {activeTab === 'assignments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === 'discussions' ? 'text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Discussions
              {activeTab === 'discussions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
            {activeTab === 'curriculum' && (
              <>
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Course Curriculum
                </h2>

                {modules.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-700/50 border-dashed">
                    <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Curriculum Locked</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mb-6">
                      {enrolled 
                        ? 'No modules have been added to this course yet.' 
                        : 'Enroll in this course to gain full access to the curriculum, including all modules and lessons.'}
                    </p>
                    {!enrolled && (
                      <button 
                        onClick={handleEnrollCourse}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modules.map((mod, idx) => {
                      const isExpanded = expandedModules.has(mod.id);
                      return (
                        <div key={mod.id} className="border border-slate-700/50 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold truncate">{mod.title}</h3>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="border-t border-slate-700/50 bg-slate-900/30 p-3 space-y-2">
                              {mod.loadingLessons ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                                </div>
                              ) : mod.lessons.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-3">
                                  Lessons coming soon
                                </p>
                              ) : (
                                mod.lessons.map((lesson, lIdx) => (
                                  <Link
                                    key={lesson.id}
                                    to={enrolled ? `/lessons/${lesson.id}` : '#'}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                                      enrolled
                                        ? 'hover:bg-slate-800/50 cursor-pointer'
                                        : 'cursor-not-allowed opacity-60'
                                    }`}
                                  >
                                    {getContentIcon(lesson.contentType)}
                                    <span className="text-slate-300 text-sm flex-1">{lesson.title}</span>
                                    <span className="text-slate-500 text-xs">Lesson {lIdx + 1}</span>
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
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Course Assignments
                </h2>

                {assignments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-slate-700/50 border-dashed">
                    <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Assignments Locked</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mb-6">
                      {enrolled 
                        ? 'No assignments have been created for this course yet.' 
                        : 'Enroll in this course to view and submit projects, assignments, and tasks.'}
                    </p>
                    {!enrolled && (
                      <button 
                        onClick={handleEnrollCourse}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((as) => {
                      const submission = userSubmissions[as.id];
                      return (
                        <div key={as.id} className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-5">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-white font-bold text-lg mb-1">{as.title}</h3>
                              <p className="text-slate-400 text-sm leading-relaxed">{as.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-blue-400 font-bold">{as.points} Points</div>
                              <div className="text-slate-500 text-xs mt-1">Due {new Date(as.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>

                          {!enrolled ? (
                            <div className="bg-slate-900/50 rounded-lg p-3 text-center text-slate-500 text-xs border border-dashed border-slate-700">
                              Enroll in the course to submit this assignment
                            </div>
                          ) : submission ? (
                            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                  <FileCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                  <div className="text-emerald-400 font-bold text-sm">Submitted Successfully</div>
                                  <a href={submission.contentUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 text-xs hover:text-blue-400 transition">View My Submission</a>
                                </div>
                              </div>
                              <div className="text-right">
                                {submission.status === 'GRADED' ? (
                                  <>
                                    <div className="text-white font-bold">{submission.grade} / {as.points}</div>
                                    <div className="text-slate-400 text-xs italic">"{submission.feedback || 'No feedback provided'}"</div>
                                  </>
                                ) : (
                                  <div className="text-slate-400 text-xs font-medium bg-slate-800 px-3 py-1 rounded-full">Pending Grade</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <label className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                isUploading === as.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'
                              }`}>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => handleFileUpload(as.id, e)}
                                  disabled={isUploading !== null}
                                />
                                {isUploading === as.id ? (
                                  <>
                                    <Loader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                    <span className="text-blue-400 font-medium">Uploading contribution...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                    <span className="text-slate-300 font-bold">Submit Your Work</span>
                                    <span className="text-slate-500 text-xs mt-1">Upload a PDF, document, or image (Max 10MB)</span>
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Community Discussions
                  </h2>
                  <button
                    onClick={() => setShowDiscussionForm(!showDiscussionForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    New Topic
                  </button>
                </div>

                {showDiscussionForm && (
                  <form onSubmit={handleCreateDiscussion} className="bg-slate-900/40 border border-blue-500/30 rounded-xl p-5 mb-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Topic Title</label>
                      <input
                        type="text"
                        value={newDiscussion.title}
                        onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., How do I get started with Module 2?"
                        className="w-full px-4 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Content</label>
                      <textarea
                        value={newDiscussion.content}
                        onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts or questions..."
                        rows={3}
                        className="w-full px-4 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition text-sm resize-none"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDiscussionForm(false)}
                        className="px-4 py-2 text-slate-400 hover:text-white transition text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPostingDiscussion}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition shadow-lg shadow-blue-500/10"
                      >
                        {isPostingDiscussion ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        Post Topic
                      </button>
                    </div>
                  </form>
                )}

                {isDiscussionsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
                    <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Discussions Restricted</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">
                      {enrolled 
                        ? 'No discussions yet in this course. Be the first to start the conversation!' 
                        : 'Enroll in the course to participate in the community discussions and ask questions.'}
                    </p>
                    {!enrolled && (
                      <button 
                        onClick={handleEnrollCourse}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-500/20"
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
                        className="block group bg-slate-900/40 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-bold group-hover:text-blue-400 transition mb-1">{disc.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2">{disc.content}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg mb-2">
                              Go to thread
                              <ChevronRight className="w-3 h-3" />
                            </div>
                            <div className="text-slate-500 text-[10px] flex items-center justify-end gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(disc.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {disc.user?.firstName?.charAt(0) || <User className="w-3 h-3" />}
                          </div>
                          <span className="text-slate-400 text-xs">
                            Started by <span className="text-slate-300">{disc.user ? `${disc.user.firstName} ${disc.user.lastName}` : `User #${disc.createdBy}`}</span>
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
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 sticky top-20">
            {enrolled ? (
              <>
                <div className="text-center mb-5">
                  <div className="w-16 h-16 mx-auto mb-3 bg-emerald-500/15 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg">You're Enrolled!</h3>
                  <p className="text-slate-400 text-sm mt-1">Continue learning from where you left off</p>
                </div>
                <Link
                  to="/my-courses"
                  className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-center shadow-lg shadow-emerald-500/15 transition-all"
                >
                  Go to My Courses
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleEnrollCourse}
                  disabled={enrolling || (!!user && Number(course.instructorId) === Number(user.id))}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/20 transition-all disabled:cursor-not-allowed"
                >
                  {!user ? 'Login to Enroll' : (Number(course.instructorId) === Number(user.id) ? 'Your Course' : (enrolling ? 'Enrolling...' : 'Enroll Now'))}
                </button>
                {Number(course.instructorId) === Number(user?.id) && (
                  <p className="text-center text-slate-500 text-xs mt-3">
                    You are the instructor for this course
                  </p>
                )}
              </>
            )}

            <hr className="border-slate-700/50 my-5" />

            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">This course includes:</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2 text-slate-400">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <FileText className="w-4 h-4 text-purple-400" />
                  {assignments.length} Projects & Tasks
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Full lifetime access
                </li>
              </ul>
            </div>
          </div>

          {course.instructor && (
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
              <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">Your Instructor</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                  {course.instructor.firstName?.charAt(0)}{course.instructor.lastName?.charAt(0)}
                </div>
                <div>
                  <h5 className="text-white font-bold">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </h5>
                  <p className="text-slate-400 text-sm">Course Instructor</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseDetailsPage;
