/**
 * Nodit XRPL Web3 Data API 서비스
 * Nodit의 REST API를 사용하여 XRPL 데이터 조회
 */

interface NoditConfig {
  apiKey: string;
  network: 'mainnet' | 'testnet';
}

export class NoditService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: NoditConfig) {
    this.apiKey = config.apiKey;
    // Nodit Web3 Data API 엔드포인트
    const networkPath = config.network === 'mainnet' ? 'mainnet' : 'testnet';
    this.baseUrl = `https://web3.nodit.io/v1/xrpl/${networkPath}`;
  }

  /**
   * HTTP 요청 보내기 (헤더에 X-API-KEY 포함)
   */
  private async request(endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nodit API 요청 실패: ${response.status} ${errorText}`);
    }

    const result: any = await response.json();
    return result;
  }

  /**
   * Native Token(XRP) 잔액 조회
   */
  async getNativeTokenBalance(accountAddress: string): Promise<any> {
    return this.request('/native-token/getNativeTokenBalanceByAccount', {
      accountAddress,
    });
  }

  /**
   * 토큰 전송 내역 조회
   */
  async getTokenTransfers(
    accountAddress: string,
    currency?: string,
    issuer?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<any> {
    const data: any = {
      accountAddress,
      withCount: false,
    };

    if (currency) data.currency = currency;
    if (issuer) data.issuer = issuer;
    if (fromDate) data.fromDate = fromDate;
    if (toDate) data.toDate = toDate;

    return this.request('/token/getTokenTransfersByAccount', data);
  }

  /**
   * 계정의 토큰 잔액 조회
   */
  async getTokenBalance(
    accountAddress: string,
    currency: string,
    issuer: string
  ): Promise<any> {
    return this.request('/token/getTokenBalanceByAccount', {
      accountAddress,
      currency,
      issuer,
    });
  }

  /**
   * 계정 트랜잭션 조회
   */
  async getAccountTransactions(
    accountAddress: string,
    limit: number = 20
  ): Promise<any> {
    return this.request('/account/getAccountTransactions', {
      accountAddress,
      limit,
    });
  }

  /**
   * 계정 정보 조회
   */
  async getAccountInfo(accountAddress: string): Promise<any> {
    return this.request('/account/getAccountInfo', {
      accountAddress,
    });
  }

  /**
   * JSON-RPC 직접 호출 (XRPL 표준 메서드 사용)
   */
  async rpcCall(method: string, params: any[]): Promise<any> {
    // Nodit의 JSON-RPC 엔드포인트
    const rpcUrl = this.baseUrl.replace('/v1/xrpl/', '/v1/xrpl-rpc/');

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nodit RPC 요청 실패: ${response.statusText}`);
    }

    const data: any = await response.json();

    if (data.error) {
      throw new Error(`Nodit RPC 에러: ${data.error.message}`);
    }

    return data.result;
  }

  /**
   * 서버 정보 조회 (JSON-RPC)
   */
  async getServerInfo(): Promise<any> {
    return this.rpcCall('server_info', []);
  }

  /**
   * Ledger 정보 조회 (JSON-RPC)
   */
  async getLedger(ledgerIndex: number | 'validated' = 'validated'): Promise<any> {
    return this.rpcCall('ledger', [
      {
        ledger_index: ledgerIndex,
        transactions: false,
        expand: false,
      },
    ]);
  }
}

/**
 * Nodit 서비스 인스턴스 생성 헬퍼
 */
export function createNoditService(
  apiKey?: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): NoditService | null {
  if (!apiKey) {
    return null;
  }

  return new NoditService({ apiKey, network });
}

// 싱글톤 인스턴스 (환경변수에서 초기화)
export const noditService = createNoditService(
  process.env.NODIT_API_KEY,
  process.env.XRPL_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
);
