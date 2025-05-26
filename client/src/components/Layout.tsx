import { ReactNode, useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import FontSizePanel from "@/components/FontSizePanel";
import { useUser } from "@/context/AuthUserContext";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  title: string;
  showHeader?: boolean;
  showNav?: boolean;
  onBack?: () => void;
  fullWidth?: boolean;
  className?: string;
}

export default function Layout({
  children,
  title,
  showHeader = true,
  showNav = true,
  onBack,
  fullWidth = false,
  className,
}: LayoutProps) {
  const [fontSizePanelOpen, setFontSizePanelOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();

  // 监听滚动事件，设置头部样式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "mx-auto bg-neutral-50 min-h-screen relative pb-20",
      fullWidth ? "w-full" : "max-w-lg",
      className
    )}>
      {showHeader && (
        <Header 
          title={title} 
          onBack={onBack}
          scrolled={scrolled}
          onFontSizeClick={() => setFontSizePanelOpen(true)} 
        />
      )}
      
      <main className={cn(
        "pb-20 relative", 
        fullWidth ? "" : "px-4"
      )}>
        {children}
      </main>
      
      {showNav && <BottomNavigation />}
      
      <FontSizePanel 
        isOpen={fontSizePanelOpen} 
        onClose={() => setFontSizePanelOpen(false)} 
        currentSize={user?.preferences?.fontSize || "medium"}
      />
    </div>
  );
}
