import { apiClient } from '../lib/apiClient';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: number;
  contentUrl: string;
  grade: number | null;
  feedback: string | null;
  status: 'SUBMITTED' | 'GRADED';
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  dueDate: string;
  courseId: string;
  points?: number;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  contentUrl: string;
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}

class AssignmentsService {
  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    try {
      const response = await apiClient.get<Assignment[]>(`/assignments/course/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<Assignment> {
    try {
      const response = await apiClient.post<Assignment>('/assignments', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    try {
      await apiClient.delete(`/assignments/${id}`);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  // --- Submissions ---

  async submitWork(data: CreateSubmissionRequest): Promise<Submission> {
    try {
      const response = await apiClient.post<Submission>('/submissions', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getMySubmission(assignmentId: string): Promise<Submission | null> {
    try {
      const response = await apiClient.get<Submission>(`/submissions/my-submission/${assignmentId}`);
      return response.data;
    } catch (error: unknown) {
      // Return null if not found (404)
      return null;
    }
  }

  async getSubmissionsForAssignment(assignmentId: string): Promise<Submission[]> {
    try {
      const response = await apiClient.get<Submission[]>(`/submissions/assignment/${assignmentId}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async gradeSubmission(submissionId: string, data: GradeSubmissionRequest): Promise<Submission> {
    try {
      const response = await apiClient.patch<Submission>(`/submissions/${submissionId}/grade`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) return error;
    return new Error('An unexpected error occurred in assignments service');
  }
}

export const assignmentsService = new AssignmentsService();
export default assignmentsService;
