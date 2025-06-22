import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseAccountType } from '../../lib/supabaseClient';
import { X, Save, FileBarChart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountTypeFormProps {
  type?: DatabaseAccountType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: any) => void;
  loading?: boolean;
}

const AccountTypeForm: React.FC<AccountTypeFormProps> = ({ 
  type, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false 
}) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    arabic_name: '',
    balance_type: 'debit',
    is_active: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (type) {
      console.log('🔄 تحميل بيانات نوع الحساب للتعديل:', type.name);
      setFormData({
        code: type.code || '',
        name: type.name || '',
        arabic_name: type.arabic_name || '',
        balance_type: type.balance_type || 'debit',
        is_active: type.is_active
      });
    } else {
      console.log('🆕 إعداد فورم نوع حساب جديد');
      // Reset form for new account type
      setFormData({
        code: '',
        name: '',
        arabic_name: '',
        balance_type: 'debit',
        is_active: true
      });
    }
    setErrors({});
  }, [type, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'رمز نوع الحساب مطلوب';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم نوع الحساب مطلوب';
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
      console.log('💾 بدء حفظ نوع الحساب...');
      
      // Prepare account type data for database
      const typeData = {
        ...formData,
        company_id: '00000000-0000-0000-0000-000000000001'
      };

      console.log('📋 بيانات نوع الحساب المرسلة:', {
        code: typeData.code,
        name: typeData.name,
        balance_type: typeData.balance_type,
        is_new: !type
      });

      // Call the onSave function passed from parent component
      await onSave(typeData);
      
      console.log('✅ تم حفظ نوع الحساب بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ نوع الحساب:', error);
      toast.error(`حدث خطأ في حفظ نوع الحساب: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {type ? 'تعديل نوع الحساب' : 'إضافة نوع حساب جديد'}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileBarChart className="w-4 h-4 inline ml-1" />
                رمز نوع الحساب *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="1"
                required
                disabled={loading}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم نوع الحساب *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Assets"
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
                placeholder="الأصول"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الرصيد
              </label>
              <div className="flex space-x-4 space-x-reverse">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="debit"
                    name="balance_type"
                    value="debit"
                    checked={formData.balance_type === 'debit'}
                    onChange={() => setFormData({ ...formData, balance_type: 'debit' })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="debit" className="mr-2 text-sm font-medium text-gray-700">
                    مدين
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="credit"
                    name="balance_type"
                    value="credit"
                    checked={formData.balance_type === 'credit'}
                    onChange={() => setFormData({ ...formData, balance_type: 'credit' })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="credit" className="mr-2 text-sm font-medium text-gray-700">
                    دائن
                  </label>
                </div>
              </div>
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
                نوع نشط
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
              <span>{type ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountTypeForm;