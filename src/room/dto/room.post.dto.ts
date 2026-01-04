import { RoomJoinType, RoomType } from '../entities/room.entity';
import { BaseRequest } from '../../common/dto/base-request';

export class RoomPostDto extends BaseRequest{
  name: string;
  max_users: number;
  room_type: RoomType;
  room_join_type: RoomJoinType;
  password?: string;
}
