import axios from 'axios';
import type { ApiResult } from '../types';
import { message } from 'antd';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      message.error(data?.message || '请求失败');
    } else {
      message.error('网络异常，请检查服务是否启动');
    }
    return Promise.reject(error);
  },
);

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResult<T>> {
  const res = await client.get<ApiResult<T>>(url, { params });
  return res.data;
}

export async function post<T>(url: string, data?: unknown): Promise<ApiResult<T>> {
  const res = await client.post<ApiResult<T>>(url, data);
  return res.data;
}

export async function put<T>(url: string, data?: unknown): Promise<ApiResult<T>> {
  const res = await client.put<ApiResult<T>>(url, data);
  return res.data;
}

export default client;
