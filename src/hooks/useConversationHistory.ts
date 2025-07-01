// src/hooks/useConversationHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types/index';


interface ConversationAnalysis {
  similarity: number;
  category: 'frequent' | 'occasional' | 'new';
  isRepeated: boolean;
}

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [repeatDetected, setRepeatDetected] = useState<boolean>(false);

  // LocalStorageから会話履歴を読み込み
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversation-history');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp)
        }));
        setConversations(conversationsWithDates);
        console.log('📚 会話履歴を読み込みました:', conversationsWithDates.length, '件');
      } catch (error) {
        console.error('会話履歴の読み込みに失敗しました:', error);
      }
    }
  }, []);

  // 会話履歴をLocalStorageに保存
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversation-history', JSON.stringify(conversations));
      console.log('💾 会話履歴を保存しました:', conversations.length, '件');
    }
  }, [conversations]);

  // 第2論文の知見に基づく類似度計算
  const calculateSimilarity = useCallback((text1: string, text2: string): number => {
    const normalize = (text: string) => text.toLowerCase().replace(/[、。！？\s]/g, '');
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);

    if (normalized1 === normalized2) return 1.0;
    if (normalized1.length === 0 || normalized2.length === 0) return 0.0;

    // 単語レベルでの類似度計算
// ...existing code...
    // 単語レベルでの類似度計算
// ...existing code...
    // 単語レベルでの類似度計算
    const words1 = normalized1.split('');
    const words2 = normalized2.split('');
// ...existing code...
    // 文字レベルでの類似度計算（重複カウントなし）
// ...existing code...
    // 文字レベルでの類似度計算（重複カウントなし）
// ...existing code...
// ...existing code...
    // 文字レベルでの類似度計算（重複カウントなし）
    const set1 = new Set(normalized1.split(''));
    const set2 = new Set(normalized2.split(''));
    const intersection = Array.from(set1).filter(char => set2.has(char));
    // Setを配列に変換してから結合
    const unionArray = Array.from(set1).concat(Array.from(set2));
    const unionSize = new Set(unionArray).size;

    if (unionSize === 0) return 0.0; // 0除算防止

    return intersection.length / unionSize;
// ...existing code...
// ...existing code...
// ...existing code...

    if (unionSize === 0) return 0.0; // 0除算防止

    return intersection.length / unionSize;
// ...existing code...



  
// ...existing code...
  }, []);

  // 会話の分析（第2論文の機能分析を参考）
  const analyzeConversation = useCallback((content: string): ConversationAnalysis => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { similarity: 0, category: 'new', isRepeated: false };
    }

    let maxSimilarity = 0;
    let repeatCount = 0;

    // 過去の会話との類似度を計算
    conversations.forEach(conv => {
      const similarity = calculateSimilarity(trimmedContent, conv.content);
      maxSimilarity = Math.max(maxSimilarity, similarity);
      
      // 類似度0.7以上を繰り返しと判定（第2論文の閾値を参考）
      if (similarity >= 0.7) {
        repeatCount++;
      }
    });

    let category: 'frequent' | 'occasional' | 'new' = 'new';
    let isRepeated = false;

    if (repeatCount >= 3) {
      category = 'frequent';
      isRepeated = true;
    } else if (repeatCount >= 1) {
      category = 'occasional';
      isRepeated = true;
    }

    return { similarity: maxSimilarity, category, isRepeated };
  }, [conversations, calculateSimilarity]);

  const addConversation = useCallback((content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const analysis = analyzeConversation(trimmedContent);
    
    const newConversation: Conversation = {
      id: Date.now().toString(),
      content: trimmedContent,
      timestamp: new Date(),
      isRepeated: analysis.isRepeated,
      category: analysis.category,
      similarity: analysis.similarity
    };

    setConversations(prev => [newConversation, ...prev].slice(0, 100)); // 最新100件まで保持
    
    // 繰り返し検出の通知
    if (analysis.isRepeated) {
      setRepeatDetected(true);
      console.log('🔄 繰り返し会話を検出しました:', trimmedContent);
      
      // 3秒後にフラグをリセット
      setTimeout(() => setRepeatDetected(false), 3000);
    }

    console.log('💬 新しい会話を追加:', {
      content: trimmedContent,
      category: analysis.category,
      similarity: analysis.similarity
    });
  }, [analyzeConversation]);

  const clearHistory = useCallback(() => {
    setConversations([]);
    localStorage.removeItem('conversation-history');
    console.log('🗑️ 会話履歴をクリアしました');
  }, []);

  // 統計情報の計算
  const getStats = useCallback(() => {
    const total = conversations.length;
    const frequent = conversations.filter(c => c.category === 'frequent').length;
    const occasional = conversations.filter(c => c.category === 'occasional').length;
    const newConv = conversations.filter(c => c.category === 'new').length;

    return {
      total,
      frequent,
      occasional,
      new: newConv,
      repeatRate: total > 0 ? ((frequent + occasional) / total * 100).toFixed(1) : '0'
    };
  }, [conversations]);

  return {
    conversations,
    addConversation,
    clearHistory,
    repeatDetected,
    getStats
  };
};
