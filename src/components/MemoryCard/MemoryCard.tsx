// src/components/MemoryCard/MemoryCard.tsx
import React, { FC, useState } from 'react';
import { Memory, Comment } from '../../types';
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

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(memory.id, {
        author: commentAuthor,
        content: newComment.trim(),
        createdAt: new Date(),
        role: 'family'
      });
      setNewComment('');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'family':
        return { icon: '👨‍👩‍👧‍👦', label: '家族', color: '#4caf50' };
      case 'personal':
        return { icon: '🙋‍♀️', label: '個人', color: '#2196f3' };
      case 'social':
        return { icon: '🌍', label: '社会', color: '#ff9800' };
      default:
        return { icon: '📝', label: 'その他', color: '#666' };
    }
  };

  const categoryInfo = getCategoryInfo(memory.category);

  return (
    <div className={`memory-card ${isRecommended ? 'recommended' : ''}`}>
      {isRecommended && (
        <div className="recommendation-banner">
          <span className="recommendation-icon">💡</span>
          <span className="recommendation-text">おすすめの思い出</span>
          {recommendationReason && (
            <div className="recommendation-reason">{recommendationReason}</div>
          )}
        </div>
      )}

      {memory.imageUrl && (
        <div className="memory-image">
          <img src={memory.imageUrl} alt={memory.title} />
        </div>
      )}
      
      <div className="memory-content">
        <div className="memory-header">
          <h3 className="memory-title">{memory.title}</h3>
          <span 
            className="memory-category"
            style={{ backgroundColor: categoryInfo.color }}
          >
            {categoryInfo.icon} {categoryInfo.label}
          </span>
        </div>
        
        <p className="memory-description">{memory.description}</p>
        
        <div className="memory-meta">
          <div className="memory-date">
            📅 {formatDate(memory.date)}
          </div>
          {memory.location && (
            <div className="memory-location">
              📍 {memory.location}
            </div>
          )}
        </div>

        <div className="memory-tags">
          {memory.tags.map(tag => (
            <span key={tag} className="memory-tag">#{tag}</span>
          ))}
        </div>

        <div className="memory-actions">
          <button 
            className="comments-toggle-btn"
            onClick={() => setShowComments(!showComments)}
          >
            💬 コメント ({memory.comments.length})
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            <div className="comments-list">
              {memory.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-date">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              ))}
            </div>

            {onAddComment && (
              <div className="add-comment-form">
                <div className="comment-author-select">
                  <select 
                    value={commentAuthor} 
                    onChange={(e) => setCommentAuthor(e.target.value)}
                  >
                    <option value="家族">家族</option>
                    <option value="介護者">介護者</option>
                    <option value="友人">友人</option>
                  </select>
                </div>
                <div className="comment-input-group">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="この思い出についてコメントを追加..."
                    rows={3}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="add-comment-btn"
                  >
                    コメント追加
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCard;
