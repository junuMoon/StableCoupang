import { Router, Request, Response } from 'express';
import { xrplService } from '../services/xrplService';

const router = Router();

/**
 * POST /api/token/setup-trustline
 * Trust Line 설정 (유저가 토큰을 받을 수 있게 함)
 */
router.post('/setup-trustline', async (req: Request, res: Response) => {
  try {
    const { userSeed, limit } = req.body;

    if (!userSeed) {
      return res.status(400).json({
        success: false,
        message: 'userSeed가 필요합니다',
      });
    }

    const result = await xrplService.setTrustLine(userSeed, limit);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/token/issue
 * 토큰 발행 (충전)
 */
router.post('/issue', async (req: Request, res: Response) => {
  try {
    const { toAddress, amount } = req.body;

    if (!toAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'toAddress와 amount가 필요합니다',
      });
    }

    const result = await xrplService.issueToken(toAddress, amount);

    res.json({
      ...result,
      message: result.success
        ? `${amount} KRW 토큰이 발행되었습니다`
        : result.message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/token/payment
 * 토큰 송금 (결제)
 */
router.post('/payment', async (req: Request, res: Response) => {
  try {
    const { fromSeed, toAddress, amount, currency } = req.body;

    if (!fromSeed || !toAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: 'fromSeed, toAddress, amount가 필요합니다',
      });
    }

    const result = await xrplService.sendPayment(
      fromSeed,
      toAddress,
      amount,
      currency || 'KRW'
    );

    res.json({
      ...result,
      message: result.success
        ? `${amount} ${currency || 'KRW'} 송금이 완료되었습니다`
        : result.message,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
