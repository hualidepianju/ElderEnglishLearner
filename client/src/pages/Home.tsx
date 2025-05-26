import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import LessonCard from "@/components/LessonCard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { LearningContent, UserProgress } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch featured learning content
  const { data: featuredContent, isLoading: isLoadingContent } = useQuery<LearningContent[]>({
    queryKey: ["/api/learning"],
    enabled: !!user,
  });

  // Fetch user progress
  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && window.location.pathname !== "/") {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Get progress for a specific content item
  const getProgress = (contentId: number): number | undefined => {
    if (!userProgress) return undefined;
    
    const progress = userProgress.find(p => p.contentId === contentId);
    return progress?.progress === null ? undefined : progress?.progress;
  };

  const handleJoinDiscussion = () => {
    setLocation("/community");
  };

  return (
    <Layout title="乐学英语">
      <section className="p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {user ? `欢迎，${user.nickname}!` : "欢迎使用乐学英语"}
          </h2>
          <p className="text-lg">今天是继续学习英语的好日子</p>
        </div>

        {user && (
          <div className="bg-neutral-100 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">学习天数</span>
              <span className="font-bold text-primary">{user.streak}天</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-4 mb-4">
              <div 
                className="bg-primary h-4 rounded-full" 
                style={{ width: `${Math.min(user.streak * 5, 100)}%` }}
              ></div>
            </div>
            <div className="text-center text-sm">
              再学习{Math.max(20 - user.streak, 0)}天获得新徽章
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4">今日推荐学习</h3>
        
        {!user ? (
          <div className="text-center py-6 bg-neutral-100 rounded-xl">
            <p className="text-neutral-500">登录以查看推荐学习内容</p>
          </div>
        ) : isLoadingContent ? (
          <div className="text-center py-6 bg-neutral-100 rounded-xl">
            <p className="text-neutral-500">正在加载学习内容...</p>
          </div>
        ) : featuredContent && featuredContent.length > 0 ? (
          featuredContent.slice(0, 2).map(content => (
            <LessonCard 
              key={content.id} 
              lesson={content} 
              progress={getProgress(content.id)}
            />
          ))
        ) : (
          <div className="text-center py-6 bg-neutral-100 rounded-xl">
            <p className="text-neutral-500">暂无学习内容</p>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4">社区活动</h3>
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-neutral-200">
          <h4 className="font-bold text-lg mb-2">今日话题: 你最喜欢的英文歌曲?</h4>
          <p className="mb-3">已有28位学员参与讨论</p>
          {!user ? (
            <button 
              onClick={() => setLocation("/auth")}
              className="w-full bg-neutral-300 text-neutral-700 rounded-lg py-3 font-semibold text-lg"
            >
              登录后加入讨论
            </button>
          ) : (
            <button 
              onClick={handleJoinDiscussion}
              className="w-full bg-secondary text-white rounded-lg py-3 font-semibold text-lg"
            >
              加入讨论
            </button>
          )}
        </div>
      </section>
    </Layout>
  );
}
