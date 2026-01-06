import { ApiProperty } from '@nestjs/swagger';
import { RoomResponseDto } from './room-response.dto';

export class RoomListResponseDto {
  @ApiProperty({
    description: '채팅 방 목록',
    type: [RoomResponseDto],
    isArray: true,
  })
  rooms: RoomResponseDto[];

  @ApiProperty({ description: '전체 방 개수', example: 100 })
  total: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지당 개수', example: 20 })
  limit: number;
}
