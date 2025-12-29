import { BaseRequest } from '../../common/dto/base-request';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsersPatchPassword extends BaseRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '기존 비밀번호' })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '새로운 비밀번호' })
  newPassword: string;
}
