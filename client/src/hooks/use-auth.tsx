import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
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

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  nickname: string;
  password: string;
}

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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingLogin, setIsPendingLogin] = useState(false);
  const [isPendingRegister, setIsPendingRegister] = useState(false);
  const [isPendingLogout, setIsPendingLogout] = useState(false);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if user is already logged in
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setUser(null);
        return;
      }
      
      if (!response.ok) {
        console.error('Failed to fetch user data');
        setUser(null);
        return;
      }
      
      const userData = await response.json();
      console.log("获取用户信息成功:", userData);
      setUser(userData);
      
      // Apply font size preference
      if (userData?.preferences?.fontSize) {
        document.documentElement.dataset.fontSize = userData.preferences.fontSize;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Check auth status on initial render
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsPendingLogin(true);
      setErrorMessage(null);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorMsg = response.status === 401 
          ? '用户名或密码错误' 
          : '登录失败，请稍后再试';
        throw new Error(errorMsg);
      }
      
      const userData = await response.json();
      console.log("登录成功，获取用户数据:", userData);
      setUser(userData);
      
      toast({
        title: '登录成功',
        description: `欢迎回来，${userData.nickname}！`
      });
      
      // 登录成功后立即再次检查认证状态，确保会话已经建立
      setTimeout(() => checkAuth(), 500);
      
      navigate('/');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
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

  // Register function
  const register = async (username: string, nickname: string, password: string): Promise<boolean> => {
    try {
      setIsPendingRegister(true);
      setErrorMessage(null);
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
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
        throw new Error('注册失败，用户名可能已存在');
      }
      
      const userData = await response.json();
      console.log("注册成功，获取用户数据:", userData);
      setUser(userData);
      
      toast({
        title: '注册成功',
        description: '您的账号已创建成功！'
      });
      
      // 注册成功后立即再次检查认证状态，确保会话已经建立
      setTimeout(() => checkAuth(), 500);
      
      navigate('/');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败';
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

  // Logout function
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

  // Update user preferences
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

  // Update font size based on user preferences
  const updateFontSize = useCallback(() => {
    if (user?.preferences?.fontSize) {
      document.documentElement.dataset.fontSize = user.preferences.fontSize;
    }
  }, [user?.preferences?.fontSize]);

  // Context value
  const value: AuthContextType = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}