import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseFixedAsset } from '../../lib/supabaseClient';
import { X, Save, Building2, DollarSign, Calendar, Truck, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FixedAssetFormProps {
  asset?: DatabaseFixedAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: any) => void;
  loading?: boolean;
}

const FixedAssetForm: React.FC<FixedAssetFormProps> = ({ asset, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    arabic_name: '',
    description: '',
    category: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_cost: 0,
    salvage_value: 0,
    useful_life_years: 0,
    depreciation_method: 'straight_line',
    accumulated_depreciation: 0,
    current_value: 0,
    location: '',
    serial_number: '',
    supplier_id: '',
    is_active: true,
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (asset) {
      console.log('🔄 تحميل بيانات الأصل للتعديل:', asset.name);
      setFormData({
        asset_code: asset.asset_code || '',
        name: asset.name || '',
        arabic_name: asset.arabic_name || '',
        description: asset.description || '',
        category: asset.category || '',
        purchase_date: asset.purchase_date || new Date().toISOString().split('T')[0],
        purchase_cost: asset.purchase_cost || 0,
        salvage_value: asset.salvage_value || 0,
        useful_life_years: asset.useful_life_years || 0,
        depreciation_method: asset.depreciation_method || 'straight_line',
        accumulated_depreciation: asset.accumulated_depreciation || 0,
        current_value: asset.current_value || 0,
        location: asset.location || '',
        serial_number: asset.serial_number || '',
        supplier_id: asset.supplier_id || '',
        is_active: asset.is_active,
        notes: asset.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم أصل جديد');
      // Reset form for new asset
      setFormData({
        asset_code: generateAssetCode(),
        name: '',
        arabic_name: '',
        description: '',
        category: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_cost: 0,
        salvage_value: 0,
        useful_life_years: 0,
        depreciation_method: 'straight_line',
        accumulated_depreciation: 0,
        current_value: 0,
        location: '',
        serial_number: '',
        supplier_id: '',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [asset, isOpen]);

  const generateAssetCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FA-${timestamp}-${randomNum}`;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.asset_code.trim()) {
      newErrors.asset_code = 'رمز الأصل مطلوب';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الأصل مطلوب';
    }
    
    if (!formData.purchase_date) {
      newErrors.purchase_date = 'تاريخ الشراء مطلوب';
    }
    
    if (formData.purchase_cost <= 0) {
      newErrors.purchase_cost = 'تكلفة الشراء يجب أن تكون أكبر من صفر';
    }
    
    if (formData.salvage_value < 0) {
      newErrors.salvage_value = 'قيمة الإنقاذ لا يمكن أن تكون سالبة';
    }
    
    if (formData.useful_life_years <= 0) {
      newErrors.useful_life_years = 'العمر الإنتاجي يجب أن يكون أكبر من صفر';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateDepreciation = () => {
    // Calculate current value based on purchase cost, salvage value, and accumulated depreciation
    const currentValue = formData.purchase_cost - formData.accumulated_depreciation;
    setFormData({ ...formData, current_value: currentValue });
  };

  useEffect(() => {
    if (!asset) {
      // For new assets, set current value to purchase cost
      setFormData(prev => ({ ...prev, current_value: prev.purchase_cost }));
    }
  }, [formData.purchase_cost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ الأصل...');
      
      // Call the onSave function passed from parent component
      await onSave(formData);
      
      console.log('✅ تم حفظ الأصل بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الأصل:', error);
      toast.error(`حدث خطأ في حفظ الأصل: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {asset ? 'تعديل الأصل الثابت' : 'إضافة أصل ثابت جديد'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline ml-1" />
                  رمز الأصل *
                </label>
                <input
                  type="text"
                  value={formData.asset_code}
                  onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.asset_code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="FA-001"
                  required
                  disabled={loading}
                />
                {errors.asset_code && <p className="mt-1 text-sm text-red-500">{errors.asset_code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline ml-1" />
                  اسم الأصل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="أدخل اسم الأصل"
                  required
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم بالعربية
                </label>
                <input
                  type="text"
                  value={formData.arabic_name}
                  onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الاسم بالعربية"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">اختر الفئة</option>
                  <option value="معدات ثقيلة">معدات ثقيلة</option>
                  <option value="مركبات">مركبات</option>
                  <option value="معدات كهربائية">معدات كهربائية</option>
                  <option value="معدات رفع">معدات رفع</option>
                  <option value="أثاث ومفروشات">أثاث ومفروشات</option>
                  <option value="أجهزة كمبيوتر">أجهزة كمبيوتر</option>
                  <option value="مباني وإنشاءات">مباني وإنشاءات</option>
                  <option value="أراضي">أراضي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاريخ الشراء *
                </label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.purchase_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  disabled={loading}
                />
                {errors.purchase_date && <p className="mt-1 text-sm text-red-500">{errors.purchase_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4 inline ml-1" />
                  المورد
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">اختر المورد</option>
                  {state.suppliers.filter(s => s.is_active).map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  الموقع
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="موقع الأصل"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرقم التسلسلي
                </label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الرقم التسلسلي"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف الأصل"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات المالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  تكلفة الشراء *
                </label>
                <input
                  type="number"
                  value={formData.purchase_cost}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    purchase_cost: parseFloat(e.target.value) || 0,
                    current_value: parseFloat(e.target.value) || 0 // For new assets, current value = purchase cost
                  })}
                  className={`w-full px-4 py-2 border ${errors.purchase_cost ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={asset || loading}
                />
                {errors.purchase_cost && <p className="mt-1 text-sm text-red-500">{errors.purchase_cost}</p>}
                {asset && (
                  <p className="mt-1 text-xs text-gray-500">لا يمكن تعديل تكلفة الشراء بعد إنشاء الأصل</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  قيمة الإنقاذ
                </label>
                <input
                  type="number"
                  value={formData.salvage_value}
                  onChange={(e) => setFormData({ ...formData, salvage_value: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.salvage_value ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.salvage_value && <p className="mt-1 text-sm text-red-500">{errors.salvage_value}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العمر الإنتاجي (سنوات) *
                </label>
                <input
                  type="number"
                  value={formData.useful_life_years}
                  onChange={(e) => setFormData({ ...formData, useful_life_years: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.useful_life_years ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                  min="1"
                  required
                  disabled={loading}
                />
                {errors.useful_life_years && <p className="mt-1 text-sm text-red-500">{errors.useful_life_years}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الإهلاك
                </label>
                <select
                  value={formData.depreciation_method}
                  onChange={(e) => setFormData({ ...formData, depreciation_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="straight_line">القسط الثابت</option>
                  <option value="declining_balance">الرصيد المتناقص</option>
                  <option value="units_of_production">وحدات الإنتاج</option>
                </select>
              </div>

              {asset && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline ml-1" />
                      الإهلاك المتراكم
                    </label>
                    <input
                      type="number"
                      value={formData.accumulated_depreciation}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData({ 
                          ...formData, 
                          accumulated_depreciation: value
                        });
                        // Recalculate current value when accumulated depreciation changes
                        setTimeout(calculateDepreciation, 100);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline ml-1" />
                      القيمة الحالية
                    </label>
                    <input
                      type="number"
                      value={formData.current_value}
                      onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={true}
                    />
                    <p className="mt-1 text-xs text-gray-500">يتم حساب القيمة الحالية تلقائياً</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملاحظات إضافية"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="mr-2 text-sm font-medium text-gray-700">
                  أصل نشط
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{asset ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FixedAssetForm;