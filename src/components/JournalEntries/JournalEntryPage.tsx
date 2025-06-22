import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  DatabaseJournalEntry, 
  DatabaseJournalEntryLine, 
  journalEntryService 
} from '../../lib/supabaseClient';
import { 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  Calendar, 
  FileText, 
  Printer, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  ArrowLeft, 
  Upload,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const JournalEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  
  const [journalEntry, setJournalEntry] = useState<DatabaseJournalEntry | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    entry_number: '',
    entry_date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    status: 'draft',
    currency: 'SAR',
    notes: ''
  });
  
  const [entryLines, setEntryLines] = useState<Array<{
    id?: string;
    account_id: string;
    account_name?: string;
    description: string;
    debit_amount: number;
    credit_amount: number;
    project_id?: string;
    customer_id?: string;
    supplier_id?: string;
  }>>([
    {
      account_id: '',
      description: '',
      debit_amount: 0,
      credit_amount: 0
    }
  ]);
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [reverseReason, setReverseReason] = useState('');
  const [showReverseDialog, setShowReverseDialog] = useState(false);
  
  // Load journal entry if editing
  useEffect(() => {
    if (id) {
      loadJournalEntry(id);
    } else {
      // Generate new entry number for new entries
      generateEntryNumber();
    }
  }, [id]);
  
  // Generate entry number
  const generateEntryNumber = async () => {
    try {
      const entryNumber = await journalEntryService.generateJournalEntryNumber('00000000-0000-0000-0000-000000000001');
      setFormData(prev => ({ ...prev, entry_number: entryNumber }));
    } catch (error) {
      console.error('Error generating entry number:', error);
      // Fallback to a simple format if API call fails
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, entry_number: `JE-${timestamp}-001` }));
    }
  };
  
  // Load journal entry data
  const loadJournalEntry = async (entryId: string) => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🔍 جلب القيد المحاسبي:', entryId);
      
      // Test connection first
      const isConnected = await journalEntryService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
      
      // Get journal entry with lines
      const { entry, lines } = await journalEntryService.getJournalEntryWithLines(entryId);
      
      setJournalEntry(entry);
      
      // Set form data
      setFormData({
        entry_number: entry.entry_number,
        entry_date: entry.entry_date,
        reference: entry.reference || '',
        description: entry.description,
        status: entry.status,
        currency: entry.currency,
        notes: entry.notes || ''
      });
      
      // Set entry lines
      if (lines.length > 0) {
        const formattedLines = lines.map(line => ({
          id: line.id,
          account_id: line.account_id,
          account_name: getAccountName(line.account_id),
          description: line.description || '',
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
          project_id: line.project_id,
          customer_id: line.customer_id,
          supplier_id: line.supplier_id
        }));
        setEntryLines(formattedLines);
      }
      
      // Load attachments
      loadAttachments(entryId);
      
      console.log('✅ تم جلب القيد المحاسبي بنجاح');
    } catch (error: any) {
      console.error('❌ خطأ في جلب القيد المحاسبي:', error);
      setConnectionError(error.message || 'حدث خطأ في جلب القيد المحاسبي');
      toast.error('حدث خطأ في جلب القيد المحاسبي');
    } finally {
      setLoading(false);
    }
  };
  
  // Load attachments
  const loadAttachments = async (entryId: string) => {
    try {
      const attachments = await journalEntryService.getJournalEntryAttachments(entryId);
      setAttachments(attachments);
    } catch (error) {
      console.error('Error loading attachments:', error);
    }
  };
  
  // Get account name by ID
  const getAccountName = (accountId: string): string => {
    const account = state.accounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : '';
  };
  
  // Add entry line
  const addEntryLine = () => {
    setEntryLines([
      ...entryLines,
      {
        account_id: '',
        description: '',
        debit_amount: 0,
        credit_amount: 0
      }
    ]);
  };
  
  // Remove entry line
  const removeEntryLine = (index: number) => {
    if (entryLines.length > 1) {
      const newLines = [...entryLines];
      newLines.splice(index, 1);
      setEntryLines(newLines);
    }
  };
  
  // Update entry line
  const updateEntryLine = (index: number, field: string, value: any) => {
    const newLines = [...entryLines];
    
    if (field === 'account_id') {
      const account = state.accounts.find(acc => acc.id === value);
      newLines[index] = {
        ...newLines[index],
        [field]: value,
        account_name: account ? `${account.code} - ${account.name}` : ''
      };
    } else {
      newLines[index] = {
        ...newLines[index],
        [field]: value
      };
    }
    
    setEntryLines(newLines);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const totalDebit = entryLines.reduce((sum, line) => sum + (parseFloat(line.debit_amount.toString()) || 0), 0);
    const totalCredit = entryLines.reduce((sum, line) => sum + (parseFloat(line.credit_amount.toString()) || 0), 0);
    
    return {
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    };
  };
  
  const { totalDebit, totalCredit, isBalanced } = calculateTotals();
  
  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.entry_number.trim()) {
      newErrors.entry_number = 'رقم القيد مطلوب';
    }
    
    if (!formData.entry_date) {
      newErrors.entry_date = 'تاريخ القيد مطلوب';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'وصف القيد مطلوب';
    }
    
    // Validate entry lines
    let hasLineErrors = false;
    entryLines.forEach((line, index) => {
      if (!line.account_id) {
        newErrors[`line_${index}_account_id`] = 'الحساب مطلوب';
        hasLineErrors = true;
      }
      
      if (line.debit_amount === 0 && line.credit_amount === 0) {
        newErrors[`line_${index}_amount`] = 'يجب إدخال مبلغ مدين أو دائن';
        hasLineErrors = true;
      }
      
      if (line.debit_amount > 0 && line.credit_amount > 0) {
        newErrors[`line_${index}_amount`] = 'لا يمكن إدخال مبلغ مدين ودائن معاً';
        hasLineErrors = true;
      }
    });
    
    if (hasLineErrors) {
      newErrors.lines = 'يوجد أخطاء في بنود القيد';
    }
    
    if (!isBalanced) {
      newErrors.balance = 'القيد غير متوازن - يجب أن يكون إجمالي المدين مساوياً لإجمالي الدائن';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Save journal entry
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare journal entry data
      const entryData: Partial<DatabaseJournalEntry> = {
        company_id: '00000000-0000-0000-0000-000000000001',
        entry_number: formData.entry_number,
        entry_date: formData.entry_date,
        reference: formData.reference,
        description: formData.description,
        status: formData.status,
        currency: formData.currency,
        notes: formData.notes,
        is_active: true
      };
      
      // Prepare entry lines
      const linesData: Partial<DatabaseJournalEntryLine>[] = entryLines.map(line => ({
        account_id: line.account_id,
        description: line.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        project_id: line.project_id,
        customer_id: line.customer_id,
        supplier_id: line.supplier_id,
        is_active: true
      }));
      
      if (id) {
        // Update existing entry
        await journalEntryService.updateJournalEntry(id, entryData, linesData);
        toast.success('تم تحديث القيد المحاسبي بنجاح');
      } else {
        // Add new entry
        await journalEntryService.addJournalEntry(entryData, linesData);
        toast.success('تم إضافة القيد المحاسبي بنجاح');
      }
      
      // Redirect to journal entries list
      navigate('/journal-entries');
    } catch (error: any) {
      console.error('❌ خطأ في حفظ القيد المحاسبي:', error);
      toast.error(`حدث خطأ في حفظ القيد المحاسبي: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Post journal entry
  const handlePost = async () => {
    if (!id) {
      toast.error('يجب حفظ القيد أولاً قبل ترحيله');
      return;
    }
    
    try {
      setPosting(true);
      
      await journalEntryService.postJournalEntry(id, state.user?.id);
      
      toast.success('تم ترحيل القيد المحاسبي بنجاح');
      
      // Reload entry to get updated status
      loadJournalEntry(id);
    } catch (error: any) {
      console.error('❌ خطأ في ترحيل القيد المحاسبي:', error);
      toast.error(`حدث خطأ في ترحيل القيد المحاسبي: ${error.message}`);
    } finally {
      setPosting(false);
    }
  };
  
  // Reverse journal entry
  const handleReverse = async () => {
    if (!id || !journalEntry || journalEntry.status !== 'posted') {
      toast.error('يمكن عكس القيود المرحلة فقط');
      return;
    }
    
    if (!reverseReason.trim()) {
      toast.error('يرجى إدخال سبب العكس');
      return;
    }
    
    try {
      setReversing(true);
      
      await journalEntryService.reverseJournalEntry(id, state.user?.id, reverseReason);
      
      toast.success('تم عكس القيد المحاسبي بنجاح');
      setShowReverseDialog(false);
      
      // Navigate back to journal entries list
      navigate('/journal-entries');
    } catch (error: any) {
      console.error('❌ خطأ في عكس القيد المحاسبي:', error);
      toast.error(`حدث خطأ في عكس القيد المحاسبي: ${error.message}`);
    } finally {
      setReversing(false);
    }
  };
  
  // Print journal entry
  const handlePrint = () => {
    window.print();
  };
  
  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      toast.loading('جاري تصدير القيد إلى PDF...');
      
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
      pdf.save(`قيد-محاسبي-${formData.entry_number}.pdf`);
      
      toast.dismiss();
      toast.success('تم تصدير القيد بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير القيد:', error);
      toast.dismiss();
      toast.error('حدث خطأ في تصدير القيد');
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
      const filePath = `journal_entries/${id}/${fileName}`;
      
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
        journal_entry_id: id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: publicUrl,
        description: `Uploaded on ${new Date().toLocaleString()}`,
        is_active: true,
        uploaded_by: state.user?.id
      };
      
      await journalEntryService.addJournalEntryAttachment(attachmentData);
      
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
      await journalEntryService.deleteJournalEntryAttachment(attachmentId);
      
      toast.success('تم حذف المرفق بنجاح');
      
      // Reload attachments
      loadAttachments(id);
    } catch (error: any) {
      console.error('❌ خطأ في حذف المرفق:', error);
      toast.error(`حدث خطأ في حذف المرفق: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل القيد المحاسبي...</span>
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
              onClick={() => navigate('/journal-entries')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة إلى قائمة القيود</span>
            </button>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Database className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  يرجى تطبيق migration الجديد: 20250622110000_journal_entries_system.sql
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
            {id ? 'تعديل القيد المحاسبي' : 'قيد محاسبي جديد'}
          </h1>
          <p className="text-gray-600">إنشاء وتعديل القيود المحاسبية مع إمكانية الطباعة والتصدير</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={() => navigate('/journal-entries')}
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
        {/* Journal Entry Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <form onSubmit={handleSave}>
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline ml-1" />
                    رقم القيد *
                  </label>
                  <input
                    type="text"
                    value={formData.entry_number}
                    onChange={(e) => setFormData({ ...formData, entry_number: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.entry_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="JE-2024-001"
                    required
                    disabled={!!id || formData.status === 'posted'}
                  />
                  {errors.entry_number && <p className="mt-1 text-sm text-red-500">{errors.entry_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.entry_date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    required
                    disabled={formData.status === 'posted'}
                  />
                  {errors.entry_date && <p className="mt-1 text-sm text-red-500">{errors.entry_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline ml-1" />
                    المرجع
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رقم الفاتورة أو المرجع"
                    disabled={formData.status === 'posted'}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline ml-1" />
                    الوصف *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    rows={2}
                    placeholder="وصف القيد المحاسبي"
                    required
                    disabled={formData.status === 'posted'}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>
              </div>

              {/* Journal Entry Lines */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">بنود القيد</h3>
                  <button
                    type="button"
                    onClick={addEntryLine}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse"
                    disabled={formData.status === 'posted'}
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة بند</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الحساب *</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مدين</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">دائن</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {entryLines.map((line, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3">
                            <select
                              value={line.account_id}
                              onChange={(e) => updateEntryLine(index, 'account_id', e.target.value)}
                              className={`w-full px-3 py-2 border ${errors[`line_${index}_account_id`] ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              required
                              disabled={formData.status === 'posted'}
                            >
                              <option value="">اختر الحساب</option>
                              {state.accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                  {account.code} - {account.name}
                                </option>
                              ))}
                            </select>
                            {errors[`line_${index}_account_id`] && (
                              <p className="mt-1 text-xs text-red-500">{errors[`line_${index}_account_id`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) => updateEntryLine(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="وصف البند"
                              disabled={formData.status === 'posted'}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={line.debit_amount}
                              onChange={(e) => updateEntryLine(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border ${errors[`line_${index}_amount`] ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              disabled={formData.status === 'posted' || line.credit_amount > 0}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={line.credit_amount}
                              onChange={(e) => updateEntryLine(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                              className={`w-full px-3 py-2 border ${errors[`line_${index}_amount`] ? 'border-red-500' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              disabled={formData.status === 'posted' || line.debit_amount > 0}
                            />
                            {errors[`line_${index}_amount`] && (
                              <p className="mt-1 text-xs text-red-500">{errors[`line_${index}_amount`]}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeEntryLine(index)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              disabled={formData.status === 'posted' || entryLines.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right font-medium text-gray-700">
                          الإجمالي:
                        </td>
                        <td className="px-4 py-3 font-bold text-green-600">
                          {totalDebit.toLocaleString()} {formData.currency}
                        </td>
                        <td className="px-4 py-3 font-bold text-red-600">
                          {totalCredit.toLocaleString()} {formData.currency}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isBalanced ? (
                            <span className="text-green-600 text-sm">متوازن ✓</span>
                          ) : (
                            <span className="text-red-600 text-sm">غير متوازن ✗</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {errors.lines && <p className="mt-2 text-sm text-red-500">{errors.lines}</p>}
                {errors.balance && <p className="mt-2 text-sm text-red-500">{errors.balance}</p>}
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
                  disabled={formData.status === 'posted'}
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
                      disabled={uploadingAttachment}
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
                              disabled={formData.status === 'posted'}
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
                    onClick={() => navigate('/journal-entries')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  {formData.status !== 'posted' && (
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
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  {id && formData.status === 'draft' && (
                    <button
                      type="button"
                      onClick={handlePost}
                      disabled={posting || !isBalanced}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                    >
                      {posting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>ترحيل</span>
                    </button>
                  )}
                  
                  {id && formData.status === 'posted' && (
                    <button
                      type="button"
                      onClick={() => setShowReverseDialog(true)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 space-x-reverse"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>عكس القيد</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Journal Entry Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة القيد المحاسبي</h3>
            
            <div ref={printRef} className="p-4 border border-gray-200 rounded-lg">
              {/* Company Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{state.settings.company.name}</h2>
                <p className="text-sm text-gray-600">{state.settings.company.address}</p>
                <p className="text-sm text-gray-600">
                  هاتف: {state.settings.company.phone} | بريد إلكتروني: {state.settings.company.email}
                </p>
              </div>
              
              {/* Journal Entry Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-blue-600 border-2 border-blue-200 inline-block px-6 py-2 rounded">
                  قيد محاسبي
                </h1>
                <p className="text-sm text-gray-600 mt-2">رقم القيد: {formData.entry_number}</p>
                <p className="text-sm text-gray-600">
                  التاريخ: {formData.entry_date ? new Date(formData.entry_date).toLocaleDateString('ar-SA') : ''}
                </p>
                {formData.reference && (
                  <p className="text-sm text-gray-600">
                    المرجع: {formData.reference}
                  </p>
                )}
              </div>
              
              {/* Status */}
              <div className="mb-4 text-center">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  formData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                  formData.status === 'posted' ? 'bg-green-100 text-green-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {formData.status === 'draft' ? 'مسودة' : 
                   formData.status === 'posted' ? 'مرحل' : 
                   'معكوس'}
                </span>
              </div>
              
              {/* Description */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold text-gray-900 mb-2">الوصف:</h3>
                <p className="text-sm text-gray-700">{formData.description}</p>
              </div>
              
              {/* Journal Entry Lines */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-900 mb-2">بنود القيد:</h3>
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">الحساب</th>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">مدين</th>
                      <th className="px-2 py-2 text-right font-medium text-gray-700 border-b">دائن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entryLines.map((line, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-2 text-gray-700">
                          {line.account_name || getAccountName(line.account_id)}
                          {line.description && (
                            <div className="text-xs text-gray-500">{line.description}</div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-gray-700">
                          {line.debit_amount > 0 ? line.debit_amount.toLocaleString() : ''}
                        </td>
                        <td className="px-2 py-2 text-gray-700">
                          {line.credit_amount > 0 ? line.credit_amount.toLocaleString() : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-2 py-2 text-gray-700">الإجمالي</td>
                      <td className="px-2 py-2 text-green-600">{totalDebit.toLocaleString()}</td>
                      <td className="px-2 py-2 text-red-600">{totalCredit.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
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
              
              {/* Footer */}
              <div className="grid grid-cols-3 gap-4 mb-6 mt-10">
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المعد</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المراجع</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-sm font-medium text-gray-700">المدير المالي</p>
                  </div>
                </div>
              </div>
              
              {/* Company Footer */}
              <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-200">
                <p>شكراً لتعاملكم معنا</p>
                <p>{state.settings.company.name} - {state.settings.company.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reverse Journal Entry Dialog */}
      {showReverseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">عكس القيد المحاسبي</h3>
            <p className="text-gray-600 mb-4">
              سيتم إنشاء قيد عكسي لهذا القيد. يرجى إدخال سبب العكس.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب العكس *
              </label>
              <textarea
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="أدخل سبب عكس القيد"
                required
              />
            </div>
            <div className="flex items-center justify-end space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={() => setShowReverseDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReverse}
                disabled={!reverseReason.trim() || reversing}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
              >
                {reversing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>تأكيد العكس</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryPage;