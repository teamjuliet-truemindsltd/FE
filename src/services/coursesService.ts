import { apiClient } from '../lib/apiClient';

export interface CourseInstructor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: number;
  instructor: CourseInstructor;
  isPublished: boolean;
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  isPublished?: boolean;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

export interface CreateModuleRequest {
  title: string;
  order?: number;
}

class CoursesService {
  async getAllCourses(page: number = 1, limit: number = 10, search?: string): Promise<CoursesResponse> {
    try {
      let url = `/courses?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await apiClient.get<CoursesResponse>(url);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getMyCourses(): Promise<Course[]> {
    try {
      const response = await apiClient.get<Course[]>('/courses/my-courses');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getCourseById(courseId: string): Promise<Course> {
    try {
      const response = await apiClient.get<Course>(`/courses/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    try {
      const response = await apiClient.post<Course>('/courses', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async updateCourse(courseId: string, data: UpdateCourseRequest): Promise<Course> {
    try {
      const response = await apiClient.patch<Course>(`/courses/${courseId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await apiClient.delete(`/courses/${courseId}`);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getModules(courseId: string): Promise<CourseModule[]> {
    try {
      const response = await apiClient.get<CourseModule[]>(`/courses/${courseId}/modules`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async addModule(courseId: string, data: CreateModuleRequest): Promise<CourseModule> {
    try {
      const response = await apiClient.post<CourseModule>(`/courses/${courseId}/modules`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async updateModule(moduleId: string, data: Partial<CreateModuleRequest>): Promise<CourseModule> {
    try {
      const response = await apiClient.patch<CourseModule>(`/courses/modules/${moduleId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async deleteModule(moduleId: string): Promise<void> {
    try {
      await apiClient.delete(`/courses/modules/${moduleId}`);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Failed to fetch courses');
  }
}

export const coursesService = new CoursesService();
export default coursesService;
