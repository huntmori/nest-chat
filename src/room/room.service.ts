import { Injectable, Logger } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { RoomPostDto } from './dto/room.post.dto';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import {
  UsersInRoom,
  UserInRoomRole,
  UserInRoomStatus,
} from './entities/users-in-room.entity';

@Injectable()
export class RoomService {
  private readonly logger: Logger = new Logger(RoomService.name);

  constructor(
    private readonly roomRepository: Repository<Room>,
    private readonly usersInRoomRepository: Repository<UsersInRoom>
  ) {}

  async createRoom(user: User, params: RoomPostDto) {
    const room = new Room();
    room.owner = user;
    room.name = params.name;
    room.room_type = params.room_type;
    room.room_join_type = params.room_join_type;
    room.password = params.password;
    room.max_users = params.max_users;

    const saved = await this.roomRepository.save(room);
    console.log('saved:', saved);

    const usersInRoom = new UsersInRoom();
    usersInRoom.user = user;
    usersInRoom.room = saved;
    usersInRoom.status = UserInRoomStatus.JOINED;
    usersInRoom.role = UserInRoomRole.OWNER;

    const savedUsersInRoom = await this.usersInRoomRepository.save(usersInRoom);



    return saved;
  }
}
