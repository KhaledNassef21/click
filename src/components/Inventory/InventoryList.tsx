import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, Package, Eye, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight, ArrowRightLeft } from 'lucide-react';
import InventoryItemForm from './InventoryItemForm';
import InventoryTransactionForm from './InventoryTransactionForm';
import { inventoryItemService, inventoryTransactionService, DatabaseInventoryItem, DatabaseInventoryTransaction } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const InventoryList: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [inventoryItems, setInventoryItems] = useState<DatabaseInventoryItem[]>([]);
  const [transactions, setTransactions] = useState<DatabaseInventoryTransaction[]>([]);
  
  const [showItemForm, setShowItemForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<DatabaseInventoryItem | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<DatabaseInventoryTransaction | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل بيانات المخزون...');
      
      // Test connection first
      const isConnected = await inventoryItemService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasItemsStructure = await inventoryItemService.checkTableStructure();
      const hasTransactionsStructure = await inventoryTransactionService.checkTableStructure();
      
      if (!hasItemsStructure || !hasTransactionsStructure) {
        throw new Error('هيكل جداول المخزون غير صحيح - يرجى تطبيق migrations');
      }

      // For demo purposes, using a default company ID
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      // Get all inventory items
      const itemsData = await inventoryItemService.getInventoryItems(companyId);
      setInventoryItems(itemsData);
      
      // Get all transactions
      const transactionsData = await inventoryTransactionService.getInventoryTransactions(companyId);
      setTransactions(transactionsData);
      
      toast.success('تم تحميل بيانات المخزون بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في تحميل بيانات المخزون:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل بيانات المخزون');
      toast.error('حدث خطأ في تحميل بيانات المخزون');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items based on search term, category, and status
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'low-stock') {
      matchesStatus = item.quantity_on_hand <= item.minimum_quantity;
    } else if (filterStatus === 'out-of-stock') {
      matchesStatus = item.quantity_on_hand === 0;
    } else if (filterStatus === 'in-stock') {
      matchesStatus = item.quantity_on_hand > item.minimum_quantity;
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get recent transactions for the selected item
  const getItemTransactions = (itemId: string) => {
    return transactions
      .filter(t => t.item_id === itemId)
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, 5);
  };

  // Calculate totals
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity_on_hand * item.cost_price), 0);
  const lowStockItems = inventoryItems.filter(item => item.quantity_on_hand <= item.minimum_quantity).length;
  const outOfStockItems = inventoryItems.filter(item => item.quantity_on_hand === 0).length;
  const categories = [...new Set(inventoryItems.filter(item => item.category).map(item => item.category))];

  // Get stock status
  const getStockStatus = (item: DatabaseInventoryItem) => {
    if (item.quantity_on_hand === 0) {
      return { status: 'out-of-stock', color: 'bg-red-100 text-red-800', text: 'نفد المخزون' };
    } else if (item.quantity_on_hand <= item.minimum_quantity) {
      return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800', text: 'مخزون منخفض' };
    } else {
      return { status: 'in-stock', color: 'bg-green-100 text-green-800', text: 'متوفر' };
    }
  };

  // Get stock icon
  const getStockIcon = (item: DatabaseInventoryItem) => {
    const status = getStockStatus(item);
    switch (status.status) {
      case 'out-of-stock':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'low-stock':
        return <TrendingDown className="w-4 h-4 text-yellow-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: {[key: string]: string} = {
      'مواد البناء': 'bg-blue-100 text-blue-800',
      'حديد ومعادن': 'bg-gray-100 text-gray-800',
      'مواد كهربائية': 'bg-yellow-100 text-yellow-800',
      'أدوات': 'bg-purple-100 text-purple-800',
      'مواد التشطيب': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Get transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'issue':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'adjustment':
        return <BarChart3 className="w-4 h-4 text-blue-600" />;
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-purple-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get transaction type text
  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'استلام';
      case 'issue':
        return 'صرف';
      case 'adjustment':
        return 'تسوية';
      case 'transfer':
        return 'نقل';
      default:
        return type;
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'text-green-600';
      case 'issue':
        return 'text-red-600';
      case 'adjustment':
        return 'text-blue-600';
      case 'transfer':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle item form
  const handleAddItem = () => {
    setSelectedItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: DatabaseInventoryItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  const handleSaveItem = async (itemData: any) => {
    try {
      setActionLoading('saveItem');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedItem) {
        // Update existing item
        await inventoryItemService.updateInventoryItem(selectedItem.id, itemData);
        toast.success('تم تحديث الصنف بنجاح');
      } else {
        // Add new item
        const newItemData = {
          ...itemData,
          company_id: companyId
        };
        
        await inventoryItemService.addInventoryItem(newItemData);
        toast.success('تم إضافة الصنف بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowItemForm(false);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الصنف:', error);
      toast.error(`حدث خطأ في حفظ الصنف: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle transaction form
  const handleAddTransaction = (item?: DatabaseInventoryItem) => {
    setSelectedTransaction(null);
    if (item) {
      setSelectedItem(item);
    }
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction: DatabaseInventoryTransaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleSaveTransaction = async (transactionData: any) => {
    try {
      setActionLoading('saveTransaction');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedTransaction) {
        // Update existing transaction
        await inventoryTransactionService.updateInventoryTransaction(selectedTransaction.id, transactionData);
        toast.success('تم تحديث الحركة بنجاح');
      } else {
        // Add new transaction
        const newTransactionData = {
          ...transactionData,
          company_id: companyId,
          is_active: true
        };
        
        await inventoryTransactionService.addInventoryTransaction(newTransactionData);
        toast.success('تم إضافة الحركة بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowTransactionForm(false);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الحركة:', error);
      toast.error(`حدث خطأ في حفظ الحركة: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle item active status
  const handleToggleItemStatus = async (item: DatabaseInventoryItem) => {
    const newStatus = !item.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا الصنف؟`)) {
      try {
        setActionLoading(item.id);
        await inventoryItemService.updateInventoryItem(item.id, { is_active: newStatus });
        toast.success(`تم ${actionText} الصنف بنجاح`);
        await loadData();
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} الصنف:`, error);
        toast.error(`حدث خطأ في ${actionText} الصنف: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Delete item (soft delete)
  const handleDeleteItem = async (item: DatabaseInventoryItem) => {
    if (item.is_active) {
      toast.error('لا يمكن حذف صنف نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذا الصنف؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(item.id);
        await inventoryItemService.deleteInventoryItem(item.id);
        toast.success('تم حذف الصنف بنجاح');
        await loadData();
      } catch (error: any) {
        console.error('❌ خطأ في حذف الصنف:', error);
        toast.error(`حدث خطأ في حذف الصنف: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل بيانات المخزون...</span>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة المخزون</h1>
          <p className="text-gray-600">إدارة المواد والأدوات والمخزون مع قاعدة البيانات</p>
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
                onClick={handleAddItem}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                صنف جديد
              </button>
              <button
                onClick={() => handleAddTransaction()}
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                حركة جديدة
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
              <p className="text-sm font-medium text-gray-500">إجمالي الأصناف</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">قيمة المخزون</p>
              <p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">مخزون منخفض</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">نفد المخزون</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
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
                placeholder="البحث في المخزون..."
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="in-stock">متوفر</option>
              <option value="low-stock">مخزون منخفض</option>
              <option value="out-of-stock">نفد المخزون</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصنف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكمية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  سعر الوحدة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  القيمة الإجمالية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ml-3 ${item.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Package className={`w-5 h-5 ${item.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className={`font-medium ${item.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {item.name}
                            {!item.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                          </div>
                          <div className="text-sm text-gray-500">كود: {item.item_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.category && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.quantity_on_hand} {item.unit_of_measure}
                      </div>
                      <div className="text-xs text-gray-500">
                        الحد الأدنى: {item.minimum_quantity} {item.unit_of_measure}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.cost_price.toLocaleString()} ر.س
                      </div>
                      <div className="text-xs text-gray-500">
                        سعر البيع: {item.selling_price.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {(item.quantity_on_hand * item.cost_price).toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getStockIcon(item)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button 
                          onClick={() => handleAddTransaction(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="إضافة حركة"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditItem(item)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="تعديل الصنف"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleItemStatus(item)}
                          disabled={actionLoading === item.id}
                          className={`p-1 rounded transition-colors ${
                            item.is_active 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                          title={item.is_active ? 'إلغاء تفعيل الصنف' : 'تفعيل الصنف'}
                        >
                          {actionLoading === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : item.is_active ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        {!item.is_active && (
                          <button 
                            onClick={() => handleDeleteItem(item)}
                            disabled={actionLoading === item.id}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="حذف الصنف"
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

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصناف</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة صنف جديد للمخزون</p>
            <button 
              onClick={handleAddItem}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة صنف جديد
            </button>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {selectedItem && (
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">حركات الصنف: {selectedItem.name}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getItemTransactions(selectedItem.id).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    {getTransactionTypeIcon(transaction.transaction_type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {getTransactionTypeText(transaction.transaction_type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.description || 'بدون وصف'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.transaction_date).toLocaleDateString('ar-SA')}
                        {transaction.reference_number && ` - ${transaction.reference_number}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'receipt' ? '+' : transaction.transaction_type === 'issue' ? '-' : ''}
                      {transaction.quantity} {selectedItem.unit_of_measure}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transaction.unit_cost && `${transaction.unit_cost.toLocaleString()} ر.س/وحدة`}
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

              {getItemTransactions(selectedItem.id).length === 0 && (
                <div className="text-center py-8">
                  <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد حركات</h4>
                  <p className="text-gray-500 mb-4">لم يتم تسجيل أي حركات لهذا الصنف</p>
                  <button 
                    onClick={() => handleAddTransaction(selectedItem)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    إضافة حركة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      <InventoryItemForm
        item={selectedItem}
        isOpen={showItemForm}
        onClose={() => setShowItemForm(false)}
        onSave={handleSaveItem}
        loading={actionLoading === 'saveItem'}
      />

      {/* Transaction Form Modal */}
      <InventoryTransactionForm
        transaction={selectedTransaction}
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSave={handleSaveTransaction}
        inventoryItems={inventoryItems.filter(item => item.is_active)}
        loading={actionLoading === 'saveTransaction'}
      />
    </div>
  );
};

export default InventoryList;