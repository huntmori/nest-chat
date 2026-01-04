import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}
  async createOne(
    id: string,
    password: string,
    email: string,
    nickname: string,
  ) {
    const user = new User();
    user.id = id;
    user.password = password;
    user.email = email;
    user.nickname = nickname;

    return this.repository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({ where: { idx: id } });
  }

  async find(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User | null> {
    return await this.repository.findOne({ where: where });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result?.affected ?? 0) > 0;
  }
}
