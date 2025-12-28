import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      console.log('user not found', email);
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('isPasswordValid? :', isPasswordValid, 'password: ', password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.idx, user.email);
  }

  refresh(userId: number, email: string) {
    return this.generateTokens(userId, email);
  }

  private generateTokens(userIdx: number, email: string) {
    const accessToken = this.jwtService.sign(
      {
        sub: userIdx,
        email,
        type: 'access',
      },
      {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: userIdx,
        email,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: '7d',
      },
    );

    return {
      access_token: accessToken,
      refreshToken: refreshToken,
    };
  }
}
