import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string | null) => {
  if (!date) {
    return new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const d = new Date(date);
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function generateAnonymousName() {
  const adjectives = ["快乐", "开心", "勤劳", "聪明", "友善", "慈祥", "温暖", "活泼"];
  const nouns = ["松鼠", "水獭", "熊猫", "小猫", "小狗", "兔子", "大象", "鹦鹉"];
  
  const adjIndex = Math.floor(Math.random() * adjectives.length);
  const nounIndex = Math.floor(Math.random() * nouns.length);
  
  return `${adjectives[adjIndex]}${nouns[nounIndex]}`;
}

export function getFontSizeClass(size?: string) {
  switch (size) {
    case "small":
      return "text-base";
    case "large":
      return "text-xl";
    case "medium":
    default:
      return "text-lg";
  }
}

// Audio utilities
export function playAudio(audioSrc: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("正在播放音频:", audioSrc);
    
    const audio = new Audio();
    
    // 设置事件监听器
    audio.onended = () => {
      console.log("音频播放完成");
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error("音频播放错误:", error);
      reject(new Error("音频播放失败"));
    };
    
    audio.oncanplaythrough = () => {
      console.log("音频已加载，准备播放");
      audio.play()
        .then(() => console.log("音频开始播放"))
        .catch(error => {
          console.error("播放失败:", error);
          reject(error);
        });
    };
    
    // 添加加载超时处理
    const timeoutId = setTimeout(() => {
      console.error("音频加载超时");
      reject(new Error("音频加载超时"));
    }, 10000); // 10秒超时
    
    audio.onloadeddata = () => {
      clearTimeout(timeoutId);
    };
    
    // 设置音频源
    audio.src = audioSrc;
    audio.load();
  });
}

// For the voice recording feature
export async function startRecording(): Promise<MediaRecorder> {
  try {
    console.log("请求麦克风权限...");
    
    // 请求媒体权限，设置音频参数以获得更好的质量
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100 // 更兼容的采样率
      } 
    });
    
    console.log("麦克风访问成功，创建MediaRecorder");
    
    // 检查是否支持特定编解码器，以提高兼容性
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      ''  // 空字符串表示使用浏览器默认MIME类型
    ];
    
    let mimeType = '';
    for (const type of mimeTypes) {
      if (type === '' || MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        console.log(`使用${mimeType ? `MIME类型: ${mimeType}` : '浏览器默认MIME类型'}`);
        break;
      }
    }
    
    // 创建并配置MediaRecorder，降低比特率以提高兼容性
    const options: MediaRecorderOptions = mimeType ? {
      mimeType: mimeType,
      audioBitsPerSecond: 96000 // 降低比特率提高兼容性
    } : {};
    
    const mediaRecorder = new MediaRecorder(stream, options);
    
    // 设置数据收集
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    // 监听错误
    mediaRecorder.onerror = (event) => {
      console.error("录音过程中出错:", event);
    };
    
    // 每秒收集数据，确保不丢失
    mediaRecorder.start(500); // 500毫秒一次，更频繁地获取数据
    console.log("录音已开始");
    
    return mediaRecorder;
  } catch (error) {
    console.error("访问麦克风失败:", error);
    throw new Error(error instanceof Error ? error.message : "无法访问麦克风，请检查权限设置");
  }
}

export function stopRecording(mediaRecorder: MediaRecorder): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      console.log("停止录音...");
      // 使用全局变量保存数据块，避免事件监听器问题
      const chunks: BlobPart[] = [];
      
      // 设置超时保护，防止长时间挂起
      const timeoutId = setTimeout(() => {
        console.error("停止录音操作超时");
        
        try {
          // 即使超时，也尝试创建Blob，可能只是onstop事件没触发
          if (chunks.length > 0) {
            console.log("尝试从已有数据创建Blob，数据块:", chunks.length);
            const blob = new Blob(chunks, { type: "audio/webm" });
            if (blob.size > 0) {
              console.log("超时但成功创建Blob，大小:", blob.size);
              resolve(blob);
            } else {
              reject(new Error("录音数据为空"));
            }
          } else {
            reject(new Error("录音操作超时，未收到数据"));
          }
        } catch (e) {
          console.error("超时处理时出错:", e);
          reject(new Error("录音处理超时"));
        } finally {
          // 确保释放资源
          cleanupMediaRecorder(mediaRecorder);
        }
      }, 5000); // 5秒超时
      
      // 确保处理所有录音数据
      mediaRecorder.ondataavailable = (event) => {
        console.log("收到录音数据块，大小:", event.data?.size);
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      // 停止时的处理
      mediaRecorder.onstop = () => {
        console.log("录音已停止，创建音频Blob");
        clearTimeout(timeoutId); // 清除超时
        
        try {
          // 检查是否有数据
          if (chunks.length === 0) {
            console.warn("没有收到录音数据");
            reject(new Error("没有收到录音数据"));
            return;
          }
          
          // 尝试不同的音频格式，按浏览器兼容性顺序
          let blob: Blob;
          try {
            blob = new Blob(chunks, { type: "audio/webm" });
          } catch (e) {
            console.warn("创建webm格式失败，尝试ogg格式:", e);
            try {
              blob = new Blob(chunks, { type: "audio/ogg" });
            } catch (e2) {
              console.warn("创建ogg格式失败，使用默认格式:", e2);
              blob = new Blob(chunks);
            }
          }
          
          console.log("录音完成，Blob大小:", blob.size, "字节，类型:", blob.type);
          
          if (blob.size === 0) {
            reject(new Error("录音数据为空"));
            return;
          }
          
          resolve(blob);
        } catch (error) {
          console.error("创建音频Blob失败:", error);
          reject(new Error("创建音频文件失败"));
        } finally {
          // 总是清理资源
          cleanupMediaRecorder(mediaRecorder);
        }
      };
      
      // 处理录音错误
      mediaRecorder.onerror = (event) => {
        console.error("录音错误:", event);
        clearTimeout(timeoutId);
        cleanupMediaRecorder(mediaRecorder);
        reject(new Error("录音过程中出错"));
      };
      
      // 如果录音已经在进行中，先请求数据然后停止
      if (mediaRecorder.state === "recording") {
        try {
          mediaRecorder.requestData();
        } catch (e) {
          console.warn("requestData失败:", e);
        }
        
        try {
          mediaRecorder.stop();
        } catch (e) {
          console.error("停止录音失败:", e);
          clearTimeout(timeoutId);
          cleanupMediaRecorder(mediaRecorder);
          reject(new Error("停止录音失败"));
        }
      } else {
        console.warn("录音器不在录音状态:", mediaRecorder.state);
        clearTimeout(timeoutId);
        cleanupMediaRecorder(mediaRecorder);
        reject(new Error("录音器状态错误"));
      }
    } catch (error) {
      console.error("停止录音过程中出错:", error);
      cleanupMediaRecorder(mediaRecorder);
      reject(new Error("停止录音失败"));
    }
  });
}

// 帮助函数：清理MediaRecorder资源
function cleanupMediaRecorder(mediaRecorder: MediaRecorder) {
  try {
    // 停止所有轨道，释放麦克风资源
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => {
        try {
          if (track.readyState === 'live') {
            track.stop();
          }
        } catch (e) {
          console.warn("停止音频轨道失败:", e);
        }
      });
    }
  } catch (e) {
    console.warn("清理MediaRecorder资源失败:", e);
  }
}

// Safe WebSocket connection that handles errors and reconnection
// 全局维护WebSocket连接映射，避免重复创建连接
const activeWebSockets: Map<number, {ws: WebSocket, userId: number}> = new Map();

// 清理函数，从映射中移除指定房间的连接
export function cleanupWebSocket(roomId: number) {
  const connection = activeWebSockets.get(roomId);
  if (connection) {
    try {
      connection.ws.close(1000, "Cleanup");
    } catch (e) {
      console.error("关闭连接时出错:", e);
    }
    activeWebSockets.delete(roomId);
  }
}

// 关闭所有WebSocket连接
export function closeAllWebSockets() {
  activeWebSockets.forEach((connection, roomId) => {
    cleanupWebSocket(roomId);
  });
}

// 创建WebSocket连接并注册回调函数
export function createChatWebSocket(roomId: number, userId: number, onMessage: (data: any) => void) {
  // 先清理之前可能存在的连接
  cleanupWebSocket(roomId);
  
  // 创建新的WebSocket连接
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/ws`;
  
  console.log(`创建WebSocket连接 [房间ID: ${roomId}]`);
  const ws = new WebSocket(wsUrl);
  
  // 保存到活跃连接映射
  activeWebSockets.set(roomId, {ws, userId});
  
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2秒
  
  // 尝试重新连接
  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log(`达到最大重连次数 ${maxReconnectAttempts}，停止重连`);
      return;
    }
    
    reconnectAttempts++;
    console.log(`重连尝试 ${reconnectAttempts}/${maxReconnectAttempts}, ${reconnectDelay}ms后重试...`);
    
    reconnectTimeout = setTimeout(() => {
      // 重新创建连接
      const newWs = createChatWebSocket(roomId, userId, onMessage);
      activeWebSockets.set(roomId, {ws: newWs, userId});
    }, reconnectDelay);
  };
  
  // 连接打开后发送加入房间消息
  ws.onopen = () => {
    console.log(`WebSocket连接已建立 [房间ID: ${roomId}]`);
    reconnectAttempts = 0; // 成功连接后重置重连计数
    
    // 发送加入房间消息
    try {
      ws.send(JSON.stringify({
        type: "join",
        roomId,
        userId
      }));
    } catch (error) {
      console.error("发送加入房间消息失败:", error);
    }
  };
  
  // 接收消息
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("解析WebSocket消息时出错:", error);
    }
  };
  
  // 处理错误
  ws.onerror = (error) => {
    console.error(`WebSocket错误 [房间ID: ${roomId}]:`, error);
  };
  
  // 连接关闭时的处理
  ws.onclose = (event) => {
    console.log(`WebSocket连接已关闭 [房间ID: ${roomId}] 代码: ${event.code}, 原因: ${event.reason}`);
    
    // 移除连接映射
    if (activeWebSockets.get(roomId)?.ws === ws) {
      activeWebSockets.delete(roomId);
    }
    
    // 非正常关闭且不是清理导致的关闭，尝试重连
    if (event.code !== 1000) {
      attemptReconnect();
    }
  };
  
  // 添加页面卸载时的清理
  window.addEventListener('beforeunload', () => {
    cleanupWebSocket(roomId);
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
  });
  
  return ws;
}
