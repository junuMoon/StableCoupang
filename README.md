# StableCoupang - 리뷰 리워드 서비스

XRP Ledger 기반의 스테이블 코인 플랫폼으로, AI가 평가한 리뷰 품질에 따라 KRW 토큰 리워드를 즉시 지급합니다.

## 핵심 컨셉

좋은 리뷰는 가치가 있습니다. AI가 리뷰의 품질을 평가하고, 가치 있는 리뷰어에게 안정적인 디지털 리워드를 지급합니다.

- 리뷰 = 광고: 좋은 리뷰야말로 최고의 광고
- 리뷰어 = 마이크로 인플루언서: 신뢰할 수 있는 리뷰어의 의견이 구매 결정에 영향
- 보상 = 스테이블코인: 실제 가치가 있는 KRW 토큰으로 즉시 지급

### 기능

- 제품 리뷰 작성 (텍스트 + 이미지)
- Google Gemini AI 기반 리뷰 품질 자동 평가 (0-100점)
- 평가 점수에 따른 KRW 스테이블코인 리워드 즉시 지급
- 사용자별 신뢰도(Reputation Score) 관리
- XRP Ledger 기반 지갑 자동 생성 및 토큰 관리
- 리뷰 피드 및 대시보드

자세한 내용은 [PRODUCT_SPEC.md](PRODUCT_SPEC.md)를 참고하세요.

## 프로젝트 구조

```
StableCoupang/
├── packages/
│   ├── api/          # Express 백엔드 (XRP Ledger API)
│   └── web/          # Next.js 프론트엔드
├── pnpm-workspace.yaml
├── package.json
├── README.md
└── PRODUCT_SPEC.md   # 제품 기획서
```

packages/api
- XRP Ledger와 Nodit API 연동을 위한 인프라 레이어
- 블록체인 지갑/토큰 관리 담당

packages/web
- Next.js App Router 기반
- Prisma + PostgreSQL (User, Product, Review, RewardHistory 모델 존재)
- NextAuth 인증
- 비즈니스 로직

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
- React Hook Form + Zod

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
pnpm dev
```

Issuer 계정 생성:
```bash
curl -X POST http://localhost:3000/api/admin/create-issuer
# 응답의 seed를 .env의 ISSUER_SEED에 저장
```

.env 파일:
```env
PORT=3000
XRPL_NETWORK=testnet
ISSUER_SEED=s...  # Issuer 계정 생성 후 입력
USE_NODIT=false
NODIT_API_KEY=    # 선택사항
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
