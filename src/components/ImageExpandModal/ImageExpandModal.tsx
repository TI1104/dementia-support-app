// src/components/ImageExpandModal/ImageExpandModal.tsx
import React, { FC, useEffect } from 'react';
import './ImageExpandModal.css';

interface ImageExpandModalProps {
  imageUrl: string;
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

const ImageExpandModal: FC<ImageExpandModalProps> = ({
  imageUrl,
  isVisible,
  onClose,
  title,
  description
}) => {
  // ESCキーで閉じる機能
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // スクロール無効化
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset'; // スクロール復活
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="image-expand-overlay" onClick={onClose}>
      <div className="image-expand-container" onClick={(e) => e.stopPropagation()}>
        <div className="image-expand-header">
          <h3>{title || '思い出の詳細'}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="image-expand-content">
          <div className="expanded-image-wrapper">
            <img 
              src={imageUrl} 
              alt={title || '思い出の画像'} 
              className="expanded-image"
            />
          </div>
          
          {description && (
            <div className="image-description">
              <p>{description}</p>
            </div>
          )}
        </div>
        
        <div className="image-expand-actions">
          <button className="action-btn secondary" onClick={onClose}>
            閉じる
          </button>
          <button className="action-btn primary">
            💬 この思い出について話し合う
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageExpandModal;
