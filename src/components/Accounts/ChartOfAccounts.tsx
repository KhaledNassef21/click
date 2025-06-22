import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  FileBarChart, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Building, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Loader2,
  AlertCircle,
  RefreshCw,
  Database,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import AccountForm from './AccountForm';
import { 
  accountService, 
  DatabaseAccount, 
  DatabaseAccountType, 
  DatabaseAccountGroup,
  DatabaseAccountMovement
} from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ChartOfAccounts: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<DatabaseAccount | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [accountMovements, setAccountMovements] = useState<DatabaseAccountMovement[]>([]);
  
  const [accounts, setAccounts] = useState<DatabaseAccount[]>([]);
  const [accountTypes, setAccountTypes] = useState<DatabaseAccountType[]>([]);
  const [accountGroups, setAccountGroups] = useState<DatabaseAccountGroup[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل دليل الحسابات...');
      
      // Test connection first
      const isConnected = await accountService.accountService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await accountService.accountService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول دليل الحسابات غير صحيح - يرجى تطبيق migrations');
      }

      // For demo purposes, using a default company ID
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      // Get account types
      const typesData = await accountService.accountService.getAccountTypes(companyId);
      setAccountTypes(typesData);
      
      // Get account groups
      const groupsData = await accountService.accountService.getAccountGroups(companyId);
      setAccountGroups(groupsData);
      
      // Get accounts
      const accountsData = await accountService.accountService.getAccounts(companyId);
      setAccounts(accountsData);
      
      // Update accounts in global state
      dispatch({ type: 'SET_ACCOUNTS', payload: accountsData });
      
      toast.success('تم تحميل دليل الحسابات بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في تحميل دليل الحسابات:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل دليل الحسابات');
      toast.error('حدث خطأ في تحميل دليل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Build account tree
  const buildAccountTree = (accounts: DatabaseAccount[]) => {
    const accountMap = new Map<string, DatabaseAccount & { children?: DatabaseAccount[] }>();
    const rootAccounts: (DatabaseAccount & { children?: DatabaseAccount[] })[] = [];
    
    // First pass: create map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });
    
    // Second pass: build tree structure
    accounts.forEach(account => {
      const accountWithChildren = accountMap.get(account.id);
      if (!accountWithChildren) return;
      
      if (account.parent_id && accountMap.has(account.parent_id)) {
        const parent = accountMap.get(account.parent_id);
        parent?.children?.push(accountWithChildren);
      } else {
        rootAccounts.push(accountWithChildren);
      }
    });
    
    // Sort root accounts by code
    rootAccounts.sort((a, b) => a.code.localeCompare(b.code));
    
    // Sort children recursively
    const sortChildren = (accounts: (DatabaseAccount & { children?: DatabaseAccount[] })[]) => {
      accounts.forEach(account => {
        if (account.children && account.children.length > 0) {
          account.children.sort((a, b) => a.code.localeCompare(b.code));
          sortChildren(account.children);
        }
      });
    };
    
    sortChildren(rootAccounts);
    
    return rootAccounts;
  };

  // Filter accounts based on search term and filter type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (account.arabic_name && account.arabic_name.includes(searchTerm));
    
    const matchesType = filterType === 'all' || 
                       accountTypes.find(type => type.id === account.account_type_id)?.code === filterType;
    
    return matchesSearch && matchesType;
  });

  // Build tree from filtered accounts
  const accountTree = buildAccountTree(filteredAccounts);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getTypeColor = (accountTypeId: string) => {
    const accountType = accountTypes.find(type => type.id === accountTypeId);
    if (!accountType) return 'text-gray-600';
    
    switch (accountType.code) {
      case '1':
        return 'text-blue-600';
      case '2':
        return 'text-red-600';
      case '3':
        return 'text-purple-600';
      case '4':
        return 'text-green-600';
      case '5':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeText = (accountTypeId: string) => {
    const accountType = accountTypes.find(type => type.id === accountTypeId);
    return accountType ? (accountType.arabic_name || accountType.name) : '';
  };

  const getTypeIcon = (accountTypeId: string) => {
    const accountType = accountTypes.find(type => type.id === accountTypeId);
    if (!accountType) return <FileBarChart className="w-4 h-4 text-gray-600" />;
    
    switch (accountType.code) {
      case '1':
        return <Building className="w-4 h-4 text-blue-600" />;
      case '2':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case '3':
        return <DollarSign className="w-4 h-4 text-purple-600" />;
      case '4':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case '5':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      default:
        return <FileBarChart className="w-4 h-4 text-gray-600" />;
    }
  };

  // Calculate totals by account type
  const calculateTotals = () => {
    const totals: { [key: string]: number } = {};
    
    accountTypes.forEach(type => {
      const accountsOfType = accounts.filter(account => account.account_type_id === type.id);
      const total = accountsOfType.reduce((sum, account) => sum + account.current_balance, 0);
      totals[type.id] = total;
    });
    
    return totals;
  };

  const totals = calculateTotals();

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account: DatabaseAccount) => {
    setSelectedAccount(account);
    setShowForm(true);
  };

  const handleViewAccount = async (account: DatabaseAccount) => {
    try {
      setActionLoading('view');
      setSelectedAccount(account);
      
      // Get account movements
      const movements = await accountService.accountService.getAccountMovements(account.id);
      setAccountMovements(movements);
      
      setShowAccountDetails(true);
    } catch (error: any) {
      console.error('Error fetching account details:', error);
      toast.error(`حدث خطأ في جلب تفاصيل الحساب: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveAccount = async (accountData: Partial<DatabaseAccount>) => {
    try {
      setActionLoading('save');
      
      if (selectedAccount) {
        // Update existing account
        await accountService.accountService.updateAccount(selectedAccount.id, accountData);
        toast.success('تم تحديث الحساب بنجاح');
      } else {
        // Add new account
        await accountService.accountService.addAccount(accountData);
        toast.success('تم إضافة الحساب بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowForm(false);
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast.error(`حدث خطأ في حفظ الحساب: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAccountStatus = async (account: DatabaseAccount) => {
    const newStatus = !account.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا الحساب؟`)) {
      try {
        setActionLoading(account.id);
        
        await accountService.accountService.updateAccount(account.id, { is_active: newStatus });
        
        toast.success(`تم ${actionText} الحساب بنجاح`);
        await loadData();
      } catch (error: any) {
        console.error(`Error ${actionText} account:`, error);
        toast.error(`حدث خطأ في ${actionText} الحساب: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteAccount = async (account: DatabaseAccount) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(account.id);
        
        await accountService.accountService.deleteAccount(account.id);
        
        toast.success('تم حذف الحساب بنجاح');
        await loadData();
      } catch (error: any) {
        console.error('Error deleting account:', error);
        toast.error(`حدث خطأ في حذف الحساب: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const renderAccountNode = (account: DatabaseAccount & { children?: DatabaseAccount[] }) => {
    const isExpanded = expandedNodes.has(account.id);
    const hasChildren = account.children && account.children.length > 0;
    const indentLevel = (account.level - 1) * 20;

    return (
      <div key={account.id}>
        <div 
          className={`flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
            account.is_header ? 'bg-gray-50 font-semibold' : ''
          }`}
          style={{ paddingRight: `${indentLevel + 12}px` }}
        >
          <div className="flex items-center space-x-3 space-x-reverse flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleNode(account.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-6"></div>
            )}
            
            {getTypeIcon(account.account_type_id)}
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm font-medium text-gray-500">{account.code}</span>
                <span className={`${account.is_header ? 'font-bold' : 'font-medium'} text-gray-900 ${!account.is_active ? 'line-through text-gray-500' : ''}`}>
                  {account.name}
                </span>
                {!account.is_active && <span className="text-xs text-red-500">(غير نشط)</span>}
              </div>
              <div className="text-xs text-gray-500">{getTypeText(account.account_type_id)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`text-sm font-medium ${getTypeColor(account.account_type_id)}`}>
              {account.current_balance.toLocaleString()} ر.س
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button 
                onClick={() => handleViewAccount(account)}
                disabled={actionLoading === account.id}
                className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50"
                title="عرض تفاصيل الحساب"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleEditAccount(account)}
                disabled={actionLoading === account.id}
                className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                title="تعديل الحساب"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleAccountStatus(account)}
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
              {!hasChildren && (
                <button 
                  onClick={() => handleDeleteAccount(account)}
                  disabled={actionLoading === account.id}
                  className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                  title="حذف الحساب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {account.children!.map(child => renderAccountNode(child as DatabaseAccount & { children?: DatabaseAccount[] }))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل دليل الحسابات...</span>
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
                  يرجى تطبيق migration الجديد: 20250622120000_chart_of_accounts_system.sql
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">دليل الحسابات</h1>
          <p className="text-gray-600">إدارة الهيكل المحاسبي للشركة وفقاً للمعايير الدولية</p>
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
          <button 
            onClick={handleAddAccount}
            disabled={actionLoading === 'save'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
          >
            {actionLoading === 'save' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>إضافة حساب جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {accountTypes.map(type => {
          let TypeIcon;
          let bgColor;
          let textColor;
          
          switch (type.code) {
            case '1':
              TypeIcon = Building;
              bgColor = 'bg-blue-100';
              textColor = 'text-blue-600';
              break;
            case '2':
              TypeIcon = TrendingDown;
              bgColor = 'bg-red-100';
              textColor = 'text-red-600';
              break;
            case '3':
              TypeIcon = DollarSign;
              bgColor = 'bg-purple-100';
              textColor = 'text-purple-600';
              break;
            case '4':
              TypeIcon = TrendingUp;
              bgColor = 'bg-green-100';
              textColor = 'text-green-600';
              break;
            case '5':
              TypeIcon = TrendingDown;
              bgColor = 'bg-orange-100';
              textColor = 'text-orange-600';
              break;
            default:
              TypeIcon = FileBarChart;
              bgColor = 'bg-gray-100';
              textColor = 'text-gray-600';
          }
          
          return (
            <div key={type.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{type.arabic_name || type.name}</p>
                  <p className={`text-2xl font-bold ${textColor}`}>{totals[type.id]?.toLocaleString() || 0} ر.س</p>
                </div>
                <div className={`p-3 rounded-lg ${bgColor}`}>
                  <TypeIcon className={`w-6 h-6 ${textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
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
              {accountTypes.map(type => (
                <option key={type.id} value={type.code}>
                  {type.arabic_name || type.name}
                </option>
              ))}
            </select>
            <button 
              onClick={() => setExpandedNodes(new Set(accounts.map(acc => acc.id)))}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>توسيع الكل</span>
            </button>
            <button 
              onClick={() => setExpandedNodes(new Set())}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>طي الكل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart of Accounts Tree */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">الهيكل المحاسبي</h3>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {accountTree.map(account => renderAccountNode(account))}
        </div>

        {accountTree.length === 0 && (
          <div className="text-center py-12">
            <FileBarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد حسابات</h4>
            <p className="text-gray-500 mb-4">ابدأ بإنشاء دليل الحسابات</p>
            <button 
              onClick={handleAddAccount}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة حساب جديد
            </button>
          </div>
        )}
      </div>

      {/* Account Form Modal */}
      {showForm && (
        <AccountForm
          account={selectedAccount}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedAccount(null);
          }}
          onSave={handleSaveAccount}
          loading={actionLoading === 'save'}
          accountTypes={accountTypes}
          accountGroups={accountGroups}
        />
      )}

      {/* Account Details Modal */}
      {showAccountDetails && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                تفاصيل الحساب: {selectedAccount.code} - {selectedAccount.name}
              </h2>
              <button
                onClick={() => setShowAccountDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Account Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">رمز الحساب</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedAccount.code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">اسم الحساب</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedAccount.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">نوع الحساب</h3>
                  <div className="flex items-center mt-1">
                    {getTypeIcon(selectedAccount.account_type_id)}
                    <span className="mr-2 text-lg font-semibold text-gray-900">
                      {getTypeText(selectedAccount.account_type_id)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الرصيد الافتتاحي</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedAccount.opening_balance.toLocaleString()} ر.س</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الرصيد الحالي</h3>
                  <p className={`text-lg font-semibold ${getTypeColor(selectedAccount.account_type_id)}`}>
                    {selectedAccount.current_balance.toLocaleString()} ر.س
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">نوع الرصيد</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAccount.balance_type === 'debit' ? 'مدين' : 'دائن'}
                  </p>
                </div>
                
                {selectedAccount.description && (
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-medium text-gray-500">الوصف</h3>
                    <p className="text-lg font-semibold text-gray-900">{selectedAccount.description}</p>
                  </div>
                )}
              </div>
              
              {/* Account Properties */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">خصائص الحساب</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedAccount.is_header}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="mr-2 text-sm font-medium text-gray-700">
                      حساب رئيسي
                    </label>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedAccount.is_active}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="mr-2 text-sm font-medium text-gray-700">
                      حساب نشط
                    </label>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedAccount.tax_account}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="mr-2 text-sm font-medium text-gray-700">
                      حساب ضريبي
                    </label>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedAccount.bank_account}
                      readOnly
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="mr-2 text-sm font-medium text-gray-700">
                      حساب بنكي
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Account Movements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">حركات الحساب</h3>
                {accountMovements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">التاريخ</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">المصدر</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مدين</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">دائن</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الرصيد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {accountMovements.map((movement) => (
                          <tr key={movement.id} className="bg-white">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(movement.transaction_date).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {movement.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {movement.source}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-green-600">
                              {movement.debit_amount > 0 ? movement.debit_amount.toLocaleString() : ''}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-red-600">
                              {movement.credit_amount > 0 ? movement.credit_amount.toLocaleString() : ''}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {movement.balance.toLocaleString()} {movement.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <FileBarChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">لا توجد حركات لهذا الحساب</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAccountDetails(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    setShowAccountDetails(false);
                    handleEditAccount(selectedAccount);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تعديل الحساب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;