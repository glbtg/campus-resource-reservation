import { get, post, put } from './client';
import type { ResourceSlotVO } from '../types';

export function listSlots(params: {
  resourceId?: number;
  reserveDate?: string;
  status?: string;
}) {
  return get<ResourceSlotVO[]>('/slots', params as Record<string, unknown>);
}

export function createSlot(data: {
  resourceId: number;
  reserveDate: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
}) {
  return post<ResourceSlotVO>('/slots', data);
}

export function batchCreateSlots(data: {
  resourceId: number;
  reserveDates: string[];
  startTime: string;
  endTime: string;
  totalCapacity: number;
}) {
  return post<number>('/slots/batch', data);
}

export function closeSlot(id: number) {
  return put<void>(`/slots/${id}/close`);
}
