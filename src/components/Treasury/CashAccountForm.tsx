import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseCashAccount } from '../../lib/supabaseClient';
import { X, Save, PiggyBank, DollarSign, MapPin, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CashAccountFormProps {
  cashAccount?: DatabaseCashAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cashAccount: any) => void;
  loading?: boolean;
}

const CashAccountForm: React.FC<CashAccountFormProps> = ({ cashAccount, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    account_name: '',
    location: '',
    currency: 'SAR',
    opening_balance: 0,
    current_balance: 0,
    responsible_person: '',
    is_active: true,
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (cashAccount) {
      console.log('🔄 تحميل بيانات حساب النقدية للتعديل:', cashAccount.account_name);
      setFormData({
        account_name: cashAccount.account_name || '',
        location: cashAccount.location || '',
        currency: cashAccount.currency || 'SAR',
        opening_balance: cashAccount.opening_balance || 0,
        current_balance: cashAccount.current_balance || 0,
        responsible_person: cashAccount.responsible_person || '',
        is_active: cashAccount.is_active,
        notes: cashAccount.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم حساب نقدية جديد');
      // Reset form for new cash account
      setFormData({
        account_name: '',
        location: '',
        currency: 'SAR',
        opening_balance: 0,
        current_balance: 0,
        responsible_person: '',
        is_active: true,
        notes: ''
      });
    }
    setErrors({});
  }, [cashAccount, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.account_name.trim()) {
      newErrors.account_name = 'اسم الحساب مطلوب';
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
      console.log('💾 بدء حفظ حساب النقدية...');
      
      // If it's a new account, set current_balance to opening_balance
      if (!cashAccount) {
        formData.current_balance = formData.opening_balance;
      }
      
      // Call the onSave function passed from parent component
      await onSave(formData);
      
      console.log('✅ تم حفظ حساب النقدية بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ حساب النقدية:', error);
      toast.error(`حدث خطأ في حفظ حساب النقدية: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {cashAccount ? 'تعديل حساب النقدية' : 'إضافة حساب نقدية جديد'}
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
                <PiggyBank className="w-4 h-4 inline ml-1" />
                اسم الحساب *
              </label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.account_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="الخزينة الرئيسية"
                required
                disabled={loading}
              />
              {errors.account_name && <p className="mt-1 text-sm text-red-500">{errors.account_name}</p>}
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
                placeholder="المكتب الرئيسي"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline ml-1" />
                المسؤول
              </label>
              <input
                type="text"
                value={formData.responsible_person}
                onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اسم الشخص المسؤول"
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
                disabled={cashAccount || loading}
              />
              {cashAccount && (
                <p className="mt-1 text-xs text-gray-500">لا يمكن تعديل الرصيد الافتتاحي بعد إنشاء الحساب</p>
              )}
            </div>

            {cashAccount && (
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
              <span>{cashAccount ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashAccountForm;