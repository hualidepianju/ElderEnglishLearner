import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Preferences {
  fontSize: "small" | "medium" | "large";
  theme: "light" | "dark";
  language: "zh" | "en";
}

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  isAdmin: boolean;
  preferences: Preferences;
  streak: number;
}

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isPendingLogin: boolean;
  isPendingRegister: boolean;
  isPendingLogout: boolean;
  errorMessage: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, nickname: string, password: string) => Promise<boolean>;
  updatePreferences: (preferences: Partial<Preferences>) => Promise<void>;
  updateFontSize: () => void;
};

// 创建认证上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 认证提供者组件
export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });
  
  const [isPendingLogin, setIsPendingLogin] = useState(false);
  const [isPendingRegister, setIsPendingRegister] = useState(false);
  const [isPendingLogout, setIsPendingLogout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { toast } = useToast();
  const [, navigate] = useLocation();

  // 检查用户是否已登录
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setAuthState({ user: null, isLoading: false, error: null });
        return;
      }
      
      if (!response.ok) {
        throw new Error('获取用户信息失败');
      }
      
      const user = await response.json();
      setAuthState({ user, isLoading: false, error: null });
      
      // 应用用户字体大小偏好
      if (user?.preferences?.fontSize) {
        document.documentElement.dataset.fontSize = user.preferences.fontSize;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('未知错误') 
      }));
    }
  }, []);
  
  // 初始化检查用户登录状态
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 登录方法
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsPendingLogin(true);
      setErrorMessage(null);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('用户名或密码错误');
        }
        throw new Error('登录失败，请稍后再试');
      }
      
      const user = await response.json();
      
      setAuthState({ user, isLoading: false, error: null });
      
      toast({
        title: '登录成功',
        description: `欢迎回来，${user.nickname}！`
      });
      
      navigate('/');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败，请稍后再试';
      setErrorMessage(message);
      
      toast({
        title: '登录失败',
        description: message,
        variant: 'destructive'
      });
      
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('未知错误') 
      }));
      
      return false;
    } finally {
      setIsPendingLogin(false);
    }
  };

  // 注册方法
  const register = async (username: string, nickname: string, password: string): Promise<boolean> => {
    try {
      setIsPendingRegister(true);
      setErrorMessage(null);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          nickname,
          password,
          preferences: {
            fontSize: 'medium',
            theme: 'light',
            language: 'zh'
          }
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '注册失败，用户名可能已存在');
      }
      
      const user = await response.json();
      
      setAuthState({ user, isLoading: false, error: null });
      
      toast({
        title: '注册成功',
        description: '您的账号已创建成功！'
      });
      
      navigate('/');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败，请稍后再试';
      setErrorMessage(message);
      
      toast({
        title: '注册失败',
        description: message,
        variant: 'destructive'
      });
      
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error : new Error('未知错误') 
      }));
      
      return false;
    } finally {
      setIsPendingRegister(false);
    }
  };

  // 登出方法
  const logout = async (): Promise<void> => {
    try {
      setIsPendingLogout(true);
      
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setAuthState({ user: null, isLoading: false, error: null });
      
      toast({
        title: '已退出登录'
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        title: '退出失败',
        description: '请稍后再试',
        variant: 'destructive'
      });
    } finally {
      setIsPendingLogout(false);
    }
  };

  // 更新用户设置
  const updatePreferences = async (preferences: Partial<Preferences>): Promise<void> => {
    if (!authState.user) {
      toast({
        title: '更新失败',
        description: '您需要先登录',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const updatedPreferences = { ...authState.user.preferences, ...preferences };
      
      const response = await fetch(`/api/users/${authState.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: updatedPreferences
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('更新设置失败');
      }
      
      const updatedUser = await response.json();
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      toast({
        title: '设置已更新',
        description: '您的偏好设置已成功更新'
      });
      
      if (preferences.fontSize) {
        document.documentElement.dataset.fontSize = preferences.fontSize;
      }
    } catch (error) {
      toast({
        title: '更新失败',
        description: '无法更新设置，请稍后再试',
        variant: 'destructive'
      });
    }
  };

  // 更新字体大小
  const updateFontSize = useCallback(() => {
    if (authState.user?.preferences?.fontSize) {
      document.documentElement.dataset.fontSize = authState.user.preferences.fontSize;
    }
  }, [authState.user?.preferences?.fontSize]);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: !!authState.user,
        isAdmin: !!authState.user?.isAdmin,
        isLoading: authState.isLoading,
        isPendingLogin,
        isPendingRegister,
        isPendingLogout,
        errorMessage,
        login,
        logout,
        register,
        updatePreferences,
        updateFontSize
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的自定义钩子
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 SimpleAuthProvider 内部使用');
  }
  return context;
}