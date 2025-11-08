# 쿠팡 스테이블 캐시 (Stable Coupang)

XRP Ledger 기반 원화 스테이블코인 이커머스 결제 시스템

## 개요

쿠팡이 자체 스테이블코인을 발행하여 즉시 정산, 낮은 수수료, 투명한 거래를 구현하는 개념 증명(PoC) 프로젝트입니다.

### 핵심 기능

- **XRP Ledger 기반 KRW 스테이블코인 발행**
- **유저 지갑 생성 및 관리**
- **토큰 충전 (발행)**
- **결제 (송금)**
- **잔액 및 거래내역 조회**

## 시연 시나리오

1. 유저가 회원가입 시 자동으로 블록체인 지갑 생성
2. 마이페이지에서 KRW 토큰 충전 (발행)
3. 상품 구매 시 즉시 판매자에게 토큰 송금
4. 판매자는 실시간으로 정산 받음
5. 모든 거래는 블록체인에 투명하게 기록

## 기술 스택

- **블록체인**: XRP Ledger (Testnet)
- **인프라**: Nodit (XRPL 노드 제공, 선택사항)
- **백엔드**: Node.js, TypeScript, Express
- **라이브러리**: xrpl.js

## 프로젝트 구조

```
hackseoul/
├── src/
│   ├── index.ts              # 메인 서버
│   ├── types/
│   │   └── index.ts          # 타입 정의
│   ├── services/
│   │   ├── xrplService.ts    # XRP Ledger 서비스 로직 (WebSocket)
│   │   └── noditService.ts   # Nodit HTTP API 서비스
│   └── routes/
│       ├── wallet.ts         # 지갑 관련 API
│       ├── token.ts          # 토큰 관련 API
│       └── nodit.ts          # Nodit 전용 API
├── .env                      # 환경변수
├── README.md                 # 프로젝트 문서
├── NODIT_SETUP.md           # Nodit 연동 가이드
├── API.md                    # API 상세 문서
├── QUICKSTART.md            # 빠른 시작 가이드
└── test-flow.sh             # 자동 테스트 스크립트
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Issuer 계정 생성 (최초 1회만)

서버를 실행한 후:

```bash
# 서버 실행
npm run dev

# 새 터미널에서 Issuer 생성
curl -X POST http://localhost:3000/api/admin/create-issuer
```

응답으로 받은 `seed`를 `.env` 파일의 `ISSUER_SEED`에 저장:

```env
PORT=3000
XRPL_NETWORK=testnet
ISSUER_SEED=sXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. 서버 재시작

```bash
npm run dev
```

### (선택) Nodit 연동

더 빠르고 안정적인 XRPL 노드를 사용하려면 Nodit을 연동하세요.

1. https://nodit.io 에서 API 키 발급
2. `.env` 파일에 추가:
```env
NODIT_API_KEY=your_api_key_here
USE_NODIT=true
```
3. 서버 재시작

자세한 내용은 [NODIT_SETUP.md](NODIT_SETUP.md)를 참고하세요.

## API 사용법

### 기본 URL

```
http://localhost:3000
```

### 1. 유저 지갑 생성

```bash
curl -X POST http://localhost:3000/api/wallet/create
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX",
    "seed": "sXXXXXXXXXXXXXXXXXXXXXXXXX",
    "publicKey": "ED..."
  },
  "message": "지갑이 성공적으로 생성되었습니다. seed를 안전하게 보관하세요!"
}
```

**중요**: 받은 `seed`를 안전하게 보관하세요!

### 2. Trust Line 설정 (토큰 받기 전 필수)

```bash
curl -X POST http://localhost:3000/api/token/setup-trustline \
  -H "Content-Type: application/json" \
  -d '{
    "userSeed": "sXXXXXXXXXXXXXXXXXXXXXXXXX"
  }'
```

### 3. 토큰 충전 (발행)

```bash
curl -X POST http://localhost:3000/api/token/issue \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX",
    "amount": "10000"
  }'
```

### 4. 잔액 조회

```bash
curl http://localhost:3000/api/wallet/balance/rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX",
    "balances": [
      {
        "currency": "XRP",
        "value": "1000"
      },
      {
        "currency": "KRW",
        "value": "10000",
        "issuer": "rIssuerAddressXXXXXXXXXXXXXX"
      }
    ]
  }
}
```

### 5. 결제 (송금)

```bash
curl -X POST http://localhost:3000/api/token/payment \
  -H "Content-Type: application/json" \
  -d '{
    "fromSeed": "sXXXXXXXXXXXXXXXXXXXXXXXXX",
    "toAddress": "rSellerAddressXXXXXXXXXXXXXX",
    "amount": "5000",
    "currency": "KRW"
  }'
```

### 6. 거래내역 조회

```bash
curl "http://localhost:3000/api/wallet/transactions/rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX?limit=10"
```

## 전체 테스트 플로우

```bash
# 1. 유저 지갑 생성
USER_WALLET=$(curl -s -X POST http://localhost:3000/api/wallet/create)
USER_ADDRESS=$(echo $USER_WALLET | jq -r '.data.address')
USER_SEED=$(echo $USER_WALLET | jq -r '.data.seed')

echo "유저 주소: $USER_ADDRESS"
echo "유저 시드: $USER_SEED"

# 2. Trust Line 설정
curl -X POST http://localhost:3000/api/token/setup-trustline \
  -H "Content-Type: application/json" \
  -d "{\"userSeed\": \"$USER_SEED\"}"

# 3. 토큰 충전 (10,000 KRW)
curl -X POST http://localhost:3000/api/token/issue \
  -H "Content-Type: application/json" \
  -d "{\"toAddress\": \"$USER_ADDRESS\", \"amount\": \"10000\"}"

# 4. 잔액 확인
curl http://localhost:3000/api/wallet/balance/$USER_ADDRESS

# 5. 판매자 지갑 생성
SELLER_WALLET=$(curl -s -X POST http://localhost:3000/api/wallet/create)
SELLER_ADDRESS=$(echo $SELLER_WALLET | jq -r '.data.address')
SELLER_SEED=$(echo $SELLER_WALLET | jq -r '.data.seed')

echo "판매자 주소: $SELLER_ADDRESS"

# 6. 판매자 Trust Line 설정
curl -X POST http://localhost:3000/api/token/setup-trustline \
  -H "Content-Type: application/json" \
  -d "{\"userSeed\": \"$SELLER_SEED\"}"

# 7. 결제 (유저 → 판매자 5,000 KRW)
curl -X POST http://localhost:3000/api/token/payment \
  -H "Content-Type: application/json" \
  -d "{\"fromSeed\": \"$USER_SEED\", \"toAddress\": \"$SELLER_ADDRESS\", \"amount\": \"5000\", \"currency\": \"KRW\"}"

# 8. 양측 잔액 확인
echo "유저 잔액:"
curl http://localhost:3000/api/wallet/balance/$USER_ADDRESS

echo "판매자 잔액:"
curl http://localhost:3000/api/wallet/balance/$SELLER_ADDRESS
```

## API 엔드포인트 목록

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | API 문서 및 헬스체크 |
| POST | `/api/wallet/create` | 새 지갑 생성 |
| GET | `/api/wallet/balance/:address` | 잔액 조회 |
| GET | `/api/wallet/transactions/:address` | 거래내역 조회 |
| POST | `/api/token/setup-trustline` | Trust Line 설정 |
| POST | `/api/token/issue` | 토큰 충전 (발행) |
| POST | `/api/token/payment` | 결제 (송금) |
| POST | `/api/admin/create-issuer` | Issuer 계정 생성 (관리자) |

## 핵심 개념

### 1. Issuer (발행자)

- 쿠팡이 운영하는 토큰 발행 계정
- KRW 스테이블코인을 발행하는 주체
- 최초 1회 생성 후 `.env`에 저장하여 재사용

### 2. Trust Line

- 유저가 특정 토큰을 받기 위해 설정하는 신뢰선
- "이 Issuer가 발행한 토큰을 받겠다"는 의사표시
- 토큰을 받기 전 반드시 설정 필요

### 3. Issued Currency

- XRP Ledger에서 커스텀 토큰을 발행하는 방식
- `{currency: "KRW", issuer: "rXXX...", value: "10000"}` 형태

## 멘토 질문 리스트

1. **담보 모델**: 현재는 무담보 발행. Fiat-backed, Algorithmic, Synthetic 중 어떤 방식이 적합한가?
2. **규제 대응**: 토큰을 "포인트"로 포장하는 전략의 현실성은?
3. **온체인 정산**: 이커머스에서 온체인 정산의 효용을 더 강화할 수 있는 방법은?
4. **수수료 모델**: XRP Ledger 수수료는 극히 낮음. 추가 수익 모델은?

## 향후 개선사항

- [ ] 웹 프론트엔드 (React + 마이페이지 UI)
- [ ] 데이터베이스 연동 (유저-지갑 매핑)
- [ ] JWT 인증
- [ ] 담보 모델 구현
- [ ] 메인넷 전환
- [ ] 환율 oracle 연동

## 라이선스

MIT

## 팀

해커톤 프로젝트 - 쿠팡 스테이블 캐시 팀
