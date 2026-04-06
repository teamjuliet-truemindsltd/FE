import { apiClient } from '../lib/apiClient';

export const ContentType = {
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT',
  TEXT: 'TEXT',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentUrl: string;
  contentType: ContentType;
  order: number;
  createdAt: string;
  updatedAt: string;
  module?: {
    id: string;
    courseId: string;
    title: string;
    order: number;
  };
}

export interface CreateLessonRequest {
  title: string;
  contentUrl: string;
  contentType?: ContentType;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  contentUrl?: string;
  contentType?: ContentType;
  order?: number;
}

class LessonsService {
  async getLessonById(lessonId: string): Promise<Lesson> {
    try {
      const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    try {
      const response = await apiClient.get<Lesson[]>(`/lessons?moduleId=${moduleId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async createLesson(moduleId: string, data: CreateLessonRequest): Promise<Lesson> {
    try {
      const response = await apiClient.post<Lesson>(`/lessons?moduleId=${moduleId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async updateLesson(lessonId: string, data: UpdateLessonRequest): Promise<Lesson> {
    try {
      const response = await apiClient.patch<Lesson>(`/lessons/${lessonId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      await apiClient.delete(`/lessons/${lessonId}`);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Failed to fetch lessons');
  }
}

export const lessonsService = new LessonsService();
export default lessonsService;
