import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// 用户偏好类型
interface Preferences {
  fontSize: "small" | "medium" | "large";
  theme: "light" | "dark";
  language: "zh" | "en";
}

// 用户类型
interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  isAdmin: boolean;
  preferences: Preferences;
  streak: number;
}

// 认证上下文类型
interface AuthContextType {
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
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingLogin, setIsPendingLogin] = useState(false);
  const [isPendingRegister, setIsPendingRegister] = useState(false);
  const [isPendingLogout, setIsPendingLogout] = useState(false);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // 检查用户是否已登录
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('获取用户信息失败');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // 应用用户字体大小偏好
      if (userData?.preferences?.fontSize) {
        document.documentElement.dataset.fontSize = userData.preferences.fontSize;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
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
      
      const userData = await response.json();
      setUser(userData);
      
      toast({
        title: '登录成功',
        description: `欢迎回来，${userData.nickname}！`
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
      
      const userData = await response.json();
      setUser(userData);
      
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
      
      setUser(null);
      
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
    if (!user) {
      toast({
        title: '更新失败',
        description: '您需要先登录',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const updatedPreferences = { ...user.preferences, ...preferences };
      
      const response = await fetch(`/api/users/${user.id}`, {
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
      setUser(updatedUser);
      
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
    if (user?.preferences?.fontSize) {
      document.documentElement.dataset.fontSize = user.preferences.fontSize;
    }
  }, [user?.preferences?.fontSize]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.isAdmin,
        isLoading,
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
};

// 使用认证上下文的自定义钩子
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};