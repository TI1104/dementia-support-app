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
  const [repeatDetected, setRepeatDetected] = useState(false);
  const [lastAddedContent, setLastAddedContent] = useState('');
  const [lastAddedTime, setLastAddedTime] = useState(0);

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

    const set1 = new Set(normalized1.split(''));
    const set2 = new Set(normalized2.split(''));
    const intersection = Array.from(set1).filter(char => set2.has(char));
    const unionArray = Array.from(set1).concat(Array.from(set2));
    const unionSize = new Set(unionArray).size;

    if (unionSize === 0) return 0.0;
    return intersection.length / unionSize;
  }, []);

  // 改善された連続重複パターンの検出と除去
  const removeConsecutiveDuplicates = useCallback((text: string): string => {
    const trimmedText = text.trim();
    console.log('🔍 重複検出開始:', trimmedText);

    // 段階1: 正規表現による直接的な重複検出
    const duplicatePattern = /(.{3,}?)\1+/g;
    const match = trimmedText.match(duplicatePattern);
    
    if (match) {
      const firstMatch = match[0];
      const originalLength = firstMatch.length;
      const halfLength = Math.floor(originalLength / 2);
      const result = firstMatch.substring(0, halfLength);
      console.log('🚫 正規表現重複検出:', trimmedText, '→', result);
      return result;
    }

    // 段階2: 単語レベルでの分割と比較（空白がある場合）
    const words = trimmedText.split(/[、。！？\s]+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      const halfLength = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, halfLength).join('');
      const secondHalf = words.slice(halfLength, halfLength * 2).join('');
      
      if (firstHalf === secondHalf && firstHalf.length > 2) {
        console.log('🚫 単語レベル重複検出:', trimmedText, '→', words.slice(0, halfLength).join(''));
        return words.slice(0, halfLength).join('');
      }

      // より柔軟な重複検出（部分一致）
      for (let i = 1; i <= halfLength; i++) {
        const segment = words.slice(0, i).join('');
        const nextSegment = words.slice(i, i * 2).join('');
        if (segment === nextSegment && segment.length > 2) {
          console.log('🚫 部分重複パターンを検出:', trimmedText, '→', words.slice(0, i).join(''));
          return words.slice(0, i).join('');
        }
      }
    }

    // 段階3: 文字レベルでの重複検出（空白がない場合のフォールバック）
    const chars = trimmedText.split('');
    const halfLength = Math.floor(chars.length / 2);
    
    if (halfLength > 2) {
      const firstHalf = chars.slice(0, halfLength).join('');
      const secondHalf = chars.slice(halfLength, halfLength * 2).join('');
      
      if (firstHalf === secondHalf) {
        console.log('🚫 文字レベル重複検出:', trimmedText, '→', firstHalf);
        return firstHalf;
      }
    }

    // 段階4: 部分文字列の繰り返し検出
    for (let i = 3; i <= halfLength; i++) {
      const segment = chars.slice(0, i).join('');
      const nextSegment = chars.slice(i, i * 2).join('');
      
      if (segment === nextSegment && segment.length > 2) {
        console.log('🚫 部分文字列重複検出:', trimmedText, '→', segment);
        return segment;
      }
    }

    console.log('✅ 重複なし:', trimmedText);
    return trimmedText;
  }, []);

  // 会話の分析
  const analyzeConversation = useCallback((content: string): ConversationAnalysis => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { similarity: 0, category: 'new', isRepeated: false };
    }

    let maxSimilarity = 0;
    let repeatCount = 0;

    conversations.forEach(conv => {
      const similarity = calculateSimilarity(trimmedContent, conv.content);
      maxSimilarity = Math.max(maxSimilarity, similarity);
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

    // 連続重複パターンを除去
    const cleanedContent = removeConsecutiveDuplicates(trimmedContent);

    // 重複検出: 同じ内容が3秒以内に追加されようとした場合は無視
    const now = Date.now();
    if (cleanedContent === lastAddedContent && now - lastAddedTime < 3000) {
      console.log('🚫 重複したセリフを検出、追加をスキップ:', cleanedContent);
      return;
    }

    const analysis = analyzeConversation(cleanedContent);

    const newConversation: Conversation = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: cleanedContent,
      timestamp: new Date(),
      isRepeated: analysis.isRepeated,
      category: analysis.category,
      similarity: analysis.similarity
    };

    setConversations(prev => [newConversation, ...prev].slice(0, 100));
    setLastAddedContent(cleanedContent);
    setLastAddedTime(now);

    // 繰り返し検出の通知
    if (analysis.isRepeated) {
      setRepeatDetected(true);
      console.log('🔄 繰り返し会話を検出しました:', cleanedContent);
      setTimeout(() => setRepeatDetected(false), 3000);
    }

    console.log('💬 新しい会話を追加:', {
      content: cleanedContent,
      category: analysis.category,
      similarity: analysis.similarity
    });
  }, [analyzeConversation, lastAddedContent, lastAddedTime, removeConsecutiveDuplicates]);

  const clearHistory = useCallback(() => {
    setConversations([]);
    setLastAddedContent('');
    setLastAddedTime(0);
    localStorage.removeItem('conversation-history');
    console.log('🗑️ 会話履歴をクリアしました');
  }, []);

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
    getStats,
    removeConsecutiveDuplicates
  };
};
