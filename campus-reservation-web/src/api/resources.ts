import { get, post, put } from './client';
import type { CampusResourceVO, PageResult } from '../types';

export function pageResources(params: {
  typeId?: number;
  keyword?: string;
  status?: string;
  current?: number;
  size?: number;
}) {
  return get<PageResult<CampusResourceVO>>('/resources', params as Record<string, unknown>);
}

export function getResourceDetail(id: number) {
  return get<CampusResourceVO>(`/resources/${id}`);
}

export function createResource(data: {
  typeId: number;
  name: string;
  campus?: string;
  building?: string;
  roomNo?: string;
  capacity: number;
  status?: string;
  description?: string;
  coverUrl?: string;
}) {
  return post<CampusResourceVO>('/resources', data);
}

export function updateResource(id: number, data: {
  typeId: number;
  name: string;
  campus?: string;
  building?: string;
  roomNo?: string;
  capacity: number;
  status?: string;
  description?: string;
  coverUrl?: string;
}) {
  return put<CampusResourceVO>(`/resources/${id}`, data);
}

export function updateResourceStatus(id: number, status: string) {
  return put<void>(`/resources/${id}/status`, { status });
}
