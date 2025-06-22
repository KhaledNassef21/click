import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseAccount, DatabaseAccountType, DatabaseAccountGroup, accountService } from '../../lib/supabaseClient';
import { X, Save, FileBarChart, Building, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountFormProps {
  account?: DatabaseAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: any) => void;
  loading?: boolean;
  accountTypes: DatabaseAccountType[];
  accountGroups: DatabaseAccountGroup[];
}

const AccountForm: React.FC<AccountFormProps> = ({ 
  account, 
  isOpen, 
  onClose, 
  onSave, 
  loading = false,
  accountTypes,
  accountGroups
}) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    arabic_name: '',
    account_type_id: '',
    account_group_id: '',
    parent_id: '',
    level: 1,
    is_header: false,
    is_active: true,
    balance_type: 'debit',
    opening_balance: 0,
    description: '',
    tax_account: false,
    bank_account: false,
    cash_account: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [filteredGroups, setFilteredGroups] = useState<DatabaseAccountGroup[]>([]);
  const [filteredParents, setFilteredParents] = useState<DatabaseAccount[]>([]);

  useEffect(() => {
    if (account) {
      console.log('🔄 تحميل بيانات الحساب للتعديل:', account.name);
      setFormData({
        code: account.code || '',
        name: account.name || '',
        arabic_name: account.arabic_name || '',
        account_type_id: account.account_type_id || '',
        account_group_id: account.account_group_id || '',
        parent_id: account.parent_id || '',
        level: account.level || 1,
        is_header: account.is_header || false,
        is_active: account.is_active,
        balance_type: account.balance_type || 'debit',
        opening_balance: account.opening_balance || 0,
        description: account.description || '',
        tax_account: account.tax_account || false,
        bank_account: account.bank_account || false,
        cash_account: account.cash_account || false
      });
      
      // Filter account groups based on account type
      if (account.account_type_id) {
        filterAccountGroups(account.account_type_id);
      }
      
      // Filter parent accounts based on account type
      if (account.account_type_id) {
        filterParentAccounts(account.account_type_id);
      }
    } else {
      console.log('🆕 إعداد فورم حساب جديد');
      // Reset form for new account
      setFormData({
        code: '',
        name: '',
        arabic_name: '',
        account_type_id: '',
        account_group_id: '',
        parent_id: '',
        level: 1,
        is_header: false,
        is_active: true,
        balance_type: 'debit',
        opening_balance: 0,
        description: '',
        tax_account: false,
        bank_account: false,
        cash_account: false
      });
      
      setFilteredGroups([]);
      setFilteredParents([]);
    }
    setErrors({});
  }, [account, isOpen, accountTypes, accountGroups]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'رمز الحساب مطلوب';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الحساب مطلوب';
    }
    
    if (!formData.account_type_id) {
      newErrors.account_type_id = 'نوع الحساب مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filterAccountGroups = (accountTypeId: string) => {
    const filtered = accountGroups.filter(group => group.account_type_id === accountTypeId);
    setFilteredGroups(filtered);
    
    // Reset account group if it doesn't match the selected account type
    if (formData.account_group_id) {
      const groupExists = filtered.some(group => group.id === formData.account_group_id);
      if (!groupExists) {
        setFormData(prev => ({ ...prev, account_group_id: '' }));
      }
    }
  };

  const filterParentAccounts = (accountTypeId: string) => {
    // Filter accounts based on account type and exclude the current account
    const filtered = state.accounts.filter(acc => 
      acc.account_type_id === accountTypeId && 
      (!account || acc.id !== account.id)
    );
    setFilteredParents(filtered);
    
    // Reset parent account if it doesn't match the selected account type
    if (formData.parent_id) {
      const parentExists = filtered.some(acc => acc.id === formData.parent_id);
      if (!parentExists) {
        setFormData(prev => ({ ...prev, parent_id: '' }));
      }
    }
  };

  const handleAccountTypeChange = (accountTypeId: string) => {
    // Get the balance type from the selected account type
    const selectedType = accountTypes.find(type => type.id === accountTypeId);
    const balanceType = selectedType ? selectedType.balance_type : 'debit';
    
    setFormData(prev => ({ 
      ...prev, 
      account_type_id: accountTypeId,
      balance_type: balanceType
    }));
    
    // Filter account groups and parent accounts based on the selected account type
    filterAccountGroups(accountTypeId);
    filterParentAccounts(accountTypeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ الحساب...');
      
      // Prepare account data for database
      const accountData = {
        ...formData,
        company_id: '00000000-0000-0000-0000-000000000001',
        // Convert empty strings to null for UUID fields
        account_group_id: formData.account_group_id || null,
        parent_id: formData.parent_id || null
      };

      console.log('📋 بيانات الحساب المرسلة:', {
        code: accountData.code,
        name: accountData.name,
        account_type_id: accountData.account_type_id,
        is_header: accountData.is_header,
        is_new: !account
      });

      // Call the onSave function passed from parent component
      await onSave(accountData);
      
      console.log('✅ تم حفظ الحساب بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الحساب:', error);
      toast.error(`حدث خطأ في حفظ الحساب: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {account ? 'تعديل الحساب' : 'إضافة حساب جديد'}
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
                رمز الحساب *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="1000"
                required
                disabled={loading}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الحساب *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="اسم الحساب"
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
                نوع الحساب *
              </label>
              <select
                value={formData.account_type_id}
                onChange={(e) => handleAccountTypeChange(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.account_type_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
                disabled={loading}
              >
                <option value="">اختر نوع الحساب</option>
                {accountTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.arabic_name || type.name}
                  </option>
                ))}
              </select>
              {errors.account_type_id && <p className="mt-1 text-sm text-red-500">{errors.account_type_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مجموعة الحساب
              </label>
              <select
                value={formData.account_group_id}
                onChange={(e) => setFormData({ ...formData, account_group_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || filteredGroups.length === 0}
              >
                <option value="">اختر مجموعة الحساب</option>
                {filteredGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.code} - {group.arabic_name || group.name}
                  </option>
                ))}
              </select>
              {filteredGroups.length === 0 && formData.account_type_id && (
                <p className="mt-1 text-xs text-gray-500">اختر نوع الحساب أولاً</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحساب الأب
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || filteredParents.length === 0}
              >
                <option value="">لا يوجد (حساب رئيسي)</option>
                {filteredParents.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
              {filteredParents.length === 0 && formData.account_type_id && (
                <p className="mt-1 text-xs text-gray-500">لا توجد حسابات أب متاحة</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline ml-1" />
                الرصيد الافتتاحي (ر.س)
              </label>
              <input
                type="number"
                value={formData.opening_balance}
                onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                disabled={formData.is_header || loading || !!account}
              />
              {formData.is_header && (
                <p className="mt-1 text-xs text-gray-500">الحسابات الرئيسية لا تقبل أرصدة مباشرة</p>
              )}
              {account && (
                <p className="mt-1 text-xs text-gray-500">لا يمكن تعديل الرصيد الافتتاحي بعد إنشاء الحساب</p>
              )}
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
                placeholder="وصف الحساب"
                disabled={loading}
              />
            </div>
          </div>

          {/* Account Properties */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">خصائص الحساب</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_header"
                  checked={formData.is_header}
                  onChange={(e) => setFormData({ ...formData, is_header: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="is_header" className="mr-2 text-sm font-medium text-gray-700">
                  حساب رئيسي (لا يقبل قيود مباشرة)
                </label>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tax_account"
                  checked={formData.tax_account}
                  onChange={(e) => setFormData({ ...formData, tax_account: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="tax_account" className="mr-2 text-sm font-medium text-gray-700">
                  حساب ضريبي
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bank_account"
                  checked={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="bank_account" className="mr-2 text-sm font-medium text-gray-700">
                  حساب بنكي
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cash_account"
                  checked={formData.cash_account}
                  onChange={(e) => setFormData({ ...formData, cash_account: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="cash_account" className="mr-2 text-sm font-medium text-gray-700">
                  حساب نقدي
                </label>
              </div>
            </div>
          </div>

          {/* Account Type Preview */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة نوع الحساب</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {accountTypes.map(type => {
                let TypeIcon;
                let color;
                
                switch (type.code) {
                  case '1':
                    TypeIcon = Building;
                    color = 'text-blue-600 bg-blue-100';
                    break;
                  case '2':
                    TypeIcon = TrendingDown;
                    color = 'text-red-600 bg-red-100';
                    break;
                  case '3':
                    TypeIcon = DollarSign;
                    color = 'text-purple-600 bg-purple-100';
                    break;
                  case '4':
                    TypeIcon = TrendingUp;
                    color = 'text-green-600 bg-green-100';
                    break;
                  case '5':
                    TypeIcon = TrendingDown;
                    color = 'text-orange-600 bg-orange-100';
                    break;
                  default:
                    TypeIcon = FileBarChart;
                    color = 'text-gray-600 bg-gray-100';
                }
                
                const isSelected = formData.account_type_id === type.id;
                
                return (
                  <div
                    key={type.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAccountTypeChange(type.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-3 rounded-lg ${color.split(' ')[1]}`}>
                        <TypeIcon className={`w-6 h-6 ${color.split(' ')[0]}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 mt-2">{type.arabic_name || type.name}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {type.balance_type === 'debit' ? 'رصيد مدين' : 'رصيد دائن'}
                      </span>
                    </div>
                  </div>
                );
              })}
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
              <span>{account ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;