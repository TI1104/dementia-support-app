// src/components/CaregiverGuidance/CaregiverGuidance.tsx
import React, { FC, useEffect, useState } from 'react';
import './CaregiverGuidance.css';

interface CaregiverGuidanceProps {
  isNewSpeech: boolean;
  speechContent: string;
  onDismiss: () => void;
}

const CaregiverGuidance: FC<CaregiverGuidanceProps> = ({
  isNewSpeech,
  speechContent,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isNewSpeech) {
      setIsVisible(true);
      console.log('💡 新しいセリフ検出 - 介護者ガイダンス表示');
      
      // 10秒後に自動非表示
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isNewSpeech, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="caregiver-guidance-overlay">
      <div className="caregiver-guidance-panel">
        <div className="guidance-header">
          <div className="guidance-icon">💡</div>
          <h3>新しいお話を検出しました</h3>
          <button className="close-btn" onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}>
            ✕
          </button>
        </div>

        <div className="guidance-content">
          <div className="detected-speech">
            <h4>検出された内容:</h4>
            <p className="speech-text">「{speechContent}」</p>
          </div>

          <div className="guidance-instructions">
            <h4>📋 第2論文に基づく推奨対応</h4>
            <div className="instruction-grid">
              <div className="instruction-item">
                <div className="instruction-icon">👋</div>
                <div className="instruction-content">
                  <h5>頷きを増加</h5>
                  <p>積極的に頷いて関心を示しましょう</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">👁️</div>
                <div className="instruction-content">
                  <h5>目線を合わせる</h5>
                  <p>アイコンタクトを取り、注意深く聞きましょう</p>
                </div>
              </div>
              
              <div className="instruction-item">
                <div className="instruction-icon">💬</div>
                <div className="instruction-content">
                  <h5>会話量を増加</h5>
                  <p>「それは素晴らしいですね」「詳しく教えてください」など積極的に返答しましょう</p>
                </div>
              </div>
            </div>
          </div>

          <div className="scientific-basis">
            <h4>🔬 科学的根拠</h4>
            <p>
              第2論文の研究結果により、新しい会話内容に対してセラピストの注目量を増加させることで、
              認知症者の多様な会話を促進し、繰り返し会話を減少させる効果が実証されています。
            </p>
          </div>
        </div>

        <div className="guidance-actions">
          <button 
            className="action-btn primary"
            onClick={() => {
              console.log('✅ 介護者が推奨対応を実行');
              setIsVisible(false);
              onDismiss();
            }}
          >
            理解しました
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
          >
            後で確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaregiverGuidance;
