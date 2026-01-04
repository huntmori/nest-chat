import { Room } from './room.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';

export enum UserInRoomStatus {
  JOINED = 'JOINED',
  LEFT = 'LEFT',
}

export enum UserInRoomRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

@Entity('users_in_rooms')
export class UsersInRoom extends BaseEntity {
  @ManyToOne(() => Room, (room) => room.users)
  room: Room;

  @ManyToOne(() => User, (user) => user.rooms)
  user: User;

  @Column()
  status: UserInRoomStatus = UserInRoomStatus.JOINED;

  @Column()
  role: UserInRoomRole = UserInRoomRole.MEMBER;

  @UpdateDateColumn()
  updated_at: Date;
}
