import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChatRoom } from "@shared/schema";
import { getChatRoomGradient, getChatRoomIcon, getDefaultChatRoomImageUrl } from "@/lib/imageUtils";

interface ChatRoomCardProps {
  room: ChatRoom;
  onlineCount?: number;
  className?: string;
}

export default function ChatRoomCard({ room, onlineCount = 0, className }: ChatRoomCardProps) {
  const [, setLocation] = useLocation();

  const handleRoomClick = () => {
    setLocation(`/chatroom/${room.id}`);
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-md mb-4 border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300", 
        className
      )}
      onClick={handleRoomClick}
    >
      <div className="relative">
        {room.imageUrl ? (
          <div className="h-32 w-full overflow-hidden">
            <img 
              src={room.imageUrl} 
              alt={room.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getDefaultChatRoomImageUrl(room.name);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
            
            {/* 聊天室图标 */}
            <div className="absolute bottom-3 left-3 flex items-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getChatRoomGradient(room.name)} flex items-center justify-center shadow-lg`}>
                <span className="material-icons text-white">{getChatRoomIcon(room.name)}</span>
              </div>
              <h3 className="text-white font-bold ml-2 text-lg drop-shadow-md">{room.name}</h3>
            </div>
          </div>
        ) : (
          <div className="relative h-32 w-full overflow-hidden">
            <img 
              src={getDefaultChatRoomImageUrl(room.name)}
              alt={room.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
            
            {/* 聊天室图标 */}
            <div className="absolute bottom-3 left-3 flex items-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getChatRoomGradient(room.name)} flex items-center justify-center shadow-lg`}>
                <span className="material-icons text-white">{getChatRoomIcon(room.name)}</span>
              </div>
              <h3 className="text-white font-bold ml-2 text-lg drop-shadow-md">{room.name}</h3>
            </div>
          </div>
        )}
        
        {/* 在线人数标签 */}
        <span className="absolute top-3 right-3 bg-success text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md flex items-center">
          <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
          {onlineCount} 在线
        </span>
      </div>
      
      <div className="p-4">
        <p className="mb-3 text-neutral-700 text-sm">{room.description}</p>
        
        {room.topic && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <div className="bg-primary/10 text-primary rounded-full p-1.5 mr-2.5">
                <span className="material-icons">campaign</span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium mb-1">今日话题</p>
                <p className="text-sm font-medium">{room.topic}</p>
              </div>
            </div>
          </div>
        )}
        
        <button 
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85 text-white rounded-lg py-3 font-semibold shadow-sm transition-all flex items-center justify-center"
        >
          <span className="material-icons mr-2">login</span>
          进入聊天室
        </button>
      </div>
    </div>
  );
}
