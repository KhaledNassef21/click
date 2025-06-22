import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseInventoryItem } from '../../lib/supabaseClient';
import { X, Save, Package, DollarSign, Truck, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryItemFormProps {
  item?: DatabaseInventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  loading?: boolean;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ item, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    arabic_name: '',
    description: '',
    category: '',
    unit_of_measure: 'piece',
    cost_price: 0,
    selling_price: 0,
    quantity_on_hand: 0,
    minimum_quantity: 0,
    maximum_quantity: 0,
    reorder_point: 0,
    location: '',
    barcode: '',
    supplier_id: '',
    is_active: true,
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (item) {
      console.log('🔄 تحميل بيانات الصنف للتعديل:', item.name);
      setFormData({
        item_code: item.item_code || '',
        name: item.name || '',
        arabic_name: item.arabic_name || '',
        description: item.description || '',
        category: item.category || '',
        unit_of_measure: item.unit_of_measure || 'piece',
        cost_price: item.cost_price || 0,
        selling_price: item.selling_price || 0,
        quantity_on_hand: item.quantity_on_hand || 0,
        minimum_quantity: item.minimum_quantity || 0,
        maximum_quantity: item.maximum_quantity || 0,
        reorder_point: item.reorder_point || 0,
        location: item.location || '',
        barcode: item.barcode || '',
        supplier_id: item.supplier_id || '',
        is_active: item.is_active,
        notes: item.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم صنف جديد');
      // Reset form for new item
      setFormData({
        item_code: generateItemCode(),
        name: '',
        arabic_name: '',
        description: '',
        category: '',
        unit_of_measure: 'piece',
        cost_price: 0,
        selling_price: 0,
        quantity_on_hand: 0,
        minimum_quantity: 0,
        maximum_quantity: 0,
        reorder_point: 0,
        location: '',
        barcode: '',
        supplier_id: '',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [item, isOpen]);

  const generateItemCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ITEM-${timestamp}-${randomNum}`;
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.item_code.trim()) {
      newErrors.item_code = 'رمز الصنف مطلوب';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الصنف مطلوب';
    }
    
    if (!formData.unit_of_measure.trim()) {
      newErrors.unit_of_measure = 'وحدة القياس مطلوبة';
    }
    
    if (formData.cost_price < 0) {
      newErrors.cost_price = 'سعر التكلفة لا يمكن أن يكون سالباً';
    }
    
    if (formData.selling_price < 0) {
      newErrors.selling_price = 'سعر البيع لا يمكن أن يكون سالباً';
    }
    
    if (formData.quantity_on_hand < 0) {
      newErrors.quantity_on_hand = 'الكمية لا يمكن أن تكون سالبة';
    }
    
    if (formData.minimum_quantity < 0) {
      newErrors.minimum_quantity = 'الحد الأدنى للكمية لا يمكن أن يكون سالباً';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ الصنف...');
      
      // Call the onSave function passed from parent component
      await onSave(formData);
      
      console.log('✅ تم حفظ الصنف بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الصنف:', error);
      toast.error(`حدث خطأ في حفظ الصنف: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'تعديل الصنف' : 'إضافة صنف جديد'}
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
                  <Package className="w-4 h-4 inline ml-1" />
                  رمز الصنف *
                </label>
                <input
                  type="text"
                  value={formData.item_code}
                  onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.item_code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="ITEM-001"
                  required
                  disabled={loading}
                />
                {errors.item_code && <p className="mt-1 text-sm text-red-500">{errors.item_code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline ml-1" />
                  اسم الصنف *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="أدخل اسم الصنف"
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
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="فئة الصنف"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وحدة القياس *
                </label>
                <select
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.unit_of_measure ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  disabled={loading}
                >
                  <option value="piece">قطعة</option>
                  <option value="kg">كيلوجرام</option>
                  <option value="meter">متر</option>
                  <option value="liter">لتر</option>
                  <option value="box">صندوق</option>
                  <option value="ton">طن</option>
                  <option value="bag">كيس</option>
                  <option value="roll">لفة</option>
                  <option value="set">طقم</option>
                  <option value="pair">زوج</option>
                  <option value="unit">وحدة</option>
                </select>
                {errors.unit_of_measure && <p className="mt-1 text-sm text-red-500">{errors.unit_of_measure}</p>}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف الصنف"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Pricing and Quantity */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الأسعار والكميات</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  سعر التكلفة
                </label>
                <input
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.cost_price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.cost_price && <p className="mt-1 text-sm text-red-500">{errors.cost_price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  سعر البيع
                </label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.selling_price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.selling_price && <p className="mt-1 text-sm text-red-500">{errors.selling_price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكمية الحالية
                </label>
                <input
                  type="number"
                  value={formData.quantity_on_hand}
                  onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.quantity_on_hand ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={item || loading}
                />
                {errors.quantity_on_hand && <p className="mt-1 text-sm text-red-500">{errors.quantity_on_hand}</p>}
                {item && (
                  <p className="mt-1 text-xs text-gray-500">يتم تحديث الكمية من خلال حركات المخزون</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأدنى للكمية
                </label>
                <input
                  type="number"
                  value={formData.minimum_quantity}
                  onChange={(e) => setFormData({ ...formData, minimum_quantity: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.minimum_quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.minimum_quantity && <p className="mt-1 text-sm text-red-500">{errors.minimum_quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للكمية
                </label>
                <input
                  type="number"
                  value={formData.maximum_quantity}
                  onChange={(e) => setFormData({ ...formData, maximum_quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نقطة إعادة الطلب
                </label>
                <input
                  type="number"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData({ ...formData, reorder_point: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات إضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="موقع تخزين الصنف"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الباركود
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="رمز الباركود"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
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
                  صنف نشط
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
              <span>{item ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryItemForm;