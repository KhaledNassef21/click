import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseInventoryTransaction, DatabaseInventoryItem } from '../../lib/supabaseClient';
import { X, Save, Package, DollarSign, Calendar, FileText, Briefcase, ArrowRightLeft, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryTransactionFormProps {
  transaction?: DatabaseInventoryTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  inventoryItems: DatabaseInventoryItem[];
  loading?: boolean;
}

const InventoryTransactionForm: React.FC<InventoryTransactionFormProps> = ({ 
  transaction, 
  isOpen, 
  onClose, 
  onSave, 
  inventoryItems, 
  loading = false 
}) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    item_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'receipt',
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    reference_number: '',
    description: '',
    project_id: '',
    location_from: '',
    location_to: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [selectedItem, setSelectedItem] = useState<DatabaseInventoryItem | null>(null);

  useEffect(() => {
    if (transaction) {
      console.log('🔄 تحميل بيانات الحركة للتعديل:', transaction.id);
      setFormData({
        item_id: transaction.item_id || '',
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        transaction_type: transaction.transaction_type || 'receipt',
        quantity: transaction.quantity || 0,
        unit_cost: transaction.unit_cost || 0,
        total_cost: transaction.total_cost || 0,
        reference_number: transaction.reference_number || '',
        description: transaction.description || '',
        project_id: transaction.project_id || '',
        location_from: transaction.location_from || '',
        location_to: transaction.location_to || ''
      });
      
      // Find selected item
      const item = inventoryItems.find(i => i.id === transaction.item_id);
      setSelectedItem(item || null);
    } else {
      console.log('🆕 إعداد فورم حركة جديدة');
      // Reset form for new transaction
      setFormData({
        item_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'receipt',
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
        reference_number: '',
        description: '',
        project_id: '',
        location_from: '',
        location_to: ''
      });
      setSelectedItem(null);
    }
    setErrors({});
  }, [transaction, isOpen, inventoryItems]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.item_id) {
      newErrors.item_id = 'الصنف مطلوب';
    }
    
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'تاريخ الحركة مطلوب';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'الكمية يجب أن تكون أكبر من صفر';
    }
    
    if (formData.transaction_type === 'issue' && selectedItem && formData.quantity > selectedItem.quantity_on_hand) {
      newErrors.quantity = 'الكمية المطلوبة أكبر من الكمية المتوفرة';
    }
    
    if (formData.transaction_type === 'transfer') {
      if (!formData.location_from) {
        newErrors.location_from = 'موقع المصدر مطلوب';
      }
      if (!formData.location_to) {
        newErrors.location_to = 'موقع الوجهة مطلوب';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemChange = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    setSelectedItem(item || null);
    
    setFormData({
      ...formData,
      item_id: itemId,
      unit_cost: item ? item.cost_price : 0,
      total_cost: item ? item.cost_price * formData.quantity : 0
    });
  };

  const handleQuantityChange = (quantity: number) => {
    const unitCost = formData.unit_cost || (selectedItem ? selectedItem.cost_price : 0);
    setFormData({
      ...formData,
      quantity,
      total_cost: unitCost * quantity
    });
  };

  const handleUnitCostChange = (unitCost: number) => {
    setFormData({
      ...formData,
      unit_cost: unitCost,
      total_cost: unitCost * formData.quantity
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ الحركة...');
      
      // Call the onSave function passed from parent component
      await onSave(formData);
      
      console.log('✅ تم حفظ الحركة بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الحركة:', error);
      toast.error(`حدث خطأ في حفظ الحركة: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {transaction ? 'تعديل حركة المخزون' : 'إضافة حركة مخزون جديدة'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline ml-1" />
                الصنف *
              </label>
              <select
                value={formData.item_id}
                onChange={(e) => handleItemChange(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.item_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              >
                <option value="">اختر الصنف</option>
                {inventoryItems.filter(item => item.is_active).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.quantity_on_hand} {item.unit_of_measure}
                  </option>
                ))}
              </select>
              {errors.item_id && <p className="mt-1 text-sm text-red-500">{errors.item_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-1" />
                تاريخ الحركة *
              </label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.transaction_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              />
              {errors.transaction_date && <p className="mt-1 text-sm text-red-500">{errors.transaction_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الحركة *
              </label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="receipt">استلام</option>
                <option value="issue">صرف</option>
                <option value="adjustment">تسوية</option>
                <option value="transfer">نقل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكمية *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-2 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                disabled={loading}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
              {selectedItem && (
                <p className="mt-1 text-xs text-gray-500">
                  الكمية المتوفرة: {selectedItem.quantity_on_hand} {selectedItem.unit_of_measure}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                سعر الوحدة
              </label>
              <input
                type="number"
                value={formData.unit_cost}
                onChange={(e) => handleUnitCostChange(parseFloat(e.target.value) || 0)}
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
                التكلفة الإجمالية
              </label>
              <input
                type="number"
                value={formData.total_cost}
                onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline ml-1" />
                رقم المرجع
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رقم أمر الشراء أو المرجع"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline ml-1" />
                المشروع
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">اختر المشروع</option>
                {state.projects.filter(p => p.is_active).map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.transaction_type === 'transfer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline ml-1" />
                    موقع المصدر *
                  </label>
                  <input
                    type="text"
                    value={formData.location_from}
                    onChange={(e) => setFormData({ ...formData, location_from: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.location_from ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="موقع المصدر"
                    required={formData.transaction_type === 'transfer'}
                    disabled={loading}
                  />
                  {errors.location_from && <p className="mt-1 text-sm text-red-500">{errors.location_from}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline ml-1" />
                    موقع الوجهة *
                  </label>
                  <input
                    type="text"
                    value={formData.location_to}
                    onChange={(e) => setFormData({ ...formData, location_to: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.location_to ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="موقع الوجهة"
                    required={formData.transaction_type === 'transfer'}
                    disabled={loading}
                  />
                  {errors.location_to && <p className="mt-1 text-sm text-red-500">{errors.location_to}</p>}
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="وصف الحركة"
                disabled={loading}
              />
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
              <span>{transaction ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryTransactionForm;