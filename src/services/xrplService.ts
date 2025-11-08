import { Client, Wallet as XrplWallet, Payment, TrustSet } from 'xrpl';
import { Wallet, Balance, PaymentResponse } from '../types';

export class XRPLService {
  private client: Client;
  private issuerWallet: XrplWallet | null = null;
  private readonly CURRENCY_CODE = 'KRW'; // 원화 스테이블코인
  private networkUrl: string;
  private useNodit: boolean = false;

  constructor(network?: string, noditApiKey?: string, useNodit?: boolean) {
    // Nodit 사용 여부 결정
    this.useNodit = useNodit || false;

    // 네트워크 URL 결정
    if (this.useNodit && noditApiKey) {
      // Nodit WebSocket 엔드포인트
      // Testnet: wss://xrpl-testnet.nodit.io/{API_KEY}
      // Mainnet: wss://xrpl.nodit.io/{API_KEY}
      const noditNetwork = network === 'mainnet' ? 'xrpl' : 'xrpl-testnet';
      this.networkUrl = `wss://${noditNetwork}.nodit.io/${noditApiKey}`;
      console.log(`🔗 Nodit XRPL 엔드포인트 사용: ${noditNetwork}`);
    } else {
      // 기본 XRPL 공용 엔드포인트
      this.networkUrl = network || 'wss://s.altnet.rippletest.net:51233';
    }

    this.client = new Client(this.networkUrl);
  }

  /**
   * XRP Ledger 연결
   */
  async connect(): Promise<void> {
    if (!this.client.isConnected()) {
      await this.client.connect();
      console.log(`✅ XRPL 연결 성공${this.useNodit ? ' (via Nodit)' : ''}`);
      console.log(`   엔드포인트: ${this.networkUrl.replace(/\/[^\/]+$/, '/***')}`);
    }
  }

  /**
   * XRP Ledger 연결 해제
   */
  async disconnect(): Promise<void> {
    if (this.client.isConnected()) {
      await this.client.disconnect();
      console.log('✅ XRPL 연결 해제');
    }
  }

  /**
   * Issuer 지갑 설정 (토큰 발행자)
   */
  setIssuer(seed: string): void {
    this.issuerWallet = XrplWallet.fromSeed(seed);
    console.log(`✅ Issuer 지갑 설정 완료: ${this.issuerWallet.address}`);
  }

  /**
   * Issuer 지갑 생성 (새로 만들 때만 사용)
   */
  async createIssuer(): Promise<Wallet> {
    await this.connect();

    const wallet = (await this.client.fundWallet()).wallet;
    this.issuerWallet = wallet;

    console.log('✅ 새 Issuer 지갑 생성:');
    console.log(`   주소: ${wallet.address}`);
    console.log(`   시드: ${wallet.seed}`);
    console.log('⚠️  시드를 .env 파일에 저장하세요!');

    return {
      address: wallet.address,
      seed: wallet.seed || '',
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * 새 유저 지갑 생성 (테스트넷 XRP 자동 충전)
   */
  async createWallet(): Promise<Wallet> {
    await this.connect();

    const fundResult = await this.client.fundWallet();
    const wallet = fundResult.wallet;

    console.log(`✅ 새 유저 지갑 생성: ${wallet.address}`);

    return {
      address: wallet.address,
      seed: wallet.seed || '',
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * 지갑 잔액 조회 (XRP + 발행된 토큰)
   */
  async getBalance(address: string): Promise<Balance[]> {
    await this.connect();

    const balances: Balance[] = [];

    // 1. XRP 잔액 조회
    const account = await this.client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    });

    const xrpBalance = Number(account.result.account_data.Balance) / 1_000_000;
    balances.push({
      currency: 'XRP',
      value: xrpBalance.toString(),
    });

    // 2. 발행된 토큰 잔액 조회
    try {
      const lines = await this.client.request({
        command: 'account_lines',
        account: address,
        ledger_index: 'validated',
      });

      if (lines.result.lines) {
        for (const line of lines.result.lines) {
          balances.push({
            currency: line.currency,
            value: line.balance,
            issuer: line.account,
          });
        }
      }
    } catch (error) {
      console.log('토큰 잔액 없음 또는 조회 실패');
    }

    return balances;
  }

  /**
   * Trust Line 설정 (유저가 토큰을 받을 수 있도록 설정)
   */
  async setTrustLine(userSeed: string, limit: string = '1000000000'): Promise<PaymentResponse> {
    await this.connect();

    if (!this.issuerWallet) {
      throw new Error('Issuer 지갑이 설정되지 않았습니다');
    }

    const userWallet = XrplWallet.fromSeed(userSeed);

    const trustSet: TrustSet = {
      TransactionType: 'TrustSet',
      Account: userWallet.address,
      LimitAmount: {
        currency: this.CURRENCY_CODE,
        issuer: this.issuerWallet.address,
        value: limit,
      },
    };

    try {
      const prepared = await this.client.autofill(trustSet);
      const signed = userWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      console.log(`✅ Trust Line 설정 완료: ${userWallet.address}`);

      return {
        success: true,
        hash: result.result.hash,
      };
    } catch (error: any) {
      console.error('Trust Line 설정 실패:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 토큰 발행 (유저에게 KRW 토큰 송금)
   */
  async issueToken(toAddress: string, amount: string): Promise<PaymentResponse> {
    await this.connect();

    if (!this.issuerWallet) {
      throw new Error('Issuer 지갑이 설정되지 않았습니다');
    }

    const payment: Payment = {
      TransactionType: 'Payment',
      Account: this.issuerWallet.address,
      Destination: toAddress,
      Amount: {
        currency: this.CURRENCY_CODE,
        value: amount,
        issuer: this.issuerWallet.address,
      },
    };

    try {
      const prepared = await this.client.autofill(payment);
      const signed = this.issuerWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      console.log(`✅ 토큰 발행 완료: ${amount} ${this.CURRENCY_CODE} → ${toAddress}`);

      return {
        success: true,
        hash: result.result.hash,
      };
    } catch (error: any) {
      console.error('토큰 발행 실패:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 토큰 송금 (유저 간 송금 또는 결제)
   */
  async sendPayment(
    fromSeed: string,
    toAddress: string,
    amount: string,
    currency: string = 'KRW'
  ): Promise<PaymentResponse> {
    await this.connect();

    const fromWallet = XrplWallet.fromSeed(fromSeed);

    let paymentAmount: any;

    if (currency === 'XRP') {
      // XRP는 drops 단위로 전송
      paymentAmount = (parseFloat(amount) * 1_000_000).toString();
    } else {
      // 토큰은 Issued Currency로 전송
      if (!this.issuerWallet) {
        throw new Error('Issuer 지갑이 설정되지 않았습니다');
      }

      paymentAmount = {
        currency: currency,
        value: amount,
        issuer: this.issuerWallet.address,
      };
    }

    const payment: Payment = {
      TransactionType: 'Payment',
      Account: fromWallet.address,
      Destination: toAddress,
      Amount: paymentAmount,
    };

    try {
      const prepared = await this.client.autofill(payment);
      const signed = fromWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      console.log(`✅ 송금 완료: ${amount} ${currency} → ${toAddress}`);

      return {
        success: true,
        hash: result.result.hash,
      };
    } catch (error: any) {
      console.error('송금 실패:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 거래 내역 조회
   */
  async getTransactions(address: string, limit: number = 10): Promise<any[]> {
    await this.connect();

    try {
      const response = await this.client.request({
        command: 'account_tx',
        account: address,
        limit: limit,
        ledger_index_min: -1,
        ledger_index_max: -1,
      });

      return response.result.transactions || [];
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
      return [];
    }
  }
}

// 싱글톤 인스턴스 (환경변수에서 초기화)
const network = process.env.XRPL_NETWORK || 'testnet';
const noditApiKey = process.env.NODIT_API_KEY;
const useNodit = process.env.USE_NODIT === 'true';

export const xrplService = new XRPLService(
  network === 'mainnet' ? 'mainnet' : undefined,
  noditApiKey,
  useNodit
);
