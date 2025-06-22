import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, Building2, Eye, Edit, Trash2, Calendar, DollarSign, TrendingDown, MapPin, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import FixedAssetForm from './FixedAssetForm';
import { fixedAssetService, DatabaseFixedAsset, DatabaseAssetDepreciation } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const FixedAssetList: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [fixedAssets, setFixedAssets] = useState<DatabaseFixedAsset[]>([]);
  const [depreciationHistory, setDepreciationHistory] = useState<{[key: string]: DatabaseAssetDepreciation[]}>({});
  
  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DatabaseFixedAsset | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load data from database
  const loadData = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل بيانات الأصول الثابتة...');
      
      // Test connection first
      const isConnected = await fixedAssetService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await fixedAssetService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول الأصول الثابتة غير صحيح - يرجى تطبيق migrations');
      }

      // For demo purposes, using a default company ID
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      // Get all fixed assets
      const assetsData = await fixedAssetService.getFixedAssets(companyId);
      setFixedAssets(assetsData);
      
      // Load depreciation history for each asset
      const historyData: {[key: string]: DatabaseAssetDepreciation[]} = {};
      for (const asset of assetsData) {
        const history = await fixedAssetService.getAssetDepreciationHistory(asset.id);
        historyData[asset.id] = history;
      }
      setDepreciationHistory(historyData);
      
      toast.success('تم تحميل بيانات الأصول الثابتة بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في تحميل بيانات الأصول الثابتة:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل بيانات الأصول الثابتة');
      toast.error('حدث خطأ في تحميل بيانات الأصول الثابتة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter assets based on search term and category
  const filteredAssets = fixedAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalPurchaseValue = fixedAssets.reduce((sum, asset) => sum + asset.purchase_cost, 0);
  const totalCurrentValue = fixedAssets.reduce((sum, asset) => sum + asset.current_value, 0);
  const totalDepreciation = fixedAssets.reduce((sum, asset) => sum + asset.accumulated_depreciation, 0);
  const categories = [...new Set(fixedAssets.filter(asset => asset.category).map(asset => asset.category))];

  // Get depreciation rate
  const getDepreciationRate = (asset: DatabaseFixedAsset) => {
    return ((asset.accumulated_depreciation / asset.purchase_cost) * 100).toFixed(1);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: {[key: string]: string} = {
      'معدات ثقيلة': 'bg-blue-100 text-blue-800',
      'مركبات': 'bg-green-100 text-green-800',
      'معدات كهربائية': 'bg-yellow-100 text-yellow-800',
      'معدات رفع': 'bg-purple-100 text-purple-800',
      'أثاث ومفروشات': 'bg-pink-100 text-pink-800',
      'أجهزة كمبيوتر': 'bg-indigo-100 text-indigo-800',
      'مباني وإنشاءات': 'bg-gray-100 text-gray-800',
      'أراضي': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Get depreciation method text
  const getDepreciationMethodText = (method: string) => {
    switch (method) {
      case 'straight_line':
        return 'القسط الثابت';
      case 'declining_balance':
        return 'الرصيد المتناقص';
      case 'units_of_production':
        return 'وحدات الإنتاج';
      default:
        return method;
    }
  };

  // Handle form
  const handleAddAsset = () => {
    setSelectedAsset(null);
    setShowForm(true);
  };

  const handleEditAsset = (asset: DatabaseFixedAsset) => {
    setSelectedAsset(asset);
    setShowForm(true);
  };

  const handleSaveAsset = async (assetData: any) => {
    try {
      setActionLoading('saveAsset');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedAsset) {
        // Update existing asset
        await fixedAssetService.updateFixedAsset(selectedAsset.id, assetData);
        toast.success('تم تحديث الأصل بنجاح');
      } else {
        // Add new asset
        const newAssetData = {
          ...assetData,
          company_id: companyId,
          current_value: assetData.purchase_cost, // Initial current value is purchase cost
          accumulated_depreciation: 0 // Initial accumulated depreciation is 0
        };
        
        await fixedAssetService.addFixedAsset(newAssetData);
        toast.success('تم إضافة الأصل بنجاح');
      }
      
      // Reload data
      await loadData();
      setShowForm(false);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الأصل:', error);
      toast.error(`حدث خطأ في حفظ الأصل: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle asset active status
  const handleToggleAssetStatus = async (asset: DatabaseFixedAsset) => {
    const newStatus = !asset.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا الأصل؟`)) {
      try {
        setActionLoading(asset.id);
        await fixedAssetService.updateFixedAsset(asset.id, { is_active: newStatus });
        toast.success(`تم ${actionText} الأصل بنجاح`);
        await loadData();
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} الأصل:`, error);
        toast.error(`حدث خطأ في ${actionText} الأصل: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Delete asset (soft delete)
  const handleDeleteAsset = async (asset: DatabaseFixedAsset) => {
    if (asset.is_active) {
      toast.error('لا يمكن حذف أصل نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من حذف هذا الأصل؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(asset.id);
        await fixedAssetService.deleteFixedAsset(asset.id);
        toast.success('تم حذف الأصل بنجاح');
        await loadData();
      } catch (error: any) {
        console.error('❌ خطأ في حذف الأصل:', error);
        toast.error(`حدث خطأ في حذف الأصل: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Calculate annual depreciation
  const calculateAnnualDepreciation = (asset: DatabaseFixedAsset) => {
    if (asset.depreciation_method === 'straight_line') {
      return (asset.purchase_cost - asset.salvage_value) / asset.useful_life_years;
    } else if (asset.depreciation_method === 'declining_balance') {
      // Simplified declining balance calculation
      const rate = 2 / asset.useful_life_years; // Double declining rate
      return (asset.purchase_cost - asset.accumulated_depreciation) * rate;
    } else {
      // Units of production - not implemented in this simplified version
      return (asset.purchase_cost - asset.salvage_value) / asset.useful_life_years;
    }
  };

  // Record depreciation
  const handleRecordDepreciation = async (asset: DatabaseFixedAsset) => {
    try {
      setActionLoading(asset.id);
      
      // Calculate depreciation amount
      const annualDepreciation = calculateAnnualDepreciation(asset);
      const newAccumulatedDepreciation = asset.accumulated_depreciation + annualDepreciation;
      const newBookValue = asset.purchase_cost - newAccumulatedDepreciation;
      
      // Create depreciation record
      const depreciationData = {
        company_id: asset.company_id,
        asset_id: asset.id,
        depreciation_date: new Date().toISOString().split('T')[0],
        depreciation_amount: annualDepreciation,
        accumulated_depreciation: newAccumulatedDepreciation,
        book_value: newBookValue,
        is_active: true,
        notes: `تسجيل إهلاك سنوي للأصل ${asset.name}`
      };
      
      await fixedAssetService.addDepreciationRecord(depreciationData);
      toast.success('تم تسجيل الإهلاك بنجاح');
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('❌ خطأ في تسجيل الإهلاك:', error);
      toast.error(`حدث خطأ في تسجيل الإهلاك: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Get supplier name
  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return '';
    const supplier = state.suppliers.find(s => s.id === supplierId);
    return supplier?.name || '';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل بيانات الأصول الثابتة...</span>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة الأصول الثابتة</h1>
          <p className="text-gray-600">إدارة الأصول الثابتة والاهلاكات مع قاعدة البيانات</p>
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
            onClick={handleAddAsset}
            disabled={actionLoading === 'saveAsset'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
          >
            {actionLoading === 'saveAsset' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>إضافة أصل جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الأصول</p>
              <p className="text-2xl font-bold text-gray-900">{fixedAssets.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">قيمة الشراء</p>
              <p className="text-2xl font-bold text-green-600">{totalPurchaseValue.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">القيمة الحالية</p>
              <p className="text-2xl font-bold text-purple-600">{totalCurrentValue.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الاهلاك</p>
              <p className="text-2xl font-bold text-red-600">{totalDepreciation.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
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
                placeholder="البحث في الأصول..."
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
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأصل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الشراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  قيمة الشراء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  القيمة الحالية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نسبة الاهلاك
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموقع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className={`hover:bg-gray-50 transition-colors ${!asset.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ml-3 ${asset.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Building2 className={`w-5 h-5 ${asset.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className={`font-medium ${asset.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {asset.name}
                          {!asset.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          كود: {asset.asset_code}
                          {asset.serial_number && ` | الرقم التسلسلي: ${asset.serial_number}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {asset.category && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(asset.category)}`}>
                        {asset.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      {new Date(asset.purchase_date).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {asset.purchase_cost.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-purple-600">
                      {asset.current_value.toLocaleString()} ر.س
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-red-600">
                        {getDepreciationRate(asset)}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${getDepreciationRate(asset)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {getDepreciationMethodText(asset.depreciation_method)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 ml-2" />
                      {asset.location || 'غير محدد'}
                    </div>
                    {asset.supplier_id && (
                      <div className="text-xs text-gray-500">
                        المورد: {getSupplierName(asset.supplier_id)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleRecordDepreciation(asset)}
                        disabled={actionLoading === asset.id}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="تسجيل إهلاك"
                      >
                        {actionLoading === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleEditAsset(asset)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="تعديل الأصل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleAssetStatus(asset)}
                        disabled={actionLoading === asset.id}
                        className={`p-1 rounded transition-colors ${
                          asset.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={asset.is_active ? 'إلغاء تفعيل الأصل' : 'تفعيل الأصل'}
                      >
                        {actionLoading === asset.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : asset.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      {!asset.is_active && (
                        <button 
                          onClick={() => handleDeleteAsset(asset)}
                          disabled={actionLoading === asset.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="حذف الأصل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد أصول ثابتة</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة أصل ثابت جديد</p>
            <button 
              onClick={handleAddAsset}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة أصل جديد
            </button>
          </div>
        )}
      </div>

      {/* Depreciation History */}
      {selectedAsset && depreciationHistory[selectedAsset.id] && depreciationHistory[selectedAsset.id].length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">سجل الإهلاك: {selectedAsset.name}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    مبلغ الإهلاك
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإهلاك المتراكم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القيمة الدفترية
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {depreciationHistory[selectedAsset.id].map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 ml-2" />
                        {new Date(record.depreciation_date).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {record.depreciation_amount.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {record.accumulated_depreciation.toLocaleString()} ر.س
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-purple-600">
                        {record.book_value.toLocaleString()} ر.س
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Asset Form Modal */}
      <FixedAssetForm
        asset={selectedAsset}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSaveAsset}
        loading={actionLoading === 'saveAsset'}
      />
    </div>
  );
};

export default FixedAssetList;