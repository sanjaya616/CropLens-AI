import {
  AssessmentRecord,
  FieldContext,
  UserFeedback,
  VerifiedGuidance,
  DatasetSample,
} from '../types';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export async function analyzeAssessmentApi(
  files: File[],
  fieldContext: FieldContext | undefined,
  token: string,
  consentNoticeVersion = '1.0'
): Promise<{ success: boolean; assessment: AssessmentRecord }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  if (fieldContext) {
    formData.append('fieldContext', JSON.stringify(fieldContext));
  }
  formData.append('consentTimestamp', new Date().toISOString());
  formData.append('consentNoticeVersion', consentNoticeVersion);

  const res = await fetch('/api/assessments/analyze', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || `Analysis request failed with status ${res.status}`);
  }
  return data as { success: boolean; assessment: AssessmentRecord };
}

export async function getAssessmentsApi(token: string): Promise<{ assessments: AssessmentRecord[] }> {
  return request<{ assessments: AssessmentRecord[] }>('/api/assessments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAssessmentByIdApi(
  id: string,
  token: string
): Promise<{ assessment: AssessmentRecord }> {
  return request<{ assessment: AssessmentRecord }>(`/api/assessments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function deleteAssessmentApi(
  id: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/assessments/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getConditionsApi(): Promise<{ conditions: VerifiedGuidance[] }> {
  return request<{ conditions: VerifiedGuidance[] }>('/api/conditions');
}

export async function getConditionByIdApi(id: string): Promise<{ condition: VerifiedGuidance }> {
  return request<{ condition: VerifiedGuidance }>(`/api/conditions/${id}`);
}

export async function submitFeedbackApi(
  feedback: {
    assessmentId: string;
    conditionId: string;
    rating: number;
    comments: string;
  },
  token: string
): Promise<{ success: boolean; feedback: UserFeedback }> {
  return request<{ success: boolean; feedback: UserFeedback }>('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(feedback),
  });
}

export async function getAdminSummaryApi(token: string) {
  return request<{
    totalUsers: number;
    totalAssessments: number;
    conditionDistribution: Record<string, number>;
    totalFeedback: number;
    recentAssessments: Array<{
      assessmentId: string;
      userId: string;
      condition: string;
      category: string;
      district?: string;
      createdAt: string;
    }>;
    recentFeedback: UserFeedback[];
  }>('/api/admin/summary', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createAdminConditionApi(
  data: Partial<VerifiedGuidance>,
  token: string
): Promise<{ success: boolean; condition: VerifiedGuidance }> {
  return request<{ success: boolean; condition: VerifiedGuidance }>('/api/admin/conditions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function updateAdminConditionApi(
  id: string,
  data: Partial<VerifiedGuidance>,
  token: string
): Promise<{ success: boolean; condition: VerifiedGuidance }> {
  return request<{ success: boolean; condition: VerifiedGuidance }>(`/api/admin/conditions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function deleteAdminConditionApi(
  id: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/admin/conditions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getDatasetSamplesApi(): Promise<{ samples: DatasetSample[] }> {
  return request<{ samples: DatasetSample[] }>('/api/dataset/samples');
}
