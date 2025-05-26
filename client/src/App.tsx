import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Learning from "@/pages/Learning";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import LessonDetail from "@/pages/lesson/LessonDetail";
import ChatRoom from "@/pages/community/ChatRoom";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuthStore } from "./store/auth";
import { Toaster } from "@/components/ui/toaster";

function App() {
  // 从 store 获取 checkAuth 方法
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  // 初始化时检查用户认证状态
  useEffect(() => {
    // 应用加载时检查用户是否已认证
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Toaster />
      <Switch>
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/learning" component={Learning} />
        <ProtectedRoute path="/learning/:id" component={LessonDetail} />
        <ProtectedRoute path="/community" component={Community} />
        <ProtectedRoute path="/chatroom/:id" component={ChatRoom} />
        <ProtectedRoute path="/profile" component={Profile} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;
