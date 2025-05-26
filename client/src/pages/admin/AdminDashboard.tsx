import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthUserContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LearningContent, ChatRoom } from "@shared/schema";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      toast({
        title: "访问受限",
        description: "您没有管理员权限",
        variant: "destructive",
      });
      setLocation("/profile");
    }
  }, [isAdmin, setLocation, toast]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">管理后台</h1>
        <Button onClick={() => setLocation("/profile")}>
          <span className="material-icons mr-2">arrow_back</span>
          返回个人页面
        </Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="content" className="text-lg py-3">学习内容管理</TabsTrigger>
          <TabsTrigger value="community" className="text-lg py-3">社区管理</TabsTrigger>
          <TabsTrigger value="users" className="text-lg py-3">用户管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>
        
        <TabsContent value="community">
          <CommunityManagement />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentManagement() {
  const [selectedContent, setSelectedContent] = useState<LearningContent | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all learning content
  const { data: contentList, isLoading } = useQuery<LearningContent[]>({
    queryKey: ["/api/learning"],
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (contentId: number) => {
      await apiRequest("DELETE", `/api/admin/learning/${contentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning"] });
      toast({
        title: "删除成功",
        description: "学习内容已成功删除",
      });
      setSelectedContent(null);
    },
    onError: (error: any) => {
      toast({
        title: "删除失败",
        description: error.message || "删除内容时出现错误",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (contentId: number) => {
    if (window.confirm("确定要删除这个学习内容吗？此操作不可撤销。")) {
      deleteMutation.mutate(contentId);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">学习内容管理</h2>
        <Button onClick={() => setIsAdding(true)}>
          <span className="material-icons mr-2">add</span>
          添加新内容
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg">加载中...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {contentList?.map((content) => (
            <Card key={content.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between">
                  <span>{content.title}</span>
                  <span className="text-sm px-2 py-1 bg-neutral-100 rounded-full">
                    {content.type === "oral" && "口语练习"}
                    {content.type === "vocabulary" && "单词学习"}
                    {content.type === "article" && "英语美文"}
                    {content.type === "writing" && "写作练习"}
                  </span>
                </CardTitle>
                <CardDescription>{content.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setSelectedContent(content)}
                >
                  <span className="material-icons mr-1">edit</span>
                  编辑
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(content.id)}
                  disabled={deleteMutation.isPending}
                >
                  <span className="material-icons mr-1">delete</span>
                  删除
                </Button>
              </CardFooter>
            </Card>
          ))}

          {contentList?.length === 0 && (
            <div className="text-center py-10 col-span-2">
              <p className="text-lg">暂无学习内容，请添加新内容</p>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <ContentForm 
          onClose={() => setIsAdding(false)} 
          onSuccess={() => {
            setIsAdding(false);
            queryClient.invalidateQueries({ queryKey: ["/api/learning"] });
          }}
        />
      )}

      {selectedContent && (
        <ContentForm 
          content={selectedContent}
          onClose={() => setSelectedContent(null)} 
          onSuccess={() => {
            setSelectedContent(null);
            queryClient.invalidateQueries({ queryKey: ["/api/learning"] });
          }}
        />
      )}
    </div>
  );
}

function ContentForm({ 
  content, 
  onClose, 
  onSuccess 
}: { 
  content?: LearningContent;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: content?.title || "",
    description: content?.description || "",
    type: content?.type || "oral",
    subtype: content?.subtype || "",
    difficulty: content?.difficulty || "beginner",
    duration: content?.duration?.toString() || "10",
    imageUrl: content?.imageUrl || "",
    content: JSON.stringify(content?.content || { dialogues: [], vocabulary: [] }, null, 2)
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (content) {
        // Update existing content
        return await apiRequest("PUT", `/api/admin/learning/${content.id}`, data);
      } else {
        // Create new content
        return await apiRequest("POST", "/api/admin/learning", data);
      }
    },
    onSuccess: () => {
      toast({
        title: content ? "更新成功" : "创建成功",
        description: content ? "学习内容已更新" : "新学习内容已创建",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/learning"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: content ? "更新失败" : "创建失败",
        description: error.message || "操作失败，请检查表单数据",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let contentObj;
      try {
        contentObj = JSON.parse(formData.content);
      } catch (err) {
        toast({
          title: "内容格式错误",
          description: "JSON 格式不正确，请检查内容字段",
          variant: "destructive",
        });
        return;
      }

      const data = {
        ...formData,
        duration: parseInt(formData.duration),
        content: contentObj
      };

      saveMutation.mutate(data);
    } catch (error: any) {
      toast({
        title: "表单错误",
        description: error.message || "请检查表单数据",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {content ? "编辑学习内容" : "添加新学习内容"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="material-icons">close</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="font-medium">标题</label>
              <Input 
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="font-medium">内容类型</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">口语练习</SelectItem>
                  <SelectItem value="vocabulary">单词学习</SelectItem>
                  <SelectItem value="article">英语美文</SelectItem>
                  <SelectItem value="writing">写作练习</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subtype" className="font-medium">子类型</label>
              <Input 
                id="subtype"
                name="subtype"
                value={formData.subtype}
                onChange={handleChange}
                placeholder="例如：supermarket, conversation"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="font-medium">难度</label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => handleSelectChange("difficulty", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择难度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">初级</SelectItem>
                  <SelectItem value="intermediate">中级</SelectItem>
                  <SelectItem value="advanced">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="font-medium">时长（分钟）</label>
              <Input 
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="imageUrl" className="font-medium">图片URL</label>
              <Input 
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="输入图片URL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="font-medium">描述</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="font-medium">内容 (JSON 格式)</label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="font-mono text-sm"
              required
            />
            <p className="text-sm text-neutral-500">
              提示：根据内容类型，JSON 需要包含不同的字段。例如，口语练习需要包含 dialogues 和 vocabulary 数组。
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <span className="material-icons animate-spin mr-2">refresh</span>
                  保存中...
                </>
              ) : (
                <>
                  <span className="material-icons mr-2">save</span>
                  保存
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommunityManagement() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all chat rooms
  const { data: chatRooms, isLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  // Delete room mutation
  const deleteMutation = useMutation({
    mutationFn: async (roomId: number) => {
      await apiRequest("DELETE", `/api/admin/chat/rooms/${roomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      toast({
        title: "删除成功",
        description: "聊天室已成功删除",
      });
    },
    onError: (error: any) => {
      toast({
        title: "删除失败",
        description: error.message || "删除聊天室时出现错误",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (roomId: number) => {
    if (window.confirm("确定要删除这个聊天室吗？此操作不可撤销。")) {
      deleteMutation.mutate(roomId);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">聊天室管理</h2>
        <Button onClick={() => setIsAdding(true)}>
          <span className="material-icons mr-2">add</span>
          添加聊天室
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg">加载中...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {chatRooms?.map((room) => (
            <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {room.topic && (
                  <div className="bg-neutral-100 p-2 rounded">
                    <p className="text-sm font-medium">今日话题：{room.topic}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setSelectedRoom(room)}
                >
                  <span className="material-icons mr-1">edit</span>
                  编辑
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(room.id)}
                  disabled={deleteMutation.isPending}
                >
                  <span className="material-icons mr-1">delete</span>
                  删除
                </Button>
              </CardFooter>
            </Card>
          ))}

          {chatRooms?.length === 0 && (
            <div className="text-center py-10 col-span-2">
              <p className="text-lg">暂无聊天室，请添加新聊天室</p>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <ChatRoomForm 
          onClose={() => setIsAdding(false)} 
          onSuccess={() => {
            setIsAdding(false);
            queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
          }}
        />
      )}

      {selectedRoom && (
        <ChatRoomForm 
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)} 
          onSuccess={() => {
            setSelectedRoom(null);
            queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
          }}
        />
      )}
    </div>
  );
}

function ChatRoomForm({ 
  room, 
  onClose, 
  onSuccess 
}: { 
  room?: ChatRoom;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: room?.name || "",
    description: room?.description || "",
    topic: room?.topic || "",
    imageUrl: room?.imageUrl || ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (room) {
        // Update existing room
        return await apiRequest("PUT", `/api/admin/chat/rooms/${room.id}`, data);
      } else {
        // Create new room
        return await apiRequest("POST", "/api/admin/chat/rooms", data);
      }
    },
    onSuccess: () => {
      toast({
        title: room ? "更新成功" : "创建成功",
        description: room ? "聊天室已更新" : "新聊天室已创建",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: room ? "更新失败" : "创建失败",
        description: error.message || "操作失败，请检查表单数据",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {room ? "编辑聊天室" : "添加新聊天室"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="material-icons">close</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="font-medium">名称</label>
            <Input 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="font-medium">描述</label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="topic" className="font-medium">今日话题</label>
            <Input 
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="可选"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="font-medium">图片URL</label>
            <Input 
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="可选"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserManagement() {
  // In a real app, this would fetch all users
  // For this demo, we'll show a simpler version
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">用户管理</h2>
      <Card>
        <CardHeader>
          <CardTitle>用户列表功能</CardTitle>
          <CardDescription>
            在完整版本中，这里将显示所有注册用户，并提供管理功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-lg">该功能正在开发中...</p>
            <p className="mt-2 text-neutral-500">
              完整版本将包括用户搜索、查看学习进度、重置密码等功能
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
