import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { RoomPostDto } from './dto/room.post.dto';
import { Room, RoomStatus } from './entities/room.entity';
import { DataSource, Repository } from 'typeorm';
import {
  UsersInRoom,
  UserInRoomRole,
  UserInRoomStatus,
} from './entities/users-in-room.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoomService {
  private readonly logger: Logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(UsersInRoom)
    private readonly usersInRoomRepository: Repository<UsersInRoom>,
    private readonly dataSource: DataSource,
  ) {}

  async createRoom(user: User, params: RoomPostDto): Promise<Room> {
    return await this.dataSource.transaction(async (manager) => {
      // 비밀번호가 필요한 경우 해싱
      let hashedPassword: string | undefined;
      if (params.password) {
        hashedPassword = await bcrypt.hash(params.password, 10);
      }

      const room = manager.create(Room, {
        owner: user,
        name: params.name,
        room_type: params.room_type,
        room_join_type: params.room_join_type,
        password: hashedPassword,
        max_users: params.max_users,
        status: RoomStatus.ACTIVE,
      });

      const savedRoom = await manager.save(room);
      this.logger.log(`Room created: ${savedRoom.uuid}`);

      const usersInRoom = manager.create(UsersInRoom, {
        user,
        room: savedRoom,
        status: UserInRoomStatus.JOINED,
        role: UserInRoomRole.OWNER,
      });

      await manager.save(usersInRoom);

      return savedRoom;
    });
  }

  async getRoomList(page = 1, limit = 20): Promise<[Room[], number]> {
    try {
      this.logger.log(`Getting room list - page: ${page}, limit: ${limit}`);
      // 임시로 status 조건 제거하여 모든 방 조회
      const result = await this.roomRepository.findAndCount({
        // where: { status: RoomStatus.ACTIVE },
        where: { users: { status: UserInRoomStatus.JOINED } },
        relations: ['owner', 'users'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      this.logger.log(
        `Found ${result[1]} total rooms, returning ${result[0].length} rooms for page ${page}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error getting room list:', error);
      throw error;
    }
  }

  async getRoomByUuid(roomUuid: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { uuid: roomUuid, status: RoomStatus.ACTIVE },
      relations: ['owner', 'users', 'users.user'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async updateRoom(
    roomUuid: string,
    userId: number,
    updateData: Partial<RoomPostDto>,
  ): Promise<Room> {
    const room = await this.getRoomByUuid(roomUuid);

    if (room.owner.idx !== userId) {
      throw new ForbiddenException('Only room owner can update the room');
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(room, updateData);
    return await this.roomRepository.save(room);
  }

  async deleteRoom(roomUuid: string, userId: number): Promise<void> {
    const room = await this.getRoomByUuid(roomUuid);

    if (room.owner.idx !== userId) {
      throw new ForbiddenException('Only room owner can delete the room');
    }

    room.status = RoomStatus.DELETED;
    await this.roomRepository.save(room);
  }

  async joinRoom(
    roomUuid: string,
    user: User,
    password?: string,
  ): Promise<UsersInRoom> {
    const room = await this.getRoomByUuid(roomUuid);

    // 이미 참여 중인지 확인
    const existingUser = await this.usersInRoomRepository.findOne({
      where: {
        room: { uuid: roomUuid },
        user: { idx: user.idx },
        status: UserInRoomStatus.JOINED,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Already joined this room');
    }

    // 인원 제한 확인
    const currentUsers = await this.usersInRoomRepository.count({
      where: {
        room: { uuid: roomUuid },
        status: UserInRoomStatus.JOINED,
      },
    });

    if (currentUsers >= room.max_users) {
      throw new BadRequestException('Room is full');
    }

    // 비밀번호 확인
    if (room.password) {
      if (!password) {
        throw new BadRequestException('Password required');
      }

      const isPasswordValid = await bcrypt.compare(password, room.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }
    }

    const usersInRoom = this.usersInRoomRepository.create({
      user,
      room,
      status: UserInRoomStatus.JOINED,
      role: UserInRoomRole.MEMBER,
    });

    return await this.usersInRoomRepository.save(usersInRoom);
  }

  async leaveRoom(roomId: string, userId: number): Promise<void> {
    const userInRoom = await this.usersInRoomRepository.findOne({
      where: {
        room: { uuid: roomId },
        user: { idx: userId },
        status: UserInRoomStatus.JOINED,
      },
      relations: ['room'],
    });

    if (!userInRoom) {
      throw new NotFoundException('Not a member of this room');
    }

    if (userInRoom.role === UserInRoomRole.OWNER) {
      throw new BadRequestException(
        'Owner cannot leave. Please delete the room or transfer ownership',
      );
    }

    userInRoom.status = UserInRoomStatus.LEFT;
    await this.usersInRoomRepository.save(userInRoom);
  }

  async getRoomMembers(roomId: string): Promise<UsersInRoom[]> {
    return await this.usersInRoomRepository.find({
      where: {
        room: { uuid: roomId },
        status: UserInRoomStatus.JOINED,
      },
      relations: ['user'],
      order: { role: 'ASC', createdAt: 'ASC' },
    });
  }

  async checkUserInRoom(roomId: string, userId: number): Promise<boolean> {
    const userInRoom = await this.usersInRoomRepository.findOne({
      where: {
        room: { uuid: roomId },
        user: { idx: userId },
        status: UserInRoomStatus.JOINED,
      },
    });
    return !!userInRoom;
  }
}
