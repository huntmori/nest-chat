# NestJS JWT 인증/인가 동작 과정

## 목차
1. [전체 구조](#전체-구조)
2. [모듈 구성](#모듈-구성)
3. [인증 흐름](#인증-흐름)
4. [토큰 갱신 흐름](#토큰-갱신-흐름)
5. [Guard 동작 원리](#guard-동작-원리)
6. [Strategy 동작 원리](#strategy-동작-원리)

---

## 전체 구조

```
src/
├── auth/
│   ├── auth.module.ts              # AuthModule 설정
│   ├── auth.service.ts             # 인증 비즈니스 로직
│   ├── auth.controller.ts          # 인증 엔드포인트
│   ├── strategies/
│   │   ├── jwt.strategy.ts         # Access Token 검증 전략
│   │   └── refresh.strategy.ts     # Refresh Token 검증 전략
│   ├── guards/
│   │   ├── jwt-auth.guard.ts       # Access Token Guard
│   │   └── jwt-refresh.guard.ts    # Refresh Token Guard
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       └── refresh.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.repository.ts
│   └── entities/user.entity.ts
└── common/
    ├── interceptors/response.interceptor.ts
    └── filters/http-exception.filter.ts
```

---

## 모듈 구성

### 1. AuthModule (`src/auth/auth.module.ts`)

```typescript
@Module({
  imports: [
    UsersModule,              // UsersRepository를 사용하기 위해 import
    PassportModule,           // Passport 인증 라이브러리
    JwtModule.register({      // JWT 토큰 생성/검증 모듈
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  exports: [AuthService],
})
```

**역할:**
- JWT 모듈 설정 (Access Token 기본 설정)
- Passport 통합
- Strategy들을 Provider로 등록

---

## 인증 흐름

### 1. 회원가입 (`POST /auth/register`)

```
Client Request
    ↓
Controller (@Post('register'))
    ↓
AuthService.register()
    ↓
1. bcrypt로 비밀번호 해싱
2. UsersRepository.create() - DB에 저장
3. generateTokens() - Access/Refresh Token 생성
    ↓
Response: { accessToken, refreshToken }
```

**코드 흐름:**

```typescript
// 1. Controller에서 요청 받음
@Post('register')
async register(@Body() dto: RegisterDto) {
  return await this.authService.register(dto.email, dto.name, dto.password);
}

// 2. Service에서 처리
async register(email: string, name: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호 해싱
  const user = await this.usersRepository.create(          // DB 저장
    email,
    name,
    hashedPassword,
  );
  return this.generateTokens(user.id, user.email);         // 토큰 생성
}

// 3. 토큰 생성
private generateTokens(userId: number, email: string) {
  const accessToken = this.jwtService.sign(
    { sub: userId, email, type: 'access' },
    { secret: JWT_SECRET, expiresIn: '15m' }
  );

  const refreshToken = this.jwtService.sign(
    { sub: userId, email, type: 'refresh' },
    { secret: JWT_REFRESH_SECRET, expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
```

---

### 2. 로그인 (`POST /auth/login`)

```
Client Request
    ↓
Controller (@Post('login'))
    ↓
AuthService.login()
    ↓
1. UsersRepository.findByEmail() - 이메일로 사용자 조회
2. bcrypt.compare() - 비밀번호 검증
3. generateTokens() - Access/Refresh Token 생성
    ↓
Response: { accessToken, refreshToken }
```

**코드 흐름:**

```typescript
async login(email: string, password: string) {
  // 1. 사용자 조회
  const user = await this.usersRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 2. 비밀번호 검증
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 3. 토큰 생성 및 반환
  return this.generateTokens(user.id, user.email);
}
```

---

## 토큰 갱신 흐름

### 3. 토큰 갱신 (`POST /auth/refresh`)

```
Client Request (with Refresh Token in body)
    ↓
@UseGuards(JwtRefreshGuard)  ← Guard 실행
    ↓
JwtRefreshGuard
    ↓
RefreshStrategy.validate()    ← Passport Strategy 실행
    ↓
1. JWT 토큰 추출 (body.refreshToken)
2. JWT 서명 검증
3. 토큰 만료 검증
4. Payload 추출 및 검증
5. validate() 반환값 → req.user에 할당
    ↓
Controller - refresh()
    ↓
AuthService.refresh(req.user.userId, req.user.email)
    ↓
generateTokens() - 새로운 Access/Refresh Token 생성
    ↓
Response: { accessToken, refreshToken }
```

**코드 흐름:**

```typescript
// 1. Controller - Guard 적용
@Post('refresh')
@UseGuards(JwtRefreshGuard)  // ← Guard가 먼저 실행됨
refresh(@Request() req: RequestWithUser) {
  // req.user는 RefreshStrategy.validate()의 반환값
  return this.authService.refresh(req.user.userId, req.user.email);
}

// 2. RefreshStrategy - 토큰 검증
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // body에서 토큰 추출
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: RefreshPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    // 이 반환값이 req.user에 할당됨
    return { userId: payload.sub, email: payload.email };
  }
}

// 3. Service - 새 토큰 생성
async refresh(userId: number, email: string) {
  return this.generateTokens(userId, email);
}
```

---

## Guard 동작 원리

### Guard의 역할
- 요청이 Controller에 도달하기 **전에** 실행됨
- 인증/인가 검사를 수행
- `true` 반환 → 요청 허용, `false` 반환 → 요청 거부

### JwtAuthGuard (`src/auth/guards/jwt-auth.guard.ts`)

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**동작 순서:**

```
1. @UseGuards(JwtAuthGuard) 실행
    ↓
2. AuthGuard('jwt') 실행
    ↓
3. 'jwt'라는 이름으로 등록된 Strategy 찾기
    ↓
4. JwtStrategy 실행
    ↓
5. JwtStrategy.validate() 실행
    ↓
6. validate() 반환값을 req.user에 할당
    ↓
7. Controller 메서드 실행
```

**사용 예시:**

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)  // ← Access Token 검증
getProfile(@Request() req: RequestWithUser) {
  return req.user;  // { userId, email }
}
```

### JwtRefreshGuard (`src/auth/guards/jwt-refresh.guard.ts`)

```typescript
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
```

**동작 순서:**

```
1. @UseGuards(JwtRefreshGuard) 실행
    ↓
2. AuthGuard('jwt-refresh') 실행
    ↓
3. 'jwt-refresh'라는 이름으로 등록된 Strategy 찾기
    ↓
4. RefreshStrategy 실행
    ↓
5. RefreshStrategy.validate() 실행
    ↓
6. validate() 반환값을 req.user에 할당
    ↓
7. Controller 메서드 실행
```

---

## Strategy 동작 원리

### Passport Strategy란?
- **인증 방식을 정의하는 클래스**
- JWT 토큰 추출 → 검증 → 사용자 정보 반환

### JwtStrategy (`src/auth/strategies/jwt.strategy.ts`)

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Header에서 추출
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    // 이 반환값이 req.user가 됨
    return { userId: payload.sub, email: payload.email };
  }
}
```

**동작 과정:**

```
1. HTTP Header에서 토큰 추출
   Authorization: Bearer <access_token>
    ↓
2. JWT 서명 검증 (SECRET_KEY 사용)
    ↓
3. 토큰 만료 검증
    ↓
4. Payload 디코딩
   {
     sub: 1,
     email: "user@example.com",
     type: "access",
     iat: 1234567890,
     exp: 1234567890
   }
    ↓
5. validate() 메서드 실행
    ↓
6. 반환값을 req.user에 할당
   req.user = { userId: 1, email: "user@example.com" }
```

### RefreshStrategy (`src/auth/strategies/refresh.strategy.ts`)

```typescript
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // Body에서 추출
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload: RefreshPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
```

**JwtStrategy vs RefreshStrategy 차이점:**

| 구분 | JwtStrategy | RefreshStrategy |
|------|-------------|-----------------|
| 토큰 추출 위치 | HTTP Header (`Authorization: Bearer`) | HTTP Body (`refreshToken`) |
| 시크릿 키 | `JWT_SECRET` | `JWT_REFRESH_SECRET` |
| 토큰 타입 | `access` | `refresh` |
| 사용 용도 | API 요청 인증 | 토큰 갱신 |
| 만료 시간 | 15분 | 7일 |

---

## 실제 사용 예시

### 1. 보호된 엔드포인트 만들기

```typescript
@Controller('users')
export class UsersController {
  // Access Token이 필요한 엔드포인트
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    // req.user는 JwtStrategy.validate()의 반환값
    return {
      userId: req.user.userId,
      email: req.user.email,
    };
  }

  // Access Token이 필요한 엔드포인트
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.update(req.user.userId, dto);
  }
}
```

### 2. 클라이언트 사용 흐름

```javascript
// 1. 로그인
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: '123456' })
});
const { accessToken, refreshToken } = await loginResponse.json();

// 2. Access Token을 사용한 API 요청
const profileResponse = await fetch('/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// 3. Access Token 만료 시 갱신
const refreshResponse = await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
  await refreshResponse.json();
```

---

## 에러 처리

### 인증 실패 시나리오

1. **토큰이 없는 경우**
   - Guard에서 자동으로 `401 Unauthorized` 반환

2. **토큰이 만료된 경우**
   - Strategy에서 자동으로 `401 Unauthorized` 반환

3. **토큰 서명이 잘못된 경우**
   - Strategy에서 자동으로 `401 Unauthorized` 반환

4. **토큰 타입이 잘못된 경우**
   - `validate()`에서 `UnauthorizedException` throw

**모든 에러는 `HttpExceptionFilter`에서 처리:**

```json
{
  "success": false,
  "data": null,
  "message": "Unauthorized",
  "timestamp": "2025-12-27T10:30:00.000Z"
}
```

---

## 환경 변수 설정

`.env` 파일:

```env
# JWT 설정
JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=nest_chat

# 환경
NODE_ENV=development
PORT=3000
```

---

## 보안 고려사항

1. **Secret Key 관리**
   - 프로덕션 환경에서는 반드시 강력한 Secret Key 사용
   - 환경 변수로 관리하고 절대 하드코딩 금지

2. **토큰 만료 시간**
   - Access Token: 짧게 (15분 권장)
   - Refresh Token: 길게 (7일 권장)

3. **HTTPS 사용**
   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - 토큰이 평문으로 전송되므로 암호화 필수

4. **Refresh Token 저장**
   - 클라이언트: HttpOnly Cookie 또는 Secure Storage
   - 서버: DB에 저장하여 무효화 가능하도록 구현 권장

5. **비밀번호 해싱**
   - bcrypt 사용 (salt rounds: 10)
   - 절대 평문으로 저장 금지

---

## 요약

```
인증 흐름:
Login → AuthService → 토큰 생성 → 클라이언트 저장

API 요청 흐름:
Request → Guard → Strategy → validate() → req.user 할당 → Controller

토큰 갱신 흐름:
Refresh Token → RefreshGuard → RefreshStrategy → 새 토큰 생성

핵심 개념:
- Guard: 요청 전 인증 검사
- Strategy: 토큰 검증 로직
- validate(): req.user에 할당할 값 반환
```
