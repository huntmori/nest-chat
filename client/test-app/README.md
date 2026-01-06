# Nest Chat Test App

NestJS 채팅 서버를 테스트하기 위한 Vue.js 클라이언트 애플리케이션

## 기능

- ✅ 회원가입 및 로그인
- ✅ 채팅방 목록 조회 (페이지네이션)
- ✅ 채팅방 생성 (공개/비공개, 비밀번호 설정)
- ✅ 채팅방 입장 (비밀번호 인증)
- ✅ 본인 소유 채팅방 삭제
- ✅ 채팅방 참여자 목록 조회
- ✅ 채팅방 나가기

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

### 3. 빌드
```bash
npm run build
```

## 사용 방법

### 1. 회원가입
- `/signup` 페이지에서 아이디, 이메일, 닉네임, 비밀번호 입력
- 회원가입 완료 후 자동으로 로그인 페이지로 이동

### 2. 로그인
- `/login` 페이지에서 이메일과 비밀번호 입력
- 로그인 성공 시 채팅방 목록 페이지로 이동

### 3. 채팅방 생성
- 채팅방 목록 페이지에서 "방 만들기" 버튼 클릭
- 방 이름, 최대 인원, 방 타입, 입장 타입 설정
- 비밀번호 입장 방식 선택 시 비밀번호 설정 가능

### 4. 채팅방 입장
- 채팅방 카드에서 "입장" 버튼 클릭
- 비밀번호가 설정된 방은 비밀번호 입력 모달이 표시됨

### 5. 채팅방 삭제
- 본인이 생성한 방에만 "삭제" 버튼이 표시됨
- 삭제 버튼 클릭 후 확인

## API 연동

백엔드 서버: `http://localhost:3000`

### 인증
- JWT 토큰 기반 인증
- 로그인 성공 시 `localStorage`에 `access_token` 저장
- 모든 API 요청에 `Authorization: Bearer {token}` 헤더 자동 추가

### 엔드포인트
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `GET /room` - 채팅방 목록
- `POST /room` - 채팅방 생성
- `GET /room/:id` - 채팅방 상세
- `DELETE /room/:id` - 채팅방 삭제
- `POST /room/:id/join` - 채팅방 입장
- `POST /room/:id/leave` - 채팅방 나가기
- `GET /room/:id/members` - 참여자 목록

## 기술 스택

- **Vue 3** - Composition API
- **TypeScript** - 타입 안정성
- **Vue Router** - 라우팅
- **Pinia** - 상태 관리 (준비됨)
- **Axios** - HTTP 클라이언트
- **jwt-decode** - JWT 토큰 디코딩

## 프로젝트 구조

```
src/
├── services/          # API 서비스 레이어
│   ├── api.ts        # Axios 인스턴스 및 인터셉터
│   ├── auth.ts       # 인증 관련 API
│   └── room.ts       # 채팅방 관련 API
├── views/            # 페이지 컴포넌트
│   ├── SignupView.vue
│   ├── LoginView.vue
│   ├── RoomListView.vue
│   └── RoomDetailView.vue
└── router/           # 라우터 설정
    └── index.ts
```

## 주의사항

- 백엔드 서버가 `http://localhost:3000`에서 실행 중이어야 합니다
- CORS 설정이 필요할 수 있습니다
- 현재 WebSocket 채팅 기능은 구현되지 않았습니다 (UI만 준비)
