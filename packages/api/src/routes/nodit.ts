import { Router, Request, Response } from 'express';
import { noditService } from '../services/noditService';

const router = Router();

/**
 * GET /api/nodit/info
 * Nodit 서비스 상태 확인
 */
router.get('/info', (req: Request, res: Response) => {
  const isConfigured = !!noditService;
  const isEnabled = process.env.USE_NODIT === 'true';

  res.json({
    success: true,
    data: {
      configured: isConfigured,
      enabled: isEnabled,
      network: process.env.XRPL_NETWORK || 'testnet',
      status: isConfigured && isEnabled ? 'active' : 'inactive',
      message: !isConfigured
        ? 'Nodit API 키가 설정되지 않았습니다. .env 파일에 NODIT_API_KEY를 추가하세요.'
        : !isEnabled
        ? 'Nodit이 비활성화되어 있습니다. USE_NODIT=true로 설정하세요.'
        : 'Nodit Web3 Data API가 활성화되어 있습니다.',
    },
  });
});

/**
 * GET /api/nodit/server-info
 * XRPL 서버 정보 조회 (Nodit JSON-RPC)
 */
router.get('/server-info', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const serverInfo = await noditService.getServerInfo();

    res.json({
      success: true,
      data: serverInfo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/nodit/balance/:address
 * Native Token(XRP) 잔액 조회 (Nodit Web3 Data API)
 */
router.get('/balance/:address', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const { address } = req.params;
    const result = await noditService.getNativeTokenBalance(address);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/nodit/account-info/:address
 * 계정 정보 조회 (Nodit Web3 Data API)
 */
router.get('/account-info/:address', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const { address } = req.params;
    const accountInfo = await noditService.getAccountInfo(address);

    res.json({
      success: true,
      data: accountInfo,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/nodit/token-balance
 * 토큰 잔액 조회 (Nodit Web3 Data API)
 */
router.post('/token-balance', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const { accountAddress, currency, issuer } = req.body;

    if (!accountAddress || !currency || !issuer) {
      return res.status(400).json({
        success: false,
        message: 'accountAddress, currency, issuer가 필요합니다.',
      });
    }

    const balance = await noditService.getTokenBalance(accountAddress, currency, issuer);

    res.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/nodit/token-transfers
 * 토큰 전송 내역 조회 (Nodit Web3 Data API)
 */
router.post('/token-transfers', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const { accountAddress, currency, issuer, fromDate, toDate } = req.body;

    if (!accountAddress) {
      return res.status(400).json({
        success: false,
        message: 'accountAddress가 필요합니다.',
      });
    }

    const transfers = await noditService.getTokenTransfers(
      accountAddress,
      currency,
      issuer,
      fromDate,
      toDate
    );

    res.json({
      success: true,
      data: transfers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/nodit/transactions/:address
 * 계정 트랜잭션 조회 (Nodit Web3 Data API)
 */
router.get('/transactions/:address', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const transactions = await noditService.getAccountTransactions(address, limit);

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/nodit/ledger
 * Ledger 정보 조회 (Nodit JSON-RPC)
 */
router.get('/ledger', async (req: Request, res: Response) => {
  try {
    if (!noditService) {
      return res.status(400).json({
        success: false,
        message: 'Nodit API 키가 설정되지 않았습니다.',
      });
    }

    const ledger = await noditService.getLedger();

    res.json({
      success: true,
      data: ledger,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
