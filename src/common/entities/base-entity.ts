import { Column, CreateDateColumn, Generated, PrimaryColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryColumn()
  idx: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @CreateDateColumn()
  @Column({ name: 'created_at' })
  createdAt: Date;
}
