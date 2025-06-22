import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Calculator, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  RotateCcw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { 
  journalEntryService, 
  DatabaseJournalEntry, 
  DatabaseJournalEntryLine 
} from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const JournalEntryList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [journalEntries, setJournalEntries] = useState<DatabaseJournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DatabaseJournalEntry | null>(null);
  const [entryLines, setEntryLines] = useState<DatabaseJournalEntryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);

  // Load journal entries from database
  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل القيود المحاسبية...');
      
      // Test connection first
      const isConnected = await journalEntryService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await journalEntryService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول القيود المحاسبية غير صحيح - يرجى تطبيق migrations');
      }

      // Get all journal entries
      const data = await journalEntryService.getJournalEntries('00000000-0000-0000-0000-000000000001');
      setJournalEntries(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة القيود المحاسبية بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} قيد محاسبي بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل القيود المحاسبية:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل القيود المحاسبية');
      toast.error('حدث خطأ في تحميل القيود المحاسبية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournalEntries();
  }, []);

  // Filter journal entries based on search term and status
  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.reference && entry.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'reversed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'posted':
        return 'مرحل';
      case 'draft':
        return 'مسودة';
      case 'reversed':
        return 'معكوس';
      default:
        return status;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'reversed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Calculate totals
  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.total_debit, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.total_credit, 0);
  const postedEntries = filteredEntries.filter(e => e.status === 'posted').length;
  const draftEntries = filteredEntries.filter(e => e.status === 'draft').length;

  // View entry details
  const handleViewEntry = async (entry: DatabaseJournalEntry) => {
    try {
      setActionLoading('view');
      setSelectedEntry(entry);
      
      // Get entry lines
      const { lines } = await journalEntryService.getJournalEntryWithLines(entry.id);
      setEntryLines(lines);
      
      setShowEntryDetails(true);
    } catch (error: any) {
      console.error('Error fetching entry details:', error);
      toast.error('حدث خطأ في جلب تفاصيل القيد');
    } finally {
      setActionLoading(null);
    }
  };

  // Edit entry
  const handleEditEntry = (entry: DatabaseJournalEntry) => {
    navigate(`/journal-entries/${entry.id}`);
  };

  // Post entry
  const handlePostEntry = async (entry: DatabaseJournalEntry) => {
    try {
      setActionLoading(entry.id);
      
      await journalEntryService.postJournalEntry(entry.id, state.user?.id);
      
      toast.success('تم ترحيل القيد المحاسبي بنجاح');
      
      // Reload entries
      await loadJournalEntries();
    } catch (error: any) {
      console.error('Error posting entry:', error);
      toast.error(`حدث خطأ في ترحيل القيد: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Reverse entry
  const handleReverseEntry = async (entry: DatabaseJournalEntry) => {
    if (entry.status !== 'posted') {
      toast.error('يمكن عكس القيود المرحلة فقط');
      return;
    }
    
    const reason = prompt('أدخل سبب عكس القيد:');
    if (!reason) return;
    
    try {
      setActionLoading(entry.id);
      
      await journalEntryService.reverseJournalEntry(entry.id, state.user?.id, reason);
      
      toast.success('تم عكس القيد المحاسبي بنجاح');
      
      // Reload entries
      await loadJournalEntries();
    } catch (error: any) {
      console.error('Error reversing entry:', error);
      toast.error(`حدث خطأ في عكس القيد: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle entry active status
  const handleToggleStatus = async (entry: DatabaseJournalEntry) => {
    const newStatus = !entry.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا القيد؟`)) {
      try {
        setActionLoading(entry.id);
        
        await journalEntryService.updateJournalEntry(entry.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} القيد بنجاح`);
        await loadJournalEntries(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} القيد:`, error);
        toast.error(`حدث خطأ في ${actionText} القيد: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entry: DatabaseJournalEntry) => {
    if (entry.status === 'posted') {
      toast.error('لا يمكن حذف القيود المرحلة، يجب عكسها أولاً');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا القيد؟')) {
      try {
        setActionLoading(entry.id);
        
        await journalEntryService.deleteJournalEntry(entry.id);
        
        toast.success('تم حذف القيد المحاسبي بنجاح');
        
        // Reload entries
        await loadJournalEntries();
      } catch (error: any) {
        console.error('Error deleting entry:', error);
        toast.error(`حدث خطأ في حذف القيد: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Get account name
  const getAccountName = (accountId: string): string => {
    const account = state.accounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : 'حساب غير معروف';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل القيود المحاسبية...</span>
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
              onClick={loadJournalEntries}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
            <p className="text-sm text-gray-500">
              تأكد من تطبيق migrations قاعدة البيانات في Supabase Dashboard
            </p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">القيود المحاسبية</h1>
          <p className="text-gray-600">إدارة القيود المحاسبية والترحيل مع قاعدة البيانات</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={loadJournalEntries}
            disabled={loading}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button 
            onClick={() => navigate('/journal-entries/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-5 h-5" />
            <span>قيد جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي القيود</p>
              <p className="text-2xl font-bold text-gray-900">{journalEntries.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي المدين</p>
              <p className="text-2xl font-bold text-green-600">{totalDebits.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الدائن</p>
              <p className="text-2xl font-bold text-red-600">{totalCredits.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Calculator className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">القيود المرحلة</p>
              <p className="text-2xl font-bold text-purple-600">{postedEntries}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في القيود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">تصفية</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="posted">مرحل</option>
              <option value="reversed">معكوس</option>
            </select>
          </div>
        </div>
      </div>

      {/* Journal Entries Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم القيد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${!entry.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 ml-2" />
                      {new Date(entry.entry_date).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg ml-3">
                        <Calculator className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {entry.entry_number}
                        {!entry.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{entry.description}</div>
                    {entry.reference && (
                      <div className="text-sm text-gray-500">المرجع: {entry.reference}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.total_debit.toLocaleString()} {entry.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {getStatusIcon(entry.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusText(entry.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button 
                        onClick={() => handleViewEntry(entry)}
                        disabled={actionLoading === entry.id || actionLoading === 'view'}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded disabled:opacity-50"
                        title="عرض تفاصيل القيد"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {entry.status === 'draft' && (
                        <>
                          <button 
                            onClick={() => handleEditEntry(entry)}
                            disabled={actionLoading === entry.id}
                            className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                            title="تعديل القيد"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handlePostEntry(entry)}
                            disabled={actionLoading === entry.id}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded disabled:opacity-50"
                            title="ترحيل القيد"
                          >
                            {actionLoading === entry.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteEntry(entry)}
                            disabled={actionLoading === entry.id}
                            className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                            title="حذف القيد"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {entry.status === 'posted' && (
                        <button 
                          onClick={() => handleReverseEntry(entry)}
                          disabled={actionLoading === entry.id}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded disabled:opacity-50"
                          title="عكس القيد"
                        >
                          {actionLoading === entry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleToggleStatus(entry)}
                        disabled={actionLoading === entry.id}
                        className={`p-1 rounded transition-colors ${
                          entry.is_active 
                            ? 'text-green-600 hover:text-green-800' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title={entry.is_active ? 'إلغاء تفعيل القيد' : 'تفعيل القيد'}
                      >
                        {actionLoading === entry.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : entry.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد قيود محاسبية</h4>
            <p className="text-gray-500 mb-4">ابدأ بإضافة قيد محاسبي جديد</p>
            <button 
              onClick={() => navigate('/journal-entries/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إضافة قيد جديد
            </button>
          </div>
        )}
      </div>

      {/* Entry Details Modal */}
      {showEntryDetails && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                تفاصيل القيد المحاسبي: {selectedEntry.entry_number}
              </h2>
              <button
                onClick={() => setShowEntryDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Entry Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">رقم القيد</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedEntry.entry_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">التاريخ</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedEntry.entry_date).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">الحالة</h3>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(selectedEntry.status)}
                    <span className={`mr-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEntry.status)}`}>
                      {getStatusText(selectedEntry.status)}
                    </span>
                  </div>
                </div>
                
                <div className="md:col-span-3">
                  <h3 className="text-sm font-medium text-gray-500">الوصف</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedEntry.description}</p>
                </div>
                
                {selectedEntry.reference && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">المرجع</h3>
                    <p className="text-lg font-semibold text-gray-900">{selectedEntry.reference}</p>
                  </div>
                )}
                
                {selectedEntry.source && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">المصدر</h3>
                    <p className="text-lg font-semibold text-gray-900">{selectedEntry.source}</p>
                  </div>
                )}
              </div>
              
              {/* Entry Lines */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">بنود القيد</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الحساب</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مدين</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">دائن</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {entryLines.map((line) => (
                        <tr key={line.id} className="bg-white">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {getAccountName(line.account_id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {line.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">
                            {line.debit_amount > 0 ? line.debit_amount.toLocaleString() : ''}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-red-600">
                            {line.credit_amount > 0 ? line.credit_amount.toLocaleString() : ''}
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
                          {selectedEntry.total_debit.toLocaleString()} {selectedEntry.currency}
                        </td>
                        <td className="px-4 py-3 font-bold text-red-600">
                          {selectedEntry.total_credit.toLocaleString()} {selectedEntry.currency}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Additional Information */}
              {selectedEntry.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ملاحظات</h3>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{selectedEntry.notes}</p>
                </div>
              )}
              
              {/* Posting Information */}
              {selectedEntry.status === 'posted' && selectedEntry.posted_at && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">معلومات الترحيل</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">تاريخ الترحيل:</span> {new Date(selectedEntry.posted_at).toLocaleString('ar-SA')}
                    </p>
                    {selectedEntry.posting_date && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">تاريخ الترحيل المحاسبي:</span> {new Date(selectedEntry.posting_date).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Reversal Information */}
              {selectedEntry.status === 'reversed' && selectedEntry.reversed_at && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">معلومات العكس</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">تاريخ العكس:</span> {new Date(selectedEntry.reversed_at).toLocaleString('ar-SA')}
                    </p>
                    {selectedEntry.reversal_reason && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">سبب العكس:</span> {selectedEntry.reversal_reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEntryDetails(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => navigate(`/journal-entries/${selectedEntry.id}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  عرض الصفحة الكاملة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryList;