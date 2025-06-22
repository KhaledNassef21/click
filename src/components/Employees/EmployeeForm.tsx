import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseEmployee } from '../../lib/supabaseClient';
import { X, Save, UserCheck, Mail, Phone, MapPin, DollarSign, Calendar, Building, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeFormProps {
  employee?: DatabaseEmployee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: any) => void;
  loading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    arabic_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    postal_code: '',
    national_id: '',
    passport_number: '',
    hire_date: new Date().toISOString().split('T')[0],
    position: '',
    department: '',
    salary: 0,
    salary_type: 'monthly',
    bank_account: '',
    iban: '',
    emergency_contact: '',
    emergency_phone: '',
    is_active: true,
    employee_code: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (employee) {
      console.log('🔄 تحميل بيانات الموظف للتعديل:', employee.name);
      setFormData({
        name: employee.name || '',
        arabic_name: employee.arabic_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        mobile: employee.mobile || '',
        address: employee.address || '',
        city: employee.city || '',
        country: employee.country || 'Saudi Arabia',
        postal_code: employee.postal_code || '',
        national_id: employee.national_id || '',
        passport_number: employee.passport_number || '',
        hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
        position: employee.position || '',
        department: employee.department || '',
        salary: employee.salary || 0,
        salary_type: employee.salary_type || 'monthly',
        bank_account: employee.bank_account || '',
        iban: employee.iban || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        is_active: employee.is_active,
        employee_code: employee.employee_code || '',
        notes: employee.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم موظف جديد');
      // Reset form for new employee
      setFormData({
        name: '',
        arabic_name: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        country: 'Saudi Arabia',
        postal_code: '',
        national_id: '',
        passport_number: '',
        hire_date: new Date().toISOString().split('T')[0],
        position: '',
        department: '',
        salary: 0,
        salary_type: 'monthly',
        bank_account: '',
        iban: '',
        emergency_contact: '',
        emergency_phone: '',
        is_active: true,
        employee_code: '',
        notes: ''
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم الموظف مطلوب';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'المنصب مطلوب';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    if (!formData.hire_date) {
      newErrors.hire_date = 'تاريخ التوظيف مطلوب';
    }
    
    if (formData.salary < 0) {
      newErrors.salary = 'الراتب لا يمكن أن يكون سالباً';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateEmployeeCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EMP-${timestamp}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ الموظف...');
      
      // Prepare employee data for database
      const employeeData = {
        ...formData,
        // Generate employee code if not provided and it's a new employee
        employee_code: formData.employee_code || (!employee ? generateEmployeeCode() : undefined),
        // Ensure required fields have default values
        salary_type: formData.salary_type || 'monthly',
        salary: formData.salary || 0,
        country: formData.country || 'Saudi Arabia'
      };

      console.log('📋 بيانات الموظف المرسلة:', {
        name: employeeData.name,
        email: employeeData.email,
        position: employeeData.position,
        employee_code: employeeData.employee_code,
        is_new: !employee
      });

      // Call the onSave function passed from parent component
      await onSave(employeeData);
      
      console.log('✅ تم حفظ الموظف بنجاح');
      
      // Reset form if it's a new employee
      if (!employee) {
        setFormData({
          name: '',
          arabic_name: '',
          email: '',
          phone: '',
          mobile: '',
          address: '',
          city: '',
          country: 'Saudi Arabia',
          postal_code: '',
          national_id: '',
          passport_number: '',
          hire_date: new Date().toISOString().split('T')[0],
          position: '',
          department: '',
          salary: 0,
          salary_type: 'monthly',
          bank_account: '',
          iban: '',
          emergency_contact: '',
          emergency_phone: '',
          is_active: true,
          employee_code: '',
          notes: ''
        });
      }
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الموظف:', error);
      toast.error(`حدث خطأ في حفظ الموظف: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {employee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCheck className="w-4 h-4 inline ml-1" />
                  اسم الموظف *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="أدخل اسم الموظف"
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
                  رمز الموظف
                </label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="سيتم إنشاؤه تلقائياً إذا ترك فارغاً"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {!formData.employee_code && !employee && "سيتم إنشاء رمز تلقائياً"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="example@email.com"
                  disabled={loading}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-11-XXX-XXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-5X-XXX-XXXX"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية الوطنية
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم جواز السفر
                </label>
                <input
                  type="text"
                  value={formData.passport_number}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A1234567"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="الرياض"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البلد
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="Saudi Arabia">المملكة العربية السعودية</option>
                  <option value="UAE">الإمارات العربية المتحدة</option>
                  <option value="Kuwait">الكويت</option>
                  <option value="Qatar">قطر</option>
                  <option value="Bahrain">البحرين</option>
                  <option value="Oman">عمان</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  العنوان
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="أدخل العنوان الكامل"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الوظيفة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline ml-1" />
                  المنصب *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="مهندس، محاسب، إداري..."
                  required
                  disabled={loading}
                />
                {errors.position && <p className="mt-1 text-sm text-red-500">{errors.position}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القسم
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">اختر القسم</option>
                  <option value="الهندسة">الهندسة</option>
                  <option value="المالية">المالية</option>
                  <option value="العمليات">العمليات</option>
                  <option value="الموارد البشرية">الموارد البشرية</option>
                  <option value="المبيعات">المبيعات</option>
                  <option value="التسويق">التسويق</option>
                  <option value="تقنية المعلومات">تقنية المعلومات</option>
                  <option value="الإدارة">الإدارة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاريخ التوظيف *
                </label>
                <input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.hire_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  disabled={loading}
                />
                {errors.hire_date && <p className="mt-1 text-sm text-red-500">{errors.hire_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  الراتب الشهري (ر.س)
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.salary ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.salary && <p className="mt-1 text-sm text-red-500">{errors.salary}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الراتب
                </label>
                <select
                  value={formData.salary_type}
                  onChange={(e) => setFormData({ ...formData, salary_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="monthly">شهري</option>
                  <option value="annual">سنوي</option>
                  <option value="daily">يومي</option>
                  <option value="hourly">بالساعة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الحساب البنكي
                </label>
                <input
                  type="text"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="رقم الحساب البنكي"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الطوارئ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جهة اتصال الطوارئ
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="اسم شخص للاتصال في حالات الطوارئ"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هاتف الطوارئ
                </label>
                <input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+966-5X-XXX-XXXX"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Notes and Status */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملاحظات إضافية عن الموظف"
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
                  موظف نشط
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
              <span>{employee ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;