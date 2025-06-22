import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseAccountGroup, DatabaseAccountType } from '../../lib/supabaseClient';
import { X, Save, FolderTree, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountGroupFormProps {
  group?: DatabaseAccountGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: any) => void;
  loading?: boolean;
  accountTypes: DatabaseAccountType[];
  accountGroups: DatabaseAccountGroup[];
}

const AccountGroupForm: React.FC<AccountGroupFormProps> = ({ 
  group, 
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
    parent_id: '',
    level: 1,
    is_active: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [filteredGroups, setFilteredGroups] = useState<DatabaseAccountGroup[]>([]);

  useEffect(() => {
    if (group) {
      console.log('🔄 تحميل بيانات المجموعة للتعديل:', group.name);
      setFormData({
        code: group.code || '',
        name: group.name || '',
        arabic_name: group.arabic_name || '',
        account_type_id: group.account_type_id || '',
        parent_id: group.parent_id || '',
        level: group.level || 1,
        is_active: group.is_active
      });
      
      // Filter parent groups based on account type
      if (group.account_type_id) {
        filterParentGroups(group.account_type_id);
      }
    } else {
      console.log('🆕 إعداد فورم مجموعة جديدة');
      // Reset form for new group
      setFormData({
        code: '',
        name: '',
        arabic_name: '',
        account_type_id: '',
        parent_id: '',
        level: 1,
        is_active: true
      });
      
      setFilteredGroups([]);
    }
    setErrors({});
  }, [group, isOpen, accountTypes, accountGroups]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'رمز المجموعة مطلوب';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المجموعة مطلوب';
    }
    
    if (!formData.account_type_id) {
      newErrors.account_type_id = 'نوع الحساب مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filterParentGroups = (accountTypeId: string) => {
    // Filter groups based on account type and exclude the current group
    const filtered = accountGroups.filter(g => 
      g.account_type_id === accountTypeId && 
      (!group || g.id !== group.id)
    );
    setFilteredGroups(filtered);
    
    // Reset parent group if it doesn't match the selected account type
    if (formData.parent_id) {
      const parentExists = filtered.some(g => g.id === formData.parent_id);
      if (!parentExists) {
        setFormData(prev => ({ ...prev, parent_id: '' }));
      }
    }
  };

  const handleAccountTypeChange = (accountTypeId: string) => {
    setFormData(prev => ({ ...prev, account_type_id: accountTypeId }));
    
    // Filter parent groups based on the selected account type
    filterParentGroups(accountTypeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ المجموعة...');
      
      // Prepare group data for database
      const groupData = {
        ...formData,
        company_id: '00000000-0000-0000-0000-000000000001',
        // Convert empty strings to null for UUID fields
        parent_id: formData.parent_id || null
      };

      console.log('📋 بيانات المجموعة المرسلة:', {
        code: groupData.code,
        name: groupData.name,
        account_type_id: groupData.account_type_id,
        is_new: !group
      });

      // Call the onSave function passed from parent component
      await onSave(groupData);
      
      console.log('✅ تم حفظ المجموعة بنجاح');
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المجموعة:', error);
      toast.error(`حدث خطأ في حفظ المجموعة: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {group ? 'تعديل مجموعة الحسابات' : 'إضافة مجموعة حسابات جديدة'}
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
                <FolderTree className="w-4 h-4 inline ml-1" />
                رمز المجموعة *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="11"
                required
                disabled={loading}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المجموعة *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="اسم المجموعة"
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
                المجموعة الأب
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || filteredGroups.length === 0}
              >
                <option value="">لا يوجد (مجموعة رئيسية)</option>
                {filteredGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.code} - {g.name}
                  </option>
                ))}
              </select>
              {filteredGroups.length === 0 && formData.account_type_id && (
                <p className="mt-1 text-xs text-gray-500">لا توجد مجموعات أب متاحة</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى
              </label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
                min="1"
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
                مجموعة نشطة
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
              <span>{group ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountGroupForm;