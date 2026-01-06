import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UsersService } from '../users/users.service';
import { RoomPostDto } from './dto/room.post.dto';
import { RoomUpdateDto } from './dto/room-update.dto';
import { RoomJoinDto } from './dto/room-join.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { RoomListResponseDto } from './dto/room-list-response.dto';

@ApiTags('Room')
@Controller('api/room')
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
  async createRoom(
    @Req() req: RequestWithUser,
    @Body() dto: RoomPostDto,
  ): Promise<RoomResponseDto> {
    const user = await this.usersService.getOneByIdx(req.user.userIdx);

    if (!user) {
      throw new UnauthorizedException();
    }

    const room = await this.roomService.createRoom(user, dto);
    return RoomResponseDto.fromEntity(room);
  }

  @Get()
  @ApiOperation({ summary: '채팅 방 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRoomList(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<RoomListResponseDto> {
    const [rooms, total] = await this.roomService.getRoomList(
      Number(page),
      Number(limit),
    );

    return {
      rooms: rooms.map((room) => RoomResponseDto.fromEntity(room)),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  @Get(':roomUuid')
  @ApiOperation({ summary: '채팅 방 상세 조회' })
  async getRoomById(
    @Param('roomUuid') roomUuid: string,
  ): Promise<RoomResponseDto> {
    const room = await this.roomService.getRoomByUuid(roomUuid);
    return RoomResponseDto.fromEntity(room);
  }

  @Patch(':roomUuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '채팅 방 수정 (방장만 가능)' })
  async updateRoom(
    @Req() req: RequestWithUser,
    @Param('roomUuid') roomUuid: string,
    @Body() dto: RoomUpdateDto,
  ): Promise<RoomResponseDto> {
    const room = await this.roomService.updateRoom(
      roomUuid,
      req.user.userIdx,
      dto,
    );
    return RoomResponseDto.fromEntity(room);
  }

  @Delete(':roomUuid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '채팅 방 삭제 (방장만 가능)' })
  async deleteRoom(
    @Req() req: RequestWithUser,
    @Param('roomUuid') roomUuid: string,
  ): Promise<{ message: string }> {
    await this.roomService.deleteRoom(roomUuid, req.user.userIdx);
    return { message: 'Room deleted successfully' };
  }

  @Post(':roomUuid/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '채팅 방 입장' })
  async joinRoom(
    @Req() req: RequestWithUser,
    @Param('roomUuid') roomUuid: string,
    @Body() dto: RoomJoinDto,
  ): Promise<{ message: string }> {
    const user = await this.usersService.getOneByIdx(req.user.userIdx);

    if (!user) {
      throw new UnauthorizedException();
    }

    await this.roomService.joinRoom(roomUuid, user, dto.password);
    return { message: 'Joined room successfully' };
  }

  @Post(':roomUuid/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '채팅 방 퇴장' })
  async leaveRoom(
    @Req() req: RequestWithUser,
    @Param('roomUuid') roomUuid: string,
  ): Promise<{ message: string }> {
    await this.roomService.leaveRoom(roomUuid, req.user.userIdx);
    return { message: 'Left room successfully' };
  }

  @Get(':roomUuid/members')
  @ApiOperation({ summary: '채팅 방 멤버 목록 조회' })
  async getRoomMembers(@Param('roomUuid') roomUuid: string) {
    const members = await this.roomService.getRoomMembers(roomUuid);
    return members.map((member) => ({
      idx: member.user.idx,
      nickname: member.user.nickname,
      role: member.role,
      joinedAt: member.createdAt,
    }));
  }

  @Get(':roomUuid/check-membership')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '사용자의 방 입장 여부 확인' })
  async checkMembership(
    @Req() req: RequestWithUser,
    @Param('roomUuid') roomUuid: string,
  ): Promise<{ isMember: boolean }> {
    const isMember = await this.roomService.checkUserInRoom(
      roomUuid,
      req.user.userIdx,
    );
    return { isMember };
  }
}
