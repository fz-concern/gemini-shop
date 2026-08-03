import { Product, AccountInfo, AccountBalance, Order, CustomerOrder, BankDetails, ApiResponse } from './types';

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const customKey = localStorage.getItem('teleshop_custom_key');
    if (customKey) {
      headers['X-Custom-API-Key'] = customKey;
    }
  }
  return headers;
};

// Customer Front Store API Callers
export async function fetchProducts(category?: string): Promise<Product[]> {
  const url = category ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
  const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<Product[]> = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch products');
  }
  return data.data || [];
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<Product> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch product details');
  }
  return data.data;
}

export async function submitCustomerOrder(payload: {
  productId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  whatsappNumber?: string;
  emailAddress?: string;
  paymentScreenshot: string;
}): Promise<CustomerOrder> {
  const res = await fetch('/api/customer-orders', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const data: ApiResponse<CustomerOrder> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to submit payment proof');
  }
  return data.data;
}

export async function fetchCustomerOrders(search?: string): Promise<CustomerOrder[]> {
  const url = search ? `/api/customer-orders?search=${encodeURIComponent(search)}` : '/api/customer-orders';
  const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<CustomerOrder[]> = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch customer orders');
  }
  return data.data || [];
}

export async function approveCustomerOrder(id: string): Promise<CustomerOrder> {
  const res = await fetch(`/api/customer-orders/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'approve' }),
    cache: 'no-store',
  });
  const data: ApiResponse<CustomerOrder> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to approve order');
  }
  return data.data;
}

export async function rejectCustomerOrder(id: string, reason?: string): Promise<CustomerOrder> {
  const res = await fetch(`/api/customer-orders/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
    cache: 'no-store',
  });
  const data: ApiResponse<CustomerOrder> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to reject order');
  }
  return data.data;
}

export async function fetchBankDetails(): Promise<BankDetails> {
  const res = await fetch('/api/bank-details', { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<BankDetails> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch bank details');
  }
  return data.data;
}

export async function saveBankDetails(details: BankDetails): Promise<BankDetails> {
  const res = await fetch('/api/bank-details', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(details),
    cache: 'no-store',
  });
  const data: ApiResponse<BankDetails> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to save bank details');
  }
  return data.data;
}

export async function updateProductPricing(productId: string, customPrice: number): Promise<any> {
  const res = await fetch('/api/product-pricing', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, customPrice }),
    cache: 'no-store',
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to update product price');
  }
  return data.data;
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success || !data.token) {
    throw new Error(data.error || 'Invalid credentials');
  }
  return data.token;
}

// Bot Owner API Callers (Direct TeleShopBot API)
export async function fetchAccountInfo(): Promise<AccountInfo> {
  const res = await fetch('/api/account/info', { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<AccountInfo> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch account info');
  }
  return data.data;
}

export async function fetchAccountBalance(): Promise<AccountBalance> {
  const res = await fetch('/api/account/balance', { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<AccountBalance> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch balance');
  }
  return data.data;
}

export async function createOrder(productId: string, quantity: number = 1): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productId, quantity }),
    cache: 'no-store',
  });
  const data: ApiResponse<Order> = await res.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to place order');
  }
  return data.data;
}

export async function fetchOrders(page: number = 1, limit: number = 20): Promise<{ orders: Order[]; pagination?: any }> {
  const res = await fetch(`/api/orders?page=${page}&limit=${limit}`, { headers: getHeaders(), cache: 'no-store' });
  const data: ApiResponse<Order[]> = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch orders');
  }
  return { orders: data.data || [], pagination: data.pagination };
}
