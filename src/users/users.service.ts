import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async createUser(
    id: string,
    password: string,
    email: string,
    nickname: string,
  ) {
    console.log('incoming params', id, password, email, nickname);

    const result = await this.userRepository.createOne(
      id,
      password,
      email,
      nickname,
    );

    console.log(result);

    return result;
  }

  async getOneByUuid(uuid: string) {
    return await this.userRepository.find({ uuid: uuid });
  }

  async getOneByIdx(idx: number) {
    return await this.userRepository.find({ idx: idx });
  }

  async updateNickname(idx: number, nickname: string) {
    const user = await this.getOneByIdx(idx);

    if (user === null) {
      throw new InternalServerErrorException();
    }

    user.nickname = nickname;

    const updated = await this.userRepository.update(idx, {
      nickname: nickname,
    });

    console.log(updated);

    return updated;
  }
}
