import { apiClient } from '../lib/apiClient';
import type { Course } from './coursesService';

export interface Enrollment {
  id: string;
  userId: number;
  courseId: string;
  course: Course;
  progressPercentage: number;
  enrolledAt: string;
}

export interface LessonCompleteResponse {
  message: string;
  lessonId?: string;
  courseProgress?: number;
  progress?: number;
}

class EnrollmentsService {
  async getUserEnrollments(): Promise<Enrollment[]> {
    try {
      const response = await apiClient.get<Enrollment[]>('/users/me/enrollments');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    try {
      const response = await apiClient.post<Enrollment>(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async markLessonComplete(lessonId: string): Promise<LessonCompleteResponse> {
    try {
      const response = await apiClient.post<LessonCompleteResponse>(`/lessons/${lessonId}/complete`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Failed to handle enrollment');
  }
}

export const enrollmentsService = new EnrollmentsService();
export default enrollmentsService;
