export interface Wallet {
  address: string;
  seed: string;
  publicKey: string;
  privateKey: string;
}

export interface Balance {
  currency: string;
  value: string;
  issuer?: string;
}

export interface PaymentResponse {
  success: boolean;
  hash?: string;
  message?: string;
}

export interface IssuedCurrency {
  currency: string;
  issuer: string;
  value: string;
}
