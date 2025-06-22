import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseBankAccount } from '../../lib/supabaseClient';
import { X, Save, Building, DollarSign, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BankAccountFormProps {
  bankAccount?: DatabaseBankAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bankAccount: any) => void;
  loading?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ bankAccount, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    iban: '',
    swift_code: '',
    branch: '',
    currency: 'SAR',
    opening_balance: 0,
    current_balance: 0,
    account_type: 'checking',
    is_active: true,
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (bankAccount) {
      console.log('🔄 تحميل بيانات الحساب البنكي للتعديل:', bankAccount.account_name);
      setFormData({
        account_name: bankAccount.account_name || '',
        bank_name: bankAccount.bank_name || '',
        account_number: bankAccount.account_number || '',
        iban: bankAccount.iban || '',
        swift_code: bankAccount.swift_code || '',
        branch: bankAccount.branch || '',
        currency: bankAccount.currency || 'SAR',
        opening_balance: bankAccount.opening_balance || 0,
        current_balance: bankAccount.current_balance || 0,
        account_type: bankAccount.account_type || 'checking',
        is_active: bankAccount.is_active,
        notes: bankAccount.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم حساب بنكي جديد');
      // Reset form for new bank account
      setFormData({
        account_name: '',
        bank_name: '',
        account_number: '',
        iban: '',
        swift_code: '',
        branch: '',
        currency: 'SAR',
        opening_balance: 0,
        current_balance: 0,
        account_type: 'checking',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [bankAccount, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.account_name.trim()) {
      newErrors.account_name = 'اسم الحساب مطلوب';
    }
    
    if (!formData.bank_name.trim()) {
      newErrors.bank_name = 'اسم البنك مطلوب';
    }
    
    if (!formData.account_number.trim()) {
      newErrors.account_number = 'رقم الحساب مطلوب';
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
      console.log('💾 بدء حفظ الحساب البنكي...');
      
      // If it's a new account, set current_balance to opening_balance
      if (!bankAccount) {
        formData.current_balance = formData.opening_balance;
      }
      
      // Call the onSave function passed from parent component
      await onSave(formData);
      
      console.log('✅ تم حفظ الحساب البنكي بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الحساب البنكي:', error);
      toast.error(`حدث خطأ في حفظ الحساب البنكي: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {bankAccount ? 'تعديل الحساب البنكي' : 'إضافة حساب بنكي جديد'}
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
                <Building className="w-4 h-4 inline ml-1" />
                اسم الحساب *
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.account_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="الحساب الجاري - البنك الأهلي"
                required
                disabled={loading}
              />
              {errors.account_name && <p className="mt-1 text-sm text-red-500">{errors.account_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline ml-1" />
                اسم البنك *
              </label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.bank_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="البنك الأهلي السعودي"
                required
                disabled={loading}
              />
              {errors.bank_name && <p className="mt-1 text-sm text-red-500">{errors.bank_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline ml-1" />
                رقم الحساب *
              </label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.account_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="1234567890"
                required
                disabled={loading}
              />
              {errors.account_number && <p className="mt-1 text-sm text-red-500">{errors.account_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline ml-1" />
                رقم الآيبان
              </label>
              <input
                type="text"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SA0000000000000000000000"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز السويفت
              </label>
              <input
                type="text"
                value={formData.swift_code}
                onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NCBKSAJE"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفرع
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="فرع العليا"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
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
                نوع الحساب
              </label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="checking">جاري</option>
                <option value="savings">توفير</option>
                <option value="credit">ائتماني</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                الرصيد الافتتاحي
              </label>
              <input
                type="number"
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                disabled={bankAccount || loading}
              />
              {bankAccount && (
                <p className="mt-1 text-xs text-gray-500">لا يمكن تعديل الرصيد الافتتاحي بعد إنشاء الحساب</p>
              )}
            </div>

            {bankAccount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  الرصيد الحالي
                </label>
                <input
                  type="number"
                  value={formData.current_balance}
                  onChange={(e) => setFormData({ ...formData, current_balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                  placeholder="0.00"
                  step="0.01"
                  disabled={true}
                />
                <p className="mt-1 text-xs text-gray-500">يتم تحديث الرصيد الحالي تلقائياً من خلال المعاملات</p>
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
                حساب نشط
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
              <span>{bankAccount ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountForm;