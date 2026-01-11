
export type UserRole = 'OWNER' | 'MANAGER' | 'SALES_PERSON';

export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PaymentMethod = 'CASH' | 'MTN_MOMO' | 'AIRTEL_MONEY';

export type TransactionType = 'SALE' | 'EXPENSE';

export interface User {
  uid: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  password?: string; // Added password field
  businessName: string;
  role: UserRole;
  tier: 'FREE' | 'PAID';
  status: UserStatus;
}

export interface Product {
  id: string;
  businessName: string; // Links product to specific SME
  name: string;
  buyPrice: number;
  sellPrice: number;
  stockCount: number;
  minStock: number;
  category?: string;
}

export interface Transaction {
  id: string;
  businessName: string; // Links transaction to specific SME
  type: TransactionType;
  amount: number;
  quantity?: number; // Number of items bought/sold
  method: PaymentMethod;
  itemId?: string;
  itemName?: string;
  timestamp: number;
  note?: string;
  recordedBy: string; // User UID
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  methodBreakdown: Record<PaymentMethod, number>;
}
