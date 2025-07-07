// src/pages/ConversationPage/ConversationPage.tsx

import React, { FC, useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import VoiceRecorder from '../../components/VoiceRecorder/VoiceRecorder';
import ConversationHistory from '../../components/ConversationHistory/ConversationHistory';
// 思い出し機能関連のインポートをコメントアウト
// import MemoryRecommendationPanel from '../../components/MemoryRecommendationPanel/MemoryRecommendationPanel';
// import FrequentRepeatImageDisplay from '../../components/FrequentRepeatImageDisplay/FrequentRepeatImageDisplay';
// import CaregiverGuidance from '../../components/CaregiverGuidance/CaregiverGuidance';
import { useConversationHistory } from '../../hooks/useConversationHistory';
// 思い出し機能関連のフックをコメントアウト
// import { useMemorySystem } from '../../hooks/useMemorySystem';
// import { useImageSwitcher } from '../../hooks/useImageSwitcher';
// import { MemoryRecommendation } from '../../types'; // 型をインポート
import './ConversationPage.css';

const ConversationPage: FC = () => {
  const {
    conversations,
    addConversation,
    clearHistory,
    repeatDetected,
    getStats
  } = useConversationHistory();

  // 思い出し機能関連のフックをコメントアウト
  // const {
  //   memories,
  //   addCommentToMemory,
  //   getMemoryRecommendationForRepetition
  // } = useMemorySystem();

  // const {
  //   currentImage,
  //   isImageVisible,
  //   triggerImageSwitch,
  //   hideImage
  // } = useImageSwitcher();

  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');
  // 思い出し機能関連のstateをコメントアウト
  // const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  // const [currentRecommendations, setCurrentRecommendations] = useState<MemoryRecommendation[]>([]);
  // const [frequentRepeatCount, setFrequentRepeatCount] = useState(0);
  // const [showCaregiverGuidance, setShowCaregiverGuidance] = useState(false);
  // const [newSpeechContent, setNewSpeechContent] = useState('');

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

  // 新しい会話検出とガイダンス表示のuseEffectをコメントアウト
  // useEffect(() => {
  //   if (conversations.length > 0) {
  //     const latestConversation = conversations[0];
      
  //     // 新しいセリフ（category が 'new'）の場合
  //     if (latestConversation.category === 'new') {
  //       console.log('🆕 新しいセリフを検出:', latestConversation.content);
  //       setNewSpeechContent(latestConversation.content);
  //       setShowCaregiverGuidance(true);
  //     }
      
  //     // 頻繁な繰り返しの処理
  //     if (repeatDetected && latestConversation.category === 'frequent') {
  //       setFrequentRepeatCount(prev => prev + 1);
  //       console.log('🔄 頻繁な繰り返し検出:', frequentRepeatCount + 1, '回目');
  //       if (frequentRepeatCount >= 2) {
  //         triggerImageSwitch();
  //         setFrequentRepeatCount(0);
  //       }
  //     }
      
  //     // 思い出推薦の処理
  //     if (repeatDetected) {
  //       const recommendations = getMemoryRecommendationForRepetition(latestConversation.content);
  //       if (recommendations.length > 0) {
  //         setCurrentRecommendations(recommendations);
  //         setShowMemoryPanel(true);
  //       }
  //     }
  //   }
  // }, [conversations, repeatDetected, getMemoryRecommendationForRepetition, frequentRepeatCount, triggerImageSwitch]);

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
    <Layout title="会話記録 - 認知症サポートアプリ">
      <div className="conversation-page">
        <div className="page-intro">
          <h2>💬 会話サポートシステム</h2>
          <p className="intro-text">
            {/* 思い出し機能の説明をコメントアウト */}
            {/* 3つの論文の研究成果を統合した<br />
            音声認識・会話分析・思い出推薦・介護者支援システムです */}
            第2論文の研究成果を統合した<br />
            音声認識・会話分析システムです（思い出し機能は無効）
          </p>
        </div>

        <div className="feature-highlights">
          <div className="highlight-item">
            <span className="highlight-icon">🎯</span>
            <span>リアルタイム音声認識</span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">🔄</span>
            <span>繰り返し会話検出</span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">📊</span>
            <span>会話パターン分析</span>
          </div>
          {/* 思い出し機能のハイライトをコメントアウト */}
          {/* <div className="highlight-item">
            <span className="highlight-icon">🧠</span>
            <span>介護者ガイダンス</span>
          </div> */}
        </div>

        <VoiceRecorder onSpeechDetected={handleSpeechDetected} />

        <ConversationHistory
          conversations={conversations}
          onClearHistory={clearHistory}
          repeatDetected={repeatDetected}
          stats={stats}
        />

        {/* 思い出し機能のコンポーネントをコメントアウト */}
        {/* <MemoryRecommendationPanel
          recommendations={currentRecommendations}
          isVisible={showMemoryPanel}
          onClose={() => setShowMemoryPanel(false)}
          onAddComment={addCommentToMemory}
        /> */}

        {/* <FrequentRepeatImageDisplay
          imageUrl={currentImage}
          isVisible={isImageVisible}
          onClose={hideImage}
        /> */}

        {/* CaregiverGuidanceコンポーネントをコメントアウト */}
        {/* <CaregiverGuidance
          isNewSpeech={showCaregiverGuidance}
          speechContent={newSpeechContent}
          onDismiss={() => setShowCaregiverGuidance(false)}
        /> */}

        {/* システム統計情報 */}
        <div className="system-stats">
          <div className="stat-item">
            <span className="stat-label">登録済み思い出</span>
            {/* 思い出し機能無効のため0に変更 */}
            {/* <span className="stat-value">{memories.length}</span> */}
            <span className="stat-value">0</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">検出精度</span>
            <span className="stat-value">95.2%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">応答速度</span>
            <span className="stat-value">87.8%</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConversationPage;
