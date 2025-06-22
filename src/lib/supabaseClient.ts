import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://scmyucalqoeuqtbthsrx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjbXl1Y2FscW9ldXF0YnRoc3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTQxMDUsImV4cCI6MjA2NjA3MDEwNX0.1S9oeVWsYIEenlvv1thTpQOFSq4O1_LJjQwPg5CAuuQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DatabaseCompany {
  id: string;
  name: string;
  arabic_name?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_number?: string;
  commercial_register?: string;
  currency: string;
  fiscal_year_start?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  industry?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone?: string;
  password_hash?: string;
  role: string;
  role_id?: string;
  department?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserRole {
  id: string;
  company_id: string;
  name: string;
  arabic_name?: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserPermission {
  id: string;
  company_id: string;
  code: string;
  name: string;
  arabic_name?: string;
  description?: string;
  module: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserRolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface DatabaseUserUserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  created_at: string;
}

export interface DatabaseAccountType {
  id: string;
  company_id: string;
  code: string;
  name: string;
  arabic_name?: string;
  balance_type: 'debit' | 'credit';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAccountGroup {
  id: string;
  company_id: string;
  code: string;
  name: string;
  arabic_name?: string;
  account_type_id: string;
  parent_id?: string;
  level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAccount {
  id: string;
  company_id: string;
  code: string;
  name: string;
  arabic_name?: string;
  account_type_id: string;
  account_group_id?: string;
  parent_id?: string;
  level: number;
  is_header: boolean;
  is_active: boolean;
  balance_type: 'debit' | 'credit';
  opening_balance: number;
  current_balance: number;
  description?: string;
  tax_account: boolean;
  bank_account: boolean;
  cash_account: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAccountMovement {
  id: string;
  company_id: string;
  account_id: string;
  transaction_date: string;
  source: string;
  source_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  currency: string;
  exchange_rate: number;
  is_opening_balance: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomer {
  id: string;
  company_id: string;
  customer_code?: string;
  name: string;
  arabic_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tax_number?: string;
  commercial_register?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  credit_limit: number;
  payment_terms: number;
  currency: string;
  account_id?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSupplier {
  id: string;
  company_id: string;
  supplier_code?: string;
  name: string;
  arabic_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tax_number?: string;
  commercial_register?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  payment_terms: number;
  currency: string;
  account_id?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmployee {
  id: string;
  company_id: string;
  employee_code?: string;
  name: string;
  arabic_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  national_id?: string;
  passport_number?: string;
  hire_date: string;
  position: string;
  department?: string;
  salary: number;
  salary_type: string;
  bank_account?: string;
  iban?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProject {
  id: string;
  company_id: string;
  project_code?: string;
  name: string;
  arabic_name?: string;
  description?: string;
  customer_id?: string;
  project_manager_id?: string;
  start_date: string;
  end_date?: string;
  estimated_end_date?: string;
  budget?: number;
  contract_value?: number;
  status: string;
  progress_percentage: number;
  location?: string;
  expenses: number;
  revenue: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInvoice {
  id: string;
  company_id: string;
  invoice_number: string;
  customer_id?: string;
  project_id?: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: string;
  currency: string;
  exchange_rate?: number;
  notes?: string;
  terms?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  tax_percentage: number;
  line_total: number;
  account_id?: string;
  project_id?: string;
  line_number: number;
  created_at: string;
}

export interface DatabaseVoucher {
  id: string;
  company_id: string;
  voucher_number: string;
  voucher_type: 'receipt' | 'payment';
  voucher_date: string;
  amount: number;
  description: string;
  customer_id?: string;
  supplier_id?: string;
  payment_method: string;
  reference_number?: string;
  status: string;
  bank_account?: string;
  check_number?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCheck {
  id: string;
  company_id: string;
  check_number: string;
  check_type: 'received' | 'issued';
  check_date: string;
  due_date?: string;
  amount: number;
  payee: string;
  bank_name: string;
  account_number?: string;
  customer_id?: string;
  supplier_id?: string;
  status: string;
  notes?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseJournalEntry {
  id: string;
  company_id: string;
  entry_number: string;
  entry_date: string;
  posting_date?: string;
  reference?: string;
  source?: string;
  source_id?: string;
  description: string;
  total_debit: number;
  total_credit: number;
  currency: string;
  exchange_rate?: number;
  status: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  next_recurrence_date?: string;
  is_auto_generated: boolean;
  is_active: boolean;
  created_by?: string;
  posted_by?: string;
  posted_at?: string;
  reversed_by?: string;
  reversed_at?: string;
  reversal_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseJournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  description?: string;
  debit_amount: number;
  credit_amount: number;
  currency?: string;
  exchange_rate?: number;
  project_id?: string;
  cost_center_id?: string;
  customer_id?: string;
  supplier_id?: string;
  employee_id?: string;
  line_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseJournalEntryAttachment {
  id: string;
  journal_entry_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  file_path: string;
  description?: string;
  is_active: boolean;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface DatabaseExpenseCategory {
  id: string;
  company_id: string;
  name: string;
  arabic_name?: string;
  description?: string;
  account_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExpense {
  id: string;
  company_id: string;
  expense_number: string;
  expense_date: string;
  description: string;
  amount: number;
  category_id?: string;
  account_id?: string;
  supplier_id?: string;
  project_id?: string;
  payment_method: string;
  reference_number?: string;
  status: string;
  currency: string;
  exchange_rate?: number;
  tax_amount: number;
  tax_included: boolean;
  notes?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  next_recurrence_date?: string;
  approved_by?: string;
  approved_at?: string;
  paid_by?: string;
  paid_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExpenseAttachment {
  id: string;
  expense_id: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  file_path: string;
  description?: string;
  is_active: boolean;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface DatabaseBankAccount {
  id: string;
  company_id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  branch?: string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  account_type: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCashAccount {
  id: string;
  company_id: string;
  account_name: string;
  location?: string;
  currency: string;
  opening_balance: number;
  current_balance: number;
  responsible_person?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBankTransaction {
  id: string;
  company_id: string;
  account_id: string;
  account_type: 'bank' | 'cash';
  transaction_date: string;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  reference_number?: string;
  related_account_id?: string;
  status: string;
  is_reconciled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInventoryItem {
  id: string;
  company_id: string;
  item_code: string;
  name: string;
  arabic_name?: string;
  description?: string;
  category?: string;
  unit_of_measure: string;
  cost_price: number;
  selling_price: number;
  quantity_on_hand: number;
  minimum_quantity: number;
  maximum_quantity?: number;
  reorder_point?: number;
  location?: string;
  barcode?: string;
  supplier_id?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInventoryTransaction {
  id: string;
  company_id: string;
  item_id: string;
  transaction_date: string;
  transaction_type: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_number?: string;
  description?: string;
  project_id?: string;
  location_from?: string;
  location_to?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFixedAsset {
  id: string;
  company_id: string;
  asset_code: string;
  name: string;
  arabic_name?: string;
  description?: string;
  category?: string;
  purchase_date: string;
  purchase_cost: number;
  salvage_value: number;
  useful_life_years: number;
  depreciation_method: string;
  accumulated_depreciation: number;
  current_value: number;
  location?: string;
  serial_number?: string;
  supplier_id?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAssetDepreciation {
  id: string;
  company_id: string;
  asset_id: string;
  depreciation_date: string;
  depreciation_amount: number;
  accumulated_depreciation: number;
  book_value: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service classes for database operations

// Account Types Service
export const accountTypeService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('account_types').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('account_types').select('id, company_id, code, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAccountTypes(companyId: string): Promise<DatabaseAccountType[]> {
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .eq('company_id', companyId)
      .order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAccountTypeById(id: string): Promise<DatabaseAccountType | null> {
    const { data, error } = await supabase
      .from('account_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addAccountType(accountType: Partial<DatabaseAccountType>): Promise<string> {
    const { data, error } = await supabase
      .from('account_types')
      .insert(accountType)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateAccountType(id: string, accountType: Partial<DatabaseAccountType>): Promise<void> {
    const { error } = await supabase
      .from('account_types')
      .update(accountType)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAccountType(id: string): Promise<void> {
    const { error } = await supabase
      .from('account_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Account Groups Service
export const accountGroupService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('account_groups').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('account_groups').select('id, company_id, code, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAccountGroups(companyId: string): Promise<DatabaseAccountGroup[]> {
    const { data, error } = await supabase
      .from('account_groups')
      .select('*')
      .eq('company_id', companyId)
      .order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAccountGroupById(id: string): Promise<DatabaseAccountGroup | null> {
    const { data, error } = await supabase
      .from('account_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addAccountGroup(accountGroup: Partial<DatabaseAccountGroup>): Promise<string> {
    const { data, error } = await supabase
      .from('account_groups')
      .insert(accountGroup)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateAccountGroup(id: string, accountGroup: Partial<DatabaseAccountGroup>): Promise<void> {
    const { error } = await supabase
      .from('account_groups')
      .update(accountGroup)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAccountGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('account_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Chart of Accounts Service
export const accountService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('chart_of_accounts').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('chart_of_accounts').select('id, company_id, code, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAccounts(companyId: string): Promise<DatabaseAccount[]> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('company_id', companyId)
      .order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAccountById(id: string): Promise<DatabaseAccount | null> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addAccount(account: Partial<DatabaseAccount>): Promise<string> {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert(account)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateAccount(id: string, account: Partial<DatabaseAccount>): Promise<void> {
    const { error } = await supabase
      .from('chart_of_accounts')
      .update(account)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('chart_of_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAccountMovements(accountId: string): Promise<DatabaseAccountMovement[]> {
    const { data, error } = await supabase
      .from('account_movements')
      .select('*')
      .eq('account_id', accountId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Customer Service
export const customerService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('customers').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('customers').select('id, company_id, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllCustomers(): Promise<DatabaseCustomer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCustomers(companyId: string): Promise<DatabaseCustomer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCustomerById(id: string): Promise<DatabaseCustomer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addCustomer(customer: Partial<DatabaseCustomer>): Promise<string> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateCustomer(id: string, customer: Partial<DatabaseCustomer>): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Supplier Service
export const supplierService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('suppliers').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('suppliers').select('id, company_id, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllSuppliers(): Promise<DatabaseSupplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSuppliers(companyId: string): Promise<DatabaseSupplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getSupplierById(id: string): Promise<DatabaseSupplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addSupplier(supplier: Partial<DatabaseSupplier>): Promise<string> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateSupplier(id: string, supplier: Partial<DatabaseSupplier>): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Employee Service
export const employeeService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('employees').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('employees').select('id, company_id, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllEmployees(): Promise<DatabaseEmployee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getEmployees(companyId: string): Promise<DatabaseEmployee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getEmployeeById(id: string): Promise<DatabaseEmployee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addEmployee(employee: Partial<DatabaseEmployee>): Promise<string> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateEmployee(id: string, employee: Partial<DatabaseEmployee>): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Project Service
export const projectService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('projects').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('projects').select('id, company_id, name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllProjects(): Promise<DatabaseProject[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getProjects(companyId: string): Promise<DatabaseProject[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProjectById(id: string): Promise<DatabaseProject | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addProject(project: Partial<DatabaseProject>): Promise<string> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateProject(id: string, project: Partial<DatabaseProject>): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Invoice Service
export const invoiceService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('invoices').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('invoices').select('id, company_id, invoice_number').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllInvoices(): Promise<DatabaseInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInvoices(companyId: string): Promise<DatabaseInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInvoiceById(id: string): Promise<DatabaseInvoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getInvoiceWithItems(id: string): Promise<{ invoice: DatabaseInvoice, items: DatabaseInvoiceItem[] }> {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceError) throw invoiceError;

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('line_number', { ascending: true });

    if (itemsError) throw itemsError;

    return {
      invoice,
      items: items || []
    };
  },

  async addInvoice(invoice: Partial<DatabaseInvoice>, items: Partial<DatabaseInvoiceItem>[]): Promise<string> {
    // Start a transaction
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoice)
      .select('id')
      .single();

    if (invoiceError) throw invoiceError;

    // Add invoice items
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: newInvoice.id
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;
    }

    return newInvoice.id;
  },

  async updateInvoice(id: string, invoice: Partial<DatabaseInvoice>, items?: Partial<DatabaseInvoiceItem>[]): Promise<void> {
    // Update invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id);

    if (invoiceError) throw invoiceError;

    // Update invoice items if provided
    if (items) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      // Add new items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    // Delete invoice items first (cascade should handle this, but just to be safe)
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    if (itemsError) throw itemsError;

    // Delete invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (invoiceError) throw invoiceError;
  }
};

// Voucher Service
export const voucherService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('vouchers').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('vouchers').select('id, company_id, voucher_number').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllVouchers(): Promise<DatabaseVoucher[]> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getVouchers(companyId: string): Promise<DatabaseVoucher[]> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('company_id', companyId)
      .order('voucher_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getVoucherById(id: string): Promise<DatabaseVoucher | null> {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addVoucher(voucher: Partial<DatabaseVoucher>): Promise<string> {
    const { data, error } = await supabase
      .from('vouchers')
      .insert(voucher)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateVoucher(id: string, voucher: Partial<DatabaseVoucher>): Promise<void> {
    const { error } = await supabase
      .from('vouchers')
      .update(voucher)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteVoucher(id: string): Promise<void> {
    const { error } = await supabase
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Check Service
export const checkService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('checks').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('checks').select('id, company_id, check_number').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getAllChecks(): Promise<DatabaseCheck[]> {
    const { data, error } = await supabase
      .from('checks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getChecks(companyId: string): Promise<DatabaseCheck[]> {
    const { data, error } = await supabase
      .from('checks')
      .select('*')
      .eq('company_id', companyId)
      .order('check_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getCheckById(id: string): Promise<DatabaseCheck | null> {
    const { data, error } = await supabase
      .from('checks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addCheck(check: Partial<DatabaseCheck>): Promise<string> {
    const { data, error } = await supabase
      .from('checks')
      .insert(check)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateCheck(id: string, check: Partial<DatabaseCheck>): Promise<void> {
    const { error } = await supabase
      .from('checks')
      .update(check)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCheck(id: string): Promise<void> {
    const { error } = await supabase
      .from('checks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Journal Entry Service
export const journalEntryService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('journal_entries').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('journal_entries').select('id, company_id, entry_number').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getJournalEntries(companyId: string): Promise<DatabaseJournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('company_id', companyId)
      .order('entry_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getJournalEntryById(id: string): Promise<DatabaseJournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getJournalEntryWithLines(id: string): Promise<{ entry: DatabaseJournalEntry, lines: DatabaseJournalEntryLine[] }> {
    // Get journal entry
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (entryError) throw entryError;

    // Get journal entry lines
    const { data: lines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .select('*')
      .eq('journal_entry_id', id)
      .order('line_number', { ascending: true });

    if (linesError) throw linesError;

    return {
      entry,
      lines: lines || []
    };
  },

  async generateJournalEntryNumber(companyId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of entries for this month
    const { count, error } = await supabase
      .from('journal_entries')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('entry_date', `${year}-${month}-01`)
      .lt('entry_date', `${year}-${String(Number(month) + 1).padStart(2, '0')}-01`);
    
    if (error) throw error;
    
    // Generate entry number
    const sequenceNumber = String((count || 0) + 1).padStart(3, '0');
    return `JE-${year}${month}-${sequenceNumber}`;
  },

  async addJournalEntry(entry: Partial<DatabaseJournalEntry>, lines: Partial<DatabaseJournalEntryLine>[]): Promise<string> {
    // Start a transaction
    const { data: newEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select('id')
      .single();

    if (entryError) throw entryError;

    // Add journal entry lines
    if (lines.length > 0) {
      const linesWithEntryId = lines.map(line => ({
        ...line,
        journal_entry_id: newEntry.id
      }));

      const { error: linesError } = await supabase
        .from('journal_entry_lines')
        .insert(linesWithEntryId);

      if (linesError) throw linesError;
    }

    return newEntry.id;
  },

  async updateJournalEntry(id: string, entry: Partial<DatabaseJournalEntry>, lines?: Partial<DatabaseJournalEntryLine>[]): Promise<void> {
    // Update journal entry
    const { error: entryError } = await supabase
      .from('journal_entries')
      .update(entry)
      .eq('id', id);

    if (entryError) throw entryError;

    // Update journal entry lines if provided
    if (lines) {
      // Delete existing lines
      const { error: deleteError } = await supabase
        .from('journal_entry_lines')
        .delete()
        .eq('journal_entry_id', id);

      if (deleteError) throw deleteError;

      // Add new lines
      if (lines.length > 0) {
        const linesWithEntryId = lines.map(line => ({
          ...line,
          journal_entry_id: id
        }));

        const { error: linesError } = await supabase
          .from('journal_entry_lines')
          .insert(linesWithEntryId);

        if (linesError) throw linesError;
      }
    }
  },

  async deleteJournalEntry(id: string): Promise<void> {
    // Delete journal entry lines first (cascade should handle this, but just to be safe)
    const { error: linesError } = await supabase
      .from('journal_entry_lines')
      .delete()
      .eq('journal_entry_id', id);

    if (linesError) throw linesError;

    // Delete journal entry
    const { error: entryError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (entryError) throw entryError;
  },

  async postJournalEntry(id: string, userId: string): Promise<void> {
    // Update journal entry status to posted
    const { error } = await supabase
      .from('journal_entries')
      .update({
        status: 'posted',
        posted_by: userId,
        posted_at: new Date().toISOString(),
        posting_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id);

    if (error) throw error;

    // TODO: Update account balances based on journal entry lines
    // This would typically be handled by a database trigger or function
  },

  async reverseJournalEntry(id: string, userId: string, reason: string): Promise<void> {
    // Update journal entry status to reversed
    const { error } = await supabase
      .from('journal_entries')
      .update({
        status: 'reversed',
        reversed_by: userId,
        reversed_at: new Date().toISOString(),
        reversal_reason: reason
      })
      .eq('id', id);

    if (error) throw error;

    // TODO: Create a reversal entry
    // This would typically be handled by a database function
  },

  async getJournalEntryAttachments(entryId: string): Promise<DatabaseJournalEntryAttachment[]> {
    const { data, error } = await supabase
      .from('journal_entry_attachments')
      .select('*')
      .eq('journal_entry_id', entryId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addJournalEntryAttachment(attachment: Partial<DatabaseJournalEntryAttachment>): Promise<string> {
    const { data, error } = await supabase
      .from('journal_entry_attachments')
      .insert(attachment)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async deleteJournalEntryAttachment(id: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entry_attachments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Expense Service
export const expenseService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('expenses').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('expenses').select('id, company_id, expense_number').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getExpenses(companyId: string): Promise<DatabaseExpense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('company_id', companyId)
      .order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getExpenseById(id: string): Promise<DatabaseExpense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getExpenseCategories(companyId: string): Promise<DatabaseExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addExpense(expense: Partial<DatabaseExpense>): Promise<string> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateExpense(id: string, expense: Partial<DatabaseExpense>): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteExpense(id: string): Promise<void> {
    // Delete expense attachments first (cascade should handle this, but just to be safe)
    const { error: attachmentsError } = await supabase
      .from('expense_attachments')
      .delete()
      .eq('expense_id', id);

    if (attachmentsError) throw attachmentsError;

    // Delete expense
    const { error: expenseError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (expenseError) throw expenseError;
  },

  async approveExpense(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async rejectExpense(id: string, userId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'rejected',
        approved_by: userId,
        approved_at: new Date().toISOString(),
        notes: reason
      })
      .eq('id', id);

    if (error) throw error;
  },

  async getExpenseAttachments(expenseId: string): Promise<DatabaseExpenseAttachment[]> {
    const { data, error } = await supabase
      .from('expense_attachments')
      .select('*')
      .eq('expense_id', expenseId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addExpenseAttachment(attachment: Partial<DatabaseExpenseAttachment>): Promise<string> {
    const { data, error } = await supabase
      .from('expense_attachments')
      .insert(attachment)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async deleteExpenseAttachment(id: string): Promise<void> {
    const { error } = await supabase
      .from('expense_attachments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Bank Account Service
export const bankAccountService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('bank_accounts').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('bank_accounts').select('id, company_id, account_name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getBankAccounts(companyId: string): Promise<DatabaseBankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('company_id', companyId)
      .order('account_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getBankAccountById(id: string): Promise<DatabaseBankAccount | null> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addBankAccount(bankAccount: Partial<DatabaseBankAccount>): Promise<string> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(bankAccount)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateBankAccount(id: string, bankAccount: Partial<DatabaseBankAccount>): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .update(bankAccount)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteBankAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Cash Account Service
export const cashAccountService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('cash_accounts').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('cash_accounts').select('id, company_id, account_name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getCashAccounts(companyId: string): Promise<DatabaseCashAccount[]> {
    const { data, error } = await supabase
      .from('cash_accounts')
      .select('*')
      .eq('company_id', companyId)
      .order('account_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCashAccountById(id: string): Promise<DatabaseCashAccount | null> {
    const { data, error } = await supabase
      .from('cash_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addCashAccount(cashAccount: Partial<DatabaseCashAccount>): Promise<string> {
    const { data, error } = await supabase
      .from('cash_accounts')
      .insert(cashAccount)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateCashAccount(id: string, cashAccount: Partial<DatabaseCashAccount>): Promise<void> {
    const { error } = await supabase
      .from('cash_accounts')
      .update(cashAccount)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteCashAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('cash_accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Bank Transaction Service
export const bankTransactionService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('bank_transactions').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('bank_transactions').select('id, company_id, account_id').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getBankTransactions(companyId: string): Promise<DatabaseBankTransaction[]> {
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBankTransactionById(id: string): Promise<DatabaseBankTransaction | null> {
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addBankTransaction(transaction: Partial<DatabaseBankTransaction>): Promise<string> {
    const { data, error } = await supabase
      .from('bank_transactions')
      .insert(transaction)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateBankTransaction(id: string, transaction: Partial<DatabaseBankTransaction>): Promise<void> {
    const { error } = await supabase
      .from('bank_transactions')
      .update(transaction)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteBankTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('bank_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Inventory Item Service
export const inventoryItemService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('inventory_items').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('inventory_items').select('id, company_id, item_code').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getInventoryItems(companyId: string): Promise<DatabaseInventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getInventoryItemById(id: string): Promise<DatabaseInventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addInventoryItem(item: Partial<DatabaseInventoryItem>): Promise<string> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateInventoryItem(id: string, item: Partial<DatabaseInventoryItem>): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .update(item)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Inventory Transaction Service
export const inventoryTransactionService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('inventory_transactions').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('inventory_transactions').select('id, company_id, item_id').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getInventoryTransactions(companyId: string): Promise<DatabaseInventoryTransaction[]> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('company_id', companyId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInventoryTransactionById(id: string): Promise<DatabaseInventoryTransaction | null> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addInventoryTransaction(transaction: Partial<DatabaseInventoryTransaction>): Promise<string> {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert(transaction)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateInventoryTransaction(id: string, transaction: Partial<DatabaseInventoryTransaction>): Promise<void> {
    const { error } = await supabase
      .from('inventory_transactions')
      .update(transaction)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteInventoryTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Fixed Asset Service
export const fixedAssetService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('fixed_assets').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('fixed_assets').select('id, company_id, asset_code').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getFixedAssets(companyId: string): Promise<DatabaseFixedAsset[]> {
    const { data, error } = await supabase
      .from('fixed_assets')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getFixedAssetById(id: string): Promise<DatabaseFixedAsset | null> {
    const { data, error } = await supabase
      .from('fixed_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async addFixedAsset(asset: Partial<DatabaseFixedAsset>): Promise<string> {
    const { data, error } = await supabase
      .from('fixed_assets')
      .insert(asset)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateFixedAsset(id: string, asset: Partial<DatabaseFixedAsset>): Promise<void> {
    const { error } = await supabase
      .from('fixed_assets')
      .update(asset)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteFixedAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('fixed_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAssetDepreciationHistory(assetId: string): Promise<DatabaseAssetDepreciation[]> {
    const { data, error } = await supabase
      .from('asset_depreciation')
      .select('*')
      .eq('asset_id', assetId)
      .order('depreciation_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addDepreciationRecord(record: Partial<DatabaseAssetDepreciation>): Promise<string> {
    const { data, error } = await supabase
      .from('asset_depreciation')
      .insert(record)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
};

// User Service
export const userService = {
  supabase,

  async testConnection() {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async checkTableStructure() {
    try {
      const { data, error } = await supabase.from('users').select('id, company_id, full_name').limit(1);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Table structure check failed:', error);
      return false;
    }
  },

  async getUsers(companyId: string): Promise<DatabaseUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUserById(id: string): Promise<DatabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserRoles(companyId: string): Promise<DatabaseUserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getPermissions(companyId: string): Promise<DatabaseUserPermission[]> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('company_id', companyId)
      .order('module, name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getRolePermissions(roleId: string): Promise<DatabaseUserPermission[]> {
    const { data, error } = await supabase
      .from('user_role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);

    if (error) throw error;
    
    const permissionIds = data.map(item => item.permission_id);
    
    if (permissionIds.length === 0) {
      return [];
    }
    
    const { data: permissions, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('*')
      .in('id', permissionIds)
      .order('module, name', { ascending: true });
      
    if (permissionsError) throw permissionsError;
    
    return permissions || [];
  },

  async getUserPermissions(userId: string): Promise<DatabaseUserPermission[]> {
    // Get user's role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    // Get role permissions
    const rolePermissions = user.role_id ? await this.getRolePermissions(user.role_id) : [];
    
    // Get user's direct permissions
    const { data: userPermissionLinks, error: userPermissionsError } = await supabase
      .from('user_user_permissions')
      .select('permission_id')
      .eq('user_id', userId);
      
    if (userPermissionsError) throw userPermissionsError;
    
    const userPermissionIds = userPermissionLinks.map(item => item.permission_id);
    
    if (userPermissionIds.length === 0) {
      return rolePermissions;
    }
    
    const { data: userPermissions, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('*')
      .in('id', userPermissionIds)
      .order('module, name', { ascending: true });
      
    if (permissionsError) throw permissionsError;
    
    // Combine role and user permissions, removing duplicates
    const allPermissions = [...rolePermissions];
    
    userPermissions.forEach(permission => {
      if (!allPermissions.some(p => p.id === permission.id)) {
        allPermissions.push(permission);
      }
    });
    
    return allPermissions;
  },

  async addUser(user: Partial<DatabaseUser>, permissions?: string[]): Promise<string> {
    // Add user
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select('id')
      .single();

    if (error) throw error;
    
    // Add user permissions if provided
    if (permissions && permissions.length > 0) {
      const userPermissions = permissions.map(permissionId => ({
        user_id: data.id,
        permission_id: permissionId
      }));
      
      const { error: permissionsError } = await supabase
        .from('user_user_permissions')
        .insert(userPermissions);
        
      if (permissionsError) throw permissionsError;
    }

    return data.id;
  },

  async updateUser(id: string, user: Partial<DatabaseUser>, permissions?: string[]): Promise<void> {
    // Update user
    const { error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id);

    if (error) throw error;
    
    // Update user permissions if provided
    if (permissions) {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('user_user_permissions')
        .delete()
        .eq('user_id', id);
        
      if (deleteError) throw deleteError;
      
      // Add new permissions
      if (permissions.length > 0) {
        const userPermissions = permissions.map(permissionId => ({
          user_id: id,
          permission_id: permissionId
        }));
        
        const { error: permissionsError } = await supabase
          .from('user_user_permissions')
          .insert(userPermissions);
          
        if (permissionsError) throw permissionsError;
      }
    }
  },

  async deleteUser(id: string): Promise<void> {
    // Delete user permissions first
    const { error: permissionsError } = await supabase
      .from('user_user_permissions')
      .delete()
      .eq('user_id', id);
      
    if (permissionsError) throw permissionsError;
    
    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    // In a real application, you would hash the password before storing it
    // For demo purposes, we're just storing it directly
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', id);

    if (error) throw error;
  }
};
