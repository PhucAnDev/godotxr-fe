const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const AUTH_EXPIRED_EVENT = 'godotxr-auth-expired';

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

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

type RefreshTokenResponse = ApiResponse<{
  accessToken: string;
  refreshToken: string;
}>;

function clearAuthSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('user_role');
}

function notifyAuthExpired() {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export function subscribeAuthExpired(listener: () => void) {
  window.addEventListener(AUTH_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
}

// Mutex: đảm bảo chỉ có 1 refresh request tại 1 thời điểm.
// Các API call 401 đồng thời sẽ đợi kết quả chung thay vì gọi refresh riêng.
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshAccessToken(): Promise<string | null> {
  // Nếu đã có refresh đang chạy → đợi kết quả của nó
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = doRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefresh(): Promise<string | null> {
  const accessToken = localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  try {
    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken,
        refreshToken,
      }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const refreshBody = (await refreshResponse.json()) as RefreshTokenResponse;
    if (!refreshBody.data) {
      return null;
    }

    localStorage.setItem('auth_token', refreshBody.data.accessToken);
    localStorage.setItem('refresh_token', refreshBody.data.refreshToken);

    return refreshBody.data.accessToken;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOnUnauthorized = true
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('auth_token');
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const newAccessToken = await tryRefreshAccessToken();

    if (newAccessToken) {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccessToken}`,
          ...(options.headers || {}),
        },
      });
    } else {
      notifyAuthExpired();
    }
  }

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
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
