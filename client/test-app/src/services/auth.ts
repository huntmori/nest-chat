import api from './api';

export interface SignupData {
  email: string;
  password: string;
  nickname: string;
  id: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  access_token_expired_at: string;
  refresh_token_expired_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const authService = {
  async signup(data: SignupData) {
    // Users API는 토큰을 반환하지 않으므로 회원가입 후 자동 로그인하지 않음
    const response = await api.post<ApiResponse<any>>('/api/users', data);
    return response.data.data;
  },

  async login(data: LoginData) {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    console.log('Login response:', response.data);
    const authData = response.data.data;
    if (authData.access_token) {
      localStorage.setItem('access_token', authData.access_token);
      console.log('Token saved to localStorage:', localStorage.getItem('access_token'));
    } else {
      console.error('No access_token in response:', response.data);
    }
    return authData;
  },

  logout() {
    localStorage.removeItem('access_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
