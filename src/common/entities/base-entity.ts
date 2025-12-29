import { Column, CreateDateColumn, Generated, PrimaryColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryColumn()
  @Generated('increment')
  idx: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
