import React, { useState, useEffect } from 'react';
import { BookOpen, Loader, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { coursesService, type CoursesResponse } from '../services/coursesService';
import { enrollmentsService } from '../services/enrollmentsService';
import { useAuthStore } from '../contexts/authContext';
import AppLayout from '../components/layout/AppLayout';

export const CoursesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [coursesData, setCoursesData] = useState<CoursesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    // Fetch user enrollments to show enrolled status
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCourses(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCourses(currentPage, searchQuery);
  }, [currentPage]);

  const fetchEnrolledCourses = async () => {
    try {
      const enrollments = await enrollmentsService.getUserEnrollments();
      const ids = new Set(enrollments.map(e => e.courseId));
      setEnrolledIds(ids);
    } catch {
      // Silently fail — enrollment status is a nice-to-have
    }
  };

  const fetchCourses = async (page: number, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await coursesService.getAllCourses(page, limit, search || undefined);
      setCoursesData(response);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load courses';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await enrollmentsService.enrollInCourse(courseId);
      setEnrolledIds(prev => new Set([...prev, courseId]));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enroll';
      alert(errorMsg);
    } finally {
      setEnrolling(null);
    }
  };

  const courses = coursesData?.data || [];
  const totalPages = coursesData?.meta?.totalPages || 1;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Courses</h1>
          <p className="text-slate-400 mt-1">
            {coursesData?.meta?.total || 0} courses available
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No courses found</p>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Course Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.has(course.id);
              return (
                <div key={course.id} className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all group flex flex-col">
                  {/* Course Header Gradient */}
                  <div className="h-36 bg-gradient-to-br from-blue-600 to-cyan-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform" />
                    </div>
                    {isEnrolled && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                        Enrolled
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>

                    {/* Instructor */}
                    {course.instructor && (
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                          {course.instructor.firstName?.charAt(0)}{course.instructor.lastName?.charAt(0)}
                        </div>
                        <span className="text-slate-300 text-sm font-medium">
                          {course.instructor.firstName} {course.instructor.lastName}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/courses/${course.id}`}
                        className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition text-center text-sm"
                      >
                        View Details
                      </Link>
                      {!isEnrolled && user?.role !== 'INSTRUCTOR' && (
                        <button
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={enrolling === course.id}
                          className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-xl font-semibold transition disabled:cursor-not-allowed text-sm"
                        >
                          {enrolling === course.id ? 'Enrolling...' : 'Enroll'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition ${
                    page === currentPage
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default CoursesPage;
