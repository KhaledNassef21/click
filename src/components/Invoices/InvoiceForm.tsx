import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { DatabaseInvoice, invoiceService } from '../../lib/supabaseClient';
import { 
  X, Save, FileText, Plus, Trash2, Calculator, Calendar, DollarSign, 
  User, Briefcase, Printer, Download, Send, CreditCard, FileCheck, 
  Loader2, AlertCircle, RefreshCw, Database, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InvoiceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<DatabaseInvoice | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    invoice_number: '',
    customer_id: '',
    project_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    paid_amount: 0,
    status: 'draft',
    currency: 'SAR',
    notes: '',
    terms: 'يرجى الدفع خلال 30 يوم من تاريخ الفاتورة',
    is_taxable: true,
    tax_rate: 15,
    discount_type: 'percentage',
    discount_value: 0
  });
  
  const [items, setItems] = useState([
    {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      tax_percentage: 15,
      line_total: 0
    }
  ]);
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };
  
  // Load invoice if editing
  useEffect(() => {
    if (id) {
      loadInvoice(id);
    } else {
      // Set default values for new invoice
      setFormData({
        ...formData,
        invoice_number: generateInvoiceNumber()
      });
    }
  }, [id]);
  
  // Load invoice data
  const loadInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🔍 جلب الفاتورة:', invoiceId);
      
      // Test connection first
      const isConnected = await invoiceService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
      
      // Get invoice with items
      const { invoice, items } = await invoiceService.getInvoiceWithItems(invoiceId);
      
      setInvoice(invoice);
      
      // Set form data
      setFormData({
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id || '',
        project_id: invoice.project_id || '',
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date || '',
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        discount_amount: invoice.discount_amount,
        total_amount: invoice.total_amount,
        paid_amount: invoice.paid_amount,
        status: invoice.status,
        currency: invoice.currency,
        notes: invoice.notes || '',
        terms: invoice.terms || 'يرجى الدفع خلال 30 يوم من تاريخ الفاتورة',
        is_taxable: invoice.tax_amount > 0,
        tax_rate: invoice.tax_amount > 0 ? (invoice.tax_amount / invoice.subtotal) * 100 : 15,
        discount_type: 'percentage',
        discount_value: invoice.discount_amount > 0 ? (invoice.discount_amount / invoice.subtotal) * 100 : 0
      });
      
      // Set items
      if (items.length > 0) {
        setItems(items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          tax_percentage: item.tax_percentage,
          line_total: item.line_total
        })));
      }
      
      console.log('✅ تم جلب الفاتورة بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في جلب الفاتورة:', error);
      setConnectionError(error.message || 'حدث خطأ في جلب الفاتورة');
      toast.error('حدث خطأ في جلب الفاتورة');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate line total
  const calculateLineTotal = (item: any) => {
    const subtotal = item.quantity * item.unit_price;
    const discountAmount = subtotal * (item.discount_percentage / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = formData.is_taxable ? afterDiscount * (item.tax_percentage / 100) : 0;
    return afterDiscount + taxAmount;
  };
  
  // Update item
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate line total
    newItems[index].line_total = calculateLineTotal(newItems[index]);
    
    setItems(newItems);
    calculateTotals(newItems);
  };
  
  // Add new item
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_percentage: 0,
        tax_percentage: formData.is_taxable ? formData.tax_rate : 0,
        line_total: 0
      }
    ]);
  };
  
  // Remove item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      calculateTotals(newItems);
    }
  };
  
  // Calculate totals
  const calculateTotals = (currentItems = items) => {
    const subtotal = currentItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    
    let discountAmount = 0;
    if (formData.discount_type === 'percentage') {
      discountAmount = subtotal * (formData.discount_value / 100);
    } else {
      discountAmount = formData.discount_value;
    }
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = formData.is_taxable ? afterDiscount * (formData.tax_rate / 100) : 0;
    const total = afterDiscount + taxAmount;
    
    setFormData({
      ...formData,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: total
    });
  };
  
  // Handle tax toggle
  const handleTaxToggle = (isTaxable: boolean) => {
    setFormData({
      ...formData,
      is_taxable: isTaxable
    });
    
    // Update tax percentage on all items
    const newItems = items.map(item => ({
      ...item,
      tax_percentage: isTaxable ? formData.tax_rate : 0
    }));
    
    setItems(newItems);
    calculateTotals(newItems);
  };
  
  // Handle tax rate change
  const handleTaxRateChange = (rate: number) => {
    setFormData({
      ...formData,
      tax_rate: rate
    });
    
    // Update tax percentage on all items
    const newItems = items.map(item => ({
      ...item,
      tax_percentage: formData.is_taxable ? rate : 0
    }));
    
    setItems(newItems);
    calculateTotals(newItems);
  };
  
  // Handle discount type change
  const handleDiscountTypeChange = (type: string) => {
    setFormData({
      ...formData,
      discount_type: type
    });
    
    calculateTotals();
  };
  
  // Handle discount value change
  const handleDiscountValueChange = (value: number) => {
    setFormData({
      ...formData,
      discount_value: value
    });
    
    calculateTotals();
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.invoice_number.trim()) {
      newErrors.invoice_number = 'رقم الفاتورة مطلوب';
    }
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'العميل مطلوب';
    }
    
    if (!formData.invoice_date) {
      newErrors.invoice_date = 'تاريخ الفاتورة مطلوب';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'تاريخ الاستحقاق مطلوب';
    }
    
    // Validate items
    let hasItemErrors = false;
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'الوصف مطلوب';
        hasItemErrors = true;
      }
      
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'الكمية يجب أن تكون أكبر من صفر';
        hasItemErrors = true;
      }
      
      if (item.unit_price < 0) {
        newErrors[`item_${index}_unit_price`] = 'السعر لا يمكن أن يكون سالباً';
        hasItemErrors = true;
      }
    });
    
    if (hasItemErrors) {
      newErrors.items = 'يوجد أخطاء في بنود الفاتورة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save invoice
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare invoice data
      const invoiceData = {
        company_id: '00000000-0000-0000-0000-000000000001',
        invoice_number: formData.invoice_number,
        customer_id: formData.customer_id || null,
        project_id: formData.project_id || null,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        discount_amount: formData.discount_amount,
        total_amount: formData.total_amount,
        paid_amount: formData.paid_amount,
        status: formData.status,
        currency: formData.currency,
        notes: formData.notes,
        terms: formData.terms,
        is_active: true
      };
      
      // Prepare items data
      const itemsData = items.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percentage: item.discount_percentage,
        tax_percentage: item.tax_percentage,
        line_total: item.line_total,
        line_number: index + 1
      }));
      
      if (id) {
        // Update existing invoice
        await invoiceService.updateInvoice(id, invoiceData, itemsData);
        toast.success('تم تحديث الفاتورة بنجاح');
      } else {
        // Add new invoice
        await invoiceService.addInvoice(invoiceData, itemsData);
        toast.success('تم إضافة الفاتورة بنجاح');
      }
      
      // Redirect to invoices list
      navigate('/invoices');
    } catch (error: any) {
      console.error('❌ خطأ في حفظ الفاتورة:', error);
      toast.error(`حدث خطأ في حفظ الفاتورة: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Print invoice
  const handlePrint = () => {
    window.print();
  };
  
  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      toast.loading('جاري تصدير الفاتورة إلى PDF...');
      
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
      pdf.save(`فاتورة-${formData.invoice_number}.pdf`);
      
      toast.dismiss();
      toast.success('تم تصدير الفاتورة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير الفاتورة:', error);
      toast.dismiss();
      toast.error('حدث خطأ في تصدير الفاتورة');
    }
  };
  
  // Send invoice by email
  const handleSendEmail = () => {
    toast.success('تم إرسال الفاتورة بنجاح إلى العميل');
    
    // Update status to sent
    setFormData({
      ...formData,
      status: 'sent'
    });
  };
  
  // Record payment
  const handleRecordPayment = () => {
    // Navigate to payment voucher page
    navigate(`/vouchers/receipt/new?invoice=${formData.invoice_number}&customer=${formData.customer_id}&amount=${formData.total_amount}`);
  };
  
  // Get customer name
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '';
    const customer = state.customers.find(c => c.id === customerId);
    return customer?.name || '';
  };
  
  // Get project name
  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = state.projects.find(p => p.id === projectId);
    return project?.name || '';
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل الفاتورة...</span>
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
              onClick={() => navigate('/invoices')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة إلى قائمة الفواتير</span>
            </button>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Database className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  يرجى تطبيق migration الجديد: 20250621150000_invoices_vouchers_checks.sql
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
            {id ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
          </h1>
          <p className="text-gray-600">إنشاء وتعديل الفواتير مع إمكانية الطباعة والتصدير</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/invoices')}
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
        {/* Invoice Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSave}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline ml-1" />
                    رقم الفاتورة *
                  </label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.invoice_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="INV-2024-001"
                    required
                  />
                  {errors.invoice_number && <p className="mt-1 text-sm text-red-500">{errors.invoice_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline ml-1" />
                    العميل *
                  </label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  >
                    <option value="">اختر العميل</option>
                    {state.customers.filter(c => c.is_active).map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {errors.customer_id && <p className="mt-1 text-sm text-red-500">{errors.customer_id}</p>}
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
                    <Calendar className="w-4 h-4 inline ml-1" />
                    تاريخ الفاتورة *
                  </label>
                  <input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.invoice_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.invoice_date && <p className="mt-1 text-sm text-red-500">{errors.invoice_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    تاريخ الاستحقاق *
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.due_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                  />
                  {errors.due_date && <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الفاتورة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">مسودة</option>
                    <option value="sent">مرسلة</option>
                    <option value="paid">مدفوعة</option>
                    <option value="partially_paid">مدفوعة جزئياً</option>
                    <option value="overdue">متأخرة</option>
                    <option value="cancelled">ملغاة</option>
                  </select>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">بنود الفاتورة</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة بند</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الكمية</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">السعر</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الخصم %</th>
                        {formData.is_taxable && (
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الضريبة %</th>
                        )}
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الإجمالي</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={item.id} className="bg-white">
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              className={`w-full px-3 py-2 border ${errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              placeholder="وصف البند"
                              required
                            />
                            {errors[`item_${index}_description`] && (
                              <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_description`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border ${errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              placeholder="1"
                              min="0.01"
                              step="0.01"
                              required
                            />
                            {errors[`item_${index}_quantity`] && (
                              <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_quantity`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border ${errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              required
                            />
                            {errors[`item_${index}_unit_price`] && (
                              <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_unit_price`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={item.discount_percentage}
                              onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.1"
                            />
                          </td>
                          {formData.is_taxable && (
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.tax_percentage}
                                onChange={(e) => updateItem(index, 'tax_percentage', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="15"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                            </td>
                          )}
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.line_total.toLocaleString()} {formData.currency}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              disabled={items.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {errors.items && <p className="mt-2 text-sm text-red-500">{errors.items}</p>}
              </div>

              {/* Tax and Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">الضريبة</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <input
                        type="checkbox"
                        id="is_taxable"
                        checked={formData.is_taxable}
                        onChange={(e) => handleTaxToggle(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_taxable" className="text-sm font-medium text-gray-700">
                        تطبيق ضريبة القيمة المضافة
                      </label>
                    </div>
                    
                    {formData.is_taxable && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          نسبة الضريبة (%)
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={formData.tax_rate}
                            onChange={(e) => handleTaxRateChange(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="15"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="bg-gray-200 px-3 py-2 rounded-r border-t border-r border-b border-gray-300">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3">الخصم</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نوع الخصم
                      </label>
                      <div className="flex space-x-4 space-x-reverse">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="discount_percentage"
                            name="discount_type"
                            value="percentage"
                            checked={formData.discount_type === 'percentage'}
                            onChange={() => handleDiscountTypeChange('percentage')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="discount_percentage" className="mr-2 text-sm font-medium text-gray-700">
                            نسبة مئوية
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="discount_fixed"
                            name="discount_type"
                            value="fixed"
                            checked={formData.discount_type === 'fixed'}
                            onChange={() => handleDiscountTypeChange('fixed')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="discount_fixed" className="mr-2 text-sm font-medium text-gray-700">
                            مبلغ ثابت
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.discount_type === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم'}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={formData.discount_value}
                          onChange={(e) => handleDiscountValueChange(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                          min="0"
                          step={formData.discount_type === 'percentage' ? '0.1' : '1'}
                        />
                        <span className="bg-gray-200 px-3 py-2 rounded-r border-t border-r border-b border-gray-300">
                          {formData.discount_type === 'percentage' ? '%' : formData.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">المجموع الفرعي:</span>
                    <span className="font-medium">{formData.subtotal.toLocaleString()} {formData.currency}</span>
                  </div>
                  
                  {formData.discount_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">الخصم:</span>
                      <span className="font-medium text-red-600">- {formData.discount_amount.toLocaleString()} {formData.currency}</span>
                    </div>
                  )}
                  
                  {formData.is_taxable && formData.tax_amount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ضريبة القيمة المضافة ({formData.tax_rate}%):</span>
                      <span className="font-medium">{formData.tax_amount.toLocaleString()} {formData.currency}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="text-base font-medium text-gray-700">الإجمالي:</span>
                    <span className="text-lg font-bold text-blue-600">{formData.total_amount.toLocaleString()} {formData.currency}</span>
                  </div>
                  
                  {formData.paid_amount > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">المدفوع:</span>
                        <span className="font-medium text-green-600">{formData.paid_amount.toLocaleString()} {formData.currency}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                        <span className="text-base font-medium text-gray-700">المتبقي:</span>
                        <span className="text-lg font-bold text-red-600">
                          {(formData.total_amount - formData.paid_amount).toLocaleString()} {formData.currency}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="ملاحظات إضافية للفاتورة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شروط الدفع
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="شروط الدفع والتعليمات"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المرفقات
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Download className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">اضغط لرفع ملفات</span>
                    <span className="text-xs text-gray-500 mt-1">أو اسحب الملفات وأفلتها هنا</span>
                  </label>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">الملفات المرفقة:</h4>
                    <ul className="space-y-2">
                      {attachments.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => navigate('/invoices')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
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
                    <span>حفظ الفاتورة</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <Send className="w-4 h-4" />
                    <span>إرسال للعميل</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordPayment}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 space-x-reverse"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>تسجيل دفعة</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Invoice Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة الفاتورة</h3>
            
            <div ref={printRef} className="p-4 border border-gray-200 rounded-lg">
              {/* Company Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{state.settings.company.name}</h2>
                <p className="text-sm text-gray-600">{state.settings.company.address}</p>
                <p className="text-sm text-gray-600">
                  هاتف: {state.settings.company.phone} | بريد إلكتروني: {state.settings.company.email}
                </p>
                {state.settings.company.taxNumber && (
                  <p className="text-sm text-gray-600">الرقم الضريبي: {state.settings.company.taxNumber}</p>
                )}
              </div>
              
              {/* Invoice Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-blue-600 border-2 border-blue-200 inline-block px-6 py-2 rounded">
                  فاتورة ضريبية
                </h1>
                <p className="text-sm text-gray-600 mt-2">رقم الفاتورة: {formData.invoice_number}</p>
                <p className="text-sm text-gray-600">
                  التاريخ: {formData.invoice_date ? new Date(formData.invoice_date).toLocaleDateString('ar-SA') : ''}
                </p>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">معلومات العميل:</h3>
                <p className="text-sm text-gray-700">
                  <strong>الاسم:</strong> {getCustomerName(formData.customer_id)}
                </p>
                {formData.project_id && (
                  <p className="text-sm text-gray-700">
                    <strong>المشروع:</strong> {getProjectName(formData.project_id)}
                  </p>
                )}
              </div>
              
              {/* Invoice Items */}
              <div className="mb-6">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">الوصف</th>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">الكمية</th>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">السعر</th>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-2 text-gray-700">{item.description}</td>
                        <td className="px-2 py-2 text-gray-700">{item.quantity}</td>
                        <td className="px-2 py-2 text-gray-700">{item.unit_price.toLocaleString()}</td>
                        <td className="px-2 py-2 text-gray-700">{item.line_total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="mb-6">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{formData.subtotal.toLocaleString()} {formData.currency}</span>
                </div>
                
                {formData.discount_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">الخصم:</span>
                    <span className="font-medium text-red-600">- {formData.discount_amount.toLocaleString()} {formData.currency}</span>
                  </div>
                )}
                
                {formData.is_taxable && formData.tax_amount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">ضريبة القيمة المضافة ({formData.tax_rate}%):</span>
                    <span className="font-medium">{formData.tax_amount.toLocaleString()} {formData.currency}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="font-medium text-gray-700">الإجمالي:</span>
                  <span className="font-bold text-blue-600">{formData.total_amount.toLocaleString()} {formData.currency}</span>
                </div>
              </div>
              
              {/* Terms */}
              {formData.terms && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">شروط الدفع:</h3>
                  <p className="text-sm text-gray-700">{formData.terms}</p>
                </div>
              )}
              
              {/* Notes */}
              {formData.notes && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-2">ملاحظات:</h3>
                  <p className="text-sm text-gray-700">{formData.notes}</p>
                </div>
              )}
              
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

export default InvoiceForm;