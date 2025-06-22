import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DatabaseProject } from '../../lib/supabaseClient';
import { X, Save, Briefcase, Calendar, DollarSign, User, MapPin, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectFormProps {
  project?: DatabaseProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: any) => void;
  loading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, isOpen, onClose, onSave, loading = false }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    arabic_name: '',
    description: '',
    customer_id: '',
    project_manager_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    estimated_end_date: '',
    budget: 0,
    contract_value: 0,
    status: 'planning',
    progress_percentage: 0,
    location: '',
    expenses: 0,
    revenue: 0,
    is_active: true,
    project_code: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (project) {
      console.log('🔄 تحميل بيانات المشروع للتعديل:', project.name);
      setFormData({
        name: project.name || '',
        arabic_name: project.arabic_name || '',
        description: project.description || '',
        customer_id: project.customer_id || '',
        project_manager_id: project.project_manager_id || '',
        start_date: project.start_date || new Date().toISOString().split('T')[0],
        end_date: project.end_date || '',
        estimated_end_date: project.estimated_end_date || '',
        budget: project.budget || 0,
        contract_value: project.contract_value || 0,
        status: project.status || 'planning',
        progress_percentage: project.progress_percentage || 0,
        location: project.location || '',
        expenses: project.expenses || 0,
        revenue: project.revenue || 0,
        is_active: project.is_active,
        project_code: project.project_code || '',
        notes: project.notes || ''
      });
    } else {
      console.log('🆕 إعداد فورم مشروع جديد');
      // Reset form for new project
      setFormData({
        name: '',
        arabic_name: '',
        description: '',
        customer_id: '',
        project_manager_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        estimated_end_date: '',
        budget: 0,
        contract_value: 0,
        status: 'planning',
        progress_percentage: 0,
        location: '',
        expenses: 0,
        revenue: 0,
        is_active: true,
        project_code: '',
        notes: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'اسم المشروع مطلوب';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'تاريخ البداية مطلوب';
    }
    
    if (formData.budget < 0) {
      newErrors.budget = 'الميزانية لا يمكن أن تكون سالبة';
    }
    
    if (formData.contract_value < 0) {
      newErrors.contract_value = 'قيمة العقد لا يمكن أن تكون سالبة';
    }
    
    if (formData.progress_percentage < 0 || formData.progress_percentage > 100) {
      newErrors.progress_percentage = 'نسبة التقدم يجب أن تكون بين 0 و 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateProjectCode = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRJ-${timestamp}-${randomNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      console.log('💾 بدء حفظ المشروع...');
      
      // Prepare project data for database
      const projectData = {
        ...formData,
        // Convert empty strings to null for UUID fields
        customer_id: formData.customer_id || null,
        project_manager_id: formData.project_manager_id || null,
        // Convert empty strings to null for optional date fields
        end_date: formData.end_date || null,
        estimated_end_date: formData.estimated_end_date || null,
        // Generate project code if not provided and it's a new project
        project_code: formData.project_code || (!project ? generateProjectCode() : undefined)
      };

      console.log('📋 بيانات المشروع المرسلة:', {
        name: projectData.name,
        customer_id: projectData.customer_id,
        project_manager_id: projectData.project_manager_id,
        status: projectData.status,
        project_code: projectData.project_code,
        is_new: !project
      });

      // Call the onSave function passed from parent component
      await onSave(projectData);
      
      console.log('✅ تم حفظ المشروع بنجاح');
      
      // Reset form if it's a new project
      if (!project) {
        setFormData({
          name: '',
          arabic_name: '',
          description: '',
          customer_id: '',
          project_manager_id: '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          estimated_end_date: '',
          budget: 0,
          contract_value: 0,
          status: 'planning',
          progress_percentage: 0,
          location: '',
          expenses: 0,
          revenue: 0,
          is_active: true,
          project_code: '',
          notes: ''
        });
      }
      
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المشروع:', error);
      toast.error(`حدث خطأ في حفظ المشروع: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {project ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline ml-1" />
                  اسم المشروع *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="أدخل اسم المشروع"
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
                  رمز المشروع
                </label>
                <input
                  type="text"
                  value={formData.project_code}
                  onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="سيتم إنشاؤه تلقائياً إذا ترك فارغاً"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {!formData.project_code && !project && "سيتم إنشاء رمز تلقائياً"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline ml-1" />
                  العميل
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">اختر العميل</option>
                  {state.customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline ml-1" />
                  مدير المشروع
                </label>
                <select
                  value={formData.project_manager_id}
                  onChange={(e) => setFormData({ ...formData, project_manager_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">اختر مدير المشروع</option>
                  {state.employees.filter(e => e.is_active).map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline ml-1" />
                  وصف المشروع
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="وصف تفصيلي للمشروع"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Dates and Financial Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">التواريخ والمعلومات المالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاريخ البداية *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`w-full px-4 py-2 border ${errors.start_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                  disabled={loading}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاريخ الانتهاء المتوقع
                </label>
                <input
                  type="date"
                  value={formData.estimated_end_date}
                  onChange={(e) => setFormData({ ...formData, estimated_end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline ml-1" />
                  تاريخ الانتهاء الفعلي
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  الميزانية (ر.س)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.budget ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.budget && <p className="mt-1 text-sm text-red-500">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  قيمة العقد (ر.س)
                </label>
                <input
                  type="number"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.contract_value ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
                {errors.contract_value && <p className="mt-1 text-sm text-red-500">{errors.contract_value}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline ml-1" />
                  المصروفات (ر.س)
                </label>
                <input
                  type="number"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: parseFloat(e.target.value) || 0 })}
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
                  الإيرادات (ر.س)
                </label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Status and Location */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الحالة والموقع</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة المشروع
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="planning">تخطيط</option>
                  <option value="active">نشط</option>
                  <option value="on_hold">متوقف</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نسبة الإنجاز (%)
                </label>
                <input
                  type="number"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border ${errors.progress_percentage ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="0"
                  step="0.1"
                  min="0"
                  max="100"
                  disabled={loading}
                />
                {errors.progress_percentage && <p className="mt-1 text-sm text-red-500">{errors.progress_percentage}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  موقع المشروع
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="المدينة، الحي، الشارع"
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
                  مشروع نشط
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
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
                  placeholder="ملاحظات إضافية عن المشروع"
                  disabled={loading}
                />
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
              <span>{project ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;