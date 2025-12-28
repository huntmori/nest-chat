import { Entity, Column, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base-entity';

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
}
