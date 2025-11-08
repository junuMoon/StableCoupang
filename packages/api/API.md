# API 문서

## 기본 정보

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

## 엔드포인트

### 1. 헬스 체크

```http
GET /
```

서버 상태 및 사용 가능한 엔드포인트 목록을 반환합니다.

**응답 예시:**
```json
{
  "message": "쿠팡 스테이블 캐시 API 서버",
  "status": "running",
  "endpoints": {
    "wallet": {...},
    "token": {...}
  }
}
```

---

## 지갑 API

### 2. 지갑 생성

```http
POST /api/wallet/create
```

새로운 사용자 지갑을 생성합니다. 테스트넷에서 자동으로 XRP가 충전됩니다.

**요청 바디**: 없음

**응답:**
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

**중요**: `seed`는 지갑의 개인키입니다. 안전하게 보관하세요!

---

### 3. 잔액 조회

```http
GET /api/wallet/balance/:address
```

특정 주소의 XRP 및 토큰 잔액을 조회합니다.

**경로 파라미터:**
- `address` (string): 조회할 지갑 주소

**응답:**
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

---

### 4. 거래 내역 조회

```http
GET /api/wallet/transactions/:address?limit=10
```

특정 주소의 거래 내역을 조회합니다.

**경로 파라미터:**
- `address` (string): 조회할 지갑 주소

**쿼리 파라미터:**
- `limit` (number, optional): 조회할 거래 수 (기본값: 10)

**응답:**
```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX",
    "transactions": [...]
  }
}
```

---

## 토큰 API

### 5. Trust Line 설정

```http
POST /api/token/setup-trustline
```

유저가 토큰을 받을 수 있도록 Trust Line을 설정합니다.
**토큰을 받기 전 반드시 실행해야 합니다.**

**요청 바디:**
```json
{
  "userSeed": "sXXXXXXXXXXXXXXXXXXXXXXXXX",
  "limit": "1000000000"  // optional, 기본값: 1000000000
}
```

**응답:**
```json
{
  "success": true,
  "hash": "ABC123..."
}
```

---

### 6. 토큰 발행 (충전)

```http
POST /api/token/issue
```

특정 주소로 KRW 토큰을 발행합니다. (충전 기능)

**요청 바디:**
```json
{
  "toAddress": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX",
  "amount": "10000"
}
```

**응답:**
```json
{
  "success": true,
  "hash": "ABC123...",
  "message": "10000 KRW 토큰이 발행되었습니다"
}
```

---

### 7. 결제 (송금)

```http
POST /api/token/payment
```

한 지갑에서 다른 지갑으로 토큰을 송금합니다. (결제 기능)

**요청 바디:**
```json
{
  "fromSeed": "sXXXXXXXXXXXXXXXXXXXXXXXXX",
  "toAddress": "rSellerAddressXXXXXXXXXXXXXX",
  "amount": "5000",
  "currency": "KRW"  // optional, 기본값: KRW
}
```

**응답:**
```json
{
  "success": true,
  "hash": "ABC123...",
  "message": "5000 KRW 송금이 완료되었습니다"
}
```

---

## 관리자 API

### 8. Issuer 계정 생성

```http
POST /api/admin/create-issuer
```

토큰 발행자(Issuer) 계정을 생성합니다. **최초 1회만 실행합니다.**

**요청 바디**: 없음

**응답:**
```json
{
  "success": true,
  "data": {
    "address": "rIssuerXXXXXXXXXXXXXXXXXXXX",
    "seed": "sXXXXXXXXXXXXXXXXXXXXXXXXX",
    "publicKey": "ED...",
    "privateKey": "..."
  },
  "message": "⚠️ Issuer seed를 .env 파일에 ISSUER_SEED로 저장하세요!"
}
```

**중요**: 받은 `seed`를 `.env` 파일에 저장하세요!

---

## 에러 응답

모든 API는 실패 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

**HTTP 상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `500`: 서버 에러

---

## 사용 순서

### 신규 유저 등록 플로우

1. **지갑 생성** (`POST /api/wallet/create`)
2. **Trust Line 설정** (`POST /api/token/setup-trustline`)
3. **토큰 충전** (`POST /api/token/issue`)
4. **잔액 확인** (`GET /api/wallet/balance/:address`)

### 결제 플로우

1. **유저**: 상품 구매 결정
2. **API**: 송금 실행 (`POST /api/token/payment`)
3. **판매자**: 즉시 토큰 수령
4. **양측**: 잔액 확인

---

## 예제 코드

### cURL

```bash
# 지갑 생성
curl -X POST http://localhost:3000/api/wallet/create

# 잔액 조회
curl http://localhost:3000/api/wallet/balance/rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX

# 토큰 충전
curl -X POST http://localhost:3000/api/token/issue \
  -H "Content-Type: application/json" \
  -d '{"toAddress": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX", "amount": "10000"}'
```

### JavaScript (fetch)

```javascript
// 지갑 생성
const createWallet = async () => {
  const response = await fetch('http://localhost:3000/api/wallet/create', {
    method: 'POST'
  });
  const data = await response.json();
  console.log(data);
};

// 잔액 조회
const getBalance = async (address) => {
  const response = await fetch(`http://localhost:3000/api/wallet/balance/${address}`);
  const data = await response.json();
  console.log(data);
};

// 결제
const makePayment = async (fromSeed, toAddress, amount) => {
  const response = await fetch('http://localhost:3000/api/token/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fromSeed,
      toAddress,
      amount,
      currency: 'KRW'
    })
  });
  const data = await response.json();
  console.log(data);
};
```

### Python (requests)

```python
import requests

# 지갑 생성
def create_wallet():
    response = requests.post('http://localhost:3000/api/wallet/create')
    return response.json()

# 잔액 조회
def get_balance(address):
    response = requests.get(f'http://localhost:3000/api/wallet/balance/{address}')
    return response.json()

# 결제
def make_payment(from_seed, to_address, amount):
    response = requests.post('http://localhost:3000/api/token/payment', json={
        'fromSeed': from_seed,
        'toAddress': to_address,
        'amount': amount,
        'currency': 'KRW'
    })
    return response.json()
```

---

## Nodit API

Nodit을 사용하면 더 빠르고 안정적인 XRPL 노드에 접근할 수 있습니다.

### 9. Nodit 상태 확인

```http
GET /api/nodit/info
```

Nodit 설정 상태와 활성화 여부를 확인합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "enabled": true,
    "network": "testnet",
    "status": "active",
    "message": "Nodit API가 활성화되어 있습니다."
  }
}
```

---

### 10. XRPL 서버 정보 (Nodit)

```http
GET /api/nodit/server-info
```

Nodit을 통해 XRPL 서버 정보를 조회합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "info": {
      "build_version": "1.12.0",
      "complete_ledgers": "32570-12345678",
      "hostid": "NODIT",
      ...
    }
  }
}
```

---

### 11. XRP 잔액 조회 (Nodit HTTP API)

```http
GET /api/nodit/balance/:address
```

Nodit HTTP API를 사용하여 XRP 잔액을 조회합니다.

**경로 파라미터:**
- `address` (string): 조회할 지갑 주소

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdlqtyMVrn3KiXXXXX",
    "xrpBalance": "999.99"
  }
}
```

---

### 12. Ledger 정보 조회 (Nodit)

```http
GET /api/nodit/ledger
```

현재 검증된 Ledger 정보를 조회합니다.

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "ledger_index": 12345678,
    "ledger_hash": "ABC123...",
    "closed": true,
    ...
  }
}
```

---

## Nodit 설정

Nodit을 사용하려면:

1. https://nodit.io 에서 API 키 발급
2. `.env` 파일에 설정:
```env
NODIT_API_KEY=your_api_key_here
USE_NODIT=true
```
3. 서버 재시작

자세한 내용은 [NODIT_SETUP.md](NODIT_SETUP.md)를 참고하세요.

---

## XRP Ledger Testnet Explorer

생성된 지갑과 거래를 블록체인에서 확인할 수 있습니다:

https://testnet.xrpl.org/

주소나 거래 해시를 검색하여 상세 정보를 확인하세요.
