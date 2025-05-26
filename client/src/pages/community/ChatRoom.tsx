import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createChatWebSocket, formatTime } from "@/lib/utils";
import { ChatRoom as ChatRoomType, ChatMessage } from "@shared/schema";

type MessageType = "system" | "user" | "other";

interface Message extends ChatMessage {
  type: MessageType;
}

export default function ChatRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  
  // 使用ref跟踪已处理的消息ID，避免重复添加消息
  const processedMessageIds = useRef<Set<number>>(new Set());

  // Fetch chat room details
  const { data: room } = useQuery<ChatRoomType>({
    queryKey: [`/api/chat/rooms/${id}`],
  });

  // Fetch past messages
  const { data: pastMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/chat/rooms/${id}/messages`],
  });
  
  // Initialize past messages
  useEffect(() => {
    console.log("初始化历史消息, pastMessages:", pastMessages?.length);
    if (pastMessages && user) {
      // 彻底重置消息处理状态，避免任何历史状态干扰
      processedMessageIds.current = new Set<number>();
      
      // 先清空消息，避免重复
      setMessages(state => {
        // 如果当前消息列表为空，则不需要清空
        if (state.length === 0) return state;
        return [];
      });
      
      const formattedMessages = pastMessages.map(msg => {
        // 添加消息ID到已处理集合
        console.log("处理历史消息ID:", msg.id);
        processedMessageIds.current.add(msg.id);
        
        return {
          ...msg,
          type: (msg.userId === user.id ? "user" : "other") as MessageType
        };
      });
      
      setMessages(prev => {
        // 如果当前已有消息，确保不会添加重复消息
        const newMessages = formattedMessages.filter(
          newMsg => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        
        if (prev.length === 0) {
          return formattedMessages;
        } else {
          return [...prev, ...newMessages];
        }
      });
    }
  }, [pastMessages, user]);

  // Set up WebSocket connection and monitor it
  useEffect(() => {
    if (!user || !id) return;

    // 清除所有可能的重复消息
    const setupMessageState = () => {
      // 重置处理过的消息ID集合
      processedMessageIds.current = new Set<number>();
    };

    // 首先确保清理任何现有连接
    const cleanupConnection = () => {
      if (wsRef.current) {
        try {
          console.log("正在清理之前的WebSocket连接");
          wsRef.current.close();
          wsRef.current = null;
        } catch (error) {
          console.error("清理WebSocket连接时出错:", error);
        }
      }
    };

    // 初始化时清理状态，避免重复
    setupMessageState();
    
    // 清理之前的连接
    cleanupConnection();

    console.log("为聊天室", id, "和用户", user.id, "建立WebSocket连接");
    
    // 用于跟踪是否已经添加了加入消息，避免重复
    let joinMessageAdded = false;
    
    // 创建新的连接并设置处理程序
    try {
      const ws = createChatWebSocket(Number(id), user.id, (data) => {
        // 确保回调函数中使用最新的状态
        handleWebSocketMessage(data);
      });
      
      wsRef.current = ws;
      
      // 连接打开时的处理
      const onOpenHandler = () => {
        console.log("WebSocket连接已打开，准备就绪");
        setIsConnected(true);
        
        // 只在首次连接时添加系统消息，且确保不重复
        if (!joinMessageAdded) {
          joinMessageAdded = true;
          
          const joinMessageId = `join-${user.id}-${Date.now()}`;
          const numericJoinId = parseInt(joinMessageId.split('-').join('').slice(0, 10));
          
          // 检查该系统消息是否已存在
          if (!processedMessageIds.current.has(numericJoinId)) {
            processedMessageIds.current.add(numericJoinId);
            
            // 添加加入消息
            setMessages(prev => [
              ...prev,
              {
                id: numericJoinId,
                roomId: Number(id),
                userId: 0, // 系统消息
                type: "system",
                content: `${user.nickname} 加入了聊天室`,
                createdAt: new Date()
              }
            ]);
          }
        }
      };
      
      // 连接关闭时的处理
      const onCloseHandler = () => {
        console.log("WebSocket连接已关闭");
        setIsConnected(false);
        joinMessageAdded = false; // 重置标记
      };
      
      // 连接错误时的处理
      const onErrorHandler = (error: Event) => {
        console.error("WebSocket连接错误:", error);
        setIsConnected(false);
        joinMessageAdded = false; // 重置标记
        
        toast({
          title: "连接错误",
          description: "聊天室连接出现问题，正在尝试重新连接",
          variant: "destructive",
        });
      };
      
      // 添加事件监听器
      ws.addEventListener('open', onOpenHandler);
      ws.addEventListener('close', onCloseHandler);
      ws.addEventListener('error', onErrorHandler);
      
      // 设置连接状态检查
      const checkConnectionInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          if (!isConnected) setIsConnected(true);
        } else if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          setIsConnected(false);
        }
      }, 5000);
      
      // 返回清理函数
      return () => {
        // 移除所有事件监听器
        ws.removeEventListener('open', onOpenHandler);
        ws.removeEventListener('close', onCloseHandler);
        ws.removeEventListener('error', onErrorHandler);
        
        // 清除检查间隔
        clearInterval(checkConnectionInterval);
        
        // 清理连接
        cleanupConnection();
      };
    } catch (error) {
      console.error("创建WebSocket连接失败:", error);
      setIsConnected(false);
      
      toast({
        title: "连接失败",
        description: "无法连接到聊天服务器，请检查网络连接",
        variant: "destructive",
      });
      
      return () => {}; // 返回空清理函数
    }
  }, [id, user, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleWebSocketMessage = (data: any) => {
    console.log("收到WebSocket消息:", data);
    
    if (data.type === "message" && user) {
      // 处理直接接收到的消息格式
      if (data.content && data.userId !== undefined && data.roomId !== undefined) {
        // 为直接消息生成一个唯一ID
        const messageId = data.id || Date.now();
        
        // 检查消息是否已处理
        if (processedMessageIds.current.has(messageId)) {
          console.log("跳过已处理的消息ID:", messageId);
          return;
        }
        
        // 先将消息ID添加到已处理集合，确保即使状态更新有延迟也不会重复处理
        processedMessageIds.current.add(messageId);
        
        const messageData = {
          id: messageId,
          content: data.content,
          userId: data.userId,
          roomId: data.roomId,
          createdAt: new Date(),
          type: data.messageType || "text"
        };
        
        // 使用函数形式更新消息，确保基于最新状态
        setMessages(prev => {
          // 检查消息是否已经存在
          if (prev.some(msg => msg.id === messageId)) {
            return prev; // 如果已存在，不做任何更改
          }
          
          // 添加新消息
          return [
            ...prev,
            {
              ...messageData,
              type: (messageData.userId === user.id ? "user" : "other") as MessageType
            }
          ];
        });
      } 
      // 处理message对象包装的消息
      else if (data.message) {
        const newMessage = data.message;
        const messageId = newMessage.id;
        
        // 跳过已处理的消息
        if (processedMessageIds.current.has(messageId)) {
          console.log("跳过已处理的包装消息ID:", messageId);
          return;
        }
        
        // 先将消息ID添加到已处理集合
        processedMessageIds.current.add(messageId);
        console.log("处理新消息ID:", messageId);
        
        // 使用函数形式更新消息，确保基于最新状态
        setMessages(prev => {
          // 检查消息是否已经存在
          if (prev.some(msg => msg.id === messageId)) {
            return prev; // 如果已存在，不做任何更改
          }
          
          // 添加新消息
          return [
            ...prev,
            {
              ...newMessage,
              type: (newMessage.userId === user.id ? "user" : "other") as MessageType
            }
          ];
        });
      }
    } else if (data.type === "join" && user && data.userId !== user.id) {
      // 为join事件创建唯一标识符
      const joinEventId = `join-${data.userId}-${Date.now()}`;
      const numericId = parseInt(joinEventId.split('-').join('').slice(0, 10));
      
      // 跳过已处理的join事件
      if (processedMessageIds.current.has(numericId)) {
        return;
      }
      
      // 先将ID添加到已处理集合
      processedMessageIds.current.add(numericId);
      
      // 处理其他用户加入的消息
      setMessages(prev => {
        // 检查消息是否已经存在
        if (prev.some(msg => msg.id === numericId)) {
          return prev; // 如果已存在，不做任何更改
        }
        
        // 添加新消息
        return [
          ...prev,
          {
            id: numericId,
            roomId: Number(id),
            userId: 0, // 系统消息
            type: "system" as MessageType,
            content: `新用户加入了聊天室`,
            createdAt: new Date()
          }
        ];
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!input.trim() || !user) return;
    
    // 检查WebSocket连接状态
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "连接失败",
        description: "无法发送消息，正在尝试重新连接...",
        variant: "destructive",
      });
      
      // 尝试重新建立WebSocket连接
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      const newWs = createChatWebSocket(Number(id), user.id, handleWebSocketMessage);
      wsRef.current = newWs;
      return;
    }

    // 构建消息对象
    const messageData = {
      type: "message",
      roomId: Number(id),
      userId: user.id,
      messageType: "text",
      content: input
    };
    
    try {
      // 发送消息
      wsRef.current.send(JSON.stringify(messageData));
      
      // 显示本地消息（优化用户体验，让用户立即看到自己发送的消息）
      const localId = Date.now() + Math.floor(Math.random() * 1000);
      const localMessage: Message = {
        id: localId,
        roomId: Number(id),
        userId: user.id,
        type: "user" as MessageType,
        content: input,
        createdAt: new Date()
      };
      
      // 记录本地消息ID，避免与服务器消息冲突
      processedMessageIds.current.add(localId);
      
      setMessages(prev => [...prev, localMessage]);
      setInput("");
    } catch (error) {
      console.error("发送消息失败:", error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleRecordVoice = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      // In a real app, you would implement actual voice recording
      setIsRecording(true);
      toast({
        title: "开始录音",
        description: "正在录制语音消息...",
      });
    } catch (error) {
      toast({
        title: "录音失败",
        description: "无法访问麦克风，请检查权限设置",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    // In a real app, you would process the recorded audio
    setIsRecording(false);
    toast({
      title: "录音已完成",
      description: "语音消息功能正在开发中",
    });
  };

  const handleImageUpload = () => {
    toast({
      title: "图片上传",
      description: "图片上传功能正在开发中",
    });
  };

  if (!room) {
    return (
      <Layout title="加载中..." onBack={() => window.history.back()}>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">正在加载聊天室信息...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={room.name} onBack={() => window.history.back()}>
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="border-b border-neutral-200 pb-3 mb-3">
            <div className="flex items-center">
              <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">公告</div>
              <p className="ml-2 text-sm">欢迎来到{room.name}，请友善交流，互相鼓励！</p>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="space-y-4 mb-4 h-96 overflow-y-auto p-1">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === "system" ? (
                  <div className="text-center">
                    <span className="bg-neutral-100 text-neutral-800/60 px-3 py-1 rounded-full text-sm">
                      系统消息: {message.content}
                    </span>
                  </div>
                ) : message.type === "user" ? (
                  <div className="flex justify-end">
                    <div className="mr-2 flex flex-col items-end">
                      <div className="flex items-center">
                        <span className="text-xs text-neutral-800/60 mr-2">
                          {formatTime(message.createdAt)}
                        </span>
                        <span className="font-semibold">
                          {user?.nickname || "我"}
                        </span>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-2 mt-1 inline-block">
                        <p>{message.content}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Your avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="material-icons text-neutral-500">person</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                      <span className="material-icons text-neutral-500">person</span>
                    </div>
                    <div className="ml-2">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">匿名用户</span>
                        <span className="text-xs text-neutral-800/60">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                      <div className="bg-neutral-100 rounded-lg p-2 mt-1 inline-block">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Connection Status */}
          {!isConnected && (
            <div className="text-center mb-3">
              <span className="bg-error/10 text-error px-3 py-1 rounded text-sm">
                连接已断开，请刷新页面重试
              </span>
            </div>
          )}
          
          {/* Chat Input */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-neutral-100 rounded-full w-10 h-10 mr-2"
              onClick={handleImageUpload}
            >
              <span className="material-icons">image</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full w-10 h-10 mr-2 ${isRecording ? 'bg-error/10 text-error animate-pulse' : 'bg-neutral-100'}`}
              onClick={handleRecordVoice}
            >
              <span className="material-icons">{isRecording ? 'stop' : 'mic'}</span>
            </Button>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="请输入消息..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-neutral-200 rounded-full py-2 px-4 pr-10"
              />
              <Button 
                className="absolute right-1 top-1 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center"
                onClick={handleSendMessage}
                disabled={!input.trim() || !user}
              >
                <span className="material-icons text-sm">send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
