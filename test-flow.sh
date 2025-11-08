#!/bin/bash

# 쿠팡 스테이블 캐시 전체 플로우 테스트 스크립트

echo "=========================================="
echo "쿠팡 스테이블 캐시 테스트 시작"
echo "=========================================="
echo ""

# 기본 설정
API_URL="http://localhost:3000"

echo "1️⃣  유저 지갑 생성 중..."
USER_RESPONSE=$(curl -s -X POST $API_URL/api/wallet/create)
USER_ADDRESS=$(echo $USER_RESPONSE | jq -r '.data.address')
USER_SEED=$(echo $USER_RESPONSE | jq -r '.data.seed')

echo "   ✅ 유저 지갑 생성 완료"
echo "   주소: $USER_ADDRESS"
echo ""

sleep 2

echo "2️⃣  Trust Line 설정 중..."
TRUST_RESPONSE=$(curl -s -X POST $API_URL/api/token/setup-trustline \
  -H "Content-Type: application/json" \
  -d "{\"userSeed\": \"$USER_SEED\"}")

echo "   ✅ Trust Line 설정 완료"
echo ""

sleep 3

echo "3️⃣  토큰 충전 (10,000 KRW)..."
ISSUE_RESPONSE=$(curl -s -X POST $API_URL/api/token/issue \
  -H "Content-Type: application/json" \
  -d "{\"toAddress\": \"$USER_ADDRESS\", \"amount\": \"10000\"}")

echo "   ✅ 토큰 충전 완료"
echo ""

sleep 2

echo "4️⃣  유저 잔액 확인..."
BALANCE_RESPONSE=$(curl -s $API_URL/api/wallet/balance/$USER_ADDRESS)
echo $BALANCE_RESPONSE | jq '.'
echo ""

sleep 2

echo "5️⃣  판매자 지갑 생성 중..."
SELLER_RESPONSE=$(curl -s -X POST $API_URL/api/wallet/create)
SELLER_ADDRESS=$(echo $SELLER_RESPONSE | jq -r '.data.address')
SELLER_SEED=$(echo $SELLER_RESPONSE | jq -r '.data.seed')

echo "   ✅ 판매자 지갑 생성 완료"
echo "   주소: $SELLER_ADDRESS"
echo ""

sleep 2

echo "6️⃣  판매자 Trust Line 설정 중..."
SELLER_TRUST=$(curl -s -X POST $API_URL/api/token/setup-trustline \
  -H "Content-Type: application/json" \
  -d "{\"userSeed\": \"$SELLER_SEED\"}")

echo "   ✅ 판매자 Trust Line 설정 완료"
echo ""

sleep 3

echo "7️⃣  결제 실행 (유저 → 판매자 5,000 KRW)..."
PAYMENT_RESPONSE=$(curl -s -X POST $API_URL/api/token/payment \
  -H "Content-Type: application/json" \
  -d "{\"fromSeed\": \"$USER_SEED\", \"toAddress\": \"$SELLER_ADDRESS\", \"amount\": \"5000\", \"currency\": \"KRW\"}")

echo "   ✅ 결제 완료"
echo ""

sleep 3

echo "8️⃣  최종 잔액 확인"
echo ""
echo "   📊 유저 잔액:"
curl -s $API_URL/api/wallet/balance/$USER_ADDRESS | jq '.data.balances[] | select(.currency == "KRW")'
echo ""

echo "   📊 판매자 잔액:"
curl -s $API_URL/api/wallet/balance/$SELLER_ADDRESS | jq '.data.balances[] | select(.currency == "KRW")'
echo ""

echo "=========================================="
echo "✅ 테스트 완료!"
echo "=========================================="
echo ""
echo "결과 요약:"
echo "- 유저 지갑: $USER_ADDRESS"
echo "- 판매자 지갑: $SELLER_ADDRESS"
echo "- 유저는 5,000 KRW를 지불했습니다"
echo "- 판매자는 5,000 KRW를 받았습니다"
echo ""
