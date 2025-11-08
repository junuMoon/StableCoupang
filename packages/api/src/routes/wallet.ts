import { Router, Request, Response } from 'express';
import { xrplService } from '../services/xrplService';

const router = Router();

/**
 * POST /api/wallet/create
 * 새 유저 지갑 생성
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const wallet = await xrplService.createWallet();

    res.json({
      success: true,
      data: {
        address: wallet.address,
        seed: wallet.seed,
        publicKey: wallet.publicKey,
      },
      message: '지갑이 성공적으로 생성되었습니다. seed를 안전하게 보관하세요!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/wallet/balance/:address
 * 지갑 잔액 조회
 */
router.get('/balance/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balances = await xrplService.getBalance(address);

    res.json({
      success: true,
      data: {
        address,
        balances,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/wallet/transactions/:address
 * 거래 내역 조회
 */
router.get('/transactions/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const transactions = await xrplService.getTransactions(address, limit);

    res.json({
      success: true,
      data: {
        address,
        transactions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
