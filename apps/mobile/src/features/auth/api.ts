import type {
  AuthTokens,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UserDto,
} from '@elara/validation';
import { api } from '@/lib/api-client';

export interface AuthResponse {
  user: UserDto;
  tokens: AuthTokens;
}

export const authApi = {
  register: (input: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', input, { auth: false }),
  login: (input: LoginInput) => api.post<AuthResponse>('/auth/login', input, { auth: false }),
  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }, { auth: false }),
  forgotPassword: (input: ForgotPasswordInput) =>
    api.post<void>('/auth/forgot-password', input, { auth: false }),
  resetPassword: (input: ResetPasswordInput) =>
    api.post<void>('/auth/reset-password', input, { auth: false }),
};
