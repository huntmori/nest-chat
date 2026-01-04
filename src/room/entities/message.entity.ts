import { BaseEntity } from '../../common/entities/base-entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  message_type: string;

  @Column()
  message_content: string;

  @ManyToOne(() => Room, (room) => room.messages)
  room: Room;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;
}
