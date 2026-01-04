import { BaseEntity } from '../../common/entities/base-entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Message } from './message.entity';
import { UsersInRoom } from './users-in-room.entity';

export enum RoomType {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum RoomJoinType {
  OPEN = 'OPEN',
  PASSWORD = 'PASSWORD',
  INVITE = 'INVITE',
}

@Entity('rooms')
export class Room extends BaseEntity {
  @Column()
  name: string;

  @Column()
  max_users: number;

  @Column()
  room_type: RoomType;

  @Column()
  room_join_type: RoomJoinType;

  @Column({
    nullable: true,
  })
  password?: string;

  @ManyToOne(() => User, (user) => user.ownedRooms)
  owner: User;

  @OneToMany(() => UsersInRoom, (user) => user.room)
  users: UsersInRoom[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
