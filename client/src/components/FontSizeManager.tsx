import { useEffect } from 'react';
import { useUser } from '@/context/AuthUserContext';

/**
 * 全局字体大小管理组件
 * 
 * 此组件不渲染任何内容，仅用于在全局应用用户的字体大小设置
 * 根据用户偏好设置文档根元素的类名，以便通过CSS变量应用不同的字体大小
 */
export default function FontSizeManager() {
  const { user } = useUser();
  
  // 应用字体大小设置
  useEffect(() => {
    if (user?.preferences) {
      const { fontSize, theme } = user.preferences;
      
      // 清除所有已有的字体大小类
      document.documentElement.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
      
      // 添加当前字体大小类
      if (fontSize) {
        document.documentElement.classList.add(`text-size-${fontSize}`);
      }
      
      // 应用主题设置
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // 添加CSS变量到根元素以控制全局基础字体大小
      let baseFontSize = '16px';
      if (fontSize === 'small') baseFontSize = '14px';
      if (fontSize === 'large') baseFontSize = '18px';
      
      document.documentElement.style.setProperty('--base-font-size', baseFontSize);
    }
  }, [user?.preferences]);
  
  return null; // 这个组件不渲染任何UI元素
}