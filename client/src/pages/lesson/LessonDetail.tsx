import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VoicePractice from "@/components/VoicePractice";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LearningContent, UserProgress } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function LessonDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch lesson details
  const { data: lesson, isLoading: isLoadingLesson } = useQuery<LearningContent>({
    queryKey: [`/api/learning/${id}`],
  });

  // Fetch user progress for this lesson
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery<UserProgress>({
    queryKey: [`/api/progress`, { contentId: Number(id) }],
    queryFn: async () => {
      const response = await fetch(`/api/progress?contentId=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }
      const data = await response.json();
      return data.find((p: UserProgress) => p.contentId === Number(id));
    },
  });

  // Initialize currentStep based on progress
  useEffect(() => {
    if (userProgress && userProgress.progress > 0) {
      // Calculate current step based on progress percentage
      // This is a simplified calculation - adjust as needed
      const totalSteps = getTotalSteps();
      const step = Math.floor((userProgress.progress / 100) * totalSteps);
      setCurrentStep(Math.min(step, totalSteps - 1));
      
      if (userProgress.completionStatus === "completed") {
        setIsCompleted(true);
      }
    }
  }, [userProgress]);

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (data: { contentId: number; progress: number; completionStatus: string }) => {
      return await apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress`] });
    },
    onError: (error: any) => {
      toast({
        title: "保存进度失败",
        description: error.message || "无法保存您的学习进度",
        variant: "destructive",
      });
    },
  });

  const getTotalSteps = () => {
    if (!lesson) return 0;
    
    if (lesson.type === "oral") {
      const dialogues = lesson.content.dialogues || [];
      return dialogues.length + 1; // +1 for intro
    }
    
    // Default to 4 steps for other types
    return 4;
  };

  const calculateProgress = (step: number) => {
    const totalSteps = getTotalSteps();
    return Math.round((step / totalSteps) * 100);
  };

  const handleStepComplete = () => {
    const nextStep = currentStep + 1;
    const totalSteps = getTotalSteps();
    
    const newProgress = calculateProgress(nextStep);
    const isFullyCompleted = nextStep >= totalSteps;
    
    // Save progress
    saveProgressMutation.mutate({
      contentId: Number(id),
      progress: newProgress,
      completionStatus: isFullyCompleted ? "completed" : "in_progress"
    });
    
    if (isFullyCompleted) {
      setIsCompleted(true);
      toast({
        title: "课程完成！",
        description: "恭喜您完成了本次学习",
      });
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    setLocation("/learning");
  };

  if (isLoadingLesson) {
    return (
      <Layout title="加载中..." onBack={handleBack}>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">正在加载课程内容...</p>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout title="找不到课程" onBack={handleBack}>
        <div className="p-4 text-center">
          <p className="text-lg mb-4">抱歉，找不到该课程</p>
          <Button onClick={handleBack}>返回学习页面</Button>
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    if (currentStep === 0) {
      return renderIntroduction();
    }
    
    if (lesson.type === "oral") {
      if (isCompleted) {
        return renderCompletionSummary();
      }
      
      // For oral practice, we render the dialogue practice
      return renderOralPractice();
    }
    
    // For other lesson types
    return (
      <div className="p-4 text-center">
        <p className="text-lg mb-4">这种类型的课程内容正在开发中</p>
        <Button onClick={handleBack}>返回学习页面</Button>
      </div>
    );
  };

  const renderIntroduction = () => {
    // 根据课程类型选择合适的背景色和图标
    const getLessonTypeStyle = () => {
      switch (lesson.type) {
        case "oral":
          return {
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
            icon: "record_voice_over"
          };
        case "vocabulary":
          return {
            bgColor: "bg-emerald-100",
            textColor: "text-emerald-600",
            icon: "menu_book"
          };
        case "writing":
          return {
            bgColor: "bg-amber-100",
            textColor: "text-amber-600",
            icon: "edit_note"
          };
        case "article":
          return {
            bgColor: "bg-violet-100",
            textColor: "text-violet-600",
            icon: "article"
          };
        default:
          return {
            bgColor: "bg-neutral-100",
            textColor: "text-neutral-600",
            icon: "school"
          };
      }
    };
    
    const typeStyle = getLessonTypeStyle();
    
    // 获取难度对应的样式
    const getDifficultyStyle = () => {
      switch (lesson.difficulty) {
        case "beginner":
          return {
            bgColor: "bg-green-100",
            textColor: "text-green-600",
            label: "初级"
          };
        case "intermediate":
          return {
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-600",
            label: "中级"
          };
        case "advanced":
          return {
            bgColor: "bg-red-100",
            textColor: "text-red-600",
            label: "高级"
          };
        default:
          return {
            bgColor: "bg-neutral-100",
            textColor: "text-neutral-600",
            label: "未知"
          };
      }
    };
    
    const difficultyStyle = getDifficultyStyle();
    
    return (
      <div className="p-4">
        <div className="relative mb-6 overflow-hidden rounded-xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 z-10"></div>
          
          {lesson.imageUrl ? (
            <img 
              src={lesson.imageUrl} 
              alt={lesson.title} 
              className="w-full h-56 object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-56 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <span className="material-icons text-white/80 text-7xl">{typeStyle.icon}</span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white z-20">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`${typeStyle.bgColor} ${typeStyle.textColor} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                {lesson.type === "oral" && "口语练习"}
                {lesson.type === "vocabulary" && "词汇学习"}
                {lesson.type === "writing" && "写作练习"}
                {lesson.type === "article" && "阅读理解"}
              </span>
              <span className={`${difficultyStyle.bgColor} ${difficultyStyle.textColor} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                {difficultyStyle.label}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{lesson.title}</h2>
            <p className="text-sm text-white/90">{lesson.description}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between mb-5">
            <div className="flex items-center mb-2 md:mb-0">
              <div className="rounded-full bg-primary/10 p-2 mr-3">
                <span className="material-icons text-primary">access_time</span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">课程时长</p>
                <p className="font-semibold">{lesson.duration}分钟</p>
              </div>
            </div>
            
            <div className="flex items-center mb-2 md:mb-0">
              <div className="rounded-full bg-secondary/10 p-2 mr-3">
                <span className="material-icons text-secondary">equalizer</span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">难度级别</p>
                <p className="font-semibold">{difficultyStyle.label}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full bg-success/10 p-2 mr-3">
                <span className="material-icons text-success">history_edu</span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-medium">学习状态</p>
                <p className="font-semibold">{isCompleted ? "已完成" : "未完成"}</p>
              </div>
            </div>
          </div>
          
          {lesson.type === "oral" && lesson.content.vocabulary && lesson.content.vocabulary.length > 0 && (
            <div className="mb-5 border-t border-neutral-100 pt-4">
              <h4 className="font-bold text-lg mb-3 flex items-center">
                <span className="material-icons text-primary mr-2">school</span>
                本课程包含的单词
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lesson.content.vocabulary.map((word, index) => (
                  <div 
                    key={index} 
                    className="bg-neutral-50 border border-neutral-200 p-3 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <p className="font-bold text-primary">{word.word}</p>
                    <p className="text-sm text-neutral-600">{word.translation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleStepComplete} 
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-4 font-semibold text-lg shadow-md transition-colors flex items-center justify-center"
          >
            <span className="material-icons mr-2">
              {isCompleted ? "replay" : "play_circle"}
            </span>
            {isCompleted ? "复习课程" : "开始学习"}
          </Button>
        </div>
      </div>
    );
  };

  const renderOralPractice = () => {
    const { dialogues } = lesson.content;
    
    if (!dialogues || dialogues.length === 0) {
      return (
        <div className="p-4 text-center">
          <p className="text-lg mb-4">该课程没有对话内容</p>
          <Button onClick={handleBack}>返回学习页面</Button>
        </div>
      );
    }
    
    // Adjust the index to get the current dialogue
    const dialogueIndex = currentStep - 1; // Subtract 1 because step 0 is introduction
    
    if (dialogueIndex >= dialogues.length) {
      return renderCompletionSummary();
    }
    
    return (
      <VoicePractice 
        dialogues={[dialogues[dialogueIndex]]} 
        onComplete={handleStepComplete} 
      />
    );
  };

  const renderCompletionSummary = () => {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 text-center">
          <div className="bg-success/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-success text-4xl">check_circle</span>
          </div>
          <h3 className="text-xl font-bold mb-2">恭喜您完成课程！</h3>
          <p className="mb-4">您已成功完成"{lesson.title}"课程的学习。</p>
          
          <div className="mb-6 text-left">
            <h4 className="font-semibold mb-2">课程回顾:</h4>
            <ul className="space-y-2 pl-4">
              {lesson.type === "oral" && lesson.content.dialogues && (
                <li>• 学习了{lesson.content.dialogues.length}个对话场景</li>
              )}
              {lesson.content.vocabulary && (
                <li>• 掌握了{lesson.content.vocabulary.length}个新单词</li>
              )}
              <li>• 学习时长约{lesson.duration}分钟</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              variant="outline"
              className="border-primary text-primary"
              onClick={() => setCurrentStep(0)}
            >
              重新学习
            </Button>
            <Button 
              className="bg-primary text-white"
              onClick={handleBack}
            >
              返回课程列表
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title={lesson.title} onBack={handleBack}>
      <div className="bg-white rounded-xl shadow-md p-4 mb-4 mx-4">
        <h3 className="text-xl font-bold mb-3">课程内容</h3>
        <div className="space-y-3">
          <LessonStep 
            number={1} 
            title="课程介绍" 
            status={currentStep >= 0 ? "completed" : "locked"}
            isActive={currentStep === 0}
            onClick={() => setCurrentStep(0)}
          />
          
          {lesson.type === "oral" && lesson.content.dialogues && 
            lesson.content.dialogues.map((dialogue, index) => (
              <LessonStep 
                key={index}
                number={index + 2}
                title={`对话${index + 1}: ${dialogue.role}`}
                status={
                  currentStep > index + 1 
                    ? "completed" 
                    : currentStep === index + 1 
                    ? "current" 
                    : "locked"
                }
                isActive={currentStep === index + 1}
                onClick={() => {
                  // Only allow navigation to steps that are already completed or current
                  if (currentStep >= index + 1) {
                    setCurrentStep(index + 1);
                  }
                }}
              />
            ))}
          
          <LessonStep 
            number={getTotalSteps() + 1}
            title="完成课程"
            status={isCompleted ? "completed" : "locked"}
            isActive={false}
          />
        </div>
      </div>
      
      {renderContent()}
    </Layout>
  );
}

interface LessonStepProps {
  number: number;
  title: string;
  status: "current" | "completed" | "locked";
  isActive: boolean;
  onClick?: () => void;
}

function LessonStep({ number, title, status, isActive, onClick }: LessonStepProps) {
  return (
    <div 
      className={cn(
        "flex items-center p-3 rounded-lg transition-colors cursor-pointer",
        isActive ? "bg-primary/10 border-2 border-primary" : "bg-primary/5",
        status === "locked" && !isActive && "opacity-60 cursor-not-allowed"
      )}
      onClick={status !== "locked" ? onClick : undefined}
    >
      <div className={cn(
        "rounded-full w-8 h-8 flex items-center justify-center mr-3",
        status === "completed" ? "bg-success text-white" : 
        status === "current" ? "bg-primary text-white" : 
        "bg-neutral-300 text-white"
      )}>
        {status === "completed" ? (
          <span className="material-icons text-sm">check</span>
        ) : (
          number
        )}
      </div>
      <div className="font-semibold">{title}</div>
      <span className={cn(
        "material-icons ml-auto",
        status === "current" ? "text-primary" : 
        status === "completed" ? "text-success" : 
        "text-neutral-400"
      )}>
        {status === "current" ? "play_circle" : 
         status === "completed" ? "check_circle" : 
         "lock"}
      </span>
    </div>
  );
}
