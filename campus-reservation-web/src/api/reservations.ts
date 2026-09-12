import { get, post, put } from './client';
import type { ReservationVO, PageResult } from '../types';

export function book(slotId: number) {
  return post<ReservationVO>('/reservations/book', { slotId });
}

export function cancel(id: number, reason?: string) {
  return put<void>(`/reservations/${id}/cancel`, { reason });
}

export function pageMyReservations(params: {
  status?: string;
  startDate?: string;
  endDate?: string;
  current?: number;
  size?: number;
}) {
  return get<PageResult<ReservationVO>>('/reservations/mine', params as Record<string, unknown>);
}

export function pageAdminReservations(params: {
  userId?: number;
  resourceId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  current?: number;
  size?: number;
}) {
  return get<PageResult<ReservationVO>>('/reservations/admin', params as Record<string, unknown>);
}
