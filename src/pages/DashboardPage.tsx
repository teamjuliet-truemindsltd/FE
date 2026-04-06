import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../contexts/authContext';
import {
  BookOpen, Zap, Users, Trophy, TrendingUp, BarChart3,
  PlayCircle, Loader, GraduationCap, Star
} from 'lucide-react';
import { dashboardService, type DashboardData, type StudentDashboard, type InstructorDashboard, type AdminDashboard } from '../services/dashboardService';
import AppLayout from '../components/layout/AppLayout';

export const DashboardPage: React.FC = () => {
  const { user, isLoading: authLoading, getCurrentUser } = useAuthStore();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      getCurrentUser();
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoadingDash(true);
      const data = await dashboardService.getDashboard();
      setDashData(data);
    } catch (err) {
      console.error('Dashboard fetch failed', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoadingDash(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderStudentDashboard = (data: StudentDashboard) => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-white">{data.stats.totalEnrolled}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Enrolled Courses</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-3xl font-bold text-white">{data.stats.completedCourses}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Completed</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-3xl font-bold text-white">{data.stats.averageProgress}%</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Avg. Progress</p>
        </div>
      </div>

      {/* Recent Learning */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white">Continue Learning</h3>
          <Link to="/my-courses" className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
            View All →
          </Link>
        </div>

        {data.enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.enrolledCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.courseId}`}
                className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/30 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <PlayCircle className="w-7 h-7 text-white/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-bold truncate group-hover:text-blue-400 transition-colors">{course.title}</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Enrolled {new Date(course.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        course.progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(course.progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-white font-bold text-sm w-12 text-right">{course.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-2xl p-10 border border-slate-700/50 border-dashed text-center">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No active courses yet. Start your journey today!</p>
            <Link to="/courses" className="inline-flex px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition shadow-lg shadow-blue-500/25">
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link to="/courses" className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Explore Courses</h4>
              <p className="text-slate-400 text-sm">Browse and enroll in new courses</p>
            </div>
          </div>
        </Link>
        <Link to="/discussions" className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Discussions</h4>
              <p className="text-slate-400 text-sm">Join the learning community</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );

  const renderInstructorDashboard = (data: InstructorDashboard) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-3xl font-bold text-white">{data.stats.activeCourses}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Active Courses</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-3xl font-bold text-white">{data.stats.totalEnrollments}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Enrollments</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-3xl font-bold text-white">{data.stats.uniqueStudents}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Unique Students</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-white font-bold truncate">{data.stats.mostPopularCourse}</p>
          <p className="text-slate-400 text-sm font-medium">Most Popular Course</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link to="/instructor" className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Manage Courses</h4>
              <p className="text-slate-400 text-sm">Create, edit, and manage your courses</p>
            </div>
          </div>
        </Link>
        <Link to="/discussions" className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Discussions</h4>
              <p className="text-slate-400 text-sm">Engage with your students</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );

  const renderAdminDashboard = (data: AdminDashboard) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
      {[
        { label: 'Total Users', value: data.overview.totalUsers, icon: Users, color: 'blue' },
        { label: 'Students', value: data.overview.studentsCount, icon: GraduationCap, color: 'emerald' },
        { label: 'Instructors', value: data.overview.instructorsCount, icon: Star, color: 'purple' },
        { label: 'Total Courses', value: data.overview.totalCourses, icon: BookOpen, color: 'amber' },
        { label: 'Enrollments', value: data.overview.totalEnrollments, icon: TrendingUp, color: 'pink' },
      ].map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-${stat.color}-500/30 transition-all group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/15 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <AppLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-400">
          {user?.role === 'STUDENT'
            ? 'Here\'s your learning overview'
            : user?.role === 'INSTRUCTOR'
            ? 'Here\'s how your courses are performing'
            : 'Platform overview'}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loadingDash ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : dashData ? (
        <>
          {dashData.role === 'STUDENT' && renderStudentDashboard(dashData as StudentDashboard)}
          {dashData.role === 'INSTRUCTOR' && renderInstructorDashboard(dashData as InstructorDashboard)}
          {dashData.role === 'ADMIN' && renderAdminDashboard(dashData as AdminDashboard)}
        </>
      ) : null}
    </AppLayout>
  );
};

export default DashboardPage;
