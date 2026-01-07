/**
 * API Client for Prompt Optimizer Backend
 */

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'development' ? DEFAULT_DEV_API_BASE_URL : '');

type ErrorDetail = unknown;

function errorDetailToMessage(detail: ErrorDetail): string | null {
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object' && 'message' in detail && typeof (detail as any).message === 'string') {
    return (detail as any).message as string;
  }
  return null;
}

async function getResponseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: ErrorDetail; message?: unknown };
    const messageFromDetail = errorDetailToMessage(data.detail);
    if (messageFromDetail) return messageFromDetail;
    if (typeof data.message === 'string') return data.message;
    return `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  match_score: number;
  reasoning?: string;
}

export interface MatchFrameworksRequest {
  input: string;
  attachment?: string;
  user_type?: 'free' | 'pro';
  model?: string;
}

export interface MatchFrameworksResponse {
  frameworks: Framework[];
}

export interface GeneratePromptRequest {
  input: string;
  framework_id: string;
  clarification_answers: {
    goalClarity: string;
    targetAudience: string;
    contextCompleteness: string;
    formatRequirements: string;
    constraints: string;
  };
  attachment_content?: string;
  user_id?: string;
  account_type?: 'free' | 'pro';
  model?: string;
}

export interface GeneratePromptResponse {
  output: string;
  framework_used: string;
  version_id: string;
}

export interface Version {
  id: string;
  user_id: string;
  content: string;
  type: 'save' | 'optimize';
  created_at: string;
  formatted_title: string;
}

export interface SaveVersionRequest {
  user_id?: string;
  content: string;
  type: 'save' | 'optimize';
}

export interface QuotaResponse {
  used: number;
  total: number;
  reset_time: string;
  can_generate: boolean;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private buildUrl(path: string): string {
    // If baseURL is empty (common in production misconfig), fall back to relative URLs.
    if (!this.baseURL) return path;
    return `${this.baseURL}${path}`;
  }

  /**
   * Match frameworks based on user input
   */
  async matchFrameworks(request: MatchFrameworksRequest): Promise<MatchFrameworksResponse> {
<<<<<<< HEAD
    const url = `${this.baseURL}/frameworks`;
    console.log('[API Client] matchFrameworks - URL:', url);
    console.log('[API Client] matchFrameworks - baseURL:', this.baseURL);
    console.log('[API Client] matchFrameworks - Request:', request);
    
    const response = await fetch(url, {
=======
    const response = await fetch(this.buildUrl('/api/v1/frameworks/match'), {
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[API Client] matchFrameworks - Response status:', response.status);
    console.log('[API Client] matchFrameworks - Response URL:', response.url);

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[API Client] matchFrameworks - Error:', error);
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    const data = await response.json();
    console.log('[API Client] matchFrameworks - Success:', data);
    return data;
  }

  /**
   * Generate optimized prompt
   */
  async generatePrompt(request: GeneratePromptRequest): Promise<GeneratePromptResponse> {
<<<<<<< HEAD
    const response = await fetch(`${this.baseURL}/prompts`, {
=======
    const response = await fetch(this.buildUrl('/api/v1/prompts/generate'), {
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    return response.json();
  }

  /**
   * Get user's version list
   */
  async getVersions(userId: string = 'test_user', limit: number = 10): Promise<Version[]> {
    const response = await fetch(
<<<<<<< HEAD
      `${this.baseURL}/versions?user_id=${userId}&limit=${limit}`,
=======
      this.buildUrl(`/api/v1/versions?user_id=${encodeURIComponent(userId)}&limit=${limit}`),
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    return response.json();
  }

  /**
   * Save a new version
   */
  async saveVersion(request: SaveVersionRequest): Promise<Version> {
<<<<<<< HEAD
    const response = await fetch(`${this.baseURL}/versions`, {
=======
    const response = await fetch(this.buildUrl('/api/v1/versions'), {
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    return response.json();
  }

  /**
   * Get a specific version
   */
  async getVersion(versionId: string): Promise<Version> {
<<<<<<< HEAD
    const response = await fetch(`${this.baseURL}/versions/${versionId}`, {
=======
    const response = await fetch(this.buildUrl(`/api/v1/versions/${encodeURIComponent(versionId)}`), {
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    return response.json();
  }

  /**
   * Rollback to a specific version
   */
  async rollbackVersion(versionId: string, userId: string = 'test_user'): Promise<Version> {
    const response = await fetch(
<<<<<<< HEAD
      `${this.baseURL}/versions/${versionId}/rollback?user_id=${userId}`,
=======
      this.buildUrl(`/api/v1/versions/${encodeURIComponent(versionId)}/rollback?user_id=${encodeURIComponent(userId)}`),
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    return response.json();
  }

  /**
   * Get user quota information
   */
  async getQuota(userId: string = 'test_user', accountType: 'free' | 'pro' = 'free'): Promise<QuotaResponse> {
    // 获取用户时区偏移量（分钟）
    const timezoneOffset = -new Date().getTimezoneOffset();
    
    const response = await fetch(
<<<<<<< HEAD
      `${this.baseURL}/quota?user_id=${userId}&account_type=${accountType}&timezone_offset=${timezoneOffset}`,
=======
      this.buildUrl(`/api/v1/quota?user_id=${encodeURIComponent(userId)}&account_type=${accountType}`),
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
<<<<<<< HEAD
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
=======
      throw new Error(await getResponseErrorMessage(response));
>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
    }

    return response.json();
  }
}

export const apiClient = new APIClient();
