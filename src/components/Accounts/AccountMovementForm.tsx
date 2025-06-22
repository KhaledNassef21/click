import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseAccount, DatabaseAccountMovement, accountService } from '../../lib/supabaseClient';
import { X, Save, FileBarChart, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountMovementFormProps {
  movement?: DatabaseAccountMovement | null;
  account?: DatabaseAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (movement: any) => void;
  loading?: boolean;
}

const AccountMovementForm: React.FC<AccountMovementFormProps> = ({ 
  movement, 
  account, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    account_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    source: 'manual',
    source_id: '',
    description: '',
    debit_amount: 0,
    credit_amount: 0,
    currency: 'SAR',
    exchange_rate: 1,
    is_opening_balance: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (movement) {
      console.log('🔄 تحميل بيانات الحركة للتعديل:', movement.id);
      setFormData({
        account_id: movement.account_id || '',
        transaction_date: movement.transaction_date || new Date().toISOString().split('T')[0],
        source: movement.source || 'manual',
        source_id: movement.source_id || '',
        description: movement.description || '',
        debit_amount: movement.debit_amount || 0,
        credit_amount: movement.credit_amount || 0,
        currency: movement.currency || 'SAR',
        exchange_rate: movement.exchange_rate || 1,
        is_opening_balance: movement.is_opening_balance || false
      });
    } else if (account) {
      console.log('🆕 إعداد فورم حركة جديدة للحساب:', account.name);
      // Reset form for new movement with account pre-selected
      setFormData({
        account_id: account.id,
        transaction_date: new Date().toISOString().split('T')[0],
        source: 'manual',
        source_id: '',
        description: '',
        debit_amount: 0,
        credit_amount: 0,
        currency: 'SAR',
        exchange_rate: 1,
        is_opening_balance: false
      });
    } else {
      console.log('🆕 إعداد فورم حركة جديدة');
      // Reset form for new movement
      setFormData({
        account_id: '',
        transaction_date: new Date().toISOString().split('T')[0],
        source: 'manual',
        source_id: '',
        description: '',
        debit_amount: 0,
        credit_amount: 0,
        currency: 'SAR',
        exchange_rate: 1,
        is_opening_balance: false
      });
    }
    setErrors({});
  }, [movement, account, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.account_id) {
      newErrors.account_id = 'الحساب مطلوب';
    }
    
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'تاريخ الحركة مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    }
    
    if (formData.debit_amount === 0 && formData.credit_amount === 0) {
      newErrors.amount = 'يجب إدخال مبلغ مدين أو دائن';
    }
    
    if (formData.debit_amount > 0 && formData.credit_amount > 0) {
      newErrors.amount = 'لا يمكن إدخال مبلغ مدين ودائن معاً';
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
      console.log('💾 بدء حفظ الحركة...');
      
      // Prepare movement data for database
      const movementData = {
        ...formData,
        company_id: '00000000-0000-0000-0000-000000000001',
        source_id: formData.source_id || '00000000-0000-0000-0000-000000000001'
      };

      console.log('📋 بيانات الحركة المرسلة:', {
        account_id: movementData.account_id,
        description: movementData.description,
        debit_amount: movementData.debit_amount,
        credit_amount: movementData.credit_amount,
        is_new: !movement
      });

      // Call the onSave function passed from parent component
      await onSave(movementData);
      
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
            {movement ? 'تعديل حركة الحساب' : 'إضافة حركة جديدة'}
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
                <FileBarChart className="w-4 h-4 inline ml-1" />
                الحساب *
              </label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.account_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading || !!account}
              >
                <option value="">اختر الحساب</option>
                {state.accounts
                  .filter(acc => !acc.is_header)
                  .map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
              </select>
              {errors.account_id && <p className="mt-1 text-sm text-red-500">{errors.account_id}</p>}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline ml-1" />
                الوصف *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                rows={2}
                placeholder="وصف الحركة"
                required
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                المبلغ المدين
              </label>
              <input
                type="number"
                value={formData.debit_amount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  debit_amount: parseFloat(e.target.value) || 0,
                  credit_amount: parseFloat(e.target.value) > 0 ? 0 : formData.credit_amount
                })}
                className={`w-full px-4 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                المبلغ الدائن
              </label>
              <input
                type="number"
                value={formData.credit_amount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  credit_amount: parseFloat(e.target.value) || 0,
                  debit_amount: parseFloat(e.target.value) > 0 ? 0 : formData.debit_amount
                })}
                className={`w-full px-4 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={loading}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العملة
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المصدر
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="manual">إدخال يدوي</option>
                <option value="journal_entry">قيد محاسبي</option>
                <option value="invoice">فاتورة</option>
                <option value="payment">دفعة</option>
                <option value="voucher">سند</option>
                <option value="check">شيك</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_opening_balance"
                checked={formData.is_opening_balance}
                onChange={(e) => setFormData({ ...formData, is_opening_balance: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="is_opening_balance" className="mr-2 text-sm font-medium text-gray-700">
                رصيد افتتاحي
              </label>
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
              <span>{movement ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountMovementForm;