import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Loader, Trash2, Eye, EyeOff, X, FolderPlus, Pencil, Info, CheckCircle, FileText, Check, Award, Send, AlertCircle } from 'lucide-react';
import { coursesService, type Course, type CreateCourseRequest, type CourseModule } from '../services/coursesService';
import { lessonsService, type Lesson, type CreateLessonRequest, ContentType } from '../services/lessonsService';
import { assignmentsService, type Assignment, type Submission, type CreateAssignmentRequest } from '../services/assignmentsService';
import { useAuthStore } from '../contexts/authContext';
import AppLayout from '../components/layout/AppLayout';

export const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Course Modal
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseForm, setCourseForm] = useState<CreateCourseRequest>({ title: '', description: '', isPublished: false });
  const [creatingCourse, setCreatingCourse] = useState(false);

  // Manage Modules
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [moduleLessons, setModuleLessons] = useState<Record<string, Lesson[]>>({});

  // Edit Course Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateCourseRequest>>({});
  const [updatingCourse, setUpdatingCourse] = useState(false);

  // Add Lesson
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null); // moduleId
  const [lessonForm, setLessonForm] = useState<CreateLessonRequest>({ title: '', contentUrl: '', contentType: ContentType.TEXT, order: 0 });
  const [addingLesson, setAddingLesson] = useState(false);

  // Manage Module & Lesson
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [isUpdatingModule, setIsUpdatingModule] = useState(false);

  // Manage Assignments
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<Partial<CreateAssignmentRequest>>({ 
    title: '', 
    description: '', 
    points: 100, 
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
  });
  const [addingAssignment, setAddingAssignment] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '' });
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true);
      const myCourses = await coursesService.getMyCourses();
      setCourses(myCourses);
    } catch (err) {
      setError('Failed to load your courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;
    try {
      setCreatingCourse(true);
      const newCourse = await coursesService.createCourse(courseForm);
      setCourses(prev => [newCourse, ...prev]);
      setCourseForm({ title: '', description: '', isPublished: false });
      setShowCreateCourse(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await coursesService.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setModules([]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = await coursesService.updateCourse(course.id, { isPublished: !course.isPublished });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, isPublished: updated.isPublished } : c));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update course');
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editForm.title?.trim()) return;
    try {
      setUpdatingCourse(true);
      const updated = await coursesService.updateCourse(editingCourse.id, editForm);
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? updated : c));
      setSelectedCourse(prev => prev?.id === updated.id ? updated : prev);
      setEditingCourse(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setUpdatingCourse(false);
    }
  };

  const selectCourseForManagement = async (course: Course) => {
    setSelectedCourse(course);
    setLoadingModules(true);
    setSelectedAssignment(null);
    try {
      const [mods, asgn] = await Promise.all([
        coursesService.getModules(course.id),
        assignmentsService.getAssignmentsByCourse(course.id).catch(() => [])
      ]);
      setModules(mods);
      setCourseAssignments(asgn);
      
      // Fetch lessons for all modules
      const lessonsMap: Record<string, Lesson[]> = {};
      await Promise.all(mods.map(async (mod) => {
        try {
          const lessons = await lessonsService.getLessonsByModule(mod.id);
          lessonsMap[mod.id] = lessons;
        } catch (err) {
          lessonsMap[mod.id] = [];
        }
      }));
      setModuleLessons(lessonsMap);
    } catch {
      setModules([]);
      setModuleLessons({});
      setCourseAssignments([]);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleAddModule = async () => {
    if (!selectedCourse || !moduleTitle.trim()) return;
    try {
      setAddingModule(true);
      const mod = await coursesService.addModule(selectedCourse.id, { title: moduleTitle, order: modules.length });
      setModules(prev => [...prev, mod]);
      setModuleTitle('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add module');
    } finally {
      setAddingModule(false);
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!lessonForm.title.trim() || !lessonForm.contentUrl.trim()) return;
    try {
      setAddingLesson(true);
      const newLesson = await lessonsService.createLesson(moduleId, lessonForm);
      setModuleLessons(prev => ({
        ...prev,
        [moduleId]: [...(prev[moduleId] || []), newLesson]
      }));
      setLessonForm({ title: '', contentUrl: '', contentType: ContentType.TEXT, order: 0 });
      setShowAddLesson(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add lesson');
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await lessonsService.deleteLesson(lessonId);
      setModuleLessons(prev => ({
        ...prev,
        [moduleId]: prev[moduleId].filter(l => l.id !== lessonId)
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete lesson');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await coursesService.deleteModule(moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      const nextLessons = { ...moduleLessons };
      delete nextLessons[moduleId];
      setModuleLessons(nextLessons);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!editModuleTitle.trim()) return;
    try {
      setIsUpdatingModule(true);
      const updated = await coursesService.updateModule(moduleId, { title: editModuleTitle });
      setModules(prev => prev.map(m => m.id === moduleId ? updated : m));
      setEditingModuleId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update module');
    } finally {
      setIsUpdatingModule(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !assignmentForm.title || !assignmentForm.description) return;
    try {
        setAddingAssignment(true);
        const newAs = await assignmentsService.createAssignment({
            title: assignmentForm.title!,
            description: assignmentForm.description!,
            points: assignmentForm.points || 100,
            courseId: selectedCourse.id,
            dueDate: new Date(assignmentForm.dueDate!).toISOString()
        });
        setCourseAssignments(prev => [newAs, ...prev]);
        setShowAddAssignment(false);
        setAssignmentForm({ title: '', description: '', points: 100, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
        setAddingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
      if (!confirm('Are you sure you want to delete this assignment?')) return;
      try {
          await assignmentsService.deleteAssignment(id);
          setCourseAssignments(prev => prev.filter(a => a.id !== id));
          if (selectedAssignment?.id === id) setSelectedAssignment(null);
      } catch (err) {
          alert('Failed to delete assignment');
      }
  };

  const viewSubmissions = async (assignment: Assignment) => {
      setSelectedAssignment(assignment);
      setLoadingSubmissions(true);
      try {
          const subs = await assignmentsService.getSubmissionsForAssignment(assignment.id);
          setSubmissions(subs);
      } catch (err) {
          setSubmissions([]);
      } finally {
          setLoadingSubmissions(false);
      }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!gradingSubmission) return;
      try {
          setIsGrading(true);
          const updated = await assignmentsService.gradeSubmission(gradingSubmission.id, gradeForm);
          setSubmissions(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
          setGradingSubmission(null);
          setGradeForm({ grade: 0, feedback: '' });
      } catch (err) {
          alert(err instanceof Error ? err.message : 'Failed to grade submission');
      } finally {
          setIsGrading(false);
      }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Instructor Panel</h1>
          <p className="text-slate-400 mt-1">Create and manage your courses</p>
        </div>
        <button
          onClick={() => setShowCreateCourse(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition text-sm shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {showCreateCourse && (
        <div className="bg-slate-800/60 rounded-2xl p-6 border border-blue-500/30 mb-8 blur-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Create New Course</h2>
            <button onClick={() => setShowCreateCourse(false)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Course title"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Course description"
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 text-sm outline-none resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={courseForm.isPublished}
                onChange={(e) => setCourseForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm text-slate-300">Publish immediately</span>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateCourse(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium text-sm">Cancel</button>
              <button type="submit" disabled={creatingCourse || !courseForm.title.trim()} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-semibold text-sm transition">
                {creatingCourse ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingCourse && (
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 mb-8 sticky top-24 z-20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-400" />
              Edit Course: {editingCourse.title}
            </h2>
            <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleEditCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 text-sm outline-none resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isPublished}
                onChange={(e) => setEditForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm text-slate-300">Published</span>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditingCourse(null)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium text-sm transition">Cancel</button>
              <button type="submit" disabled={updatingCourse || !editForm.title?.trim()} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-semibold text-sm transition">
                {updatingCourse ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedCourse ? 'lg:col-span-1' : 'lg:col-span-3'}>
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">You haven't created any courses yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`bg-slate-800/60 rounded-xl p-4 border transition-all cursor-pointer ${
                    selectedCourse?.id === course.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-700/50 hover:border-slate-600'
                  }`}
                  onClick={() => selectCourseForManagement(course)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold line-clamp-1 flex-1">{course.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${
                      course.isPublished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePublish(course); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition"
                    >
                      {course.isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCourse(course);
                        setEditForm({ title: course.title, description: course.description, isPublished: course.isPublished });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs transition"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                <button onClick={() => { setSelectedCourse(null); setModules([]); }} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="New module title..."
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
                />
                <button
                  onClick={handleAddModule}
                  disabled={addingModule || !moduleTitle.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-semibold text-sm transition"
                >
                  <FolderPlus className="w-4 h-4" />
                  {addingModule ? 'Adding...' : 'Add Module'}
                </button>
              </div>

              {loadingModules ? (
                <div className="flex justify-center py-8"><Loader className="w-6 h-6 text-blue-500 animate-spin" /></div>
              ) : modules.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm italic">No modules yet. Add one above!</p>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, idx) => (
                    <div key={mod.id} className="border border-slate-700/50 rounded-xl p-4 bg-slate-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          {editingModuleId === mod.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={editModuleTitle}
                                onChange={(e) => setEditModuleTitle(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleUpdateModule(mod.id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg transition"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => setEditingModuleId(null)} className="p-1.5 bg-slate-700 text-slate-400 rounded-lg transition"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <h4 className="text-white font-semibold flex-1">{mod.title}</h4>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!editingModuleId && (
                            <button onClick={() => { setEditingModuleId(mod.id); setEditModuleTitle(mod.title); }} className="p-1.5 text-slate-400 hover:text-white transition"><Pencil className="w-4 h-4" /></button>
                          )}
                          <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-slate-700 mx-1" />
                          <button onClick={() => setShowAddLesson(showAddLesson === mod.id ? null : mod.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs transition">
                            <Plus className="w-3 h-3" /> Add Lesson
                          </button>
                        </div>
                      </div>

                      {moduleLessons[mod.id]?.length > 0 && (
                        <div className="mt-3 space-y-2 mb-4">
                          {moduleLessons[mod.id].map((lesson, lIdx) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-2 bg-slate-900/40 border border-slate-700/30 rounded-lg group transition-all hover:border-slate-600">
                              <div className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">{lIdx + 1}</div>
                              <span className="text-slate-300 text-xs flex-1">{lesson.title}</span>
                              <span className="text-slate-500 text-[10px] uppercase font-bold px-1.5 py-0.5 bg-slate-800 rounded">{lesson.contentType}</span>
                              <button onClick={() => handleDeleteLesson(mod.id, lesson.id)} className="p-1.5 text-red-500/0 group-hover:text-red-500/60 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      {showAddLesson === mod.id && (
                        <div className="bg-slate-950/40 rounded-xl p-4 mt-3 space-y-3 border border-emerald-500/20 animate-in slide-in-from-top-1 duration-200">
                          <input type="text" value={lessonForm.title} onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Lesson title" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none" />
                          <input type="text" value={lessonForm.contentUrl} onChange={(e) => setLessonForm(prev => ({ ...prev, contentUrl: e.target.value }))} placeholder="Content URL or Text" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none" />
                          <select value={lessonForm.contentType} onChange={(e) => setLessonForm(prev => ({ ...prev, contentType: e.target.value as ContentType }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none">
                            <option value={ContentType.TEXT}>Text</option>
                            <option value={ContentType.VIDEO}>Video</option>
                            <option value={ContentType.DOCUMENT}>Document</option>
                          </select>
                          <button onClick={() => handleAddLesson(mod.id)} disabled={addingLesson || !lessonForm.title.trim()} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-bold text-sm transition">
                             {addingLesson ? 'Adding...' : 'Create Lesson'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 border-t border-slate-700/50 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Course Assignments</h2>
                  </div>
                  <button onClick={() => setShowAddAssignment(!showAddAssignment)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl font-semibold text-xs transition">
                    <Plus className="w-3 h-3" /> {showAddAssignment ? 'Cancel' : 'New Assignment'}
                  </button>
                </div>

                {showAddAssignment && (
                  <div className="bg-slate-900/40 rounded-xl p-5 border border-purple-500/20 mb-6 animate-in slide-in-from-top-2 duration-300">
                    <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 ml-1">Assignment Title</label>
                        <input type="text" value={assignmentForm.title} onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 ml-1">Description</label>
                        <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Instructions..." rows={3} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-1 focus:ring-purple-500 outline-none resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 ml-1">Points</label>
                        <input type="number" value={assignmentForm.points} onChange={(e) => setAssignmentForm(prev => ({ ...prev, points: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 ml-1">Due Date</label>
                        <input type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none" />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button type="submit" disabled={addingAssignment || !assignmentForm.title} className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 text-white rounded-xl font-bold text-sm transition">
                          {addingAssignment ? 'Creating...' : 'Create Assignment'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {courseAssignments.length === 0 ? (
                  <div className="text-center py-10 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50">
                    <p className="text-slate-500 text-sm italic">No assignments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courseAssignments.map((as) => (
                      <div key={as.id} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><FileText className="w-5 h-5" /></div>
                            <div>
                              <h3 className="text-white font-bold text-sm">{as.title}</h3>
                              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{as.points} Points • {new Date(as.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => viewSubmissions(as)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition">Submissions</button>
                            <button onClick={() => handleDeleteAssignment(as.id)} className="p-1.5 text-red-400/60 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAssignment && (
                  <div className="mt-8 bg-slate-900 p-6 rounded-2xl border border-blue-500/20 blur-in">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white">Submissions: {selectedAssignment.title}</h3>
                      <button onClick={() => setSelectedAssignment(null)} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
                    </div>

                    {loadingSubmissions ? (
                      <div className="flex justify-center py-10"><Loader className="w-6 h-6 animate-spin" /></div>
                    ) : submissions.length === 0 ? (
                      <p className="text-center text-slate-500 text-sm flex gap-2 justify-center"><AlertCircle className="w-4 h-4" /> No submissions yet</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-800 text-slate-400 uppercase tracking-widest font-bold">
                            <tr>
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Grade</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {submissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-800/30">
                                <td className="px-4 py-4 text-white font-medium">{sub.user?.firstName} {sub.user?.lastName}</td>
                                <td className="px-4 py-4 text-slate-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded-full ${sub.status === 'GRADED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>{sub.status}</span></td>
                                <td className="px-4 py-4 text-white">{sub.grade ?? '-'} / {selectedAssignment.points}</td>
                                <td className="px-4 py-4 text-right flex justify-end gap-2">
                                  <a href={sub.contentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition tracking-wide uppercase font-bold text-[10px]">View</a>
                                  <button onClick={() => { setGradingSubmission(sub); setGradeForm({ grade: sub.grade || 0, feedback: sub.feedback || '' }); }} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg transition"><Award className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {gradingSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-blue-500/30 p-6 shadow-2xl scale-in-center">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Award className="w-6 h-6 text-blue-400" /> Grade Submission</h2>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-white transition"><X className="w-6 h-6" /></button>
            </div>
            <div className="mb-6 p-4 bg-slate-900 rounded-xl border border-slate-700">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Student</div>
                <div className="text-white font-bold">{gradingSubmission.user?.firstName} {gradingSubmission.user?.lastName}</div>
                <div className="mt-3 text-[10px] text-slate-500 uppercase font-bold tracking-widest">Assignment</div>
                <div className="text-blue-400 font-semibold">{selectedAssignment?.title}</div>
            </div>
            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Grade (Max {selectedAssignment?.points})</label>
                <input type="number" max={selectedAssignment?.points} value={gradeForm.grade} onChange={(e) => setGradeForm(prev => ({ ...prev, grade: Number(e.target.value) }))} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-lg focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Feedback</label>
                <textarea value={gradeForm.feedback} onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))} rows={4} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm outline-none transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setGradingSubmission(null)} className="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold transition">Cancel</button>
                <button type="submit" disabled={isGrading} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white rounded-xl font-bold transition flex justify-center items-center gap-2">
                  {isGrading ? <Loader className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />} Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default InstructorDashboardPage;
