import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsersPatchNickname {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nickname: string;
}