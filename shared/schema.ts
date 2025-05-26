import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  nickname: text("nickname").notNull(),
  password: text("password").notNull(),
  avatar: text("avatar").default("default-avatar.png"),
  isAdmin: boolean("is_admin").default(false),
  preferences: json("preferences").$type<{
    fontSize: "small" | "medium" | "large";
    theme: "light" | "dark";
    language: "zh" | "en";
  }>().default({
    fontSize: "medium",
    theme: "light",
    language: "zh"
  }),
  streak: integer("streak").default(0),
});

// Learning Content Table
export const learningContent = pgTable("learning_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "oral", "vocabulary", "article", "writing"
  subtype: text("subtype"), // e.g. "supermarket", "transportation", etc. for oral
  content: json("content").notNull(), // Content structure depends on type
  difficulty: text("difficulty").notNull().default("beginner"), // "beginner", "intermediate", "advanced"
  duration: integer("duration"), // in minutes
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Progress Table
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentId: integer("content_id").notNull().references(() => learningContent.id, { onDelete: "cascade" }),
  completionStatus: text("completion_status").notNull().default("not_started"), // "not_started", "in_progress", "completed"
  progress: integer("progress").default(0), // 0-100%
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

// Chat Rooms Table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  topic: text("topic"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("text"), // "text", "voice", "image"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vocabulary Collection
export const userVocabulary = pgTable("user_vocabulary", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  pronunciation: text("pronunciation"),
  example: text("example"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Writing Exercises
export const userWritings = pgTable("user_writings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  promptId: integer("prompt_id").references(() => learningContent.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  translation: text("translation"),
  status: text("status").notNull().default("draft"), // "draft", "submitted", "reviewed"
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLearningContentSchema = createInsertSchema(learningContent).omit({ id: true, createdAt: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, lastAccessed: true });
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertUserVocabularySchema = createInsertSchema(userVocabulary).omit({ id: true, createdAt: true });
export const insertUserWritingSchema = createInsertSchema(userWritings).omit({ id: true, createdAt: true, updatedAt: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LearningContent = typeof learningContent.$inferSelect;
export type InsertLearningContent = z.infer<typeof insertLearningContentSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type UserVocabulary = typeof userVocabulary.$inferSelect;
export type InsertUserVocabulary = z.infer<typeof insertUserVocabularySchema>;

export type UserWriting = typeof userWritings.$inferSelect;
export type InsertUserWriting = z.infer<typeof insertUserWritingSchema>;
