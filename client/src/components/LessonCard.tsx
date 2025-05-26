import { cn } from "@/lib/utils";
import { LearningContent } from "@shared/schema";
import { useLocation } from "wouter";
import { getDifficultyStyle, getCourseTypeStyle, getDefaultImageUrl } from "@/lib/imageUtils";

interface LessonCardProps {
  lesson: LearningContent;
  progress?: number;
  className?: string;
}

export default function LessonCard({ lesson, progress, className }: LessonCardProps) {
  const [, setLocation] = useLocation();
  
  // 获取课程类型和难度的样式
  const typeStyle = getCourseTypeStyle(lesson.type);
  const difficultyStyle = getDifficultyStyle(lesson.difficulty);

  const handleLessonClick = () => {
    setLocation(`/learning/${lesson.id}`);
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-md overflow-hidden mb-4 border border-neutral-200 hover:shadow-lg transition-all duration-300", 
        className
      )}
      onClick={handleLessonClick}
    >
      <div className="relative">
        <div className="h-36 w-full bg-neutral-100 overflow-hidden">
          {lesson.imageUrl ? (
            <>
              <img 
                src={lesson.imageUrl} 
                alt={lesson.title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getDefaultImageUrl(lesson.type);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </>
          ) : (
            <>
              <img 
                src={getDefaultImageUrl(lesson.type)} 
                alt={lesson.title} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </>
          )}
          
          {/* 难度级别标签 */}
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            <span className={`flex items-center ${difficultyStyle.textColor}`}>
              <span className="material-icons text-sm mr-1">{difficultyStyle.icon}</span>
              {difficultyStyle.label}
            </span>
          </div>
          
          {/* 课程类型图标 */}
          <div className="absolute bottom-2 left-2 text-white z-10">
            <span className="material-icons text-2xl">{typeStyle.icon}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-lg mb-2 line-clamp-1">{lesson.title}</h4>
        <p className="text-sm text-neutral-700 mb-3 line-clamp-2">{lesson.description}</p>
        
        <div className="flex justify-between text-sm mb-3">
          <div className="flex items-center text-primary">
            <div className="bg-primary/10 rounded-full p-1 mr-1.5">
              <span className="material-icons text-sm">access_time</span>
            </div>
            <span>{lesson.duration}分钟</span>
          </div>
          
          <div className={`flex items-center px-2 py-1 rounded-full ${difficultyStyle.bgColor} ${difficultyStyle.textColor}`}>
            <span className="material-icons text-sm mr-1">{typeStyle.icon}</span>
            <span className="font-medium">{typeStyle.label}</span>
          </div>
        </div>
        
        {progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">学习进度</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 bg-white rounded-full border-2 border-primary"></span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <button 
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-3 mt-4 font-semibold text-base shadow-sm transition-colors flex items-center justify-center"
        >
          <span className="material-icons mr-2">
            {progress && progress > 0 ? "play_circle" : "visibility"}
          </span>
          {progress ? (progress > 0 ? "继续学习" : "开始学习") : "查看详情"}
        </button>
      </div>
    </div>
  );
}
