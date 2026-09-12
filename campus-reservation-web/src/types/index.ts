export interface LoginUser {
  id: number;
  username: string;
  nickname: string;
  role: 'ADMIN' | 'STUDENT';
}

export interface UserVO {
  id: number;
  username: string;
  nickname: string;
  role: string;
  phone: string;
  status: number;
}

export interface LoginResponse {
  token: string;
  user: UserVO;
}

export interface ResourceTypeVO {
  id: number;
  name: string;
  description: string;
  sort: number;
  status: number;
}

export interface CampusResourceVO {
  id: number;
  typeId: number;
  typeName: string;
  name: string;
  campus: string;
  building: string;
  roomNo: string;
  capacity: number;
  status: string;
  description: string;
  coverUrl: string;
}

export interface ResourceSlotVO {
  id: number;
  resourceId: number;
  resourceName: string;
  reserveDate: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  remainCapacity: number;
  status: string;
}

export interface ReservationVO {
  id: number;
  reservationNo: string;
  userId: number;
  username: string;
  nickname: string;
  resourceId: number;
  resourceName: string;
  slotId: number;
  reserveDate: string;
  startTime: string;
  endTime: string;
  status: string;
  cancelReason: string;
  createTime: string;
}

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  current: number;
  size: number;
  total: number;
  records: T[];
}
