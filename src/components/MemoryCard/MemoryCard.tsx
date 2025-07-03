// src/components/MemoryCard/MemoryCard.tsx に画像拡大機能を追加
import React, { FC, useState } from 'react';
import { Memory, Comment } from '../../types';
import ImageExpandModal from '../ImageExpandModal/ImageExpandModal';
import './MemoryCard.css';

interface MemoryCardProps {
  memory: Memory;
  onAddComment?: (memoryId: string, comment: Omit<Comment, 'id'>) => void;
  isRecommended?: boolean;
  recommendationReason?: string;
}

const MemoryCard: FC<MemoryCardProps> = ({ 
  memory, 
  onAddComment, 
  isRecommended = false,
  recommendationReason 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('家族');
  const [showExpandedImage, setShowExpandedImage] = useState(false);

  // ... 既存のコード ...

  return (
    <>
      <div className={`memory-card ${isRecommended ? 'recommended' : ''}`}>
        {/* ... 既存のコード ... */}

        {memory.imageUrl && (
          <div className="memory-image">
            <img 
              src={memory.imageUrl} 
              alt={memory.title}
              onClick={() => setShowExpandedImage(true)}
              style={{ cursor: 'pointer' }}
            />
            <div className="image-overlay">
              <span className="expand-hint">クリックで拡大</span>
            </div>
          </div>
        )}
        
        {/* ... 既存のコード ... */}
      </div>

      {/* 画像拡大モーダル */}
      {memory.imageUrl && (
        <ImageExpandModal
          imageUrl={memory.imageUrl}
          isVisible={showExpandedImage}
          onClose={() => setShowExpandedImage(false)}
          title={memory.title}
          description={memory.description}
        />
      )}
    </>
  );
};

export default MemoryCard;
