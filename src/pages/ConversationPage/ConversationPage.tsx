// src/pages/ConversationPage/ConversationPage.tsx
import React, { FC, useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import VoiceRecorder from '../../components/VoiceRecorder/VoiceRecorder';
import ConversationHistory from '../../components/ConversationHistory/ConversationHistory';
import MemoryRecommendationPanel from '../../components/MemoryRecommendationPanel/MemoryRecommendationPanel';
import FrequentRepeatImageDisplay from '../../components/FrequentRepeatImageDisplay/FrequentRepeatImageDisplay';
import CaregiverGuidance from '../../components/CaregiverGuidance/CaregiverGuidance';
import { useConversationHistory } from '../../hooks/useConversationHistory';
import { useMemorySystem } from '../../hooks/useMemorySystem';
import { useImageSwitcher } from '../../hooks/useImageSwitcher';
import { MemoryRecommendation } from '../../types'; // 型をインポート
import './ConversationPage.css';

const ConversationPage: FC = () => {
  const {
    conversations,
    addConversation,
    clearHistory,
    repeatDetected,
    getStats
  } = useConversationHistory();

  const {
    memories,
    addCommentToMemory,
    getMemoryRecommendationForRepetition
  } = useMemorySystem();

  const {
    currentImage,
    isImageVisible,
    triggerImageSwitch,
    hideImage
  } = useImageSwitcher();

  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [currentRecommendations, setCurrentRecommendations] = useState<MemoryRecommendation[]>([]);
  const [frequentRepeatCount, setFrequentRepeatCount] = useState(0);
  const [showCaregiverGuidance, setShowCaregiverGuidance] = useState(false);
  const [newSpeechContent, setNewSpeechContent] = useState('');

  // 連続重複パターンの検出と除去
  const removeConsecutiveDuplicates = useCallback((text: string): string => {
    const trimmedText = text.trim();
    
    // 「音声認識できて音声認識できて」のような連続重複パターンを検出
    const words = trimmedText.split(/[、。！？\s]+/).filter(w => w.length > 0);
    
    if (words.length >= 2) {
      // 文章を半分に分けて比較
      const halfLength = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, halfLength).join('');
      const secondHalf = words.slice(halfLength, halfLength * 2).join('');
      
      // 前半と後半が同じ場合、前半のみを返す
      if (firstHalf === secondHalf && firstHalf.length > 2) {
        console.log('🚫 連続重複パターンを検出、後半を除去:', trimmedText, '→', words.slice(0, halfLength).join(''));
        return words.slice(0, halfLength).join('');
      }
      
      // より柔軟な重複検出（部分一致）
      for (let i = 1; i <= halfLength; i++) {
        const segment = words.slice(0, i).join('');
        const nextSegment = words.slice(i, i * 2).join('');
        
        if (segment === nextSegment && segment.length > 2) {
          console.log('🚫 部分重複パターンを検出、重複部分を除去:', trimmedText, '→', words.slice(0, i).join(''));
          return words.slice(0, i).join('');
        }
      }
    }
    
    return trimmedText;
  }, []);

  // 新しいセリフ検出と介護者ガイダンス表示
  useEffect(() => {
    if (conversations.length > 0) {
      const latestConversation = conversations[0];

      // 新しいセリフ（category が 'new'）の場合
      if (latestConversation.category === 'new') {
        console.log('🆕 新しいセリフを検出:', latestConversation.content);
        setNewSpeechContent(latestConversation.content);
        setShowCaregiverGuidance(true);
      }

      // 頻繁な繰り返しの処理
      if (repeatDetected && latestConversation.category === 'frequent') {
        setFrequentRepeatCount(prev => prev + 1);
        console.log('🔄 頻繁な繰り返し検出:', frequentRepeatCount + 1, '回目');

        if (frequentRepeatCount >= 2) {
          triggerImageSwitch();
          setFrequentRepeatCount(0);
        }
      }

      // 思い出推薦の処理
      if (repeatDetected) {
        const recommendations = getMemoryRecommendationForRepetition(latestConversation.content);
        if (recommendations.length > 0) {
          setCurrentRecommendations(recommendations);
          setShowMemoryPanel(true);
        }
      }
    }
  }, [conversations, repeatDetected, getMemoryRecommendationForRepetition, frequentRepeatCount, triggerImageSwitch]);

  // 音声認識ハンドラーの修正
  const handleSpeechDetected = useCallback((text: string, confidence: number, isFinal: boolean) => {
    if (confidence < 0.6) return;
    
    // 認識中は重複除去を行わない（リアルタイム表示のため）
    if (!isFinal) {
      return;
    }
    
    // 発話確定時のみ処理（重複除去を適用）
    if (isFinal && text !== lastProcessedTranscript && text.length > 3) {
      // 連続重複パターンを除去
      const cleanedText = removeConsecutiveDuplicates(text);
      
      // 句読点で文章を分割
      const sentences = cleanedText.split(/[。！？\n]/).filter(s => s.trim().length > 3);
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed && trimmed !== lastProcessedTranscript) {
          // addConversation内でも重複除去が行われる
          addConversation(trimmed);
          setLastProcessedTranscript(trimmed);
        }
      });
    }
  }, [addConversation, lastProcessedTranscript, removeConsecutiveDuplicates]);

  const stats = getStats();

  return (
    <Layout title="会話サポート - 認知症コミュニケーション支援">
      <div className="conversation-page">
        <div className="page-intro">
          <h2>💬 会話サポートシステム</h2>
          <p className="intro-text">
            3つの論文の研究成果を統合した
            <br />
            音声認識・会話分析・思い出推薦・介護者支援システムです
          </p>
          <div className="feature-highlights">
            <div className="highlight-item">
              <span className="highlight-icon">🎤</span>
              <span>リアルタイム音声認識</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">🔄</span>
              <span>繰り返し会話検出</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">💡</span>
              <span>介護者ガイダンス</span>
            </div>
          </div>
        </div>

        <VoiceRecorder 
          onSpeechDetected={handleSpeechDetected}
        />
        
        <ConversationHistory 
          conversations={conversations}
          onClearHistory={clearHistory}
          repeatDetected={repeatDetected}
          stats={stats}
        />

        {/* 思い出推薦パネル */}
        <MemoryRecommendationPanel
          recommendations={currentRecommendations}
          isVisible={showMemoryPanel}
          onClose={() => setShowMemoryPanel(false)}
          onAddComment={addCommentToMemory}
        />

        {/* 頻繁な繰り返し時の画像表示 */}
        <FrequentRepeatImageDisplay
          imageUrl={currentImage}
          isVisible={isImageVisible}
          onClose={hideImage}
        />

        {/* 新しいセリフ検出時の介護者ガイダンス */}
        <CaregiverGuidance
          isNewSpeech={showCaregiverGuidance}
          speechContent={newSpeechContent}
          onDismiss={() => setShowCaregiverGuidance(false)}
        />

        {/* システム統計情報 */}
        <div className="system-stats">
          <div className="stat-item">
            <span className="stat-label">新しいセリフ検出</span>
            <span className="stat-value">{stats.new}件</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">介護者ガイダンス表示</span>
            <span className="stat-value">{stats.new}回</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationPage;
