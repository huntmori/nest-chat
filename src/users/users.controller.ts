import {
  Body,
  Controller,
  Get, InternalServerErrorException,
  Param, Patch,
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
import { ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { UsersPatchNickname } from './dto/users.patch.nickname';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: UsersDtoPost): Promise<UsersDto | null> {
    console.log('dto', dto);
    console.log(process.env);

    const { id, password, email, nickname } = dto;
    const user = await this.usersService.createUser(
      id,
      password,
      email,
      nickname,
    );

    if (user === null) {
      throw new InternalServerErrorException();
    }

    return {
      uuid: user.uuid,
      nickname: user.nickname,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
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

  @Get('/uuid/:uuid')
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

  @Patch('/nickname')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '닉네임 변경' })
  async updateNickname(
    @Req() req: RequestWithUser,
    @Body() dto: UsersPatchNickname,
  ) {
    const idx = req.user.userIdx;
    const user = await this.usersService.getOneByIdx(idx);

    if (user === null) {
      throw new UnauthorizedException();
    }
    if (user.idx !== idx) {
      throw new UnauthorizedException();
    }
    const updatedUser = await this.usersService.updateNickname(
      idx,
      dto.nickname,
    );

    if (updatedUser === null) {
      throw new InternalServerErrorException();
    }

    return {
      uuid: updatedUser.uuid,
      nickname: updatedUser.nickname,
      created_at: updatedUser.createdAt,
      updated_at: updatedUser.updatedAt,
    };
  }
}
