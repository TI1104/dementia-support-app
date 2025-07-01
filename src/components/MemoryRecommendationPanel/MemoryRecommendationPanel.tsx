// src/components/MemoryRecommendationPanel/MemoryRecommendationPanel.tsx
import React, { FC, useEffect, useState } from 'react';
import { MemoryRecommendation } from '../../types';
import MemoryCard from '../MemoryCard/MemoryCard';
import './MemoryRecommendationPanel.css';

interface MemoryRecommendationPanelProps {
  recommendations: MemoryRecommendation[];
  isVisible: boolean;
  onClose: () => void;
  onAddComment?: (memoryId: string, comment: any) => void;
}

const MemoryRecommendationPanel: FC<MemoryRecommendationPanelProps> = ({
  recommendations,
  isVisible,
  onClose,
  onAddComment
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (recommendations.length > 0) {
      setCurrentIndex(0);
    }
  }, [recommendations]);

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  const currentRecommendation = recommendations[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  return (
    <div className="memory-recommendation-overlay">
      <div className="memory-recommendation-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span className="panel-icon">🧠</span>
            <h3>思い出システム発動</h3>
            <span className="panel-subtitle">
              繰り返し会話を検出しました
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="panel-content">
          <div className="recommendation-info">
            <p className="recommendation-message">
              同じお話を繰り返されているようですね。
              <br />
              こんな思い出はいかがでしょうか？
            </p>
            
            {recommendations.length > 1 && (
              <div className="recommendation-counter">
                {currentIndex + 1} / {recommendations.length}
              </div>
            )}
          </div>

          <div className="memory-display">
            <MemoryCard
              memory={currentRecommendation.memory}
              isRecommended={true}
              recommendationReason={currentRecommendation.reason}
              onAddComment={onAddComment}
            />
          </div>

          {recommendations.length > 1 && (
            <div className="navigation-controls">
              <button 
                className="nav-btn prev-btn"
                onClick={handlePrevious}
              >
                ← 前の思い出
              </button>
              <button 
                className="nav-btn next-btn"
                onClick={handleNext}
              >
                次の思い出 →
              </button>
            </div>
          )}

          <div className="panel-actions">
            <button className="action-btn secondary" onClick={onClose}>
              後で見る
            </button>
            <button 
              className="action-btn primary"
              onClick={() => {
                console.log('💬 思い出について話し始める');
                // ここで会話開始のロジックを実装
              }}
            >
              この思い出について話す
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryRecommendationPanel;
