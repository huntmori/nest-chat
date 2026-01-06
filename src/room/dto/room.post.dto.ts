import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RoomJoinType, RoomType } from '../entities/room.entity';
import { BaseRequest } from '../../common/dto/base-request';

export class RoomPostDto extends BaseRequest {
  @ApiProperty({
    description: '채팅 방 이름',
    example: '즐거운 채팅방',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '최대 참여 인원',
    example: 10,
    minimum: 2,
    maximum: 100,
  })
  @IsInt()
  @Min(2)
  @Max(100)
  max_users: number;

  @ApiProperty({
    description: '방 타입',
    enum: RoomType,
    example: RoomType.PUBLIC,
  })
  @IsEnum(RoomType)
  room_type: RoomType;

  @ApiProperty({
    description: '입장 타입',
    enum: RoomJoinType,
    example: RoomJoinType.OPEN,
  })
  @IsEnum(RoomJoinType)
  room_join_type: RoomJoinType;

  @ApiProperty({
    description: '방 비밀번호 (PASSWORD 타입인 경우 필수)',
    example: 'password123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}
