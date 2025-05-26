import { useUser } from "@/context/AuthUserContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onFontSizeClick: () => void;
  scrolled?: boolean;
}

export default function Header({ title, onBack, onFontSizeClick, scrolled = false }: HeaderProps) {
  const { user } = useUser();
  
  return (
    <header 
      className={cn(
        "text-white sticky top-0 z-20 transition-all duration-300 backdrop-blur-md",
        scrolled 
          ? "bg-white/90 text-neutral-900 shadow-sm"
          : "bg-gradient-to-r from-primary to-secondary"
      )}
    >
      <div className="flex justify-between items-center h-16 px-4">
        <div className="flex items-center">
          {onBack && (
            <button 
              onClick={onBack} 
              className={cn(
                "mr-3 p-2 rounded-full transition flex items-center justify-center",
                scrolled 
                  ? "hover:bg-neutral-100" 
                  : "hover:bg-white/20"
              )}
              aria-label="返回"
            >
              <span className="material-icons">arrow_back</span>
            </button>
          )}
          <h1 className="text-xl font-bold line-clamp-1">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={onFontSizeClick}
            className={cn(
              "mr-2 p-2 rounded-full transition flex items-center justify-center",
              scrolled 
                ? "hover:bg-neutral-100" 
                : "hover:bg-white/20"
            )}
            aria-label="调整字体大小"
          >
            <span className="material-icons">text_fields</span>
          </button>
          
          <div className="relative">
            <button 
              className={cn(
                "p-2 rounded-full transition flex items-center justify-center",
                scrolled 
                  ? "hover:bg-neutral-100" 
                  : "hover:bg-white/20"
              )}
              aria-label="通知"
            >
              <span className="material-icons">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
          </div>
          
          {/* 用户头像 */}
          {user && (
            <button className="ml-2 flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.nickname} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="bg-gradient-to-br from-primary/30 to-secondary/30 w-full h-full flex items-center justify-center">
                    <span className="material-icons text-white/80">person</span>
                  </div>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
