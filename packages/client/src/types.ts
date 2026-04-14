export type PaymentMethod = 'cash' | 'mobile_money' | 'bank' | 'credit';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  barcode?: string;
  supplierId?: string;
  lastSaleDate?: string;
  daysSinceLastSale?: number;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  discount: number;
  productName?: string;
  productId?: string;
  saleId?: string;
  unitPrice?: number;
  returnedQuantity?: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  createdAt?: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  cashierId: string;
  shiftId?: string;
  cashierName?: string;
  promoId?: string;
  promoName?: string;
  clientTxId?: string;
}

export interface SaleReturn {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  amount: number;
  reason?: string;
  authorizedBy?: string;
  shiftId?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  creditLimit: number;
  balance: number;
  guarantorInfo?: string;
  lastPaymentDate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  balance: number;
  totalOrders?: number;
  lastDelivery?: string;
  reliabilityScore?: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  status: 'ACTIVE' | 'VOIDED';
  authorizedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  amount: number;
  paymentMethod: 'cash' | 'mobile_money' | 'bank';
  reference?: string;
  notes?: string;
  recordedBy: string;
  shiftId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'admin' | 'MANAGER' | 'CASHIER' | 'STAFF' | 'staff' | 'hq-ceo';
  employeeId?: string;
  profilePicture?: string;
  tenantStatus?: string;
  isActive?: boolean;
  authorizedModules?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CashierShift {
  id: string;
  cashierId: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  expectedCash?: number;
  actualCash?: number;
  variance?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  joinedDate: string;
  salary: number;
  status: 'active' | 'on_leave' | 'terminated';
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  authorizedModules?: string[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}
