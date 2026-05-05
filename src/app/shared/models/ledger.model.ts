export type LedgerType = 'credit' | 'debit';

export interface LedgerEntry {
  id: string;
  date: string;
  type: LedgerType;
  amount: number;
  description: string;
  referenceId?: string; // e.g., invoice ID or expense ID
  createdAt: string;
}
