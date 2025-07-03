// src/components/ConversationHistory/ConversationHistory.tsx
import React, { FC, useState } from 'react';
import { Conversation } from '../../types/index';
import './ConversationHistory.css';

interface ConversationHistoryProps {
  conversations: Conversation[];
  onClearHistory: () => void;
  repeatDetected: boolean;
  stats: {
    total: number;
    frequent: number;
    occasional: number;
    new: number;
    repeatRate: string;
  };
}

const ConversationHistory: FC<ConversationHistoryProps> = ({
  conversations,
  onClearHistory,
  repeatDetected,
  stats
}) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'frequent':
        return { icon: '🔄', label: '頻繁', color: '#ff9800', bgColor: '#fff3e0' };
      case 'occasional':
        return { icon: '⚠️', label: '時々', color: '#ff5722', bgColor: '#fbe9e7' };
      default:
        return { icon: '💬', label: '新規', color: '#4caf50', bgColor: '#e8f5e8' };
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.7) return '#f44336';
    if (similarity >= 0.5) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div className="conversation-history">
      {repeatDetected && (
        <div className="repeat-alert">
          <div className="alert-icon">🔄</div>
          <div className="alert-content">
            <h4>繰り返し会話を検出</h4>
            <p>同じような内容の会話が検出されました。思い出システムを発動しますか？</p>
          </div>
        </div>
      )}

      <div className="history-header">
        <div className="header-title">
          <h3>📊 会話分析結果</h3>
          <p>第2論文に基づく会話パターン分析</p>
        </div>
        <button 
          className="clear-history-btn"
          onClick={onClearHistory}
          disabled={conversations.length === 0}
        >
          🗑️ 履歴をクリア
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">総会話数</div>
        </div>
        <div className="stat-card repeat">
          <div className="stat-number">{stats.repeatRate}%</div>
          <div className="stat-label">繰り返し率</div>
        </div>
        <div className="stat-card frequent">
          <div className="stat-number">{stats.frequent}</div>
          <div className="stat-label">頻繁な繰り返し</div>
        </div>
        <div className="stat-card occasional">
          <div className="stat-number">{stats.occasional}</div>
          <div className="stat-label">時々の繰り返し</div>
        </div>
      </div>

      {/* LINE風チャット表示 */}
      <div className="chat-timeline">
        {conversations.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">🎤</div>
            <h4>まだ会話履歴がありません</h4>
            <p>音声認識を開始して会話を記録しましょう</p>
            <p className="empty-subtitle">
              同じ内容を繰り返すと自動的に検出されます
            </p>
          </div>
        ) : (
          <div className="message-stream">
            {conversations.map((conversation, index) => {
              const categoryInfo = getCategoryInfo(conversation.category);
              const isLatest = index === 0;
              
              return (
                <div key={conversation.id} className="message-thread">
                  {/* 日付区切り */}
                  {(index === 0 || 
                    formatDate(conversation.timestamp) !== formatDate(conversations[index - 1].timestamp)) && (
                    <div className="date-divider">
                      <span className="date-label">{formatDate(conversation.timestamp)}</span>
                    </div>
                  )}
                  
                  {/* 独立したメッセージバブル */}
                  <div 
                    className={`chat-bubble ${conversation.category} ${isLatest ? 'latest' : ''}`}
                    onClick={() => setSelectedConversation(
                      selectedConversation === conversation.id ? null : conversation.id
                    )}
                  >
                    <div className="bubble-header">
                      <div className="category-section">
                        <span className="category-icon">{categoryInfo.icon}</span>
                        <span className="category-text">{categoryInfo.label}</span>
                        {conversation.similarity > 0 && (
                          <span 
                            className="similarity-tag"
                            style={{ 
                              backgroundColor: getSimilarityColor(conversation.similarity),
                              color: 'white'
                            }}
                          >
                            類似度: {Math.round(conversation.similarity * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="time-stamp">
                        {formatTime(conversation.timestamp)}
                      </div>
                    </div>
                    
                    <div className="bubble-content">
                      {conversation.content}
                    </div>
                    
                    {conversation.similarity > 0 && (
                      <div className="similarity-indicator">
                        <div 
                          className="similarity-bar"
                          style={{ 
                            backgroundColor: getSimilarityColor(conversation.similarity),
                            width: `${conversation.similarity * 100}%`
                          }}
                        />
                      </div>
                    )}
                    
                    {conversation.isRepeated && (
                      <div className="repeat-notice">
                        <span className="repeat-icon">🔄</span>
                        <span className="repeat-message">
                          この内容は以前にも話されています
                          {conversation.category === 'frequent' && ' (頻繁)'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* 詳細表示 */}
                  {selectedConversation === conversation.id && (
                    <div className="detail-panel">
                      <h5>📊 詳細分析</h5>
                      <div className="detail-content">
                        <div className="detail-row">
                          <strong>発話時刻:</strong> {conversation.timestamp.toLocaleString('ja-JP')}
                        </div>
                        <div className="detail-row">
                          <strong>文字数:</strong> {conversation.content.length}文字
                        </div>
                        <div className="detail-row">
                          <strong>類似度:</strong> {Math.round(conversation.similarity * 100)}%
                        </div>
                        <div className="detail-row">
                          <strong>カテゴリ:</strong> {conversation.category}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
