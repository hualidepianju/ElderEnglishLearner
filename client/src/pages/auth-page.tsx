import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(3, "用户名至少需要3个字符"),
  password: z.string().min(6, "密码至少需要6个字符"),
});

const registerSchema = z.object({
  username: z.string().min(3, "用户名至少需要3个字符"),
  nickname: z.string().min(2, "昵称至少需要2个字符"),
  password: z.string().min(6, "密码至少需要6个字符"),
  confirmPassword: z.string().min(6, "密码至少需要6个字符"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密码不匹配",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { 
    isAuthenticated,
    isPendingLogin,
    isPendingRegister,
    errorMessage,
    login,
    register
  } = useAuth();
  const [, setLocation] = useLocation();

  // 使用useEffect处理重定向，避免React渲染中的setState警告
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      nickname: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    console.log("Login form submitted with values:", values);
    await login(values.username, values.password);
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    console.log("Register form submitted with values:", values);
    await register(values.username, values.nickname, values.password);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      {/* 左侧表单 */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md py-6">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20">
              <span className="material-icons text-white text-3xl">school</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">乐学英语</h1>
            <p className="text-neutral-500 text-lg">为长者定制的英语学习平台</p>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 p-1.5 bg-neutral-100 rounded-xl">
              <TabsTrigger 
                value="login" 
                className={cn(
                  "rounded-lg text-base py-3 transition-all",
                  activeTab === "login" ? "shadow-md" : "hover:text-primary"
                )}
              >
                登录账号
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className={cn(
                  "rounded-lg text-base py-3 transition-all",
                  activeTab === "register" ? "shadow-md" : "hover:text-primary"
                )}
              >
                新用户注册
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-none shadow-xl shadow-primary/5 rounded-2xl">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-bold text-center">欢迎回来</CardTitle>
                  <CardDescription className="text-center text-base">
                    请输入您的账号密码登录系统
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">用户名</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-neutral-400">
                                <span className="material-icons text-xl">account_circle</span>
                              </span>
                              <FormControl>
                                <Input 
                                  placeholder="请输入您的用户名" 
                                  className="pl-10 py-6 text-base rounded-xl" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-medium">密码</FormLabel>
                              <Button variant="link" className="p-0 h-auto text-sm">
                                忘记密码?
                              </Button>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-neutral-400">
                                <span className="material-icons text-xl">lock</span>
                              </span>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="请输入您的密码" 
                                  className="pl-10 py-6 text-base rounded-xl"
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {errorMessage && activeTab === "login" && (
                        <div className="p-4 text-base rounded-xl bg-destructive/10 text-destructive flex items-start">
                          <span className="material-icons mr-2 text-destructive">error_outline</span>
                          <span>{errorMessage}</span>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-lg py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                        disabled={isPendingLogin}
                      >
                        {isPendingLogin ? 
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            登录中...
                          </> 
                          : "登录账号"
                        }
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center py-6">
                  <p className="text-base text-neutral-600">
                    还没有账号？
                    <Button variant="link" onClick={() => setActiveTab("register")} className="p-0 h-auto ml-1 text-base">
                      立即注册
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-none shadow-xl shadow-primary/5 rounded-2xl">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-bold text-center">创建新账号</CardTitle>
                  <CardDescription className="text-center text-base">
                    注册即可开始您的英语学习之旅
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">用户名</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-neutral-400">
                                <span className="material-icons text-xl">account_circle</span>
                              </span>
                              <FormControl>
                                <Input 
                                  placeholder="请创建您的用户名" 
                                  className="pl-10 py-6 text-base rounded-xl" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">昵称</FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-neutral-400">
                                <span className="material-icons text-xl">person</span>
                              </span>
                              <FormControl>
                                <Input 
                                  placeholder="请输入您的昵称" 
                                  className="pl-10 py-6 text-base rounded-xl" 
                                  {...field} 
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">密码</FormLabel>
                              <div className="relative">
                                <span className="absolute left-3 top-3 text-neutral-400">
                                  <span className="material-icons text-xl">lock</span>
                                </span>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="请创建密码" 
                                    className="pl-10 py-6 text-base rounded-xl" 
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">确认密码</FormLabel>
                              <div className="relative">
                                <span className="absolute left-3 top-3 text-neutral-400">
                                  <span className="material-icons text-xl">lock_outline</span>
                                </span>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="重复输入密码" 
                                    className="pl-10 py-6 text-base rounded-xl" 
                                    {...field} 
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {errorMessage && activeTab === "register" && (
                        <div className="p-4 text-base rounded-xl bg-destructive/10 text-destructive flex items-start">
                          <span className="material-icons mr-2 text-destructive">error_outline</span>
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-lg py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                        disabled={isPendingRegister}
                      >
                        {isPendingRegister ? 
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            注册中...
                          </> 
                          : "创建账号"
                        }
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center py-6">
                  <p className="text-base text-neutral-600">
                    已有账号？
                    <Button variant="link" onClick={() => setActiveTab("login")} className="p-0 h-auto ml-1 text-base">
                      立即登录
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 右侧介绍与图片 */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/90 to-primary hidden md:flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
        {/* 装饰性元素 */}
        <div className="absolute w-96 h-96 rounded-full bg-white/10 -top-20 -right-20 blur-2xl"></div>
        <div className="absolute w-60 h-60 rounded-full bg-white/5 bottom-10 -left-20 blur-xl"></div>
        
        <div className="relative z-10 max-w-lg px-6 py-12">
          <div className="mb-12">
            <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">专为老年人设计</span>
            <h2 className="text-4xl font-bold mb-6 leading-tight">以简单友好的方式<br />开启您的英语学习之旅</h2>
            <p className="text-lg opacity-90 mb-8">
              我们精心设计了适合老年人使用的英语学习平台，大字体、简单操作、实用内容，让您轻松畅享学习乐趣。
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <span className="material-icons">school</span>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">日常实用会话</h3>
                <p className="opacity-80">学习购物、旅行、看病等实用场景对话</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <span className="material-icons">record_voice_over</span>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">语音互动练习</h3>
                <p className="opacity-80">通过语音练习提高发音和听力能力</p>
              </div>
            </div>
            
            <div className="flex items-start p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 flex-shrink-0 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <span className="material-icons">forum</span>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">社区互动学习</h3>
                <p className="opacity-80">认识志同道合的学习伙伴，共同进步</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}