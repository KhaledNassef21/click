import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Filter, Briefcase, Eye, Edit, Trash2, Calendar, DollarSign, TrendingUp, MapPin, User, Loader2, AlertCircle, RefreshCw, Database, ToggleLeft, ToggleRight } from 'lucide-react';
import ProjectForm from './ProjectForm';
import { projectService, DatabaseProject } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

const ProjectList: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DatabaseProject | null>(null);
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Load projects from database
  const loadProjects = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      console.log('🚀 بدء تحميل المشاريع...');
      
      // Test connection first
      const isConnected = await projectService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }

      // Check table structure
      const hasCorrectStructure = await projectService.checkTableStructure();
      if (!hasCorrectStructure) {
        throw new Error('هيكل جدول المشاريع غير صحيح - يرجى تطبيق migrations');
      }

      // Get all projects (including inactive ones for management)
      let data: DatabaseProject[] = [];
      try {
        // For demo purposes, using a default company ID
        const companyId = '00000000-0000-0000-0000-000000000001';
        // Get all projects regardless of active status for management
        const { data: allProjects, error } = await projectService.supabase
          .from('projects')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        data = allProjects || [];
      } catch (error: any) {
        console.log('⚠️ فشل في جلب المشاريع حسب الشركة، محاولة جلب جميع المشاريع...');
        // If company-based query fails, try to get all projects
        data = await projectService.getAllProjects();
      }
      
      setProjects(data);
      
      if (data.length === 0) {
        toast.success('تم تحميل قائمة المشاريع بنجاح (لا توجد بيانات)');
      } else {
        toast.success(`تم تحميل ${data.length} مشروع بنجاح`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تحميل المشاريع:', error);
      setConnectionError(error.message || 'حدث خطأ في تحميل المشاريع');
      toast.error('حدث خطأ في تحميل المشاريع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.project_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return 'تخطيط';
      case 'active':
        return 'نشط';
      case 'on_hold':
        return 'متوقف';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'غير محدد';
    const customer = state.customers.find(c => c.id === customerId);
    return customer?.name || 'عميل غير معروف';
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'غير محدد';
    const employee = state.employees.find(e => e.id === managerId);
    return employee?.name || 'مدير غير معروف';
  };

  const calculateProgress = (project: DatabaseProject) => {
    return project.progress_percentage || 0;
  };

  const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
  const totalExpenses = projects.reduce((sum, project) => sum + (project.expenses || 0), 0);
  const totalRevenue = projects.reduce((sum, project) => sum + (project.revenue || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const handleEdit = (project: DatabaseProject) => {
    setSelectedProject(project);
    setShowForm(true);
  };

  const handleSave = async (projectData: any) => {
    try {
      setActionLoading('save');
      const companyId = '00000000-0000-0000-0000-000000000001';
      
      if (selectedProject) {
        // Update existing project in database
        console.log('🔄 تحديث المشروع في قاعدة البيانات:', selectedProject.id);
        await projectService.updateProject(selectedProject.id, projectData);
        toast.success('تم تحديث المشروع بنجاح في قاعدة البيانات');
      } else {
        // Add new project to database
        console.log('➕ إضافة مشروع جديد إلى قاعدة البيانات');
        const newProjectData = {
          ...projectData,
          company_id: companyId,
          project_code: projectData.project_code || `PRJ-${Date.now()}`,
          is_active: true
        };
        
        await projectService.addProject(newProjectData);
        toast.success('تم إضافة المشروع بنجاح إلى قاعدة البيانات');
      }
      
      // Reload projects from database
      await loadProjects();
      setShowForm(false);
      setSelectedProject(null);
    } catch (error: any) {
      console.error('❌ خطأ في حفظ المشروع:', error);
      toast.error(`حدث خطأ في حفظ المشروع: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle project active status (soft delete/activate)
  const handleToggleStatus = async (project: DatabaseProject) => {
    const newStatus = !project.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    
    if (window.confirm(`هل أنت متأكد من ${actionText} هذا المشروع؟`)) {
      try {
        setActionLoading(project.id);
        console.log(`🔄 ${actionText} المشروع في قاعدة البيانات:`, project.id);
        
        await projectService.updateProject(project.id, { 
          is_active: newStatus 
        });
        
        toast.success(`تم ${actionText} المشروع بنجاح`);
        await loadProjects(); // Reload to show updated status
      } catch (error: any) {
        console.error(`❌ خطأ في ${actionText} المشروع:`, error);
        toast.error(`حدث خطأ في ${actionText} المشروع: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Permanent delete (only for inactive projects)
  const handlePermanentDelete = async (project: DatabaseProject) => {
    if (project.is_active) {
      toast.error('لا يمكن حذف مشروع نشط. يرجى إلغاء تفعيله أولاً');
      return;
    }

    if (window.confirm('هل أنت متأكد من الحذف النهائي لهذا المشروع؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        setActionLoading(project.id);
        console.log('🗑️ حذف نهائي للمشروع من قاعدة البيانات:', project.id);
        
        // Permanent delete from database
        const { error } = await projectService.supabase
          .from('projects')
          .delete()
          .eq('id', project.id);

        if (error) {
          throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }

        toast.success('تم حذف المشروع نهائياً من قاعدة البيانات');
        await loadProjects();
      } catch (error: any) {
        console.error('❌ خطأ في الحذف النهائي:', error);
        toast.error(`حدث خطأ في الحذف النهائي: ${error.message}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleRetry = () => {
    loadProjects();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">جاري تحميل المشاريع...</span>
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
              onClick={handleRetry}
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
                  يرجى تطبيق migration الجديد: 20250621140000_employees_projects_setup.sql
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">إدارة المشاريع</h1>
          <p className="text-gray-600">إدارة المشاريع ومراكز التكلفة مع قاعدة البيانات</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
          <button 
            onClick={() => setShowForm(true)}
            disabled={actionLoading === 'save'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 space-x-reverse disabled:opacity-50"
          >
            {actionLoading === 'save' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>إضافة مشروع جديد</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي المشاريع</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">المشاريع النشطة</p>
              <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">إجمالي الميزانيات</p>
              <p className="text-2xl font-bold text-purple-600">{totalBudget.toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">صافي الربح</p>
              <p className="text-2xl font-bold text-emerald-600">{(totalRevenue - totalExpenses).toLocaleString()} ر.س</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
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
                placeholder="البحث في المشاريع..."
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
              <option value="planning">تخطيط</option>
              <option value="active">نشط</option>
              <option value="on_hold">متوقف</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow ${!project.is_active ? 'opacity-75' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className={`p-2 rounded-lg ${project.is_active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Briefcase className={`w-5 h-5 ${project.is_active ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${project.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {project.name}
                    {!project.is_active && <span className="text-xs text-red-500 mr-2">(غير نشط)</span>}
                  </h3>
                  {project.project_code && (
                    <p className="text-xs text-gray-500">كود: {project.project_code}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status || 'planning')}`}>
                {getStatusText(project.status || 'planning')}
              </span>
            </div>

            {project.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
            )}

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <User className="w-4 h-4" />
                  <span>العميل</span>
                </div>
                <span className="font-medium">{getCustomerName(project.customer_id)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ البداية</span>
                </div>
                <span className="font-medium">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                </span>
              </div>

              {project.budget && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>الميزانية</span>
                  </div>
                  <span className="font-medium">{project.budget.toLocaleString()} ر.س</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>المصروفات</span>
                </div>
                <span className="font-medium text-red-600">{(project.expenses || 0).toLocaleString()} ر.س</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>الإيرادات</span>
                </div>
                <span className="font-medium text-green-600">{(project.revenue || 0).toLocaleString()} ر.س</span>
              </div>

              {project.location && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>الموقع</span>
                  </div>
                  <span className="font-medium">{project.location}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">تقدم المشروع</span>
                <span className="font-medium">{calculateProgress(project).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(calculateProgress(project), 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Profit/Loss Indicator */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
              <span className="text-sm font-medium text-gray-600">صافي الربح/الخسارة</span>
              <span className={`text-sm font-bold ${
                (project.revenue || 0) - (project.expenses || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {((project.revenue || 0) - (project.expenses || 0)).toLocaleString()} ر.س
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <button 
                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                  title="عرض تفاصيل المشروع"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEdit(project)}
                  disabled={actionLoading !== null}
                  className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                  title="تعديل المشروع"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(project)}
                  disabled={actionLoading === project.id}
                  className={`p-1 rounded transition-colors ${
                    project.is_active 
                      ? 'text-green-600 hover:text-green-800' 
                      : 'text-gray-400 hover:text-green-600'
                  }`}
                  title={project.is_active ? 'إلغاء تفعيل المشروع' : 'تفعيل المشروع'}
                >
                  {actionLoading === project.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : project.is_active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                </button>
                {!project.is_active && (
                  <button 
                    onClick={() => handlePermanentDelete(project)}
                    disabled={actionLoading !== null}
                    className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                    title="حذف نهائي (للمشاريع غير النشطة فقط)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                عرض التفاصيل
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">لا توجد مشاريع</h4>
          <p className="text-gray-500 mb-4">ابدأ بإضافة مشروعك الأول</p>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة مشروع جديد
          </button>
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        project={selectedProject}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedProject(null);
        }}
        onSave={handleSave}
        loading={actionLoading === 'save'}
      />
    </div>
  );
};

export default ProjectList;