export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'user' | 'manager';
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  arabicName?: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  taxNumber?: string;
  currency: string;
  fiscalYearStart: string;
  country: string;
  city: string;
  website?: string;
  description?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  arabicName?: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
  balance: number;
  isActive: boolean;
  level: number;
  hasChildren: boolean;
}

export interface Customer {
  id: string;
  name: string;
  arabicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  balance: number;
  creditLimit?: number;
  paymentTerms?: number;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  arabicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  balance: number;
  paymentTerms?: number;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  arabicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  position: string;
  department?: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
  bankAccount?: string;
  nationalId?: string;
  emergencyContact?: string;
}

export interface Contractor {
  id: string;
  name: string;
  arabicName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  balance: number;
  specialization: string;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  projectId?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  attachments?: string[];
  currency: string;
  exchangeRate?: number;
  taxes: InvoiceTax[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
  accountId?: string;
}

export interface InvoiceTax {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  supplierId?: string;
  contractorId?: string;
  projectId?: string;
  accountId: string;
  receipt?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'cash' | 'bank' | 'check' | 'card';
  reference?: string;
  attachments?: string[];
  currency: string;
  exchangeRate?: number;
}

export interface Project {
  id: string;
  name: string;
  arabicName?: string;
  description?: string;
  customerId?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  expenses: number;
  revenue: number;
  progress: number;
  manager?: string;
  location?: string;
  costCenter?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  entries: JournalEntryLine[];
  total: number;
  status: 'draft' | 'posted';
  createdBy: string;
  attachments?: string[];
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
  projectId?: string;
  costCenter?: string;
}

export interface Payment {
  id: string;
  type: 'receipt' | 'payment';
  date: string;
  amount: number;
  reference: string;
  description: string;
  customerId?: string;
  supplierId?: string;
  contractorId?: string;
  method: 'cash' | 'bank' | 'check' | 'card';
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  bankAccount?: string;
  checkNumber?: string;
  attachments?: string[];
  currency: string;
  exchangeRate?: number;
}

export interface Check {
  id: string;
  type: 'received' | 'issued';
  checkNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  payee: string;
  bank: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  customerId?: string;
  supplierId?: string;
  notes?: string;
  currency: string;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  isActive: boolean;
  accountType: 'checking' | 'savings' | 'credit';
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  arabicName?: string;
  category: string;
  unitPrice: number;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  unit: string;
  isActive: boolean;
  supplier?: string;
  location?: string;
  barcode?: string;
  description?: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  arabicName?: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  depreciationMethod: 'straight-line' | 'declining-balance' | 'units-of-production';
  usefulLife: number;
  salvageValue: number;
  currentValue: number;
  accumulatedDepreciation: number;
  location?: string;
  serialNumber?: string;
  supplier?: string;
  isActive: boolean;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: 'sales' | 'purchase' | 'withholding';
  isActive: boolean;
  accountId?: string;
  description?: string;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  arabicName?: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  budget?: number;
  actualCost: number;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
  isActive: boolean;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: PayrollAllowance[];
  deductions: PayrollDeduction[];
  grossSalary: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  payDate?: string;
}

export interface PayrollAllowance {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface PayrollDeduction {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

export interface Report {
  id: string;
  name: string;
  type: 'balance-sheet' | 'income-statement' | 'cash-flow' | 'trial-balance' | 'custom';
  parameters: ReportParameter[];
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export interface ReportParameter {
  name: string;
  value: any;
  type: 'date' | 'dateRange' | 'account' | 'customer' | 'project';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  changes?: any;
  ipAddress?: string;
}