import { apiClient } from '../lib/apiClient';

export interface EnrollmentTrend {
  date: string;
  count: number;
}

export interface StudentDashboard {
  role: 'STUDENT';
  stats: {
    totalEnrolled: number;
    completedCourses: number;
    averageProgress: number;
  };
  enrolledCourses: {
    id: string;
    courseId: string;
    title: string;
    progress: number;
    enrolledAt: string;
  }[];
}

export interface InstructorDashboard {
  role: 'INSTRUCTOR';
  stats: {
    activeCourses: number;
    totalEnrollments: number;
    uniqueStudents: number;
    mostPopularCourse: string;
  };
  enrollmentTrends: EnrollmentTrend[];
}

export interface AdminDashboard {
  role: 'ADMIN';
  overview: {
    totalUsers: number;
    studentsCount: number;
    instructorsCount: number;
    totalCourses: number;
    totalEnrollments: number;
  };
  enrollmentTrends: EnrollmentTrend[];
}

export type DashboardData = StudentDashboard | InstructorDashboard | AdminDashboard;

class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await apiClient.get<DashboardData>('/dashboard');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Failed to fetch dashboard data');
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
