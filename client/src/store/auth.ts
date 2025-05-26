import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';

interface Preferences {
  fontSize: "small" | "medium" | "large";
  theme: "light" | "dark";
  language: "zh" | "en";
}

interface User {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  isAdmin: boolean;
  preferences: Preferences;
  streak: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isPendingLogin: boolean;
  isPendingRegister: boolean;
  isPendingLogout: boolean;
  errorMessage: string | null;
  
  // 验证用户是否已登录
  checkAuth: () => Promise<void>;
  
  // 登录方法
  login: (username: string, password: string) => Promise<boolean>;
  
  // 注册方法
  register: (username: string, nickname: string, password: string) => Promise<boolean>;
  
  // 登出方法
  logout: () => Promise<void>;
  
  // 更新用户偏好设置
  updatePreferences: (preferences: Partial<Preferences>) => Promise<void>;
  
  // 循环字体大小设置
  updateFontSize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isPendingLogin: false,
  isPendingRegister: false,
  isPendingLogout: false,
  errorMessage: null,
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // 使用普通fetch代替apiRequest，因为apiRequest在401时会抛出异常
      const response = await fetch('/api/user', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      set({ user: null, isLoading: false });
    }
  },
  
  login: async (username: string, password: string) => {
    set({ isPendingLogin: true, errorMessage: null });
    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isPendingLogin: false });
        console.log("登录成功, 用户信息:", userData);
        return true;
      } else {
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          console.log("登录响应错误:", errorData);
          set({ 
            errorMessage: errorData.message || '登录失败，请检查用户名和密码', 
            isPendingLogin: false 
          });
        } catch (parseError) {
          console.log("解析错误响应失败:", parseError, "状态码:", response.status);
          set({ 
            errorMessage: `登录失败 (${response.status})，请检查用户名和密码`, 
            isPendingLogin: false 
          });
        }
        return false;
      }
    } catch (error) {
      console.error('登录网络错误:', error);
      set({ 
        errorMessage: '登录失败，网络错误或服务器无响应', 
        isPendingLogin: false 
      });
      return false;
    }
  },
  
  register: async (username: string, nickname: string, password: string) => {
    set({ isPendingRegister: true, errorMessage: null });
    try {
      const response = await apiRequest('POST', '/api/register', { 
        username, 
        nickname, 
        password,
        avatar: null,
        isAdmin: false,
        preferences: {
          fontSize: "medium",
          theme: "light",
          language: "zh"
        },
        streak: 0
      });
      
      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isPendingRegister: false });
        return true;
      } else {
        const error = await response.json();
        set({ 
          errorMessage: error.message || '注册失败，该用户名可能已存在', 
          isPendingRegister: false 
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        errorMessage: '注册失败，请稍后再试', 
        isPendingRegister: false 
      });
      return false;
    }
  },
  
  logout: async () => {
    set({ isPendingLogout: true });
    try {
      await apiRequest('POST', '/api/logout');
      set({ 
        user: null, 
        isPendingLogout: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isPendingLogout: false });
    }
  },
  
  updatePreferences: async (preferences: Partial<Preferences>) => {
    const { user } = get();
    if (!user) return;
    
    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };
    
    try {
      const response = await apiRequest('PUT', `/api/users/${user.id}`, {
        preferences: updatedPreferences
      });
      if (response.ok) {
        const updatedUser = {
          ...user,
          preferences: updatedPreferences
        };
        set({ user: updatedUser });
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  },
  
  updateFontSize: () => {
    const { user } = get();
    if (!user) return;
    
    // 循环切换字体大小: small -> medium -> large -> small
    const currentSize = user.preferences.fontSize;
    let newSize: "small" | "medium" | "large";
    
    if (currentSize === "small") {
      newSize = "medium";
    } else if (currentSize === "medium") {
      newSize = "large";
    } else {
      newSize = "small";
    }
    
    get().updatePreferences({ fontSize: newSize });
  }
}));