import { ApiProperty } from '@nestjs/swagger';

export class UsersDto {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
