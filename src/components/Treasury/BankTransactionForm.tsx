import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseBankTransaction, DatabaseBankAccount, DatabaseCashAccount } from '../../lib/supabaseClient';
import { X, Save, ArrowLeftRight, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BankTransactionFormProps {
  transaction?: DatabaseBankTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  bankAccounts: DatabaseBankAccount[];
  cashAccounts: DatabaseCashAccount[];
  loading?: boolean;
}

const BankTransactionForm: React.FC<BankTransactionFormProps> = ({ 
  transaction, 
  isOpen, 
  onClose, 
  onSave, 
  bankAccounts, 
  cashAccounts, 
  loading = false 
}) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    account_id: '',
    account_type: 'bank',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'deposit',
    amount: 0,
    description: '',
    reference_number: '',
    related_account_id: '',
    status: 'completed',
    is_reconciled: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (transaction) {
      console.log('🔄 تحميل بيانات المعاملة للتعديل:', transaction.id);
      setFormData({
        account_id: transaction.account_id || '',
        account_type: transaction.account_type || 'bank',
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
        transaction_type: transaction.transaction_type || 'deposit',
        amount: transaction.amount || 0,
        description: transaction.description || '',
        reference_number: transaction.reference_number || '',
        related_account_id: transaction.related_account_id || '',
        status: transaction.status || 'completed',
        is_reconciled: transaction.is_reconciled || false
      });
    } else {
      console.log('🆕 إعداد فورم معاملة جديدة');
      // Reset form for new transaction
      setFormData({
        account_id: '',
        account_type: 'bank',
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'deposit',
        amount: 0,
        description: '',
        reference_number: '',
        related_account_id: '',
        status: 'completed',
        is_reconciled: false
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.account_id) {
      newErrors.account_id = 'الحساب مطلوب';
    }
    
    if (!formData.transaction_date) {
      newErrors.transaction_date = 'تاريخ المعاملة مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    
    if (formData.transaction_type === 'transfer' && !formData.related_account_id) {
      newErrors.related_account_id = 'الحساب المقابل مطلوب للتحويلات';
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
      console.log('💾 بدء حفظ المعاملة...');
      
      // Call the onSave function passed from parent component
      await onSave(formData);
      
      console.log('✅ تم حفظ المعاملة بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المعاملة:', error);
      toast.error(`حدث خطأ في حفظ المعاملة: ${error.message}`);
    }
  };

  // Get account options based on account type
  const getAccountOptions = () => {
    if (formData.account_type === 'bank') {
      return bankAccounts.filter(account => account.is_active).map(account => (
        <option key={account.id} value={account.id}>
          {account.account_name} - {account.bank_name} ({account.current_balance.toLocaleString()} {account.currency})
        </option>
      ));
    } else {
      return cashAccounts.filter(account => account.is_active).map(account => (
        <option key={account.id} value={account.id}>
          {account.account_name} ({account.current_balance.toLocaleString()} {account.currency})
        </option>
      ));
    }
  };

  // Get related account options based on account type
  const getRelatedAccountOptions = () => {
    if (formData.account_type === 'bank') {
      // If main account is bank, show both bank and cash accounts as options
      return [
        ...bankAccounts.filter(account => account.is_active && account.id !== formData.account_id).map(account => (
          <option key={account.id} value={account.id}>
            {account.account_name} - {account.bank_name} (بنكي)
          </option>
        )),
        ...cashAccounts.filter(account => account.is_active).map(account => (
          <option key={account.id} value={account.id}>
            {account.account_name} (نقدي)
          </option>
        ))
      ];
    } else {
      // If main account is cash, show both bank and cash accounts as options
      return [
        ...bankAccounts.filter(account => account.is_active).map(account => (
          <option key={account.id} value={account.id}>
            {account.account_name} - {account.bank_name} (بنكي)
          </option>
        )),
        ...cashAccounts.filter(account => account.is_active && account.id !== formData.account_id).map(account => (
          <option key={account.id} value={account.id}>
            {account.account_name} (نقدي)
          </option>
        ))
      ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {transaction ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
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
                نوع الحساب *
              </label>
              <div className="flex space-x-4 space-x-reverse">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="bank"
                    name="account_type"
                    value="bank"
                    checked={formData.account_type === 'bank'}
                    onChange={() => setFormData({ ...formData, account_type: 'bank', account_id: '' })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="bank" className="mr-2 text-sm font-medium text-gray-700">
                    حساب بنكي
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cash"
                    name="account_type"
                    value="cash"
                    checked={formData.account_type === 'cash'}
                    onChange={() => setFormData({ ...formData, account_type: 'cash', account_id: '' })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="cash" className="mr-2 text-sm font-medium text-gray-700">
                    حساب نقدي
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحساب *
              </label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.account_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              >
                <option value="">اختر الحساب</option>
                {getAccountOptions()}
              </select>
              {errors.account_id && <p className="mt-1 text-sm text-red-500">{errors.account_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline ml-1" />
                تاريخ المعاملة *
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
                نوع المعاملة *
              </label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="deposit">إيداع</option>
                <option value="withdrawal">سحب</option>
                <option value="transfer">تحويل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                المبلغ *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                disabled={loading}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
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
                placeholder="رقم الشيك أو المرجع"
                disabled={loading}
              />
            </div>

            {formData.transaction_type === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ArrowLeftRight className="w-4 h-4 inline ml-1" />
                  الحساب المقابل *
                </label>
                <select
                  value={formData.related_account_id}
                  onChange={(e) => setFormData({ ...formData, related_account_id: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.related_account_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required={formData.transaction_type === 'transfer'}
                  disabled={loading}
                >
                  <option value="">اختر الحساب المقابل</option>
                  {getRelatedAccountOptions()}
                </select>
                {errors.related_account_id && <p className="mt-1 text-sm text-red-500">{errors.related_account_id}</p>}
              </div>
            )}

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
                <option value="completed">مكتملة</option>
                <option value="pending">معلقة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                rows={3}
                placeholder="وصف المعاملة"
                required
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_reconciled"
                checked={formData.is_reconciled}
                onChange={(e) => setFormData({ ...formData, is_reconciled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="is_reconciled" className="mr-2 text-sm font-medium text-gray-700">
                تمت مطابقتها
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
              <span>{transaction ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankTransactionForm;