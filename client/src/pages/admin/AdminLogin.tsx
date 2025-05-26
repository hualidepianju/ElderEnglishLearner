import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthUserContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "请输入用户名和密码",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        setLocation("/admin/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    setLocation("/profile");
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackClick}
              className="mr-2"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <CardTitle className="text-2xl">管理员登录</CardTitle>
          </div>
          <CardDescription>
            请输入管理员账号和密码以访问内容管理系统
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-lg font-medium">
                用户名
              </label>
              <Input
                id="username"
                type="text"
                placeholder="输入管理员用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-lg font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="输入管理员密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg h-12"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="material-icons animate-spin mr-2">refresh</span>
              ) : (
                <span className="material-icons mr-2">admin_panel_settings</span>
              )}
              登录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
