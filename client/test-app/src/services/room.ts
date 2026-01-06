import api from './api';

export enum RoomType {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum RoomJoinType {
  OPEN = 'OPEN',
  PASSWORD = 'PASSWORD',
  INVITE = 'INVITE',
}

export enum RoomStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

export interface RoomOwner {
  idx: number;
  nickname: string;
}

export interface Room {
  uuid: string;
  name: string;
  max_users: number;
  room_type: RoomType;
  room_join_type: RoomJoinType;
  status: RoomStatus;
  hasPassword: boolean;
  currentUsers: number;
  createdAt: string;
  owner: RoomOwner;
}

export interface CreateRoomData {
  name: string;
  max_users: number;
  room_type: RoomType;
  room_join_type: RoomJoinType;
  password?: string;
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const roomService = {
  async getRoomList(page = 1, limit = 20) {
    const response = await api.get<ApiResponse<RoomListResponse>>('/api/room', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async getRoomById(roomId: string) {
    const response = await api.get<ApiResponse<Room>>(`/api/room/${roomId}`);
    return response.data.data;
  },

  async createRoom(data: CreateRoomData) {
    const response = await api.post<ApiResponse<Room>>('/api/room', data);
    return response.data.data;
  },

  async updateRoom(roomId: string, data: Partial<CreateRoomData>) {
    const response = await api.patch<ApiResponse<Room>>(`/api/room/${roomId}`, data);
    return response.data.data;
  },

  async deleteRoom(roomId: string) {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/api/room/${roomId}`);
    return response.data.data;
  },

  async joinRoom(roomId: string, password?: string) {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `/api/room/${roomId}/join`,
      {
        password,
      },
    );
    return response.data.data;
  },

  async leaveRoom(roomId: string) {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `/api/room/${roomId}/leave`,
    );
    return response.data.data;
  },

  async getRoomMembers(roomId: string) {
    const response = await api.get<ApiResponse<any>>(`/api/room/${roomId}/members`);
    return response.data.data;
  },

  async checkMembership(roomId: string) {
    const response = await api.get<ApiResponse<{ isMember: boolean }>>(
      `/api/room/${roomId}/check-membership`,
    );
    return response.data.data;
  },
};
