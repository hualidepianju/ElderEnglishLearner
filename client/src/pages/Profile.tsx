import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AvatarSelector from "@/components/AvatarSelector";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { 
    user, 
    logout, 
    updatePreferences,
    isAuthenticated
  } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // 确保在组件加载时检查用户登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      // 如果用户未登录，可以重定向到登录页面
      // 或者保持当前页面显示"请登录"提示
    }
  }, [isAuthenticated]);
  
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleAvatarChange = () => {
    setIsAvatarSelectorOpen(true);
  };

  const handleSelectAvatar = async (avatarUrl: string) => {
    if (!user) return;
    
    try {
      setIsUpdatingAvatar(true);
      // 调用API更新用户头像
      await apiRequest("PUT", `/api/users/${user.id}`, {
        avatar: avatarUrl
      });
      
      // 更新本地用户状态
      window.location.reload(); // 临时解决方案，实际应该通过状态更新
      
      toast({
        title: "头像更新成功",
        description: "您的个人头像已成功更新",
      });
    } catch (error) {
      console.error("更新头像失败:", error);
      toast({
        title: "头像更新失败",
        description: "更新头像时发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleNicknameSubmit = () => {
    if (!newNickname.trim()) {
      toast({
        title: "昵称不能为空",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be an API call
    toast({
      title: "昵称修改成功",
      description: `昵称已从 "${user?.nickname}" 修改为 "${newNickname}"`,
    });
    setIsNicknameDialogOpen(false);
    setNewNickname("");
  };

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "所有密码字段都必须填写",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码必须相同",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be an API call
    toast({
      title: "密码修改成功",
      description: "您的密码已被更新",
    });
    setIsPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleThemeToggle = (checked: boolean) => {
    updatePreferences({ theme: checked ? "dark" : "light" });
  };

  const handleLogout = async () => {
    setIsLogoutDialogOpen(true);
  };
  
  const confirmLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
  };

  const handleFontSizeChange = (size: "small" | "medium" | "large") => {
    updatePreferences({ fontSize: size });
  };

  const handleAdminClick = () => {
    if (user?.isAdmin) {
      setLocation("/admin/dashboard");
    } else {
      setLocation("/admin/login");
    }
  };

  if (!user) {
    return (
      <Layout title="个人设置">
        <div className="p-4 text-center">
          <p className="mb-4">请登录后查看个人设置</p>
          <Button onClick={() => setLocation("/")}>返回首页</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="个人设置">
      <section className="p-4">
        <h2 className="text-2xl font-bold mb-6">个人设置</h2>
        
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          {/* 顶部带有渐变色的区域 */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                    <div className="w-full h-full bg-neutral-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-white">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.nickname} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 w-full h-full flex items-center justify-center">
                          <span className="material-icons text-primary/80 text-5xl">person</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={handleAvatarChange} 
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-icons">photo_camera</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* 用户信息部分 (需要留出头像的空间) */}
          <div className="pt-20 px-4 pb-5 text-center">
            <h3 className="font-bold text-2xl mb-1">{user.nickname}</h3>
            
            <div className="flex items-center justify-center mb-5">
              <div className="bg-success/10 text-success rounded-full px-4 py-1 flex items-center">
                <span className="material-icons text-sm mr-1">celebration</span>
                <span className="font-medium">已学习 {user.streak} 天</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 px-4">
              <Button 
                variant="outline"
                className="flex-1 border border-primary text-primary hover:bg-primary/10 rounded-lg py-2.5 font-semibold"
                onClick={() => setIsNicknameDialogOpen(true)}
              >
                <span className="material-icons mr-2">edit</span>
                修改昵称
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border border-primary text-primary hover:bg-primary/10 rounded-lg py-2.5 font-semibold"
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                <span className="material-icons mr-2">lock</span>
                修改密码
              </Button>
            </div>
          </div>
        </div>
        
        {/* Account Settings */}
        <h3 className="text-xl font-bold mb-3">账号设置</h3>
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-neutral-200">
            <button 
              className="w-full flex items-center justify-between p-4"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              <div className="flex items-center">
                <span className="material-icons text-neutral-800 mr-3">lock</span>
                <span>修改密码</span>
              </div>
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
          <div className="border-b border-neutral-200">
            <button className="w-full flex items-center justify-between p-4">
              <div className="flex items-center">
                <span className="material-icons text-neutral-800 mr-3">notifications</span>
                <span>通知设置</span>
              </div>
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
          <div>
            <button className="w-full flex items-center justify-between p-4">
              <div className="flex items-center">
                <span className="material-icons text-neutral-800 mr-3">help</span>
                <span>帮助中心</span>
              </div>
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
        
        {/* App Settings */}
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="material-icons text-primary mr-2">settings</span>
          应用设置
        </h3>
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          {/* 字体大小设置 */}
          <div className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-500 rounded-full p-2 mr-3">
                    <span className="material-icons">format_size</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">字体大小</h4>
                    <p className="text-xs text-neutral-500">调整应用内文字大小，适合您的阅读习惯</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button 
                  className={`py-3 px-2 rounded-xl flex flex-col items-center ${
                    user.preferences.fontSize === 'small' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-neutral-100 border border-neutral-200'
                  }`}
                  onClick={() => handleFontSizeChange("small")}
                >
                  <span className="material-icons text-sm mb-1">text_fields</span>
                  <span className="text-xs font-medium">小号</span>
                </button>
                <button 
                  className={`py-3 px-2 rounded-xl flex flex-col items-center ${
                    user.preferences.fontSize === 'medium' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-neutral-100 border border-neutral-200'
                  }`}
                  onClick={() => handleFontSizeChange("medium")}
                >
                  <span className="material-icons mb-1">text_fields</span>
                  <span className="text-xs font-medium">中号</span>
                </button>
                <button 
                  className={`py-3 px-2 rounded-xl flex flex-col items-center ${
                    user.preferences.fontSize === 'large' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-neutral-100 border border-neutral-200'
                  }`}
                  onClick={() => handleFontSizeChange("large")}
                >
                  <span className="material-icons text-lg mb-1">text_fields</span>
                  <span className="text-xs font-medium">大号</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* 夜间模式设置 */}
          <div className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="bg-purple-100 text-purple-500 rounded-full p-2 mr-3">
                  <span className="material-icons">dark_mode</span>
                </div>
                <div>
                  <h4 className="font-semibold">夜间模式</h4>
                  <p className="text-xs text-neutral-500">在黑暗环境中使用深色主题保护眼睛</p>
                </div>
              </div>
              <Switch 
                checked={user.preferences.theme === "dark"}
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          {/* 界面语言设置 */}
          <div className="hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="bg-green-100 text-green-500 rounded-full p-2 mr-3">
                  <span className="material-icons">language</span>
                </div>
                <div>
                  <h4 className="font-semibold">界面语言</h4>
                  <p className="text-xs text-neutral-500">选择应用显示语言</p>
                </div>
              </div>
              <div className="flex items-center bg-neutral-100 rounded-lg px-3 py-2">
                <span className="font-medium mr-1">简体中文</span>
                <span className="material-icons text-sm">expand_more</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Admin Section (visible only for admin users) */}
        {user.isAdmin && (
          <>
            <h3 className="text-xl font-bold mb-3">管理员功能</h3>
            <div className="bg-white rounded-xl shadow-md mb-6">
              <button 
                className="w-full flex items-center justify-between p-4"
                onClick={handleAdminClick}
              >
                <div className="flex items-center">
                  <span className="material-icons text-neutral-800 mr-3">admin_panel_settings</span>
                  <span>管理后台</span>
                </div>
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
          </>
        )}
        
        <Button 
          className="w-full bg-error/90 hover:bg-error text-white rounded-lg py-3 font-semibold text-lg flex items-center justify-center"
          onClick={handleLogout}
        >
          <span className="material-icons mr-2">logout</span>
          退出登录
        </Button>
      </section>

      {/* Nickname Dialog */}
      <Dialog open={isNicknameDialogOpen} onOpenChange={setIsNicknameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改昵称</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="输入新昵称"
              className="mb-4"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNicknameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleNicknameSubmit}>
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="当前密码"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="新密码"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="确认新密码"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handlePasswordSubmit}>
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 头像选择器 */}
      <AvatarSelector
        open={isAvatarSelectorOpen}
        onOpenChange={setIsAvatarSelectorOpen}
        onSelectAvatar={handleSelectAvatar}
        currentAvatar={user.avatar || undefined}
      />

      {/* 退出登录确认对话框 */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认退出</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center">您确定要退出登录吗？</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmLogout}
              className="bg-error hover:bg-error/90"
            >
              <span className="material-icons mr-2">logout</span>
              确认退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
