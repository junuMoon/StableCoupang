## Repo Structure
### packages/api
- XRP Ledger와 Nodit API 연동을 위한 인프라 레이어
- 블록체인 지갑/토큰 관리만 담당
- 비즈니스 로직 없음

### packages/web
- Next.js App Router 기반
- Prisma + PostgreSQL (User, Product, Review, RewardHistory 모델 존재)
- NextAuth 인증
- 실제 비즈니스 로직이 여기 있어야 함