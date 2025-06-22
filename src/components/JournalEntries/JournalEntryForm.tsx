import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, Plus, Trash2, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

interface JournalEntryFormProps {
  entry?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ entry, isOpen, onClose, onSave }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString().split('T')[0],
    reference: entry?.reference || '',
    description: entry?.description || '',
    entries: entry?.entries || [
      { id: '1', accountId: '', accountName: '', debit: 0, credit: 0, description: '' }
    ],
    status: entry?.status || 'draft'
  });

  const addEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      accountId: '',
      accountName: '',
      debit: 0,
      credit: 0,
      description: ''
    };
    setFormData({
      ...formData,
      entries: [...formData.entries, newEntry]
    });
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length > 1) {
      const newEntries = formData.entries.filter((_, i) => i !== index);
      setFormData({ ...formData, entries: newEntries });
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...formData.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    
    if (field === 'accountId') {
      const account = state.accounts.find(acc => acc.id === value);
      newEntries[index].accountName = account?.name || '';
    }
    
    setFormData({ ...formData, entries: newEntries });
  };

  const getTotalDebits = () => {
    return formData.entries.reduce((sum, entry) => sum + (parseFloat(entry.debit.toString()) || 0), 0);
  };

  const getTotalCredits = () => {
    return formData.entries.reduce((sum, entry) => sum + (parseFloat(entry.credit.toString()) || 0), 0);
  };

  const isBalanced = () => {
    return Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference || !formData.description) {
      toast.error('المرجع والوصف مطلوبان');
      return;
    }

    if (!isBalanced()) {
      toast.error('القيد غير متوازن - يجب أن يكون إجمالي المدين مساوياً لإجمالي الدائن');
      return;
    }

    const newEntry = {
      id: entry?.id || Date.now().toString(),
      ...formData,
      total: getTotalDebits(),
      createdBy: state.user?.name || 'المستخدم'
    };

    onSave(newEntry);
    toast.success(entry ? 'تم تحديث القيد بنجاح' : 'تم إضافة القيد بنجاح');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {entry ? 'تعديل القيد اليومي' : 'قيد يومي جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التاريخ *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المرجع *
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="JE-2024-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">مسودة</option>
                <option value="posted">مرحل</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="وصف القيد المحاسبي"
                required
              />
            </div>
          </div>

          {/* Journal Entries */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">بنود القيد</h3>
              <button
                type="button"
                onClick={addEntry}
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
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الحساب</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الوصف</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">مدين</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">دائن</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.entries.map((entryItem, index) => (
                    <tr key={entryItem.id} className="bg-white">
                      <td className="px-4 py-3">
                        <select
                          value={entryItem.accountId}
                          onChange={(e) => updateEntry(index, 'accountId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">اختر الحساب</option>
                          {state.accounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={entryItem.description}
                          onChange={(e) => updateEntry(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="وصف البند"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={entryItem.debit}
                          onChange={(e) => updateEntry(index, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={entryItem.credit}
                          onChange={(e) => updateEntry(index, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeEntry(index)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          disabled={formData.entries.length === 1}
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
                      {getTotalDebits().toLocaleString()} ر.س
                    </td>
                    <td className="px-4 py-3 font-bold text-red-600">
                      {getTotalCredits().toLocaleString()} ر.س
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBalanced() ? (
                        <span className="text-green-600 text-sm">متوازن ✓</span>
                      ) : (
                        <span className="text-red-600 text-sm">غير متوازن ✗</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!isBalanced()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{entry ? 'تحديث' : 'حفظ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalEntryForm;