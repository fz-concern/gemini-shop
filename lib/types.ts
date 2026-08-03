export interface Product {
  id: string;
  active: boolean;
  published?: boolean;
  name: string;
  names?: Record<string, string>;
  basePrice?: number; // Base cost from API
  price: number; // Active selling price
  profitMargin?: number; // Calculated profit per item
  stock: number;
  inStock: boolean;
  categoryId?: string;
  categoryIdentityKey?: string;
  category: string;
  categories?: Record<string, string>;
  description: string;
  descriptions?: Record<string, string>;
  minBuy: number;
  maxBuy: number;
}

export interface AccountInfo {
  chatId: string;
  username: string;
  firstName: string;
  lastName: string;
  balance: number;
  totalDeposit: number;
  totalSpent: number;
  createdAt: string;
}

export interface AccountBalance {
  balance: number;
  totalDeposit: number;
  totalSpent: number;
}

export interface Order {
  orderCode: string;
  productId: string;
  productName: string;
  quantity: number;
  totalQty?: number;
  unitPrice: number;
  originalAmount?: number;
  discountPercent?: number;
  discountAmount?: number;
  promoDiscountAmount?: number;
  totalAmount: number;
  status: 'completed' | 'confirm_paid' | 'pending' | 'expired' | 'cancelled' | string;
  items: string[];
  createdAt: string;
  completedAt?: string;
}

export interface CustomerOrder {
  id: string;
  orderCode: string;
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  contactMethod?: 'whatsapp' | 'email' | 'both';
  contactValue?: string;
  whatsappNumber?: string;
  emailAddress?: string;
  paymentScreenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  items?: string[];
  botOrderCode?: string;
  botOrderId?: string;
  botOrderDetails?: any;
  createdAt: string;
  approvedAt?: string;
  updatedAt?: string;
}

export interface BankDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  usdtAddress?: string;
  instructions: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  code?: string;
  error?: string;
}
