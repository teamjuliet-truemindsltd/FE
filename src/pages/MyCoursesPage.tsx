import React, { useState, useEffect } from 'react';
import { BookOpen, Loader, PlayCircle, Trophy, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { enrollmentsService, type Enrollment } from '../services/enrollmentsService';
import AppLayout from '../components/layout/AppLayout';

export const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const fetchMyEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await enrollmentsService.getUserEnrollments();
      setEnrollments(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load your courses';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const completedCount = enrollments.filter(e => parseFloat(String(e.progressPercentage)) >= 100).length;
  const inProgressCount = enrollments.length - completedCount;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Learning</h1>
          <p className="text-slate-400 mt-1">{enrollments.length} enrolled courses</p>
        </div>
        <Link to="/courses" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition text-sm shadow-lg shadow-blue-500/20">
          Browse More Courses
        </Link>
      </div>

      {/* Summary Stats */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{enrollments.length}</p>
              <p className="text-slate-400 text-xs">Total Courses</p>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inProgressCount}</p>
              <p className="text-slate-400 text-xs">In Progress</p>
            </div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{completedCount}</p>
              <p className="text-slate-400 text-xs">Completed</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50 border-dashed">
          <div className="bg-slate-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No courses yet</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            You haven't enrolled in any courses yet. Start your learning journey today!
          </p>
          <Link
            to="/courses"
            className="inline-flex px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/25"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const progress = parseFloat(String(enrollment.progressPercentage));
            const isComplete = progress >= 100;
            const courseTitle = enrollment.course?.title || 'Untitled Course';

            return (
              <div key={enrollment.id} className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/30 transition-all group flex flex-col">
                {/* Thumbnail */}
                <div className={`h-40 relative overflow-hidden ${
                  isComplete 
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-500' 
                    : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                }`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-14 h-14 text-white/40 group-hover:scale-110 group-hover:text-white/60 transition-all duration-300" />
                  </div>
                  {isComplete && (
                    <div className="absolute top-3 right-3 bg-white text-emerald-600 p-2 rounded-full shadow-lg">
                      <Trophy className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {courseTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-5">
                    <Clock className="w-3.5 h-3.5" />
                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </div>

                  {/* Progress */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">Progress</span>
                      <span className={`text-sm font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isComplete ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>

                    <Link
                      to={`/courses/${enrollment.courseId}`}
                      className="w-full mt-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition text-center block text-sm"
                    >
                      {isComplete ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default MyCoursesPage;
