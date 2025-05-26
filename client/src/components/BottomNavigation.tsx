import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    // Determine active tab based on current location
    if (location === "/") {
      setActiveTab("home");
    } else if (location.startsWith("/learning")) {
      setActiveTab("learning");
    } else if (location.startsWith("/community") || location.startsWith("/chatroom")) {
      setActiveTab("community");
    } else if (location.startsWith("/profile")) {
      setActiveTab("profile");
    }
  }, [location]);

  const handleTabClick = (tab: string) => {
    switch (tab) {
      case "home":
        setLocation("/");
        break;
      case "learning":
        setLocation("/learning");
        break;
      case "community":
        setLocation("/community");
        break;
      case "profile":
        setLocation("/profile");
        break;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10 shadow-lg shadow-black/5">
      <div className="max-w-lg mx-auto flex justify-around px-2 pt-2 pb-1">
        <TabButton 
          icon="home"
          activeIcon="home"
          label="首页" 
          isActive={activeTab === "home"} 
          onClick={() => handleTabClick("home")} 
        />
        <TabButton 
          icon="school"
          activeIcon="school" 
          label="学习" 
          isActive={activeTab === "learning"} 
          onClick={() => handleTabClick("learning")} 
        />
        <TabButton 
          icon="forum"
          activeIcon="forum" 
          label="社区" 
          isActive={activeTab === "community"} 
          onClick={() => handleTabClick("community")} 
        />
        <TabButton 
          icon="person_outline"
          activeIcon="person" 
          label="我的" 
          isActive={activeTab === "profile"} 
          onClick={() => handleTabClick("profile")} 
        />
      </div>
    </nav>
  );
}

interface TabButtonProps {
  icon: string;
  activeIcon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon, activeIcon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button 
      className={cn(
        "py-2 px-4 flex flex-col items-center justify-center relative w-1/4 transition",
        "rounded-xl",
        isActive ? "bg-primary/10" : "hover:bg-neutral-100"
      )}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {/* 背景动画效果，仅在激活时显示 */}
      {isActive && (
        <span className="absolute inset-0 bg-primary/5 rounded-xl animate-pulse"></span>
      )}
      
      <span className={cn(
        "material-icons transition-all",
        isActive 
          ? "text-primary scale-110" 
          : "text-neutral-500"
      )}>
        {isActive ? activeIcon : icon}
      </span>
      
      <span className={cn(
        "text-xs mt-1 font-medium transition-colors",
        isActive ? "text-primary" : "text-neutral-500"
      )}>
        {label}
      </span>
    </button>
  );
}
