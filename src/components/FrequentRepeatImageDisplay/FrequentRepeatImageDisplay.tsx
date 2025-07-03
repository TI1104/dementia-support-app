// src/components/FrequentRepeatImageDisplay/FrequentRepeatImageDisplay.tsx を更新
import React, { FC, useState } from 'react';
import ImageExpandModal from '../ImageExpandModal/ImageExpandModal';
import './FrequentRepeatImageDisplay.css';

interface FrequentRepeatImageDisplayProps {
  imageUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

const FrequentRepeatImageDisplay: FC<FrequentRepeatImageDisplayProps> = ({
  imageUrl,
  isVisible,
  onClose
}) => {
  const [showExpandedImage, setShowExpandedImage] = useState(false);

  if (!isVisible) return null;

  const handleTalkAboutMemory = () => {
    console.log('💬 この思い出について話し始める - 画像拡大表示');
    setShowExpandedImage(true);
  };

  return (
    <>
      <div className="frequent-repeat-overlay">
        <div className="frequent-repeat-container">
          <div className="image-header">
            <h3>🔄 同じお話が続いています</h3>
            <p>こちらの思い出はいかがですか？</p>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
          
          <div className="image-display">
            <img 
              src={imageUrl} 
              alt="思い出の画像" 
              className="memory-image"
              onClick={() => setShowExpandedImage(true)} // 画像クリックでも拡大
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          <div className="image-actions">
            <button 
              className="action-btn primary"
              onClick={handleTalkAboutMemory}
            >
              この思い出について話す
            </button>
            <button className="action-btn secondary" onClick={onClose}>
              後で見る
            </button>
          </div>
        </div>
      </div>

      {/* 画像拡大モーダル */}
      <ImageExpandModal
        imageUrl={imageUrl}
        isVisible={showExpandedImage}
        onClose={() => setShowExpandedImage(false)}
        title="思い出の詳細"
        description="この思い出について家族みんなで話し合ってみませんか？"
      />
    </>
  );
};

export default FrequentRepeatImageDisplay;
