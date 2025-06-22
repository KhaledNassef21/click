import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission }) => {
  const { state, hasPermission } = useApp();

  // Check if user has the required permission
  if (!hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {state.currentLanguage === 'ar' ? 'غير مصرح' : 'Access Denied'}
          </h2>
          <p className="text-gray-600 mb-6">
            {state.currentLanguage === 'ar' 
              ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة'
              : 'You do not have permission to access this page'
            }
          </p>
          <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>
              {state.currentLanguage === 'ar' 
                ? `الصلاحية المطلوبة: ${permission}`
                : `Required permission: ${permission}`
              }
            </span>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {state.currentLanguage === 'ar' ? 'العودة' : 'Go Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;