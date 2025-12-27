import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersDtoPost } from './dto/users.dto.post';
import { UsersService } from './users.service';
import { plainToInstance } from 'class-transformer';
import { UsersDto } from './dto/users.dto';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() dto: UsersDtoPost): UsersDto {
    console.log('dto', dto);
    console.log(process.env);

    const { id, password, email, nickname } = dto;
    const user = this.usersService.createUser(id, password, email, nickname);

    return plainToInstance(UsersDto, user);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '로그인 유저 프로필 조회' })
  async getMine(@Req() req: RequestWithUser): Promise<UsersDto> {
    const idx = req.user.userIdx;

    const user = await this.usersService.getOneByIdx(idx);

    if (user === null) {
      throw new UnauthorizedException();
    }

    return {
      uuid: user.uuid,
      nickname: user.nickname,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  @Get(':uuid')
  async getUser(@Param('uuid') uuid: string): Promise<UsersDto | null> {
    const user = await this.usersService.getOneByUuid(uuid);
    if (user === null) {
      return null;
    }

    return {
      uuid: user.uuid,
      nickname: user.nickname,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
