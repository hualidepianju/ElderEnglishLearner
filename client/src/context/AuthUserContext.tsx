import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// User interface definitions
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

// Combined context interface
interface AuthUserContextType {
  // Auth state
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
  
  // Auth actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, nickname: string, password: string) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  
  // User preference actions
  updatePreferences: (preferences: Partial<Preferences>) => Promise<void>;
  updateFontSize: () => void;
}

// 创建一个默认值，防止在 Provider 外部使用时出错
const defaultContextValue: AuthUserContextType = {
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  checkAuth: async () => {},
  updatePreferences: async () => {},
  updateFontSize: () => {}
};

const AuthUserContext = createContext<AuthUserContextType>(defaultContextValue);

export function AuthUserProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Computed auth states
  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;

  // Load user on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth methods
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("正在检查登录状态...");
      const response = await fetch("/api/user", {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log("用户已登录:", userData);
        setUser(userData);
        
        // Apply font size setting if available
        if (userData?.preferences?.fontSize) {
          document.documentElement.dataset.fontSize = userData.preferences.fontSize;
        }
        
        // Apply theme setting if available
        if (userData?.preferences?.theme) {
          document.documentElement.dataset.theme = userData.preferences.theme;
          if (userData.preferences.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } else {
        console.log("用户未登录或会话已过期，状态码:", response.status);
        // 明确设置为null，确保状态一致
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // 出错时也应该清除用户状态
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Login starting with:", username, password);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      console.log("Login response status:", response.status, response.statusText);
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Login successful, user data:", userData);
        setUser(userData);
        
        // Apply font size setting
        if (userData?.preferences?.fontSize) {
          document.documentElement.dataset.fontSize = userData.preferences.fontSize;
        }
        
        toast({
          title: "登录成功",
          description: `欢迎回来，${userData.nickname}！`,
        });
        return true;
      } else {
        // 处理401错误
        if (response.status === 401) {
          console.log("Login failed with 401 status");
          toast({
            title: "登录失败",
            description: "用户名或密码错误",
            variant: "destructive",
          });
          return false;
        }

        // 尝试解析错误信息
        try {
          const errorText = await response.text();
          console.log("Error response text:", errorText);
          
          let error;
          try {
            error = JSON.parse(errorText);
          } catch {
            error = { message: errorText };
          }
          
          toast({
            title: "登录失败",
            description: error.message || "用户名或密码错误",
            variant: "destructive",
          });
        } catch (parseErr) {
          console.error("Error parsing error response:", parseErr);
          toast({
            title: "登录失败",
            description: "用户名或密码错误",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: "网络错误，请稍后再试",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setUser(null);
      setLocation("/");
      toast({
        title: "已退出登录",
      });
    } catch (error) {
      toast({
        title: "退出失败",
        description: "请稍后再试",
        variant: "destructive",
      });
    }
  }, [setLocation, toast]);

  const register = useCallback(async (username: string, nickname: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Register starting with:", username, nickname, password);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          nickname,
          password,
          preferences: {
            fontSize: "medium",
            theme: "light",
            language: "zh"
          }
        }),
        credentials: 'include'
      });

      console.log("Register response status:", response.status, response.statusText);
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Register successful, user data:", userData);
        // 注册成功后自动登录用户
        setUser(userData);
        toast({
          title: "注册成功",
          description: "您的账号已创建成功！",
        });
        return true;
      } else {
        // 处理特定状态码
        if (response.status === 400) {
          console.log("Register failed with 400 status");
          toast({
            title: "注册失败",
            description: "用户名已存在",
            variant: "destructive",
          });
          return false;
        }
        
        // 尝试解析错误信息
        try {
          const errorText = await response.text();
          console.log("Error response text:", errorText);
          
          let error;
          try {
            error = JSON.parse(errorText);
          } catch {
            error = { message: errorText };
          }
          
          toast({
            title: "注册失败",
            description: error.message || "注册失败，请稍后再试",
            variant: "destructive",
          });
        } catch (parseErr) {
          console.error("Error parsing error response:", parseErr);
          toast({
            title: "注册失败",
            description: "注册失败，请稍后再试",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      toast({
        title: "注册失败",
        description: "网络错误，请稍后再试",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // User preferences methods
  const updatePreferences = useCallback(async (preferences: Partial<Preferences>) => {
    if (!user) return;

    try {
      const updatedPreferences = { ...user.preferences, ...preferences };
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: updatedPreferences,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Update font size if it was changed
        if (preferences.fontSize) {
          document.documentElement.dataset.fontSize = preferences.fontSize;
        }
        
        // Update theme if it was changed
        if (preferences.theme) {
          document.documentElement.dataset.theme = preferences.theme;
          if (preferences.theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }

        toast({
          title: "设置已更新",
          description: "您的偏好设置已成功更新",
        });
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast({
        title: "更新失败",
        description: "无法更新设置，请稍后再试",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateFontSize = useCallback(() => {
    if (user?.preferences?.fontSize) {
      document.documentElement.dataset.fontSize = user.preferences.fontSize;
    }
  }, [user?.preferences?.fontSize]);

  return (
    <AuthUserContext.Provider value={{ 
      isAuthenticated, 
      isAdmin,
      isLoading,
      user, 
      login, 
      logout, 
      register, 
      checkAuth,
      updatePreferences,
      updateFontSize
    }}>
      {children}
    </AuthUserContext.Provider>
  );
}

// Custom hooks to use our context
export function useAuthUser() {
  return useContext(AuthUserContext);
}

// Backward compatibility hooks
export function useAuth() {
  const context = useAuthUser();
  return {
    isAuthenticated: context.isAuthenticated,
    isAdmin: context.isAdmin,
    isLoading: context.isLoading,
    user: context.user,
    login: context.login,
    logout: context.logout,
    register: context.register,
    checkAuth: context.checkAuth
  };
}

export function useUser() {
  const context = useAuthUser();
  return {
    user: context.user,
    updatePreferences: context.updatePreferences,
    updateFontSize: context.updateFontSize
  };
}