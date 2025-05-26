import { pool, db } from "./db";
import { 
  User, InsertUser,
  LearningContent, InsertLearningContent,
  UserProgress, InsertUserProgress,
  ChatRoom, InsertChatRoom,
  ChatMessage, InsertChatMessage,
  UserVocabulary, InsertUserVocabulary,
  UserWriting, InsertUserWriting,
  users, learningContent, userProgress, chatRooms, chatMessages, userVocabulary, userWritings
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connect_pg_simple from "connect-pg-simple";

// 创建PostgreSQL会话存储
const PostgresSessionStore = connect_pg_simple(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User | undefined>;
  
  // Learning content operations
  getLearningContent(id: number): Promise<LearningContent | undefined>;
  getAllLearningContent(): Promise<LearningContent[]>;
  getLearningContentByType(type: string): Promise<LearningContent[]>;
  getLearningContentByTypeAndSubtype(type: string, subtype: string): Promise<LearningContent[]>;
  createLearningContent(content: InsertLearningContent): Promise<LearningContent>;
  updateLearningContent(id: number, update: Partial<LearningContent>): Promise<LearningContent | undefined>;
  deleteLearningContent(id: number): Promise<boolean>;
  
  // User progress operations
  getUserProgress(userId: number, contentId: number): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: number): Promise<UserProgress[]>;
  createOrUpdateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Chat room operations
  getChatRoom(id: number): Promise<ChatRoom | undefined>;
  getAllChatRooms(): Promise<ChatRoom[]>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  updateChatRoom(id: number, update: Partial<ChatRoom>): Promise<ChatRoom | undefined>;
  
  // Chat messages operations
  getChatMessages(roomId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Vocabulary operations
  getUserVocabulary(userId: number): Promise<UserVocabulary[]>;
  addUserVocabulary(vocabulary: InsertUserVocabulary): Promise<UserVocabulary>;
  deleteUserVocabulary(id: number): Promise<boolean>;
  
  // User writing operations
  getUserWritings(userId: number): Promise<UserWriting[]>;
  getUserWritingById(id: number): Promise<UserWriting | undefined>;
  createUserWriting(writing: InsertUserWriting): Promise<UserWriting>;
  updateUserWriting(id: number, update: Partial<UserWriting>): Promise<UserWriting | undefined>;
  deleteUserWriting(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values([insertUser]).returning();
    return result[0];
  }
  
  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Learning content operations
  async getLearningContent(id: number): Promise<LearningContent | undefined> {
    const result = await db.select().from(learningContent).where(eq(learningContent.id, id));
    return result[0];
  }
  
  async getAllLearningContent(): Promise<LearningContent[]> {
    return await db.select().from(learningContent);
  }
  
  async getLearningContentByType(type: string): Promise<LearningContent[]> {
    return await db.select().from(learningContent).where(eq(learningContent.type, type));
  }
  
  async getLearningContentByTypeAndSubtype(type: string, subtype: string): Promise<LearningContent[]> {
    return await db.select()
      .from(learningContent)
      .where(and(
        eq(learningContent.type, type),
        eq(learningContent.subtype, subtype)
      ));
  }
  
  async createLearningContent(insertContent: InsertLearningContent): Promise<LearningContent> {
    const result = await db.insert(learningContent)
      .values([insertContent])
      .returning();
    return result[0];
  }
  
  async updateLearningContent(id: number, update: Partial<LearningContent>): Promise<LearningContent | undefined> {
    const result = await db.update(learningContent)
      .set(update)
      .where(eq(learningContent.id, id))
      .returning();
    return result[0];
  }
  
  async deleteLearningContent(id: number): Promise<boolean> {
    const result = await db.delete(learningContent)
      .where(eq(learningContent.id, id))
      .returning({ id: learningContent.id });
    return result.length > 0;
  }
  
  // User progress operations
  async getUserProgress(userId: number, contentId: number): Promise<UserProgress | undefined> {
    const result = await db.select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.contentId, contentId)
      ));
    return result[0];
  }
  
  async getAllUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }
  
  async createOrUpdateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    // 查找现有记录
    const existing = await this.getUserProgress(
      insertProgress.userId,
      insertProgress.contentId
    );
    
    if (existing) {
      // 更新现有记录
      const result = await db.update(userProgress)
        .set({
          ...insertProgress,
          lastAccessed: new Date()
        })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result[0];
    } else {
      // 创建新记录
      const result = await db.insert(userProgress)
        .values([insertProgress])
        .returning();
      return result[0];
    }
  }
  
  // Chat room operations
  async getChatRoom(id: number): Promise<ChatRoom | undefined> {
    const result = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return result[0];
  }
  
  async getAllChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms);
  }
  
  async createChatRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const result = await db.insert(chatRooms)
      .values([insertRoom])
      .returning();
    return result[0];
  }
  
  async updateChatRoom(id: number, update: Partial<ChatRoom>): Promise<ChatRoom | undefined> {
    const result = await db.update(chatRooms)
      .set(update)
      .where(eq(chatRooms.id, id))
      .returning();
    return result[0];
  }
  
  // Chat messages operations
  async getChatMessages(roomId: number, limit: number = 50): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }
  
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages)
      .values([insertMessage])
      .returning();
    return result[0];
  }
  
  // Vocabulary operations
  async getUserVocabulary(userId: number): Promise<UserVocabulary[]> {
    return await db.select()
      .from(userVocabulary)
      .where(eq(userVocabulary.userId, userId));
  }
  
  async addUserVocabulary(insertVocabulary: InsertUserVocabulary): Promise<UserVocabulary> {
    const result = await db.insert(userVocabulary)
      .values([insertVocabulary])
      .returning();
    return result[0];
  }
  
  async deleteUserVocabulary(id: number): Promise<boolean> {
    const result = await db.delete(userVocabulary)
      .where(eq(userVocabulary.id, id))
      .returning({ id: userVocabulary.id });
    return result.length > 0;
  }
  
  // User writing operations
  async getUserWritings(userId: number): Promise<UserWriting[]> {
    return await db.select()
      .from(userWritings)
      .where(eq(userWritings.userId, userId))
      .orderBy(desc(userWritings.updatedAt));
  }
  
  async getUserWritingById(id: number): Promise<UserWriting | undefined> {
    const result = await db.select()
      .from(userWritings)
      .where(eq(userWritings.id, id));
    return result[0];
  }
  
  async createUserWriting(insertWriting: InsertUserWriting): Promise<UserWriting> {
    const result = await db.insert(userWritings)
      .values([insertWriting])
      .returning();
    return result[0];
  }
  
  async updateUserWriting(id: number, update: Partial<UserWriting>): Promise<UserWriting | undefined> {
    // 设置更新时间
    const updatedData = {
      ...update,
      updatedAt: new Date()
    };
    
    const result = await db.update(userWritings)
      .set(updatedData)
      .where(eq(userWritings.id, id))
      .returning();
    return result[0];
  }
  
  async deleteUserWriting(id: number): Promise<boolean> {
    const result = await db.delete(userWritings)
      .where(eq(userWritings.id, id))
      .returning({ id: userWritings.id });
    return result.length > 0;
  }
}

// 导出实例
export const storage = new DatabaseStorage();