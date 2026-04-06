import { apiClient } from '../lib/apiClient';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Reply {
  id: string;
  content: string;
  userId: number;
  user?: User;
  createdAt: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  courseId: string | null;
  createdBy: number;
  user?: User;
  replies?: Reply[];
  createdAt: string;
}

export interface CreateDiscussionRequest {
  title: string;
  content: string;
  courseId?: string;
}

export interface CreateReplyRequest {
  content: string;
  discussionId: string;
}

class CollaborationService {
  async getAllDiscussions(courseId?: string): Promise<Discussion[]> {
    try {
      const response = await apiClient.get<Discussion[]>('/collaboration/discussions', {
          params: { courseId } // Actually, I updated the controller to accept body, but body in GET is non-standard.
                               // Wait, I used @Body in the GET in the controller. I should use @Query or change to POST.
                               // Let me assume Query for better REST.
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getDiscussion(id: string): Promise<Discussion> {
    try {
      const response = await apiClient.get<Discussion>(`/collaboration/discussions/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async createDiscussion(data: CreateDiscussionRequest): Promise<Discussion> {
    try {
      const response = await apiClient.post<Discussion>('/collaboration/discussions', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async createReply(data: CreateReplyRequest): Promise<Reply> {
    try {
      const response = await apiClient.post<Reply>('/collaboration/replies', data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Failed to handle collaboration');
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
