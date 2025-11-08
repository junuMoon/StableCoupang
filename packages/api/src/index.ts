import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import walletRoutes from './routes/wallet';
import tokenRoutes from './routes/token';
import noditRoutes from './routes/nodit';
import { xrplService } from './services/xrplService';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 헬스 체크
app.get('/', (req: Request, res: Response) => {
  const useNodit = process.env.USE_NODIT === 'true';
  const hasNoditKey = !!process.env.NODIT_API_KEY;

  res.json({
    message: '쿠팡 스테이블 캐시 API 서버',
    status: 'running',
    network: {
      provider: useNodit && hasNoditKey ? 'Nodit' : 'Public XRPL',
      type: process.env.XRPL_NETWORK || 'testnet',
      noditEnabled: useNodit,
      noditConfigured: hasNoditKey,
    },
    endpoints: {
      wallet: {
        create: 'POST /api/wallet/create',
        balance: 'GET /api/wallet/balance/:address',
        transactions: 'GET /api/wallet/transactions/:address',
      },
      token: {
        setupTrustline: 'POST /api/token/setup-trustline',
        issue: 'POST /api/token/issue',
        payment: 'POST /api/token/payment',
      },
      nodit: {
        info: 'GET /api/nodit/info',
        serverInfo: 'GET /api/nodit/server-info',
      },
    },
  });
});

// API 라우트
app.use('/api/wallet', walletRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/nodit', noditRoutes);

// Issuer 설정 엔드포인트 (관리자용)
app.post('/api/admin/create-issuer', async (req: Request, res: Response) => {
  try {
    const issuer = await xrplService.createIssuer();
    res.json({
      success: true,
      data: issuer,
      message: '⚠️ Issuer seed를 .env 파일에 ISSUER_SEED로 저장하세요!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 서버 시작
async function startServer() {
  try {
    // XRP Ledger 연결
    await xrplService.connect();

    // Issuer 설정 (환경변수에 있는 경우)
    if (process.env.ISSUER_SEED) {
      xrplService.setIssuer(process.env.ISSUER_SEED);
    } else {
      console.log('⚠️  ISSUER_SEED가 설정되지 않았습니다.');
      console.log('   POST /api/admin/create-issuer 로 새 Issuer를 생성하세요.');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
      console.log(`📡 API 문서: http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

// 종료 처리
process.on('SIGINT', async () => {
  console.log('\n서버를 종료합니다...');
  await xrplService.disconnect();
  process.exit(0);
});

startServer();
