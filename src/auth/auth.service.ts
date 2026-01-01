import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { ApiException } from '../common/exceptions/ApiException';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    const EXCEPTION_CODE = 'auth.login.invalid_credentials';
    if (!user) {
      this.logger.log('user not found', email);
      throw new ApiException(EXCEPTION_CODE, ['Invalid credentials']);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    this.logger.log(
      'isPasswordValid? :',
      isPasswordValid,
      'password: ',
      password,
    );
    if (!isPasswordValid) {
      throw new ApiException(EXCEPTION_CODE, ['Invalid credentials']);
    }

    return this.generateTokens(user.idx, user.email, user.uuid);
  }

  refresh(userId: number, email: string, userUuid: string) {
    return this.generateTokens(userId, email, userUuid);
  }

  private generateTokens(userIdx: number, email: string, userUuid: string) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 개발 환경이면 약 100년(36500일), 아니면 15분/7일 설정
    const ACCESS_TOKEN_EXPIRES_STR = isDevelopment ? '36500d' : '15m';
    const REFRESH_TOKEN_EXPIRES_STR = isDevelopment ? '36500d' : '7d';

    // 응답용 만료 시간 계산 (밀리초 단위)
    const ACCESS_TOKEN_EXPIRES_IN = isDevelopment
      ? 36500 * 24 * 60 * 60 * 1000
      : 15 * 60 * 1000;
    const REFRESH_TOKEN_EXPIRES_IN = isDevelopment
      ? 36500 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    const now = Date.now();

    const accessToken = this.jwtService.sign(
      {
        sub: userIdx,
        userUuid,
        email,
        type: 'access',
      },
      {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: ACCESS_TOKEN_EXPIRES_STR,
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
        expiresIn: REFRESH_TOKEN_EXPIRES_STR,
      },
    );

    return {
      access_token: accessToken,
      access_token_expired_at: new Date(
        now + ACCESS_TOKEN_EXPIRES_IN,
      ).toISOString(),
      refresh_token: refreshToken,
      refresh_token_expired_at: new Date(
        now + REFRESH_TOKEN_EXPIRES_IN,
      ).toISOString(),
    };
  }
}
