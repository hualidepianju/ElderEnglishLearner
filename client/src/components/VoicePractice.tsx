import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { startRecording, stopRecording, playAudio } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Dialogue {
  role: string;
  english: string;
  chinese: string;
  audio: string;
}

interface VoicePracticeProps {
  dialogues: Dialogue[];
  onComplete: () => void;
}

export default function VoicePractice({ dialogues, onComplete }: VoicePracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const currentDialogue = dialogues[currentIndex];

  // Clean up recorded audio when dialogue changes
  useEffect(() => {
    return () => {
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
      }
    };
  }, [recordedAudio]);

  // 音频播放引用
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 清理函数，确保资源释放
  const cleanupAudio = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      } catch (e) {
        console.warn("清理音频元素失败:", e);
      }
    }
  };
  
  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);
  
  const handlePlayOriginal = async () => {
    if (isPlaying) return;
    
    // 先清理之前的资源
    cleanupAudio();
    
    setIsPlaying(true);
    console.log("正在播放原声:", currentDialogue.audio);
    
    try {
      // 创建新的音频元素
      const audioElement = new Audio();
      audioRef.current = audioElement;
      
      // 设置监听器
      audioElement.onended = () => {
        console.log("原声播放完成");
        setIsPlaying(false);
      };
      
      audioElement.onerror = (e) => {
        console.error("原声播放失败:", e);
        toast({
          title: "音频播放失败",
          description: "无法播放原声音频，请稍后重试",
          variant: "destructive",
        });
        setIsPlaying(false);
      };
      
      // 添加加载超时处理
      timeoutRef.current = setTimeout(() => {
        console.error("原声音频加载超时");
        toast({
          title: "加载超时",
          description: "音频加载时间过长，请检查网络连接",
          variant: "destructive",
        });
        setIsPlaying(false);
      }, 8000); // 8秒超时，更合理的值
      
      // 音频加载完成事件
      audioElement.oncanplaythrough = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        console.log("原声音频已加载，准备播放");
      };
      
      // 设置音频源
      audioElement.src = currentDialogue.audio;
      audioElement.load();
      
      // 尝试播放
      try {
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("原声开始播放");
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            })
            .catch(error => {
              console.error("原声播放Promise失败:", error);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              // 更友好的错误消息，区分不同原因
              if (error.name === "NotAllowedError") {
                toast({
                  title: "需要用户操作",
                  description: "浏览器要求您进行交互后才能播放音频",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "播放失败",
                  description: "无法播放音频，请重试",
                  variant: "destructive",
                });
              }
              setIsPlaying(false);
            });
        }
      } catch (playError) {
        console.error("执行播放操作失败:", playError);
        toast({
          title: "播放操作失败",
          description: "无法开始播放音频，请重试",
          variant: "destructive",
        });
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("播放原声时出错:", error);
      toast({
        title: "播放错误",
        description: "播放过程中发生错误，请稍后重试",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
        setRecordedAudio(null);
      }
      
      const recorder = await startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
      
      toast({
        title: "开始录音",
        description: "请开始朗读对话内容",
      });
    } catch (error) {
      toast({
        title: "录音失败",
        description: "无法访问麦克风，请检查权限设置",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    if (!recorderRef.current) return;
    
    try {
      const blob = await stopRecording(recorderRef.current);
      const audioUrl = URL.createObjectURL(blob);
      setRecordedAudio(audioUrl);
      setIsRecording(false);
      
      toast({
        title: "录音完成",
        description: "点击播放按钮可听取您的录音",
      });
    } catch (error) {
      toast({
        title: "录音失败",
        description: "保存录音时出错，请重试",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const handlePlayRecording = async () => {
    if (!recordedAudio || isPlaying) return;
    
    // 先清理之前的资源
    cleanupAudio();
    
    setIsPlaying(true);
    try {
      console.log("正在播放录音:", recordedAudio);
      
      // 创建新的音频元素
      const audioElement = new Audio();
      audioRef.current = audioElement;
      
      // 设置监听器
      audioElement.onended = () => {
        console.log("录音播放完成");
        setIsPlaying(false);
      };
      
      audioElement.onerror = (e) => {
        console.error("录音播放失败:", e);
        toast({
          title: "无法播放录音",
          description: "播放您的录音时出错，请重新录制",
          variant: "destructive",
        });
        setIsPlaying(false);
      };
      
      // 添加加载超时处理
      timeoutRef.current = setTimeout(() => {
        console.error("录音加载超时");
        toast({
          title: "录音加载超时",
          description: "无法加载录音，请重新录制",
          variant: "destructive",
        });
        setIsPlaying(false);
      }, 5000); // 5秒超时
      
      // 音频加载完成事件
      audioElement.oncanplaythrough = () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        console.log("录音已加载，准备播放");
      };
      
      // 设置音频源
      audioElement.src = recordedAudio;
      audioElement.load();
      
      // 尝试播放
      try {
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("录音开始播放");
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
            })
            .catch(error => {
              console.error("录音播放Promise失败:", error);
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              
              let errorMessage = "无法播放录音，请重试";
              if (error.name === "NotAllowedError") {
                errorMessage = "浏览器需要您的操作才能播放";
              } else if (error.name === "NotSupportedError") {
                errorMessage = "您的浏览器不支持此录音格式";
              }
              
              toast({
                title: "播放录音失败",
                description: errorMessage,
                variant: "destructive",
              });
              setIsPlaying(false);
            });
        }
      } catch (playError) {
        console.error("执行播放操作失败:", playError);
        toast({
          title: "播放操作失败",
          description: "无法开始播放录音，请重试",
          variant: "destructive",
        });
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("播放录音时出错:", error);
      toast({
        title: "播放错误",
        description: "播放过程中发生错误，请重新录制",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRecordedAudio(null);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setRecordedAudio(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <h3 className="text-xl font-bold mb-3">口语练习</h3>
      
      <div className="border-l-4 border-primary pl-3 py-1 mb-4">
        <p className="font-semibold">请跟读下面的对话</p>
      </div>
      
      <div className="mb-4">
        <div className="flex mb-2">
          <div className="bg-neutral-100 rounded-lg p-3 max-w-[80%]">
            <p className="font-semibold mb-1">{currentDialogue.role}:</p>
            <p>{currentDialogue.english}</p>
            <p className="text-sm text-neutral-800/60 mt-1">"{currentDialogue.chinese}"</p>
            <button 
              onClick={handlePlayOriginal}
              disabled={isPlaying}
              className="mt-2 bg-secondary/10 text-secondary px-3 py-1 rounded-lg flex items-center"
            >
              <span className="material-icons text-sm mr-1">
                {isPlaying ? "pause" : "volume_up"}
              </span>
              <span>听原声</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center bg-neutral-100 rounded-lg p-6 mb-4">
        <span className={cn(
          "material-icons text-6xl mb-2",
          isRecording ? "text-error animate-pulse" : "text-primary"
        )}>
          mic
        </span>
        <p className="text-center mb-3">
          {isRecording ? "正在录音..." : "点击下方按钮开始跟读练习"}
        </p>
        
        <div className="flex gap-3">
          {!isRecording ? (
            <>
              <Button
                onClick={handleStartRecording}
                className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center"
                aria-label="开始录音"
              >
                <span className="material-icons text-2xl">mic</span>
              </Button>
              
              {recordedAudio && (
                <Button
                  onClick={handlePlayRecording}
                  disabled={isPlaying}
                  className="bg-secondary text-white rounded-full w-16 h-16 flex items-center justify-center"
                  aria-label="播放录音"
                >
                  <span className="material-icons text-2xl">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handleStopRecording}
              className="bg-error text-white rounded-full w-16 h-16 flex items-center justify-center animate-pulse"
              aria-label="停止录音"
            >
              <span className="material-icons text-2xl">stop</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className="bg-neutral-100 text-neutral-800 px-6 py-3 rounded-lg font-semibold"
        >
          上一步
        </Button>
        <Button
          onClick={handleNext}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold"
        >
          {currentIndex === dialogues.length - 1 ? "完成" : "下一步"}
        </Button>
      </div>
    </div>
  );
}
