// src/hooks/useMemorySystem.ts
import { useState, useEffect, useCallback } from 'react';
import { Memory, MemoryRecommendation, LifeStory, Comment } from '../types';
// ↑ Comment を追加

export const useMemorySystem = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [lifeStories, setLifeStories] = useState<LifeStory[]>([]);
  const [recommendations, setRecommendations] = useState<MemoryRecommendation[]>([]);

  // LocalStorageから思い出データを読み込み
  useEffect(() => {
    const savedMemories = localStorage.getItem('memory-system');
    const savedLifeStories = localStorage.getItem('life-stories');
    
    if (savedMemories) {
      try {
        const parsed = JSON.parse(savedMemories);
        const memoriesWithDates = parsed.map((memory: any) => ({
          ...memory,
          date: new Date(memory.date),
          comments: memory.comments.map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt)
          }))
        }));
        setMemories(memoriesWithDates);
        console.log('📚 思い出データを読み込みました:', memoriesWithDates.length, '件');
      } catch (error) {
        console.error('思い出データの読み込みに失敗:', error);
      }
    }

    if (savedLifeStories) {
      try {
        const parsed = JSON.parse(savedLifeStories);
        setLifeStories(parsed);
        console.log('📖 ライフストーリーを読み込みました:', parsed.length, '件');
      } catch (error) {
        console.error('ライフストーリーの読み込みに失敗:', error);
      }
    }
  }, []);

  // データをLocalStorageに保存
  useEffect(() => {
    if (memories.length > 0) {
      localStorage.setItem('memory-system', JSON.stringify(memories));
    }
  }, [memories]);

  useEffect(() => {
    if (lifeStories.length > 0) {
      localStorage.setItem('life-stories', JSON.stringify(lifeStories));
    }
  }, [lifeStories]);

  // 第1論文の知見：写真を思い出想起のトリガーとして利用
  const findRelatedMemories = useCallback((keywords: string[], emotions: string[] = []): MemoryRecommendation[] => {
    const relatedMemories: MemoryRecommendation[] = [];

    memories.forEach(memory => {
      let relevanceScore = 0;
      let reasons: string[] = [];

      // キーワードマッチング
      const keywordMatches = memory.tags.filter(tag => 
        keywords.some(keyword => keyword.includes(tag) || tag.includes(keyword))
      );
      if (keywordMatches.length > 0) {
        relevanceScore += keywordMatches.length * 0.3;
        reasons.push(`キーワード: ${keywordMatches.join(', ')}`);
      }

      // 場所マッチング
      if (memory.location && keywords.some(keyword => keyword.includes(memory.location!))) {
        relevanceScore += 0.4;
        reasons.push(`場所: ${memory.location}`);
      }

      // 時期マッチング
      const timeKeywords = ['春', '夏', '秋', '冬', '正月', 'クリスマス', '誕生日'];
      const timeMatches = timeKeywords.filter(timeKeyword => 
        keywords.some(keyword => keyword.includes(timeKeyword)) &&
        memory.description.includes(timeKeyword)
      );
      if (timeMatches.length > 0) {
        relevanceScore += 0.3;
        reasons.push(`時期: ${timeMatches.join(', ')}`);
      }

      if (relevanceScore > 0.2) {
        relatedMemories.push({
          memory,
          relevanceScore,
          reason: reasons.join(', '),
          triggerType: 'keyword'
        });
      }
    });

    return relatedMemories.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 3);
  }, [memories]);

  // 第2論文の知見：繰り返し会話検出時の思い出推薦
  const getMemoryRecommendationForRepetition = useCallback((conversationContent: string): MemoryRecommendation[] => {
    console.log('🔄 繰り返し会話に対する思い出推薦を開始:', conversationContent);

    // 会話内容からキーワードを抽出
    const keywords = conversationContent.split(/[、。！？\s]/).filter(word => word.length > 1);
    
    const recommendations = findRelatedMemories(keywords);
    
    // 繰り返し会話用の特別な推薦ロジック
    const specialRecommendations = recommendations.map(rec => ({
      ...rec,
      triggerType: 'repetition' as const,
      reason: `繰り返し会話「${conversationContent}」に関連: ${rec.reason}`
    }));

    console.log('💡 推薦された思い出:', specialRecommendations.length, '件');
    return specialRecommendations;
  }, [findRelatedMemories]);

  // 新しい思い出を追加
  const addMemory = useCallback((memoryData: Omit<Memory, 'id'>) => {
    const newMemory: Memory = {
      ...memoryData,
      id: Date.now().toString(),
    };

    setMemories(prev => [newMemory, ...prev]);
    console.log('📸 新しい思い出を追加:', newMemory.title);
  }, []);

  // 思い出にコメントを追加
  const addCommentToMemory = useCallback((memoryId: string, comment: Omit<Comment, 'id'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
    };

    setMemories(prev => prev.map(memory => 
      memory.id === memoryId 
        ? { ...memory, comments: [...memory.comments, newComment] }
        : memory
    ));

    console.log('💬 思い出にコメントを追加:', memoryId);
  }, []);

  // ライフストーリーを追加
  const addLifeStory = useCallback((storyData: Omit<LifeStory, 'id'>) => {
    const newStory: LifeStory = {
      ...storyData,
      id: Date.now().toString(),
    };

    setLifeStories(prev => [newStory, ...prev]);
    console.log('📖 新しいライフストーリーを追加:', newStory.community);
  }, []);

  return {
    memories,
    lifeStories,
    recommendations,
    addMemory,
    addCommentToMemory,
    addLifeStory,
    findRelatedMemories,
    getMemoryRecommendationForRepetition,
    setRecommendations
  };
};
