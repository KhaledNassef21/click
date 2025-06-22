import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  DatabaseExpense, 
  DatabaseExpenseCategory, 
  expenseService 
} from '../../lib/supabaseClient';
import { 
  X, Save, Receipt, DollarSign, Calendar, FileText, Printer, 
  Download, Loader2, AlertCircle, RefreshCw, Database, ArrowLeft, 
  Upload, Tag, Truck, Briefcase, CreditCard, Calculator, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ExpenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  
  const [expense, setExpense] = useState<DatabaseExpense | null>(null);
  const [categories, setCategories] = useState<DatabaseExpenseCategory[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    expense_number: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category_id: '',
    account_id: '',
    supplier_id: '',
    project_id: '',
    payment_method: 'cash',
    reference_number: '',
    status: 'pending',
    currency: 'SAR',
    tax_amount: 0,
    tax_included: false,
    notes: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Generate expense number
  const generateExpenseNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EXP-${year}${month}${day}-${random}`;
  };
  
  // Load expense if editing
  useEffect(() => {
    // Load expense categories
    loadExpenseCategories();
    
    if (id) {
      loadExpense(id);
    } else {
      // Set default values for new expense
      setFormData({
        ...formData,
        expense_number: generateExpenseNumber()
      });
    }
  }, [id]);
  
  // Load expense categories
  const loadExpenseCategories = async () => {
    try {
      const data = await expenseService.getExpenseCategories('00000000-0000-0000-0000-000000000001');
      setCategories(data);
    } catch (error) {
      console.error('Error loading expense categories:', error);
      toast.error('حدث خطأ في تحميل فئات المصروفات');
    }
  };
  
  // Load expense data
  const loadExpense = async (expenseId: string) => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🔍 جلب المصروف:', expenseId);
      
      // Test connection first
      const isConnected = await expenseService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
      
      // Get expense
      const expense = await expenseService.getExpenseById(expenseId);
      if (!expense) {
        throw new Error('لم يتم العثور على المصروف');
      }
      
      setExpense(expense);
      
      // Set form data
      setFormData({
        expense_number: expense.expense_number,
        expense_date: expense.expense_date,
        description: expense.description,
        amount: expense.amount,
        category_id: expense.category_id || '',
        account_id: expense.account_id || '',
        supplier_id: expense.supplier_id || '',
        project_id: expense.project_id || '',
        payment_method: expense.payment_method,
        reference_number: expense.reference_number || '',
        status: expense.status,
        currency: expense.currency,
        tax_amount: expense.tax_amount || 0,
        tax_included: expense.tax_included || false,
        notes: expense.notes || ''
      });
      
      // Load attachments
      loadAttachments(expenseId);
      
      console.log('✅ تم جلب المصروف بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في جلب المصروف:', error);
      setConnectionError(error.message || 'حدث خطأ في جلب المصروف');
      toast.error('حدث خطأ في جلب المصروف');
    } finally {
      setLoading(false);
    }
  };
  
  // Load attachments
  const loadAttachments = async (expenseId: string) => {
    try {
      const attachments = await expenseService.getExpenseAttachments(expenseId);
      setAttachments(attachments);
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  };
  
  // Calculate tax
  const calculateTax = (amount: number, taxRate: number = 15, included: boolean = false) => {
    if (included) {
      // Tax is included in the amount
      return amount * (taxRate / (100 + taxRate));
    } else {
      // Tax is not included in the amount
      return amount * (taxRate / 100);
    }
  };
  
  // Handle tax included change
  const handleTaxIncludedChange = (included: boolean) => {
    const taxRate = 15; // Default tax rate
    const newTaxAmount = calculateTax(formData.amount, taxRate, included);
    
    setFormData({
      ...formData,
      tax_included: included,
      tax_amount: parseFloat(newTaxAmount.toFixed(2))
    });
  };
  
  // Handle amount change
  const handleAmountChange = (amount: number) => {
    const taxRate = 15; // Default tax rate
    const newTaxAmount = calculateTax(amount, taxRate, formData.tax_included);
    
    setFormData({
      ...formData,
      amount,
      tax_amount: parseFloat(newTaxAmount.toFixed(2))
    });
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.expense_number.trim()) {
      newErrors.expense_number = 'رقم المصروف مطلوب';
    }
    
    if (!formData.expense_date) {
      newErrors.expense_date = 'تاريخ المصروف مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'وصف المصروف مطلوب';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'فئة المصروف مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save expense
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare expense data
      const expenseData = {
        company_id: '00000000-0000-0000-0000-000000000001',
        expense_number: formData.expense_number,
        expense_date: formData.expense_date,
        description: formData.description,
        amount: formData.amount,
        category_id: formData.category_id || null,
        account_id: formData.account_id || null,
        supplier_id: formData.supplier_id || null,
        project_id: formData.project_id || null,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        status: formData.status,
        currency: formData.currency,
        tax_amount: formData.tax_amount,
        tax_included: formData.tax_included,
        notes: formData.notes,
        is_active: true,
        created_by: state.user?.id
      };
      
      if (id) {
        // Update existing expense
        await expenseService.updateExpense(id, expenseData);
        toast.success('تم تحديث المصروف بنجاح');
      } else {
        // Add new expense
        await expenseService.addExpense(expenseData);
        toast.success('تم إضافة المصروف بنجاح');
      }
      
      // Redirect to expenses list
      navigate('/expenses');
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المصروف:', error);
      toast.error(`حدث خطأ في حفظ المصروف: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Approve expense
  const handleApprove = async () => {
    if (!id) return;
    
    try {
      setApproving(true);
      
      await expenseService.approveExpense(id, state.user?.id);
      
      toast.success('تم اعتماد المصروف بنجاح');
      
      // Reload expense
      loadExpense(id);
    } catch (error: any) {
      console.error('❌ خطأ في اعتماد المصروف:', error);
      toast.error(`حدث خطأ في اعتماد المصروف: ${error.message}`);
    } finally {
      setApproving(false);
    }
  };
  
  // Reject expense
  const handleReject = async () => {
    if (!id) return;
    
    const reason = prompt('أدخل سبب رفض المصروف:');
    if (!reason) return;
    
    try {
      setApproving(true);
      
      await expenseService.rejectExpense(id, state.user?.id, reason);
      
      toast.success('تم رفض المصروف بنجاح');
      
      // Reload expense
      loadExpense(id);
    } catch (error: any) {
      console.error('❌ خطأ في رفض المصروف:', error);
      toast.error(`حدث خطأ في رفض المصروف: ${error.message}`);
    } finally {
      setApproving(false);
    }
  };
  
  // Print expense
  const handlePrint = () => {
    window.print();
  };
  
  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      toast.loading('جاري تصدير المصروف إلى PDF...');
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`مصروف-${formData.expense_number}.pdf`);
      
      toast.dismiss();
      toast.success('تم تصدير المصروف بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير المصروف:', error);
      toast.dismiss();
      toast.error('حدث خطأ في تصدير المصروف');
    }
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process uploaded files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !id) return;
    
    try {
      setUploadingAttachment(true);
      
      const file = e.target.files[0];
      
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `expenses/${id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Add attachment record
      const attachmentData = {
        expense_id: id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: publicUrl,
        description: `Uploaded on ${new Date().toLocaleString()}`,
        is_active: true,
        uploaded_by: state.user?.id
      };
      
      await expenseService.addExpenseAttachment(attachmentData);
      
      toast.success('تم رفع المرفق بنجاح');
      
      // Reload attachments
      loadAttachments(id);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('❌ خطأ في رفع المرفق:', error);
      toast.error(`حدث خطأ في رفع المرفق: ${error.message}`);
    } finally {
      setUploadingAttachment(false);
    }
  };
  
  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    
    try {
      await expenseService.deleteExpenseAttachment(attachmentId);
      
      toast.success('تم حذف المرفق بنجاح');
      
      // Reload attachments
      loadAttachments(id);
    } catch (error: any) {
      console.error('❌ خطأ في حذف المرفق:', error);
      toast.error(`حدث خطأ في حذف المرفق: ${error.message}`);
    }
  };
  
  // Get category name
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    return category ? (category.arabic_name || category.name) : '';
  };
  
  // Get supplier name
  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return '';
    const supplier = state.suppliers.find(s => s.id === supplierId);
    return supplier?.name || '';
  };
  
  // Get project name
  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = state.projects.find(p => p.id === projectId);
    return project?.name || '';
  };
  
  // Get account name
  const getAccountName = (accountId?: string) => {
    if (!accountId) return '';
    const account = state.accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : '';
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل المصروف...</span>
        </div>
      </div>
    );
  }
  
  if (connectionError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في الاتصال</h3>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/expenses')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة إلى قائمة المصروفات</span>
            </button>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Database className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  يرجى تطبيق migration الجديد: 20250623110000_expenses_management.sql
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {id ? 'تعديل المصروف' : 'مصروف جديد'}
          </h1>
          <p className="text-gray-600">إنشاء وتعديل المصروفات مع إمكانية الطباعة والتصدير</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSave}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Receipt className="w-4 h-4 inline ml-1" />
                    رقم المصروف *
                  </label>
                  <input
                    type="text"
                    value={formData.expense_number}
                    onChange={(e) => setFormData({ ...formData, expense_number: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.expense_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="EXP-2024-001"
                    required
                    disabled={!!id || formData.status !== 'pending'}
                  />
                  {errors.expense_number && <p className="mt-1 text-sm text-red-500">{errors.expense_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    تاريخ المصروف *
                  </label>
                  <input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.expense_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                    disabled={formData.status !== 'pending'}
                  />
                  {errors.expense_date && <p className="mt-1 text-sm text-red-500">{errors.expense_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline ml-1" />
                    فئة المصروف *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                    disabled={formData.status !== 'pending'}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.arabic_name || category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline ml-1" />
                    المبلغ (ر.س) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                    disabled={formData.status !== 'pending'}
                  />
                  {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline ml-1" />
                    المورد
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.status !== 'pending'}
                  >
                    <option value="">اختر المورد</option>
                    {state.suppliers.filter(s => s.is_active).map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="w-4 h-4 inline ml-1" />
                    المشروع
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.status !== 'pending'}
                  >
                    <option value="">اختر المشروع</option>
                    {state.projects.filter(p => p.is_active).map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calculator className="w-4 h-4 inline ml-1" />
                    الحساب
                  </label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formData.status !== 'pending'}
                  >
                    <option value="">اختر الحساب</option>
                    {state.accounts
                      .filter(a => !a.is_header && a.is_active)
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline ml-1" />
                    طريقة الدفع *
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={formData.status !== 'pending'}
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="check">شيك</option>
                    <option value="credit_card">بطاقة ائتمان</option>
                    <option value="other">أخرى</option>
                  </select>
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
                    placeholder="رقم الفاتورة أو المرجع"
                    disabled={formData.status !== 'pending'}
                  />
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
                    placeholder="وصف المصروف"
                    required
                    disabled={formData.status !== 'pending'}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>
              </div>

              {/* Tax Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">معلومات الضريبة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tax_included"
                      checked={formData.tax_included}
                      onChange={(e) => handleTaxIncludedChange(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={formData.status !== 'pending'}
                    />
                    <label htmlFor="tax_included" className="mr-2 text-sm font-medium text-gray-700">
                      المبلغ شامل الضريبة
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calculator className="w-4 h-4 inline ml-1" />
                      مبلغ الضريبة
                    </label>
                    <input
                      type="number"
                      value={formData.tax_amount}
                      onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={formData.status !== 'pending'}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="ملاحظات إضافية"
                  disabled={formData.status !== 'pending'}
                />
              </div>

              {/* Attachments */}
              {id && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      المرفقات
                    </label>
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={uploadingAttachment || formData.status !== 'pending'}
                    >
                      {uploadingAttachment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>إضافة مرفق</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  
                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-gray-900">{attachment.file_name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(attachment.uploaded_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <a
                              href={attachment.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(attachment.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              disabled={formData.status !== 'pending'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">لا توجد مرفقات</p>
                      <p className="text-sm text-gray-400 mt-1">اضغط على "إضافة مرفق" لرفع ملفات</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => navigate('/expenses')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  {formData.status === 'pending' && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>حفظ</span>
                    </button>
                  )}
                </div>
                
                {id && formData.status === 'pending' && (
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={approving}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span>رفض</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>اعتماد</span>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Expense Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة المصروف</h3>
            
            <div ref={printRef} className="p-4 border border-gray-200 rounded-lg">
              {/* Company Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{state.settings.company.name}</h2>
                <p className="text-sm text-gray-600">{state.settings.company.address}</p>
                <p className="text-sm text-gray-600">
                  هاتف: {state.settings.company.phone} | بريد إلكتروني: {state.settings.company.email}
                </p>
              </div>
              
              {/* Expense Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-red-600 border-2 border-red-200 inline-block px-6 py-2 rounded">
                  سند صرف
                </h1>
                <p className="text-sm text-gray-600 mt-2">رقم المصروف: {formData.expense_number}</p>
                <p className="text-sm text-gray-600">
                  التاريخ: {formData.expense_date ? new Date(formData.expense_date).toLocaleDateString('ar-SA') : ''}
                </p>
              </div>
              
              {/* Status */}
              <div className="mb-4 text-center">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  formData.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  formData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {formData.status === 'pending' ? 'في الانتظار' : 
                   formData.status === 'approved' ? 'معتمد' : 
                   formData.status === 'rejected' ? 'مرفوض' : 
                   'مدفوع'}
                </span>
              </div>
              
              {/* Expense Details */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">تفاصيل المصروف:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm text-gray-700">
                    <strong>المبلغ:</strong> {formData.amount.toLocaleString()} {formData.currency}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>الفئة:</strong> {getCategoryName(formData.category_id)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>طريقة الدفع:</strong> {
                      formData.payment_method === 'cash' ? 'نقدي' :
                      formData.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                      formData.payment_method === 'check' ? 'شيك' :
                      formData.payment_method === 'credit_card' ? 'بطاقة ائتمان' : 'أخرى'
                    }
                  </p>
                  {formData.tax_amount > 0 && (
                    <p className="text-sm text-gray-700">
                      <strong>الضريبة:</strong> {formData.tax_amount.toLocaleString()} {formData.currency}
                      {formData.tax_included ? ' (مشمولة)' : ' (إضافية)'}
                    </p>
                  )}
                  {formData.reference_number && (
                    <p className="text-sm text-gray-700">
                      <strong>المرجع:</strong> {formData.reference_number}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Related Entities */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">الجهات المرتبطة:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {formData.supplier_id && (
                    <p className="text-sm text-gray-700">
                      <strong>المورد:</strong> {getSupplierName(formData.supplier_id)}
                    </p>
                  )}
                  {formData.project_id && (
                    <p className="text-sm text-gray-700">
                      <strong>المشروع:</strong> {getProjectName(formData.project_id)}
                    </p>
                  )}
                  {formData.account_id && (
                    <p className="text-sm text-gray-700">
                      <strong>الحساب:</strong> {getAccountName(formData.account_id)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-2">الوصف:</h3>
                <p className="text-sm text-gray-700">{formData.description}</p>
              </div>
              
              {/* Notes */}
              {formData.notes && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">ملاحظات:</h3>
                  <p className="text-sm text-gray-700">{formData.notes}</p>
                </div>
              )}
              
              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">المرفقات:</h3>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {attachments.map((attachment, index) => (
                      <li key={index}>{attachment.file_name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 mb-6 mt-10">
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المعد</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المعتمد</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المستلم</p>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
                <p>شكراً لتعاملكم معنا</p>
                <p>{state.settings.company.name} - {state.settings.company.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;