import { post, get } from './client';
import type { LoginResponse, UserVO } from '../types';

export function login(username: string, password: string) {
  return post<LoginResponse>('/auth/login', { username, password });
}

export function register(username: string, password: string, nickname: string, phone?: string) {
  return post<UserVO>('/auth/register', { username, password, nickname, phone });
}

export function getCurrentUser() {
  return get<UserVO>('/auth/me');
}
