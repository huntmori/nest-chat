import { Entity, Column, UpdateDateColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';
import { Message } from '../../room/entities/message.entity';
import { UsersInRoom } from '../../room/entities/users-in-room.entity';
import { Room } from '../../room/entities/room.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 100 })
  nickname: string;

  @Column({ length: 255 })
  password: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Room, (room) => room.owner)
  ownedRooms: Room[];

  @OneToMany(() => UsersInRoom, (room) => room.user)
  rooms: UsersInRoom[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
