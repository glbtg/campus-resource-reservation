import { get, post, put } from './client';
import type { ResourceTypeVO } from '../types';

export function listResourceTypes() {
  return get<ResourceTypeVO[]>('/resource-types');
}

export function createResourceType(data: { name: string; description?: string; sort?: number }) {
  return post<ResourceTypeVO>('/resource-types', data);
}

export function updateResourceType(id: number, data: { name: string; description?: string; sort?: number }) {
  return put<ResourceTypeVO>(`/resource-types/${id}`, data);
}
