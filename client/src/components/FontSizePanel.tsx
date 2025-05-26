import { useState, useEffect } from "react";
import { useUser } from "@/context/AuthUserContext";
import { cn } from "@/lib/utils";

interface FontSizePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: "small" | "medium" | "large";
}

export default function FontSizePanel({ isOpen, onClose, currentSize }: FontSizePanelProps) {
  const { updatePreferences } = useUser();
  const [size, setSize] = useState<"small" | "medium" | "large">(currentSize);

  // Update the size state when currentSize changes
  useEffect(() => {
    setSize(currentSize);
  }, [currentSize]);

  const handleSizeButtonClick = (newSize: "small" | "medium" | "large") => {
    setSize(newSize);
  };

  const saveSettings = () => {
    updatePreferences({ fontSize: size });
    onClose();
  };

  return (
    <div className={cn(
      "fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-sm",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-w-lg mx-auto shadow-2xl transition-transform duration-300",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* 拖动指示条 */}
        <div className="w-16 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold">字体大小</h3>
            <p className="text-neutral-500 text-sm mt-1">调整应用中所有文字的大小</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors" 
            aria-label="关闭"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* 选择按钮组 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => handleSizeButtonClick("small")}
            className={cn(
              "flex flex-col items-center justify-center bg-white border rounded-xl py-5 transition-all",
              size === "small" 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <span className="material-icons text-base mb-2 text-neutral-700">text_fields</span>
            <span className="text-sm font-medium">较小</span>
            {size === "small" && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <span className="text-primary">
                  <span className="material-icons text-sm">check_circle</span>
                </span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleSizeButtonClick("medium")}
            className={cn(
              "flex flex-col items-center justify-center bg-white border rounded-xl py-5 transition-all",
              size === "medium" 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <span className="material-icons text-lg mb-2 text-neutral-700">text_fields</span>
            <span className="text-sm font-medium">中等</span>
            {size === "medium" && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <span className="text-primary">
                  <span className="material-icons text-sm">check_circle</span>
                </span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => handleSizeButtonClick("large")}
            className={cn(
              "flex flex-col items-center justify-center bg-white border rounded-xl py-5 transition-all",
              size === "large" 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <span className="material-icons text-2xl mb-2 text-neutral-700">text_fields</span>
            <span className="text-sm font-medium">较大</span>
            {size === "large" && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <span className="text-primary">
                  <span className="material-icons text-sm">check_circle</span>
                </span>
              </div>
            )}
          </button>
        </div>
        
        {/* 预览区域 */}
        <div className="bg-neutral-50 rounded-xl p-5 mb-6 border border-neutral-200">
          <h4 className="text-neutral-500 text-sm font-medium mb-3">预览效果</h4>
          <div className={cn(
            "bg-white rounded-lg p-4 border border-neutral-100",
            {
              "text-sm": size === "small",
              "text-base": size === "medium",
              "text-lg": size === "large"
            }
          )}>
            <p className="font-bold mb-1">老年英语学习</p>
            <p className="text-neutral-700">这是一个专为老年人设计的英语学习平台，通过{size === "small" ? "小号" : size === "large" ? "大号" : "普通"}字体，让您的阅读更舒适。</p>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl py-3.5 font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={saveSettings}
            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl py-3.5 font-medium transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
