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

// **修正**: 類似度詳細情報の型定義
interface SimilarityDetail {
  targetContent: string;
  similarity: number;
  matchType: 'exact' | 'semantic' | 'low';
  timestamp: Date;
  id: string;
}

// **修正**: 型パラメータを正しく設定
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else {
      return new Intl.DateTimeFormat('ja-JP', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
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
    if (similarity >= 0.3) return '#2196f3';
    return '#4caf50';
  };

  // **修正**: マッチタイプの表示情報
  const getMatchTypeInfo = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return { icon: '🎯', label: '完全一致', color: '#f44336' };
      case 'semantic':
        return { icon: '🔗', label: '意味的類似', color: '#ff9800' };
      default:
        return { icon: '📊', label: '低類似', color: '#9e9e9e' };
    }
  };

  const getSafeSimilarity = (conversation: Conversation): number => {
    const similarity = conversation.similarity || 0;
    return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
  };

  const getWeekRange = () => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return `${oneWeekAgo.toLocaleDateString('ja-JP')} - ${today.toLocaleDateString('ja-JP')}`;
  };

  return (
    <div className="conversation-history">
      {repeatDetected && (
        <div className="repeat-alert">
          <div className="alert-icon">🔄</div>
          <div className="alert-content">
            <h4>繰り返し発話を検出しました</h4>
            <p>同じような内容の発話が繰り返されています</p>
          </div>
        </div>
      )}

      <div className="history-header">
        <div className="header-content">
          <h3>📊 TF-IDF + Embedding類似度分析（詳細比較版）</h3>
          <p className="period-info">分析期間: {getWeekRange()}</p>
          <p className="analysis-note">完全一致優先 + 類似度詳細比較による会話パターン分析</p>
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

      <div className="chat-timeline">
        {conversations.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">💬</div>
            <h4>まだ会話履歴がありません</h4>
            <p>過去1週間の会話が表示されます</p>
            <p>音声認識を開始して会話を記録しましょう</p>
            <p className="empty-subtitle">類似度詳細比較で繰り返し検出を行います</p>
          </div>
        ) : (
          <div className="message-stream">
            {conversations.map((conversation, index) => {
              const categoryInfo = getCategoryInfo(conversation.category);
              const isLatest = index === 0;
              const safeSimilarity = getSafeSimilarity(conversation);

              return (
                <div key={conversation.id} className="message-thread">
                  {/* 日付区切り */}
                  {(index === 0 ||
                    formatDate(conversation.timestamp) !== formatDate(conversations[index - 1].timestamp)) && (
                    <div className="date-divider">
                      <span className="date-label">{formatDate(conversation.timestamp)}</span>
                    </div>
                  )}

                  {/* メッセージバブル */}
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
                        <span 
                          className="similarity-tag"
                          style={{ 
                            backgroundColor: getSimilarityColor(safeSimilarity),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75em',
                            marginLeft: '8px',
                            fontWeight: 'bold'
                          }}
                        >
                          {Math.round(safeSimilarity * 100)}%
                        </span>
                      </div>
                      <div className="time-stamp">
                        {formatTime(conversation.timestamp)}
                      </div>
                    </div>

                    <div className="bubble-content">
                      {conversation.content}
                    </div>

                    <div className="similarity-indicator" style={{ marginTop: '8px' }}>
                      <div className="similarity-info" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        fontSize: '0.8em',
                        color: '#666'
                      }}>
                        <span>最高類似度</span>
                        <span style={{ fontWeight: 'bold' }}>
                          {Math.round(safeSimilarity * 100)}%
                        </span>
                      </div>
                      <div className="similarity-bar-container" style={{ 
                        width: '100%', 
                        height: '6px', 
                        backgroundColor: '#e0e0e0', 
                        borderRadius: '3px',
                        marginTop: '4px'
                      }}>
                        <div 
                          className="similarity-bar"
                          style={{ 
                            backgroundColor: getSimilarityColor(safeSimilarity),
                            width: `${Math.max(safeSimilarity * 100, 3)}%`,
                            height: '100%',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    {conversation.isRepeated && (
                      <div className="repeat-notice" style={{ 
                        marginTop: '8px',
                        padding: '6px 10px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '6px',
                        fontSize: '0.85em',
                        color: '#f57c00',
                        border: '1px solid #ffcc02'
                      }}>
                        <span className="repeat-icon">🔄</span>
                        <span className="repeat-message">
                          この内容は以前にも話されています
                          {conversation.category === 'frequent' && ' (頻繁)'}
                        </span>
                      </div>
                    )}

                    {/* **修正された詳細表示（類似度比較詳細を含む）** */}
                    {selectedConversation === conversation.id && (
                      <div className="detail-panel" style={{ 
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '0.9em',
                        border: '1px solid #e9ecef'
                      }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>📊 詳細分析結果</h5>
                        <div className="detail-content">
                          <div className="detail-row" style={{ marginBottom: '6px' }}>
                            <strong>発話時刻:</strong> {conversation.timestamp.toLocaleString('ja-JP')}
                          </div>
                          <div className="detail-row" style={{ marginBottom: '6px' }}>
                            <strong>文字数:</strong> {conversation.content.length}文字
                          </div>
                          <div className="detail-row" style={{ marginBottom: '6px' }}>
                            <strong>最高類似度:</strong> 
                            <span style={{ 
                              color: getSimilarityColor(safeSimilarity),
                              fontWeight: 'bold',
                              marginLeft: '4px'
                            }}>
                              {Math.round(safeSimilarity * 100)}%
                            </span>
                          </div>
                          <div className="detail-row" style={{ marginBottom: '6px' }}>
                            <strong>分類カテゴリ:</strong> {conversation.category}
                          </div>
                          {conversation.isRepeated && (
                            <div className="detail-row" style={{ marginBottom: '6px' }}>
                              <strong>繰り返し検出:</strong> 
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ 検出済み</span>
                            </div>
                          )}

                          {/* **修正された類似度比較詳細** */}
                          {(conversation as any).similarityDetails && (conversation as any).similarityDetails.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <h6 style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '0.9em' }}>
                                🔍 類似度比較詳細（上位5件）
                              </h6>
                              <div className="similarity-details" style={{ 
                                maxHeight: '200px', 
                                overflowY: 'auto',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                padding: '8px',
                                backgroundColor: '#ffffff'
                              }}>
                                {(conversation as any).similarityDetails.slice(0, 5).map((detail: SimilarityDetail, idx: number) => {
                                  const matchInfo = getMatchTypeInfo(detail.matchType);
                                  return (
                                    <div key={detail.id} style={{ 
                                      marginBottom: idx < 4 ? '8px' : '0',
                                      padding: '8px',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '4px',
                                      border: '1px solid #e9ecef'
                                    }}>
                                      <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        marginBottom: '4px'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <span style={{ marginRight: '6px' }}>{matchInfo.icon}</span>
                                          <span style={{ 
                                            fontSize: '0.8em', 
                                            color: matchInfo.color,
                                            fontWeight: 'bold'
                                          }}>
                                            {matchInfo.label}
                                          </span>
                                        </div>
                                        <span style={{ 
                                          fontSize: '0.8em',
                                          fontWeight: 'bold',
                                          color: getSimilarityColor(detail.similarity)
                                        }}>
                                          {Math.round(detail.similarity * 100)}%
                                        </span>
                                      </div>
                                      <div style={{ 
                                        fontSize: '0.8em',
                                        color: '#6c757d',
                                        marginBottom: '4px'
                                      }}>
                                        <strong>比較対象:</strong> {formatTime(detail.timestamp)} - {detail.targetContent.substring(0, 50)}
                                        {detail.targetContent.length > 50 ? '...' : ''}
                                      </div>
                                      <div className="similarity-bar-container" style={{ 
                                        width: '100%', 
                                        height: '4px', 
                                        backgroundColor: '#e0e0e0', 
                                        borderRadius: '2px'
                                      }}>
                                        <div 
                                          className="similarity-bar"
                                          style={{ 
                                            backgroundColor: getSimilarityColor(detail.similarity),
                                            width: `${Math.max(detail.similarity * 100, 2)}%`,
                                            height: '100%',
                                            borderRadius: '2px'
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="detail-row" style={{ marginTop: '8px', fontSize: '0.8em', color: '#6c757d' }}>
                            <strong>アルゴリズム:</strong> 完全一致優先 + TF-IDF (40%) + Embedding (60%)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
