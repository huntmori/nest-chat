import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  private readonly logger: Logger = new Logger(UsersService.name);

  constructor(private readonly userRepository: UsersRepository) {}

  async createUser(
    id: string,
    password: string,
    email: string,
    nickname: string,
  ) {
    console.log('incoming params', id, password, email, nickname);
    const encryptedPassword = await bcrypt.hash(password, 10);
    const result = await this.userRepository.createOne(
      id,
      encryptedPassword,
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

  async updatePassword(idx: number, oldPassword: string, newPassword: string) {
    const user = await this.getOneByIdx(idx);

    if (user === null) {
      throw new InternalServerErrorException();
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new InternalServerErrorException();
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPassword;
    const updated = await this.userRepository.update(idx, {
      password: encryptedPassword,
    });

    this.logger.log('user password updated? ', updated !== null);

    return updated;
  }
}
