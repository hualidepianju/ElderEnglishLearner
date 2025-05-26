import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";
import LessonCard from "@/components/LessonCard";
import { LearningContent, UserProgress } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// 匹配数据库中的类型
type CategoryType = "oral" | "vocabulary" | "article" | "writing";

export default function Learning() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("oral");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all learning content
  const { data: allContent, isLoading: isLoadingContent, error: contentError } = useQuery<LearningContent[]>({
    queryKey: ["/api/learning"],
  });

  // Fetch user progress
  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
  });

  // Filter content by active category
  const contentByType = allContent?.filter(content => content.type === activeCategory) || [];

  // Get all subtypes for the current category
  const availableSubtypes = Array.from(new Set(contentByType.map(content => content.subtype))).filter(Boolean) as string[];

  useEffect(() => {
    // Reset subcategory when changing main categories
    setActiveSubcategory(null);
  }, [activeCategory]);

  useEffect(() => {
    if (contentError) {
      toast({
        title: "加载内容失败",
        description: "无法加载学习内容，请稍后再试",
        variant: "destructive"
      });
    }
  }, [contentError, toast]);

  // Get progress for a specific content item
  const getProgress = (contentId: number): number | undefined => {
    if (!userProgress) return undefined;
    
    const progress = userProgress.find(p => p.contentId === contentId);
    return progress?.progress === null ? undefined : progress?.progress;
  };

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    setActiveSubcategory(null);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setActiveSubcategory(subcategory === activeSubcategory ? null : subcategory);
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "oral":
        return renderOralContent();
      case "vocabulary":
        return renderVocabularyContent();
      case "article":
        return renderArticlesContent();
      case "writing":
        return renderWritingContent();
      default:
        return null;
    }
  };

  const renderOralContent = () => {
    // 处理加载状态
    if (isLoadingContent) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-neutral-600">正在加载口语学习内容...</p>
        </div>
      );
    }

    // 获取所有口语练习内容
    const oralContent = contentByType || [];

    // 获取可用的子类别
    const subtypes = Array.from(new Set(oralContent.map(content => content.subtype))).filter(Boolean) as string[];
    
    // 准备子类别的显示信息
    const subtypeInfo: Record<string, {title: string, icon: string}> = {
      'daily': {title: '日常对话', icon: 'chat'},
      'supermarket': {title: '超市购物', icon: 'shopping_cart'},
      'hospital': {title: '医院问诊', icon: 'local_hospital'},
      'restaurant': {title: '餐厅点餐', icon: 'restaurant'},
      'transportation': {title: '交通出行', icon: 'directions_bus'},
      'travel': {title: '旅游度假', icon: 'flight'},
      'other': {title: '更多场景', icon: 'more_horiz'}
    };

    // 过滤显示当前选择的子类别
    const filteredContent = activeSubcategory 
      ? oralContent.filter(content => content.subtype === activeSubcategory)
      : oralContent;

    return (
      <div>
        <h3 className="text-xl font-bold mb-4">口语练习</h3>
        
        {/* Oral English Subcategories */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h4 className="font-bold mb-3">情景对话</h4>
          <div className="grid grid-cols-2 gap-3">
            {subtypes.length > 0 ? (
              subtypes.map(subtype => {
                const info = subtypeInfo[subtype] || {title: subtype, icon: 'category'};
                return (
                  <OralSubcategory 
                    key={subtype}
                    title={info.title} 
                    icon={info.icon} 
                    isActive={activeSubcategory === subtype}
                    onClick={() => handleSubcategoryChange(subtype)}
                  />
                );
              })
            ) : (
              <>
                <OralSubcategory 
                  title="日常对话" 
                  icon="chat" 
                  isActive={activeSubcategory === "daily"}
                  onClick={() => handleSubcategoryChange("daily")}
                />
                <OralSubcategory 
                  title="医院问诊" 
                  icon="local_hospital" 
                  isActive={activeSubcategory === "hospital"}
                  onClick={() => handleSubcategoryChange("hospital")}
                />
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h4 className="font-bold mb-3">配音练习</h4>
          <div className="space-y-3">
            <VoiceOverOption 
              title="动画配音" 
              icon="movie"
              bgColor="bg-rose-50"
              iconColor="text-rose-500"
              borderColor="border-rose-200"
              onClick={() => {}} 
            />
            <VoiceOverOption 
              title="电影片段配音" 
              icon="video_library"
              bgColor="bg-blue-50"
              iconColor="text-blue-500"
              borderColor="border-blue-200"
              onClick={() => {}} 
            />
            <VoiceOverOption 
              title="情景对话配音" 
              icon="mic"
              bgColor="bg-purple-50"
              iconColor="text-purple-500"
              borderColor="border-purple-200"
              onClick={() => {}} 
            />
          </div>
        </div>
        
        {/* Content List */}
        <div className="mt-4">
          <h4 className="font-bold mb-3">学习内容</h4>
          {isLoadingContent ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredContent.length > 0 ? (
            <div className="space-y-4">
              {filteredContent.map(content => (
                <LessonCard 
                  key={content.id} 
                  lesson={content} 
                  progress={getProgress(content.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-neutral-100 rounded-lg">
              <span className="material-icons text-3xl text-primary mb-2">search_off</span>
              <p className="text-neutral-600">
                {activeSubcategory ? '该类别下暂无学习内容' : '请从上方选择一个情景对话类别'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVocabularyContent = () => {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">单词学习</h3>
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <p className="mb-4">通过分类、场景学习英语单词，提高词汇量。</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <VocabCategory title="日常用语" count={45} onClick={() => {}} />
            <VocabCategory title="食物饮品" count={32} onClick={() => {}} />
            <VocabCategory title="出行交通" count={28} onClick={() => {}} />
            <VocabCategory title="身体健康" count={36} onClick={() => {}} />
          </div>
          
          <button className="w-full bg-primary text-white rounded-lg py-3 font-semibold">
            进入单词库
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h4 className="font-bold mb-3">单词记忆卡片</h4>
          <p className="mb-4">每天5个新单词，轻松积累词汇量</p>
          <div className="bg-neutral-100 rounded-lg p-4 mb-4 text-center">
            <h5 className="text-xl font-bold mb-1">Greeting</h5>
            <p className="text-neutral-500 mb-3">问候</p>
            <p className="italic mb-2">
              "A friendly greeting can make someone's day better."
            </p>
            <button className="bg-secondary/10 text-secondary px-3 py-1 rounded-lg flex items-center mx-auto">
              <span className="material-icons text-sm mr-1">volume_up</span>
              <span>播放发音</span>
            </button>
          </div>
          <div className="flex justify-between">
            <button className="bg-neutral-100 text-neutral-800 px-4 py-2 rounded-lg">
              上一个
            </button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg">
              下一个
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderArticlesContent = () => {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">英语美文</h3>
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="bg-accent/10 rounded-full p-2 mr-3">
              <span className="material-icons text-accent">auto_stories</span>
            </div>
            <h4 className="font-bold">每日短文</h4>
          </div>
          <div className="border-l-4 border-accent/50 pl-3 py-2 mb-3">
            <h5 className="font-semibold mb-1">The Joy of Learning</h5>
            <p className="text-sm text-neutral-500">学习的乐趣</p>
          </div>
          <p className="mb-3">
            Learning a new language opens doors to new cultures and experiences. 
            It helps us connect with people from different backgrounds...
          </p>
          <button className="w-full bg-accent text-white rounded-lg py-3 font-semibold">
            阅读全文
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h4 className="font-bold mb-3">文章分类</h4>
          <div className="grid grid-cols-2 gap-3">
            <ArticleCategory title="名人故事" count={12} onClick={() => {}} />
            <ArticleCategory title="自然科学" count={8} onClick={() => {}} />
            <ArticleCategory title="生活随笔" count={15} onClick={() => {}} />
            <ArticleCategory title="经典美文" count={10} onClick={() => {}} />
          </div>
        </div>
      </div>
    );
  };

  const renderWritingContent = () => {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">写作练习</h3>
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h4 className="font-bold mb-3">今日写作主题</h4>
          <div className="bg-warning/10 p-3 rounded-lg mb-3">
            <p className="font-semibold">My Favorite Hobby</p>
            <p className="text-sm text-neutral-500 mt-1">写一篇关于你最喜欢的爱好的短文</p>
          </div>
          <button className="w-full bg-warning text-white rounded-lg py-3 font-semibold">
            开始写作
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h4 className="font-bold mb-3">常用句型学习</h4>
          <div className="space-y-3">
            <div className="bg-neutral-100 rounded-lg p-3">
              <p className="font-semibold">自我介绍</p>
              <p className="text-sm mt-1">I am [name]. I am from [place].</p>
              <p className="text-sm text-neutral-500">我是[姓名]。我来自[地点]。</p>
            </div>
            <div className="bg-neutral-100 rounded-lg p-3">
              <p className="font-semibold">询问方向</p>
              <p className="text-sm mt-1">Excuse me, how can I get to [place]?</p>
              <p className="text-sm text-neutral-500">打扰一下，请问怎样去[地点]？</p>
            </div>
            <div className="bg-neutral-100 rounded-lg p-3">
              <p className="font-semibold">表达感谢</p>
              <p className="text-sm mt-1">Thank you for your help.</p>
              <p className="text-sm text-neutral-500">感谢您的帮助。</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout title="学习内容">
      <section className="p-4">
        <h2 className="text-2xl font-bold mb-6">学习内容</h2>
        
        {/* Learning Categories */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <CategoryCard
            title="口语练习"
            icon="record_voice_over"
            color="primary"
            isActive={activeCategory === "oral"}
            onClick={() => handleCategoryChange("oral")}
          />
          <CategoryCard
            title="单词学习"
            icon="menu_book"
            color="primary"
            isActive={activeCategory === "vocabulary"}
            onClick={() => handleCategoryChange("vocabulary")}
          />
          <CategoryCard
            title="英语美文"
            icon="article"
            color="primary"
            isActive={activeCategory === "article"}
            onClick={() => handleCategoryChange("article")}
          />
          <CategoryCard
            title="写作练习"
            icon="edit_note"
            color="primary"
            isActive={activeCategory === "writing"}
            onClick={() => handleCategoryChange("writing")}
          />
        </div>

        {/* Category Content */}
        {renderCategoryContent()}
      </section>
    </Layout>
  );
}

// Helper Components

interface OralSubcategoryProps {
  title: string;
  icon: string;
  isActive?: boolean;
  onClick: () => void;
}

function OralSubcategory({ title, icon, isActive = false, onClick }: OralSubcategoryProps) {
  return (
    <div 
      className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
        isActive ? "bg-primary/20" : "bg-primary/5"
      }`}
      onClick={onClick}
    >
      <span className="material-icons text-primary mb-1">{icon}</span>
      <div className="font-semibold">{title}</div>
    </div>
  );
}

interface VoiceOverOptionProps {
  title: string;
  icon: string;
  bgColor?: string;
  iconColor?: string;
  borderColor?: string;
  onClick: () => void;
}

function VoiceOverOption({ 
  title, 
  icon, 
  bgColor = "bg-secondary/5", 
  iconColor = "text-secondary",
  borderColor = "border-transparent",
  onClick 
}: VoiceOverOptionProps) {
  return (
    <div 
      className={`flex items-center p-3 ${bgColor} border ${borderColor} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mr-3`}>
        <span className={`material-icons ${iconColor}`}>{icon}</span>
      </div>
      <div className="font-medium">{title}</div>
      <span className="material-icons ml-auto">chevron_right</span>
    </div>
  );
}

interface VocabCategoryProps {
  title: string;
  count: number;
  onClick: () => void;
}

function VocabCategory({ title, count, onClick }: VocabCategoryProps) {
  return (
    <div 
      className="bg-secondary/5 p-3 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-neutral-500">{count}个单词</div>
    </div>
  );
}

interface ArticleCategoryProps {
  title: string;
  count: number;
  onClick: () => void;
}

function ArticleCategory({ title, count, onClick }: ArticleCategoryProps) {
  return (
    <div 
      className="bg-accent/5 p-3 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-neutral-500">{count}篇文章</div>
    </div>
  );
}
