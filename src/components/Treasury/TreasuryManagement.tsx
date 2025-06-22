import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, PiggyBank, Eye, Edit, Trash2, Calendar, DollarSign, CreditCard, Building, TrendingUp, TrendingDown, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight, ArrowLeftRight } from 'lucide-react';
import BankAccountForm from './BankAccountForm';
import CashAccountForm from './CashAccountForm';
import BankTransactionForm from './BankTransactionForm';
import { bankAccountService, cashAccountService, bankTransactionService, DatabaseBankAccount, DatabaseCashAccount, DatabaseBankTransaction } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const TreasuryManagement: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [bankAccounts, setBankAccounts] = useState<DatabaseBankAccount[]>([]);
  const [cashAccounts, setCashAccounts] = useState<DatabaseCashAccount[]>([]);
  const [transactions, setTransactions] = useState<DatabaseBankTransaction[]>([]);
  
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showCashAccountForm, setShowCashAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  const [selectedBankAccount, setSelectedBankAccount] = useState<DatabaseBankAccount | null>(null);
  const [selectedCashAccount, setSelectedCashAccount] = useState<DatabaseCashAccount | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<DatabaseBankTransaction | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل بيانات الخزينة والبنوك...');
      
      // Test connection first
      const isConnected = await bankAccountService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasBankAccountsStructure = await bankAccountService.checkTableStructure();
      const hasCashAccountsStructure = await cashAccountService.checkTableStructure();
      const hasTransactionsStructure = await bankTransactionService.checkTableStructure();
      
      if (!hasBankAccountsStructure || !hasCashAccountsStructure || !hasTransactionsStructure) {
        throw new Error('هيكل جداول الخزينة والبنوك غير صحيح - يرجى تطبيق migrations');
      }

      // For demo purposes, using a default company ID
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      // Get all bank accounts
      const bankAccountsData = await bankAccountService.getBankAccounts(companyId);
      setBankAccounts(bankAccountsData);
      
      // Get all cash accounts
      const cashAccountsData = await cashAccountService.getCashAccounts(companyId);
      setCashAccounts(cashAccountsData);
      
      // Get all transactions
      const transactionsData = await bankTransactionService.getBankTransactions(companyId);
      setTransactions(transactionsData);
      
      toast.success('تم تحميل بيانات الخزينة والبنوك بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في تحميل بيانات الخزينة والبنوك:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل بيانات الخزينة والبنوك');
      toast.error('حدث خطأ في تحميل بيانات الخزينة والبنوك');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter accounts based on search term and filter type
  const filteredAccounts = [...bankAccounts, ...cashAccounts.map(ca => ({ 
    ...ca, 
    account_type: 'cash' as const,
    bank_name: 'نقدي'
  }))].filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || 
                       (filterType === 'bank' && account.account_type !== 'cash') || 
                       (filterType === 'cash' && account.account_type === 'cash');
    
    return matchesSearch && matchesType;
  });

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => {
    return transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           transaction.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
  }).slice(0, 5); // Show only the 5 most recent transactions

  // Calculate totals
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  const totalCashBalance = cashAccounts.reduce((sum, account) => sum + account.current_balance, 0);
  const totalBalance = totalBankBalance + totalCashBalance;

  // Handle bank account form
  const handleAddBankAccount = () => {
    setSelectedBankAccount(null);
    setShowBankAccountForm(true);
  };

  const handleEditBankAccount = (account: DatabaseBankAccount) => {
    setSelectedBankAccount(account);
    setShowBankAccountForm(true);
  };

  const handleSaveBankAccount = async (accountData: any) => {
    try {
      setActionLoading('saveBankAccount');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedBankAccount) {
        // Update existing bank account
        await bankAccountService.updateBankAccount(selectedBankAccount.id, accountData);
        toast.success('تم تحديث الحساب البنكي بنجاح');
      } else {
        // Add new bank account
        const newAccountData = {
          ...accountData,
          company_id: companyId
        };
        
        await bankAccountService.addBankAccount(newAccountData);
        toast.success('تم إضافة الحساب البنكي بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowBankAccountForm(false);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الحساب البنكي:', error);
      toast.error(`حدث خطأ في حفظ الحساب البنكي: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle cash account form
  const handleAddCashAccount = () => {
    setSelectedCashAccount(null);
    setShowCashAccountForm(true);
  };

  const handleEditCashAccount = (account: DatabaseCashAccount) => {
    setSelectedCashAccount(account);
    setShowCashAccountForm(true);
  };

  const handleSaveCashAccount = async (accountData: any) => {
    try {
      setActionLoading('saveCashAccount');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedCashAccount) {
        // Update existing cash account
        await cashAccountService.updateCashAccount(selectedCashAccount.id, accountData);
        toast.success('تم تحديث حساب النقدية بنجاح');
      } else {
        // Add new cash account
        const newAccountData = {
          ...accountData,
          company_id: companyId
        };
        
        await cashAccountService.addCashAccount(newAccountData);
        toast.success('تم إضافة حساب النقدية بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowCashAccountForm(false);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ حساب النقدية:', error);
      toast.error(`حدث خطأ في حفظ حساب النقدية: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle transaction form
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: DatabaseBankTransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      setActionLoading('saveTransaction');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedTransaction) {
        // Update existing transaction
        await bankTransactionService.updateBankTransaction(selectedTransaction.id, transactionData);
        toast.success('تم تحديث المعاملة بنجاح');
      } else {
        // Add new transaction
        const newTransactionData = {
          ...transactionData,
          company_id: companyId,
          is_active: true
        };
        
        await bankTransactionService.addBankTransaction(newTransactionData);
        toast.success('تم إضافة المعاملة بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowTransactionForm(false);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المعاملة:', error);
      toast.error(`حدث خطأ في حفظ المعاملة: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle account active status
  const handleToggleAccountStatus = async (account: any, type: 'bank' | 'cash') => {
    const newStatus = !account.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا الحساب؟`)) {
      try {
        setActionLoading(account.id);
        
        if (type === 'bank') {
          await bankAccountService.updateBankAccount(account.id, { is_active: newStatus });
        } else {
          await cashAccountService.updateCashAccount(account.id, { is_active: newStatus });
        }
        
        toast.success(`تم ${actionText} الحساب بنجاح`);
        await loadData();
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} الحساب:`, error);
        toast.error(`حدث خطأ في ${actionText} الحساب: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Delete account (soft delete)
  const handleDeleteAccount = async (account: any, type: 'bank' | 'cash') => {
    if (account.is_active) {
      toast.error('لا يمكن حذف حساب نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(account.id);
        
        if (type === 'bank') {
          await bankAccountService.deleteBankAccount(account.id);
        } else {
          await cashAccountService.deleteCashAccount(account.id);
        }
        
        toast.success('تم حذف الحساب بنجاح');
        await loadData();
      } catch (error: any) {
        console.error('❌ خطأ في حذف الحساب:', error);
        toast.error(`حدث خطأ في حذف الحساب: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4 text-blue-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get transaction type text
  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'withdrawal':
        return 'سحب';
      case 'transfer':
        return 'تحويل';
      default:
        return type;
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get account name by ID
  const getAccountName = (id: string, type: string) => {
    if (type === 'bank') {
      const account = bankAccounts.find(a => a.id === id);
      return account ? account.account_name : 'غير معروف';
    } else {
      const account = cashAccounts.find(a => a.id === id);
      return account ? account.account_name : 'غير معروف';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل بيانات الخزينة والبنوك...</span>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في الاتصال</h3>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <div className="space-y-2">
            <button
              onClick={loadData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
            <p className="text-sm text-gray-500">
              تأكد من تطبيق migrations قاعدة البيانات في Supabase Dashboard
            </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Database className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  يرجى تطبيق migration الجديد: 20250621152345_treasury_inventory_assets.sql
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الخزينة والبنك</h1>
          <p className="text-gray-600">إدارة الحسابات النقدية والبنكية والمعاملات المالية</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <div className="relative group">
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة جديد</span>
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
              <button
                onClick={handleAddBankAccount}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                حساب بنكي جديد
              </button>
              <button
                onClick={handleAddCashAccount}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                حساب نقدية جديد
              </button>
              <button
                onClick={handleAddTransaction}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                معاملة جديدة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الأرصدة</p>
              <p className="text-2xl font-bold text-gray-900">{totalBalance.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <PiggyBank className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الأرصدة البنكية</p>
              <p className="text-2xl font-bold text-green-600">{totalBankBalance.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">الأرصدة النقدية</p>
              <p className="text-2xl font-bold text-purple-600">{totalCashBalance.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">عدد الحسابات</p>
              <p className="text-2xl font-bold text-orange-600">{bankAccounts.length + cashAccounts.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الحسابات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">تصفية</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              <option value="bank">حسابات بنكية</option>
              <option value="cash">حسابات نقدية</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">الحسابات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحساب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرصيد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const isBankAccount = 'bank_name' in account && account.account_type !== 'cash';
                  return (
                    <tr key={account.id} className={`hover:bg-gray-50 transition-colors ${!account.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ml-3 ${isBankAccount ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {isBankAccount ? (
                              <Building className="w-5 h-5 text-blue-600" />
                            ) : (
                              <PiggyBank className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${account.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                              {account.account_name}
                              {!account.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                            </div>
                            {isBankAccount && (
                              <div className="text-sm text-gray-500">{account.bank_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isBankAccount ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isBankAccount ? 'بنكي' : 'نقدي'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.current_balance.toLocaleString()} {account.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => isBankAccount ? 
                              handleEditBankAccount(account as DatabaseBankAccount) : 
                              handleEditCashAccount(account as DatabaseCashAccount)
                            }
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleAccountStatus(
                              account, 
                              isBankAccount ? 'bank' : 'cash'
                            )}
                            disabled={actionLoading === account.id}
                            className={`p-1 rounded transition-colors ${
                              account.is_active 
                                ? 'text-green-600 hover:text-green-800' 
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                            title={account.is_active ? 'إلغاء تفعيل الحساب' : 'تفعيل الحساب'}
                          >
                            {actionLoading === account.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : account.is_active ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          {!account.is_active && (
                            <button 
                              onClick={() => handleDeleteAccount(
                                account, 
                                isBankAccount ? 'bank' : 'cash'
                              )}
                              disabled={actionLoading === account.id}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات</h4>
              <p className="text-gray-500 mb-4">ابدأ بإضافة حساب بنكي أو نقدي جديد</p>
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <button 
                  onClick={handleAddBankAccount}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  حساب بنكي جديد
                </button>
                <button 
                  onClick={handleAddCashAccount}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  حساب نقدية جديد
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">المعاملات الأخيرة</h3>
            <button 
              onClick={handleAddTransaction}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              إضافة معاملة
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {getTransactionTypeIcon(transaction.transaction_type)}
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {getAccountName(transaction.account_id, transaction.account_type)}
                        {transaction.transaction_type === 'transfer' && transaction.related_account_id && (
                          <span> → {getAccountName(transaction.related_account_id, transaction.account_type === 'bank' ? 'cash' : 'bank')}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}
                        {transaction.reference_number && ` - ${transaction.reference_number}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'deposit' ? '+' : transaction.transaction_type === 'withdrawal' ? '-' : ''}
                      {transaction.amount.toLocaleString()} ر.س
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTransactionTypeText(transaction.transaction_type)}
                    </div>
                    <button 
                      onClick={() => handleEditTransaction(transaction)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      تعديل
                    </button>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد معاملات</h4>
                  <p className="text-gray-500 mb-4">ابدأ بإضافة معاملة جديدة</p>
                  <button 
                    onClick={handleAddTransaction}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إضافة معاملة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Form Modal */}
      <BankAccountForm
        bankAccount={selectedBankAccount}
        isOpen={showBankAccountForm}
        onClose={() => setShowBankAccountForm(false)}
        onSave={handleSaveBankAccount}
        loading={actionLoading === 'saveBankAccount'}
      />

      {/* Cash Account Form Modal */}
      <CashAccountForm
        cashAccount={selectedCashAccount}
        isOpen={showCashAccountForm}
        onClose={() => setShowCashAccountForm(false)}
        onSave={handleSaveCashAccount}
        loading={actionLoading === 'saveCashAccount'}
      />

      {/* Transaction Form Modal */}
      <BankTransactionForm
        transaction={selectedTransaction}
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSave={handleSaveTransaction}
        bankAccounts={bankAccounts}
        cashAccounts={cashAccounts}
        loading={actionLoading === 'saveTransaction'}
      />
    </div>
  );
};

export default TreasuryManagement;