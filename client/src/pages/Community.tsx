import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import ChatRoomCard from "@/components/ChatRoomCard";
import { useAuth } from "@/hooks/useAuth";
import { generateAnonymousName } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChatRoom } from "@shared/schema";

// Mock online counts for chat rooms
const ONLINE_COUNTS = {
  1: 28,
  2: 15,
  3: 12
};

export default function Community() {
  const { user } = useAuth();
  const [anonymousName, setAnonymousName] = useState<string>("");

  // Generate anonymous name on first load
  useEffect(() => {
    if (!anonymousName) {
      setAnonymousName(generateAnonymousName());
    }
  }, [anonymousName]);

  // Fetch chat rooms
  const { data: chatRooms, isLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  return (
    <Layout title="交流社区">
      <section className="p-4">
        <h2 className="text-2xl font-bold mb-4">交流社区</h2>
        
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center mb-4">
            {/* Anonymous avatar */}
            <div className="w-12 h-12 bg-neutral-300 rounded-full flex items-center justify-center">
              <span className="material-icons text-white">person</span>
            </div>
            <div className="ml-3">
              <h3 className="font-bold">{anonymousName}</h3>
              <p className="text-sm text-neutral-800/60">您的匿名身份</p>
            </div>
          </div>
          <div className="bg-neutral-100 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">社区规则:</p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>友善交流，互相尊重</li>
              <li>禁止分享个人联系方式</li>
              <li>禁止发布不良内容</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3">聊天室</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-neutral-500">加载中...</p>
          </div>
        ) : chatRooms && chatRooms.length > 0 ? (
          chatRooms.map(room => (
            <ChatRoomCard 
              key={room.id} 
              room={room} 
              onlineCount={ONLINE_COUNTS[room.id as keyof typeof ONLINE_COUNTS] || 0}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-neutral-100 rounded-xl">
            <p className="text-neutral-500">暂无聊天室</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
