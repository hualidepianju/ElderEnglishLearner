/**
 * 图片辅助工具函数
 */

// 课程类型对应的图标和背景色
interface CourseTypeStyle {
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  label: string;
}

// 获取课程类型的样式
export function getCourseTypeStyle(type: string): CourseTypeStyle {
  switch (type) {
    case "oral":
      return {
        icon: "record_voice_over",
        gradientFrom: "from-blue-400",
        gradientTo: "to-blue-600",
        label: "口语练习"
      };
    case "vocabulary":
      return {
        icon: "menu_book",
        gradientFrom: "from-emerald-400",
        gradientTo: "to-emerald-600",
        label: "词汇学习"
      };
    case "writing":
      return {
        icon: "edit_note",
        gradientFrom: "from-amber-400",
        gradientTo: "to-amber-600",
        label: "写作练习"
      };
    case "article":
      return {
        icon: "article",
        gradientFrom: "from-violet-400",
        gradientTo: "to-violet-600",
        label: "阅读理解"
      };
    case "dubbing":
      return {
        icon: "mic",
        gradientFrom: "from-rose-400",
        gradientTo: "to-rose-600",
        label: "配音练习"
      };
    default:
      return {
        icon: "school",
        gradientFrom: "from-primary/70",
        gradientTo: "to-secondary/70",
        label: "学习内容"
      };
  }
}

// 课程难度对应的样式
interface DifficultyStyle {
  icon: string;
  textColor: string;
  bgColor: string;
  label: string;
}

// 获取难度级别的样式
export function getDifficultyStyle(difficulty: string): DifficultyStyle {
  switch (difficulty) {
    case "beginner":
      return {
        icon: "circle",
        textColor: "text-green-600",
        bgColor: "bg-green-100",
        label: "初级"
      };
    case "intermediate":
      return {
        icon: "change_history",
        textColor: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "中级"
      };
    case "advanced":
      return {
        icon: "star",
        textColor: "text-red-600",
        bgColor: "bg-red-100",
        label: "高级"
      };
    default:
      return {
        icon: "help",
        textColor: "text-neutral-600",
        bgColor: "bg-neutral-100",
        label: "未知"
      };
  }
}

// 聊天室名称生成唯一渐变色
export function getChatRoomGradient(name: string): string {
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const gradients = [
    "from-blue-400 to-indigo-600",
    "from-emerald-400 to-teal-600",
    "from-orange-400 to-amber-600",
    "from-rose-400 to-pink-600",
    "from-violet-400 to-purple-600"
  ];
  
  return gradients[Math.abs(hash) % gradients.length];
}

// 根据聊天室名称生成一个图标
export function getChatRoomIcon(name: string): string {
  const icons = ["forum", "chat", "groups", "language", "diversity_3", "public"];
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return icons[Math.abs(hash) % icons.length];
}

// 获取不同类型内容的默认图片URL
export function getDefaultImageUrl(type: string): string {
  // 为不同类型的内容提供默认图片
  switch (type) {
    case "oral":
      return "https://images.unsplash.com/photo-1573497019236-61f323342eb9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BlYWtpbmd8ZW58MHx8MHx8fDA%3D";
    case "vocabulary":
      return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dm9jYWJ1bGFyeXxlbnwwfHwwfHx8MA%3D%3D";
    case "writing":
      return "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d3JpdGluZ3xlbnwwfHwwfHx8MA%3D%3D";
    case "article":
      return "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhZGluZ3xlbnwwfHwwfHx8MA%3D%3D";
    case "dubbing":
      return "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWljcm9waG9uZXxlbnwwfHwwfHx8MA%3D%3D";
    default:
      return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWR1Y2F0aW9ufGVufDB8fDB8fHww";
  }
}

// 获取不同类型聊天室的默认图片URL
export function getDefaultChatRoomImageUrl(name: string): string {
  // 根据聊天室名称哈希值选择默认图片
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const images = [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGlzY3Vzc2lvbnxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1558403194-611308249627?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRhbGtpbmd8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvdXAlMjBjaGF0fGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29tbXVuaWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D"
  ];
  
  return images[Math.abs(hash) % images.length];
}

// 获取默认用户头像URL
export function getDefaultAvatarUrl(name: string): string {
  // 使用名字的首字母和随机颜色生成默认头像
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
}

// 默认头像选项列表
interface DefaultAvatar {
  id: number;
  url: string;
  name: string;
}

// 10个预设头像供用户选择
export const defaultAvatars: DefaultAvatar[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2VuaW9yfGVufDB8fDB8fHww",
    name: "微笑长者"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1556200549-10f308e80efa?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHNlbmlvcnxlbnwwfHwwfHx8MA%3D%3D",
    name: "休闲长者"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1595976200272-e91d64798964?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fHNlbmlvcnxlbnwwfHwwfHx8MA%3D%3D",
    name: "优雅女士"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1512632578888-169bbbc7efcf?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTB8fHNlbmlvcnxlbnwwfHwwfHx8MA%3D%3D",
    name: "活力先生"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGVsZGVybHl8ZW58MHx8MHx8fDA%3D",
    name: "智慧长者"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1517630800677-932d836ab680?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGVsZGVybHl8ZW58MHx8MHx8fDA%3D",
    name: "快乐爷爷"
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1534445967719-8ae7b972b3fd?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGVsZGVybHl8ZW58MHx8MHx8fDA%3D",
    name: "开心奶奶"
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGVsZGVybHl8ZW58MHx8MHx8fDA%3D",
    name: "思考者"
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww",
    name: "年轻女士" 
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww",
    name: "年轻先生"
  }
];