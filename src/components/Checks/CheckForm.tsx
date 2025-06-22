import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseCheck } from '../../lib/supabaseClient';
import { X, Save, CreditCard, DollarSign, User, Calendar, Building, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckFormProps {
  check?: DatabaseCheck | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (check: any) => void;
  loading?: boolean;
}

const CheckForm: React.FC<CheckFormProps> = ({ check, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    check_type: 'received',
    check_number: '',
    check_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payee: '',
    bank_name: '',
    account_number: '',
    status: 'pending',
    customer_id: '',
    supplier_id: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (check) {
      console.log('🔄 تحميل بيانات الشيك للتعديل:', check.check_number);
      setFormData({
        check_type: check.check_type || 'received',
        check_number: check.check_number || '',
        check_date: check.check_date || new Date().toISOString().split('T')[0],
        due_date: check.due_date || new Date().toISOString().split('T')[0],
        amount: check.amount || 0,
        payee: check.payee || '',
        bank_name: check.bank_name || '',
        account_number: check.account_number || '',
        status: check.status || 'pending',
        customer_id: check.customer_id || '',
        supplier_id: check.supplier_id || '',
        notes: check.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم شيك جديد');
      // Reset form for new check
      setFormData({
        check_type: 'received',
        check_number: '',
        check_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        amount: 0,
        payee: '',
        bank_name: '',
        account_number: '',
        status: 'pending',
        customer_id: '',
        supplier_id: '',
        notes: ''
      });
    }
    setErrors({});
  }, [check, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.check_number.trim()) {
      newErrors.check_number = 'رقم الشيك مطلوب';
    }
    
    if (!formData.payee.trim()) {
      newErrors.payee = 'اسم المستفيد/الدافع مطلوب';
    }
    
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'اسم البنك مطلوب';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckTypeChange = (type: string) => {
    setFormData({
      ...formData,
      check_type: type,
      // Reset the party based on type
      customer_id: type === 'received' ? formData.customer_id : '',
      supplier_id: type === 'issued' ? formData.supplier_id : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ الشيك...');
      
      // Prepare check data for database
      const checkData = {
        ...formData,
        // Convert empty strings to null for UUID fields
        customer_id: formData.customer_id || null,
        supplier_id: formData.supplier_id || null,
        // Convert empty strings to null for optional fields
        due_date: formData.due_date || null,
        account_number: formData.account_number || null
      };

      console.log('📋 بيانات الشيك المرسلة:', {
        check_number: checkData.check_number,
        check_type: checkData.check_type,
        amount: checkData.amount,
        payee: checkData.payee,
        is_new: !check
      });

      // Call the onSave function passed from parent component
      await onSave(checkData);
      
      console.log('✅ تم حفظ الشيك بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الشيك:', error);
      toast.error(`حدث خطأ في حفظ الشيك: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {check ? 'تعديل الشيك' : 'شيك جديد'}
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
                نوع الشيك *
              </label>
              <div className="flex space-x-4 space-x-reverse">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="received"
                    name="check_type"
                    value="received"
                    checked={formData.check_type === 'received'}
                    onChange={() => handleCheckTypeChange('received')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="received" className="mr-2 text-sm font-medium text-gray-700">
                    شيك مقبوض
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="issued"
                    name="check_type"
                    value="issued"
                    checked={formData.check_type === 'issued'}
                    onChange={() => handleCheckTypeChange('issued')}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="issued" className="mr-2 text-sm font-medium text-gray-700">
                    شيك مدفوع
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline ml-1" />
                رقم الشيك *
              </label>
              <input
                type="text"
                value={formData.check_number}
                onChange={(e) => setFormData({ ...formData, check_number: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.check_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="123456"
                required
                disabled={loading}
              />
              {errors.check_number && <p className="mt-1 text-sm text-red-500">{errors.check_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-1" />
                تاريخ الشيك *
              </label>
              <input
                type="date"
                value={formData.check_date}
                onChange={(e) => setFormData({ ...formData, check_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-1" />
                تاريخ الاستحقاق *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                المبلغ (ر.س) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline ml-1" />
                {formData.check_type === 'received' ? 'الدافع' : 'المستفيد'} *
              </label>
              <input
                type="text"
                value={formData.payee}
                onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.payee ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="اسم الشخص أو الشركة"
                required
                disabled={loading}
              />
              {errors.payee && <p className="mt-1 text-sm text-red-500">{errors.payee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline ml-1" />
                البنك *
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.bank_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="اسم البنك"
                required
                disabled={loading}
              />
              {errors.bank_name && <p className="mt-1 text-sm text-red-500">{errors.bank_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الحساب
              </label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="رقم الحساب (اختياري)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="pending">في الانتظار</option>
                <option value="cleared">مقبوض</option>
                <option value="bounced">مرتد</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {/* Customer/Supplier Selection */}
            {formData.check_type === 'received' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العميل
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">اختر العميل</option>
                  {state.customers.filter(c => c.is_active).map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.check_type === 'issued' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            )}

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
              <span>{check ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckForm;