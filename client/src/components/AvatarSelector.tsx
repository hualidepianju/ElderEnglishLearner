import { useState } from "react";
import { cn } from "@/lib/utils";
import { defaultAvatars } from "@/lib/imageUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AvatarSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (url: string) => void;
  currentAvatar?: string | null;
}

export default function AvatarSelector({ 
  open, 
  onOpenChange, 
  onSelectAvatar,
  currentAvatar
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelectAvatar(selectedAvatar);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-md md:max-w-lg rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-xl font-bold text-center">选择您的头像</DialogTitle>
        </DialogHeader>
        
        <div className="py-3 px-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {defaultAvatars.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.url)}
                className={cn(
                  "relative rounded-xl p-1 overflow-hidden transition-all",
                  selectedAvatar === avatar.url
                    ? "ring-2 ring-primary scale-105 shadow-lg" 
                    : "hover:scale-105 hover:shadow-md",
                  avatar.url === currentAvatar && !selectedAvatar
                    ? "ring-2 ring-primary" 
                    : ""
                )}
              >
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img 
                    src={avatar.url} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://via.placeholder.com/150?text=无法加载";
                    }}
                  />
                </div>
                
                {selectedAvatar === avatar.url && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center rounded-xl">
                    <span className="material-icons text-white">check_circle</span>
                  </div>
                )}
                
                <p className="text-xs text-center mt-1 font-medium truncate px-1">
                  {avatar.name}
                </p>
              </button>
            ))}
            
            {/* 上传自定义头像选项 */}
            <button
              onClick={() => {}}
              className={cn(
                "relative rounded-xl p-1 overflow-hidden transition-all hover:shadow-md flex flex-col items-center justify-center"
              )}
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100 flex items-center justify-center">
                <span className="material-icons text-2xl sm:text-4xl text-neutral-400">add_photo_alternate</span>
              </div>
              <p className="text-xs text-center mt-1 font-medium">
                上传图片
              </p>
            </button>
          </div>
        </div>
        
        <DialogFooter className="p-3 border-t flex gap-2 sm:justify-between sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none h-10 text-sm"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedAvatar}
            className="flex-1 sm:flex-none h-10 text-sm"
          >
            确认选择
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}