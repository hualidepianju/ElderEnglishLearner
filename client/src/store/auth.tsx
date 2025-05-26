import { create } from 'zustand';

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

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isPendingLogin: boolean;
  isPendingRegister: boolean;
  isPendingLogout: boolean;
  errorMessage: string | null;
  isInitialized: boolean;

  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, nickname: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: Partial<Preferences>) => Promise<void>;
  updateFontSize: () => void;
}

// For simpler management without context issues
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,
  isPendingLogin: false,
  isPendingRegister: false,
  isPendingLogout: false,
  errorMessage: null,
  isInitialized: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }
      
      if (!response.ok) {
        console.error('Failed to fetch user data');
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }
      
      const userData = await response.json();
      
      set({ user: userData, isLoading: false, isInitialized: true });
      
      // Apply font size preference
      if (userData?.preferences?.fontSize) {
        document.documentElement.dataset.fontSize = userData.preferences.fontSize;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  login: async (username: string, password: string) => {
    try {
      set({ isPendingLogin: true, errorMessage: null });
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorMsg = response.status === 401 
          ? '用户名或密码错误' 
          : '登录失败，请稍后再试';
        set({ errorMessage: errorMsg, isPendingLogin: false });
        return false;
      }
      
      const userData = await response.json();
      set({ user: userData, isPendingLogin: false });
      
      // Apply font size preference
      if (userData?.preferences?.fontSize) {
        document.documentElement.dataset.fontSize = userData.preferences.fontSize;
      }
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      set({ errorMessage: message, isPendingLogin: false });
      return false;
    }
  },

  register: async (username: string, nickname: string, password: string) => {
    try {
      set({ isPendingRegister: true, errorMessage: null });
      
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
        const errorMsg = '注册失败，用户名可能已存在';
        set({ errorMessage: errorMsg, isPendingRegister: false });
        return false;
      }
      
      const userData = await response.json();
      set({ user: userData, isPendingRegister: false });
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败';
      set({ errorMessage: message, isPendingRegister: false });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ isPendingLogout: true });
      
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      set({ user: null, isPendingLogout: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isPendingLogout: false });
    }
  },

  updatePreferences: async (preferences: Partial<Preferences>) => {
    const { user } = get();
    
    if (!user) {
      console.error('Cannot update preferences - user not logged in');
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
        throw new Error('Failed to update preferences');
      }
      
      const updatedUser = await response.json();
      set({ user: updatedUser });
      
      if (preferences.fontSize) {
        document.documentElement.dataset.fontSize = preferences.fontSize;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  },

  updateFontSize: () => {
    const { user } = get();
    if (user?.preferences?.fontSize) {
      document.documentElement.dataset.fontSize = user.preferences.fontSize;
    }
  }
}));