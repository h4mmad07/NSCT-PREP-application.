import {
  Subject,
  ActiveTestSession,
  TestResult,
  TestReviewData,
  OverviewAnalytics,
  WeakAreaItem,
  UserProfile
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('nsct_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('nsct_token');
    }
    return this.token;
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nsct_token');
      localStorage.removeItem('nsct_user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.detail || `HTTP Error ${response.status}`);
    }

    return response.json();
  }

  // Auth & Profile
  async getMe(): Promise<UserProfile> {
    const user = await this.request<UserProfile>('/auth/me');
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('nsct_user', JSON.stringify(user));
    }
    return user;
  }

  async getGoogleAuthUrl(): Promise<{ configured: boolean; auth_url: string | null; message?: string }> {
    return this.request<{ configured: boolean; auth_url: string | null; message?: string }>('/auth/google/url');
  }

  async verifyGoogleCredential(idToken: string): Promise<any> {
    const res = await this.request<any>('/auth/google/verify', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
      if (typeof window !== 'undefined' && res.user) {
        localStorage.setItem('nsct_user', JSON.stringify(res.user));
      }
    }
    return res;
  }

  async updateProfile(data: Partial<UserProfile['profile']>): Promise<any> {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Subjects & Topics
  async getSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/subjects');
  }

  async getSubjectDetails(slug: string): Promise<any> {
    return this.request(`/subjects/${slug}`);
  }

  // Test Engine
  async createTest(config: {
    mode: string;
    title?: string;
    subjects?: string[];
    topics?: string[];
    difficulty?: string;
    question_count?: number;
    time_limit_minutes?: number;
    randomize_questions?: boolean;
    randomize_options?: boolean;
    negative_marking?: boolean;
    instant_feedback?: boolean;
  }): Promise<ActiveTestSession> {
    return this.request<ActiveTestSession>('/tests', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getCurrentActiveSession(): Promise<ActiveTestSession | null> {
    return this.request<ActiveTestSession | null>('/tests/active/current');
  }

  async getActiveSession(sessionId: string): Promise<ActiveTestSession> {
    return this.request<ActiveTestSession>(`/tests/${sessionId}`);
  }

  async saveAnswer(sessionId: string, payload: {
    session_question_id: string;
    selected_option_id?: string | null;
    is_marked_for_review?: boolean;
    time_spent_seconds?: number;
  }): Promise<any> {
    return this.request(`/tests/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitTest(sessionId: string): Promise<TestResult> {
    return this.request<TestResult>(`/tests/${sessionId}/submit`, {
      method: 'POST',
    });
  }

  async getTestResult(sessionId: string): Promise<TestResult> {
    return this.request<TestResult>(`/tests/${sessionId}/result`);
  }

  async getTestReview(sessionId: string): Promise<TestReviewData> {
    return this.request<TestReviewData>(`/tests/${sessionId}/review`);
  }

  // Question Reporting
  async reportQuestion(questionId: string, payload: { reason: string; description?: string }): Promise<any> {
    return this.request(`/questions/${questionId}/report`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Analytics & Practice
  async getOverviewAnalytics(): Promise<OverviewAnalytics> {
    return this.request<OverviewAnalytics>('/analytics/overview');
  }

  async getWeakAreas(): Promise<WeakAreaItem[]> {
    return this.request<WeakAreaItem[]>('/analytics/weak-areas');
  }

  async getMistakes(): Promise<any> {
    return this.request('/analytics/mistakes');
  }

  async getTestHistory(): Promise<any[]> {
    return this.request('/analytics/history');
  }

  async getLeaderboard(): Promise<any[]> {
    return this.request('/analytics/leaderboard');
  }

  async getBookmarks(): Promise<any[]> {
    return this.request('/bookmarks');
  }

  async toggleBookmark(questionId: string): Promise<{ bookmarked: boolean }> {
    return this.request(`/bookmarks/${questionId}`, {
      method: 'POST',
    });
  }

  // Admin Operations
  async getAdminOverview(): Promise<any> {
    return this.request('/admin/overview');
  }

  async getAdminQuestions(filters: Record<string, string> = {}): Promise<any[]> {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/admin/questions${params ? `?${params}` : ''}`);
  }

  async createAdminQuestion(payload: any): Promise<any> {
    return this.request('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAdminQuestion(questionId: string, payload: any): Promise<any> {
    return this.request(`/admin/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminQuestion(questionId: string): Promise<any> {
    return this.request(`/admin/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  async toggleQuestionStatus(questionId: string, status: string): Promise<any> {
    return this.request(`/admin/questions/${questionId}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  async getAdminReports(status?: string): Promise<any[]> {
    return this.request(`/admin/reports${status ? `?status=${status}` : ''}`);
  }

  async updateReportStatus(reportId: string, status: string): Promise<any> {
    return this.request(`/admin/reports/${reportId}?status=${status}`, {
      method: 'PATCH',
    });
  }

  async getAdminUsers(): Promise<any[]> {
    return this.request('/admin/users');
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string): Promise<any> {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
