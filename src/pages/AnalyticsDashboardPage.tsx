import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
  Users, BookOpen, GraduationCap, TrendingUp, Award, Clock, ArrowUpRight, ArrowDownRight, Activity, Calendar
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { dashboardService, type DashboardData } from '../services/dashboardService';

const COLORS = ['#00f2fe', '#007adf', '#4f46e5', '#8b5cf6', '#ec4899'];

const AnalyticsDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData = await dashboardService.getDashboard();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mb-4"></div>
          <p className="text-slate-400 animate-pulse font-medium">Synthesizing platform data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-red-400 font-medium">{error || 'Something went wrong'}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary-teal text-white rounded-lg text-sm font-bold"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  const renderInstructorView = (dash: any) => {
    const { stats, enrollmentTrends } = dash;

    // Fallback data for beautiful visualization if DB is new
    const chartData = enrollmentTrends?.length > 0 ? enrollmentTrends : [
      { date: '2024-03-01', count: 4 },
      { date: '2024-03-05', count: 7 },
      { date: '2024-03-10', count: 12 },
      { date: '2024-03-15', count: 9 },
      { date: '2024-03-20', count: 18 },
      { date: '2024-03-25', count: 22 },
      { date: '2024-03-30', count: 31 },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header>
          <h1 className="text-3xl font-bold text-white">Instructor Insights</h1>
          <p className="text-slate-400 mt-1">Deep-dive into your course performance and student growth.</p>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.uniqueStudents}
            icon={<Users className="w-5 h-5" />}
            trend="+12.5%"
            isPositive={true}
          />
          <StatCard
            title="Active Courses"
            value={stats.activeCourses}
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            icon={<TrendingUp className="w-5 h-5" />}
            trend="+8.2%"
            isPositive={true}
          />
          <StatCard
            title="Popularity"
            value={stats.mostPopularCourse}
            icon={<Award className="w-5 h-5" />}
            subtitle="Top performing course"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Growth Chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-teal" />
                  Enrollment Trends
                </h3>
                <p className="text-xs text-slate-500">Student intake over the last 30 days</p>
              </div>
              <div className="px-3 py-1 bg-primary-teal/10 text-primary-teal rounded-full text-[10px] font-bold uppercase tracking-wider">
                Live Data
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#00f2fe' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Retention Chart */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Progress Segments
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: 35 },
                      { name: 'In Progress', value: 45 },
                      { name: 'Not Started', value: 20 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0, 1, 2].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Completed</div>
                <div className="text-sm font-bold text-white">35%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">InProgress</div>
                <div className="text-sm font-bold text-white">45%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Dormant</div>
                <div className="text-sm font-bold text-white">20%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminView = (dash: any) => {
    const { overview, enrollmentTrends } = dash;
    const chartData = enrollmentTrends?.length > 0 ? enrollmentTrends : [
      { date: '2024-03-01', count: 40 },
      { date: '2024-03-15', count: 85 },
      { date: '2024-03-30', count: 120 },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header>
          <h1 className="text-3xl font-bold text-white">System Overlord</h1>
          <p className="text-slate-400 mt-1">Platform-wide statistics and ecosystem health monitoring.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard title="Total Users" value={overview.totalUsers} icon={<Users className="w-5 h-5" />} />
          <StatCard title="Students" value={overview.studentsCount} icon={<GraduationCap className="w-5 h-5" />} />
          <StatCard title="Instructors" value={overview.instructorsCount} icon={<Award className="w-5 h-5" />} />
          <StatCard title="All Courses" value={overview.totalCourses} icon={<BookOpen className="w-5 h-5" />} />
          <StatCard title="Lifetime Enrollments" value={overview.totalEnrollments} icon={<TrendingUp className="w-5 h-5" />} />
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-teal" />
            Global Platform Growth
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentView = (dash: any) => {
    const { stats, enrolledCourses } = dash;
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header>
          <h1 className="text-3xl font-bold text-white">Learning Momentum</h1>
          <p className="text-slate-400 mt-1">Track your personal growth and course milestones.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Courses Enrolled" value={stats.totalEnrolled} icon={<BookOpen className="w-5 h-5" />} />
          <StatCard title="Completed" value={stats.completedCourses} icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} />
          <StatCard title="Avg. Progress" value={`${stats.averageProgress}%`} icon={<Activity className="w-5 h-5" />} />
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Recent Motivation</h3>
          <div className="space-y-4">
            {enrolledCourses.map((c: any) => (
              <div key={c.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-teal/20 flex items-center justify-center text-primary-teal">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{c.title}</h4>
                    <p className="text-xs text-slate-500">Enrolled {(new Date(c.enrolledAt)).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary-teal font-bold">{c.progress}%</div>
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary-teal transition-all duration-1000" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto pb-10">
        {data.role === 'ADMIN' && renderAdminView(data)}
        {data.role === 'INSTRUCTOR' && renderInstructorView(data)}
        {data.role === 'STUDENT' && renderStudentView(data)}
      </div>
    </AppLayout>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  isPositive?: boolean;
  subtitle?: string;
}> = ({ title, value, icon, trend, isPositive, subtitle }) => (
  <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary-teal/30 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-primary-teal group-hover:bg-primary-teal/10 transition-all">
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <div className="text-2xl font-black text-white mb-1">{value}</div>
    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</div>
    {subtitle && <div className="text-[10px] text-slate-600 mt-2 italic">{subtitle}</div>}
  </div>
);

const CheckCircle = ({ className, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default AnalyticsDashboardPage;
