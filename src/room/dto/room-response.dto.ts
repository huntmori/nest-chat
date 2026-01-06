import { ApiProperty } from '@nestjs/swagger';
import {
  Room,
  RoomJoinType,
  RoomStatus,
  RoomType,
} from '../entities/room.entity';

class RoomOwnerDto {
  @ApiProperty({ description: '방장 인덱스', example: 1 })
  idx: number;

  @ApiProperty({ description: '방장 닉네임', example: 'user123' })
  nickname: string;
}

export class RoomResponseDto {
  @ApiProperty({
    description: '방 UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({ description: '방 이름', example: '즐거운 채팅방' })
  name: string;

  @ApiProperty({ description: '최대 참여 인원', example: 10 })
  max_users: number;

  @ApiProperty({
    description: '방 타입',
    enum: RoomType,
    example: RoomType.PUBLIC,
  })
  room_type: RoomType;

  @ApiProperty({
    description: '입장 타입',
    enum: RoomJoinType,
    example: RoomJoinType.OPEN,
  })
  room_join_type: RoomJoinType;

  @ApiProperty({
    description: '방 상태',
    enum: RoomStatus,
    example: RoomStatus.ACTIVE,
  })
  status: RoomStatus;

  @ApiProperty({ description: '비밀번호 설정 여부', example: false })
  hasPassword: boolean;

  @ApiProperty({ description: '현재 참여 인원', example: 5 })
  currentUsers: number;

  @ApiProperty({
    description: '생성 일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({ description: '방장 정보', type: RoomOwnerDto })
  owner: {
    idx: number;
    nickname: string;
  };

  static fromEntity(room: Room): RoomResponseDto {
    return {
      uuid: room.uuid,
      name: room.name,
      max_users: room.max_users,
      room_type: room.room_type,
      room_join_type: room.room_join_type,
      status: room.status,
      hasPassword: !!room.password,
      currentUsers: room.users?.length || 0,
      createdAt: room.createdAt,
      owner: {
        idx: room.owner.idx,
        nickname: room.owner.nickname,
      },
    };
  }
}
