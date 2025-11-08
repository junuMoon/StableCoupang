# 쿠팡 스테이블 캐시

XRP Ledger 기반의 스테이블 코인 플랫폼

## 프로젝트 구조 (모노레포)

```
StableCoupang/
├── packages/
│   ├── api/          # Express 백엔드 (XRP Ledger API)
│   └── web/          # Next.js 프론트엔드
├── pnpm-workspace.yaml
└── package.json
```

## 기술 스택

### 백엔드 (packages/api)
- Node.js + Express
- TypeScript
- XRP Ledger (xrpl)
- Nodit API (선택)

### 프론트엔드 (packages/web)
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- NextAuth.js v5
- Prisma + PostgreSQL

## 시작하기

### 1. 필수 요구사항
- Node.js 20+
- pnpm 10+
- PostgreSQL 14+

### 2. 설치

```bash
# 저장소 클론
git clone <your-repo-url>
cd StableCoupang

# 의존성 설치
pnpm install
```

### 3. 환경 변수 설정

#### 백엔드 (packages/api/.env)

```bash
cd packages/api
cp .env.example .env
```

.env 파일:
```env
PORT=3000
XRPL_NETWORK=testnet
ISSUER_SEED=s...  # Issuer 계정 생성 후 입력
USE_NODIT=false
NODIT_API_KEY=    # 선택사항
```

Issuer 계정 생성:
```bash
curl -X POST http://localhost:3000/api/admin/create-issuer
# 응답의 seed를 .env의 ISSUER_SEED에 저장
```

#### 프론트엔드 (packages/web/.env)

```bash
cd packages/web
```

.env 파일:
```env
# PostgreSQL 연결 정보
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/stable_coupang"

# NextAuth
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-random-secret-key"  # 랜덤 문자열로 변경

# 백엔드 API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"

# XRP Seed 암호화 키 (32자 이상)
ENCRYPTION_KEY="your-32-char-encryption-key"
```

### 4. 데이터베이스 설정

```bash
# PostgreSQL 데이터베이스 생성
createdb stable_coupang

# Prisma 마이그레이션 실행
cd packages/web
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 5. 실행

터미널 1 - 백엔드 실행:
```bash
pnpm dev:api
# 또는
cd packages/api
pnpm dev
```

터미널 2 - 프론트엔드 실행:
```bash
pnpm dev:web
# 또는
cd packages/web
pnpm dev
```

또는 한 번에 실행 (병렬):
```bash
pnpm dev
```

### 6. 접속

- 프론트엔드: http://localhost:3001
- 백엔드 API: http://localhost:3000

## 주요 기능

### 회원가입
1. 이메일/비밀번호로 회원가입
2. 자동으로 XRP 지갑 생성
3. Trust Line 자동 설정
4. 테스트넷 XRP 자동 충전

### 로그인
- NextAuth.js Credentials Provider 사용
- 세션 기반 인증

### 마이페이지
- KRW 토큰 잔액 조회
- XRP 잔액 조회
- 토큰 충전 (Issue)
- 거래 내역 조회

## API 엔드포인트

### 백엔드 API (포트 3000)
- `POST /api/wallet/create` - 지갑 생성
- `GET /api/wallet/balance/:address` - 잔액 조회
- `GET /api/wallet/transactions/:address` - 거래 내역
- `POST /api/token/setup-trustline` - Trust Line 설정
- `POST /api/token/issue` - 토큰 발행 (충전)
- `POST /api/token/payment` - 토큰 송금

자세한 API 문서: `packages/api/API.md`

### 프론트엔드 API (포트 3001)
- `POST /api/register` - 회원가입
- `POST /api/auth/signin` - 로그인 (NextAuth)

## 개발 스크립트

```bash
# 전체 모노레포
pnpm dev              # 모든 패키지 dev 모드 실행 (병렬)
pnpm build            # 모든 패키지 빌드

# 백엔드만
pnpm dev:api          # 백엔드 dev 모드
pnpm build:api        # 백엔드 빌드

# 프론트엔드만
pnpm dev:web          # 프론트엔드 dev 모드
pnpm build:web        # 프론트엔드 빌드
```

## 데이터베이스 스키마

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // bcrypt 해시
  name        String?
  xrpAddress  String   @unique
  xrpSeed     String   // 암호화됨
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 보안

- 비밀번호: bcrypt 해싱
- XRP Seed: AES-256-CBC 암호화
- 세션: JWT 기반
- CORS: 설정됨
- 환경 변수: .env 파일로 관리

## 주의사항

1. ISSUER_SEED는 절대 외부에 노출하지 마세요
2. .env 파일은 .gitignore에 포함되어 있습니다
3. 프로덕션 환경에서는 반드시 NEXTAUTH_SECRET과 ENCRYPTION_KEY를 변경하세요
4. 현재는 테스트넷을 사용합니다 (실제 자산 아님)

## 트러블슈팅

### PostgreSQL 연결 실패
- PostgreSQL이 실행 중인지 확인
- DATABASE_URL이 올바른지 확인
- 데이터베이스가 생성되었는지 확인

### 백엔드 API 연결 실패
- 백엔드가 3000 포트에서 실행 중인지 확인
- NEXT_PUBLIC_API_URL이 올바른지 확인

### Prisma 오류
```bash
cd packages/web
npx prisma generate
npx prisma migrate dev
```

## 라이선스

ISC

## 기여

Pull Request를 환영합니다!
