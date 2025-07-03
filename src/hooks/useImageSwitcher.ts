// src/hooks/useImageSwitcher.ts
import { useState, useEffect, useCallback } from 'react';

interface ImageSwitcherReturn {
  currentImage: string;
  isImageVisible: boolean;
  triggerImageSwitch: () => void;
  hideImage: () => void;
}

export const useImageSwitcher = (): ImageSwitcherReturn => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(false);

  // サンプル画像配列（実際の思い出画像に置き換え可能）
  const sampleImages = [
    'https://via.placeholder.com/400x300/4caf50/white?text=家族の思い出1',
    'https://via.placeholder.com/400x300/2196f3/white?text=旅行の思い出',
    'https://via.placeholder.com/400x300/ff9800/white?text=お祭りの思い出',
    'https://via.placeholder.com/400x300/9c27b0/white?text=誕生日の思い出',
    'https://via.placeholder.com/400x300/f44336/white?text=お正月の思い出'
  ];

  const triggerImageSwitch = useCallback(() => {
    console.log('🖼️ 頻繁な繰り返し検出 - 画像切り替え開始');
    
    // 次の画像に切り替え
    setCurrentImageIndex(prev => (prev + 1) % sampleImages.length);
    setIsImageVisible(true);
    
    // 10秒後に画像を非表示
    setTimeout(() => {
      setIsImageVisible(false);
    }, 10000);
  }, [sampleImages.length]);

  const hideImage = useCallback(() => {
    setIsImageVisible(false);
  }, []);

  return {
    currentImage: sampleImages[currentImageIndex],
    isImageVisible,
    triggerImageSwitch,
    hideImage
  };
};
