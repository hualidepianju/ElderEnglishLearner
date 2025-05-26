import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// 配置WebSocket支持
neonConfig.webSocketConstructor = ws;

// 检查环境变量
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 创建数据库连接池
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 创建Drizzle ORM实例
export const db = drizzle(pool, { schema });