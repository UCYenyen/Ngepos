export interface XenditConnectProps {
  businessId: string;
}

export interface PaymentCredentialStatus {
  connected: boolean;
  status: string | null;
  keyLast4: string | null;
}
