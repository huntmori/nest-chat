import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseRequest } from '../../common/dto/base-request';

export class UsersPatchNickname extends BaseRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nickname: string;
}
