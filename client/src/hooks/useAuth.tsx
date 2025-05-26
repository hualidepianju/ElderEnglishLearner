import { useAuthStore } from '@/store/auth';

/**
 * 认证钩子，提供所有与用户认证相关的状态和方法
 */
export function useAuth() {
  const {
    user,
    isLoading,
    isPendingLogin,
    isPendingRegister,
    isPendingLogout,
    errorMessage,
    login,
    register,
    logout,
    updatePreferences,
    updateFontSize
  } = useAuthStore();

  // 计算衍生状态
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user.isAdmin;

  return {
    // 用户数据
    user,
    
    // 认证状态
    isAuthenticated,
    isAdmin,
    isLoading,
    
    // 操作状态
    isPendingLogin,
    isPendingRegister,
    isPendingLogout,
    errorMessage,
    
    // 认证方法
    login,
    register,
    logout,
    
    // 偏好设置方法
    updatePreferences,
    updateFontSize
  };
}