import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertLearningContentSchema, 
  insertUserProgressSchema,
  insertChatRoomSchema,
  insertChatMessageSchema,
  insertUserVocabularySchema,
  insertUserWritingSchema
} from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { seedLearningContent } from "./seed-data";

// Extended WebSocket interface to include room information
interface ExtendedWebSocket extends WebSocket {
  roomId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup authentication with Passport
  setupAuth(app);
  
  // 添加管理员专用路由用于初始化数据
  app.post("/api/admin/seed-data", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      await seedLearningContent();
      res.json({ message: "学习内容添加成功" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Set up WebSocket server for real-time chat with a specific path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws' 
  });
  
  console.log("WebSocket server initialized on path: /ws");
  
  wss.on("connection", (ws: ExtendedWebSocket) => {
    console.log("New WebSocket connection established");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`WebSocket message received: ${message.toString().substring(0, 100)}`);
        
        if (data.type === "join") {
          // User joined a chat room
          ws.roomId = data.roomId;
          console.log(`User ${data.userId} joined room ${data.roomId}`);
        } else if (data.type === "message" && ws.roomId) {
          // User sent a message to the room
          const chatMessage = await storage.createChatMessage({
            roomId: ws.roomId,
            userId: data.userId,
            type: data.messageType || "text",
            content: data.content
          });
          
          console.log(`Message sent in room ${ws.roomId} by user ${data.userId}`);
          
          // Broadcast to all clients in the same room
          wss.clients.forEach((client) => {
            const extendedClient = client as ExtendedWebSocket;
            if (extendedClient.roomId === ws.roomId) {
              client.send(JSON.stringify({
                type: "message",
                message: chatMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  });
  
  // Auth routes are handled by auth.ts
  
  // User routes
  app.put("/api/users/:id", async (req, res) => {
    if (!req.user || (req.user as any).id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "无权限修改" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "用户不存在" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Learning content routes
  app.get("/api/learning", async (req, res) => {
    const type = req.query.type as string;
    const subtype = req.query.subtype as string;
    
    try {
      let content;
      if (type && subtype) {
        content = await storage.getLearningContentByTypeAndSubtype(type, subtype);
      } else if (type) {
        content = await storage.getLearningContentByType(type);
      } else {
        content = await storage.getAllLearningContent();
      }
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/learning/:id", async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getLearningContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "学习内容不存在" });
      }
      
      res.json(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin routes for managing content
  app.post("/api/admin/learning", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      const contentData = insertLearningContentSchema.parse(req.body);
      const newContent = await storage.createLearningContent(contentData);
      res.status(201).json(newContent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/admin/learning/:id", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const updatedContent = await storage.updateLearningContent(contentId, req.body);
      
      if (!updatedContent) {
        return res.status(404).json({ message: "学习内容不存在" });
      }
      
      res.json(updatedContent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/admin/learning/:id", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      const contentId = parseInt(req.params.id);
      const deleted = await storage.deleteLearningContent(contentId);
      
      if (!deleted) {
        return res.status(404).json({ message: "学习内容不存在" });
      }
      
      res.json({ message: "学习内容已删除" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // User progress routes
  app.get("/api/progress", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const userId = (req.user as any).id;
      const progress = await storage.getAllUserProgress(userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/progress", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      
      const progress = await storage.createOrUpdateUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Chat room routes
  app.get("/api/chat/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllChatRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/chat/rooms/:id", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const room = await storage.getChatRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "聊天室不存在" });
      }
      
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/chat/rooms/:id/messages", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin routes for managing chat rooms
  app.post("/api/admin/chat/rooms", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      const roomData = insertChatRoomSchema.parse(req.body);
      const newRoom = await storage.createChatRoom(roomData);
      res.status(201).json(newRoom);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/admin/chat/rooms/:id", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      const roomId = parseInt(req.params.id);
      const updatedRoom = await storage.updateChatRoom(roomId, req.body);
      
      if (!updatedRoom) {
        return res.status(404).json({ message: "聊天室不存在" });
      }
      
      res.json(updatedRoom);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Vocabulary routes
  app.get("/api/vocabulary", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const userId = (req.user as any).id;
      const vocabulary = await storage.getUserVocabulary(userId);
      res.json(vocabulary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/vocabulary", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const vocabData = insertUserVocabularySchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      
      const vocabulary = await storage.addUserVocabulary(vocabData);
      res.status(201).json(vocabulary);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/vocabulary/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const vocabId = parseInt(req.params.id);
      const deleted = await storage.deleteUserVocabulary(vocabId);
      
      if (!deleted) {
        return res.status(404).json({ message: "单词不存在" });
      }
      
      res.json({ message: "单词已删除" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // 用户写作练习相关路由
  // 获取用户所有写作
  app.get("/api/writings", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const userId = (req.user as any).id;
      const writings = await storage.getUserWritings(userId);
      res.json(writings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // 获取特定写作
  app.get("/api/writings/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const writingId = parseInt(req.params.id);
      const writing = await storage.getUserWritingById(writingId);
      
      if (!writing) {
        return res.status(404).json({ message: "写作不存在" });
      }
      
      // 只有作者和管理员可以查看
      if (writing.userId !== (req.user as any).id && !(req.user as any).isAdmin) {
        return res.status(403).json({ message: "无权限查看" });
      }
      
      res.json(writing);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // 创建新写作
  app.post("/api/writings", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const writingData = insertUserWritingSchema.parse({
        ...req.body,
        userId: (req.user as any).id
      });
      
      const writing = await storage.createUserWriting(writingData);
      res.status(201).json(writing);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // 更新写作
  app.put("/api/writings/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const writingId = parseInt(req.params.id);
      const writing = await storage.getUserWritingById(writingId);
      
      if (!writing) {
        return res.status(404).json({ message: "写作不存在" });
      }
      
      // 只有作者可以修改
      if (writing.userId !== (req.user as any).id) {
        return res.status(403).json({ message: "无权限修改" });
      }
      
      const updatedWriting = await storage.updateUserWriting(writingId, req.body);
      res.json(updatedWriting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // 删除写作
  app.delete("/api/writings/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "未登录" });
    }
    
    try {
      const writingId = parseInt(req.params.id);
      const writing = await storage.getUserWritingById(writingId);
      
      if (!writing) {
        return res.status(404).json({ message: "写作不存在" });
      }
      
      // 只有作者和管理员可以删除
      if (writing.userId !== (req.user as any).id && !(req.user as any).isAdmin) {
        return res.status(403).json({ message: "无权限删除" });
      }
      
      const deleted = await storage.deleteUserWriting(writingId);
      res.json({ message: "写作已删除", success: deleted });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // 管理员反馈写作
  app.post("/api/admin/writings/:id/feedback", async (req, res) => {
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({ message: "需要管理员权限" });
    }
    
    try {
      const writingId = parseInt(req.params.id);
      const writing = await storage.getUserWritingById(writingId);
      
      if (!writing) {
        return res.status(404).json({ message: "写作不存在" });
      }
      
      const updatedWriting = await storage.updateUserWriting(writingId, {
        feedback: req.body.feedback,
        status: "reviewed"
      });
      
      res.json(updatedWriting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
