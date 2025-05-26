import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

// 创建认证上下文
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// 认证提供者组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的自定义钩子
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext 必须在 AuthProvider 内部使用");
  }
  return context;
}