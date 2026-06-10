export interface GatewayCheckoutProps {
  transactionId: string;
  invoiceUrl: string;
  total: number;
  onPaid: () => void;
  onCancel: () => void;
}
