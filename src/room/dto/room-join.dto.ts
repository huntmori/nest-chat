import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RoomJoinDto {
  @ApiProperty({
    description: '방 비밀번호 (PASSWORD 타입인 경우 필수)',
    example: 'password123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}
