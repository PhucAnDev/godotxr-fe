const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/** Lỗi trả về từ BE, mang theo message và danh sách errors chi tiết */
export class ApiError extends Error {
  public readonly status: number;
  public readonly errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/** Shape chuẩn của mọi response từ BE (ApiResponse<T>) */
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Tự động đính kèm Bearer token nếu có trong localStorage
  const token = localStorage.getItem('auth_token');
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers || {}),
    },
  });

  // Luôn parse JSON để lấy message từ BE
  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(response.status, `HTTP ${response.status}`);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.message || `HTTP ${response.status}`,
      body.errors ?? []
    );
  }

  return body;
}
