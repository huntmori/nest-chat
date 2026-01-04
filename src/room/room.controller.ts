import {
  Body,
  Controller,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UsersService } from '../users/users.service';
import { RoomPostDto } from './dto/room.post.dto';

@Controller('room')
export class RoomController {
  private readonly logger = new Logger('RoomController');
  constructor(
    private readonly roomService: RoomService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '채팅 방 생성' })
  async createRoom(@Req() req: RequestWithUser, @Body() dto: RoomPostDto) {
    this.logger.log('dto', dto);

    const userIdx = req.user.userIdx;

    const user = await this.usersService.getOneByIdx(userIdx);

    if (user === null) {
      throw new UnauthorizedException();
    }

    const room = await this.roomService.createRoom(user, dto);


  }
}
