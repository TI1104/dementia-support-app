// src/hooks/useConversationHistory.ts

import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types/index';

interface ConversationAnalysis {
  similarity: number;
  category: 'frequent' | 'occasional' | 'new';
  isRepeated: boolean;
  semanticMatches?: number;
  exactMatches?: number;
  // **重要**: 類似度詳細を追加
  similarityDetails?: SimilarityDetail[];
}

// **新規追加**: 類似度詳細の型定義
interface SimilarityDetail {
  targetContent: string;
  similarity: number;
  matchType: 'exact' | 'semantic' | 'low';
  timestamp: Date;
  id: string;
}

interface SimilarityConfig {
  tfidfWeight: number;
  embeddingWeight: number;
  semanticThreshold: number;
}

// 高度な類似度計算クラス（日本語最適化版）
class AdvancedSimilarityCalculator {
  private config: SimilarityConfig = {
    tfidfWeight: 0.4,
    embeddingWeight: 0.6,
    semanticThreshold: 0.75
  };

  private vocabulary: Map<string, number> = new Map();
  private idfScores: Map<string, number> = new Map();

  // **修正されたトークナイザー（日本語最適化）**
  private tokenize(text: string): string[] {
    if (!text || typeof text !== 'string') return [];
    
    // 日本語の特性を考慮した改良版
    const normalized = text.trim().toLowerCase();
    
    // 1. 完全な文章をそのまま保持
    const fullText = normalized.replace(/[、。！？\s]/g, '');
    
    // 2. 句読点で分割した部分文章
    const sentences = normalized.split(/[、。！？]/).filter(s => s.trim().length > 0);
    
    // 3. 空白で分割した単語（制限を30文字に緩和）
    const words = normalized.split(/\s+/).filter(word => word.length > 0 && word.length <= 30);
    
    // 4. N-gram生成（2-gram, 3-gram）
    const ngrams = [];
    for (let n = 2; n <= Math.min(5, fullText.length); n++) {
      for (let i = 0; i <= fullText.length - n; i++) {
        ngrams.push(fullText.substring(i, i + n));
      }
    }
    
    // 5. 特徴語の抽出
    const features = this.extractKeywords(normalized);
    
    return [fullText, ...sentences, ...words, ...ngrams.slice(0, 20), ...features];
  }

  // キーワード抽出
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const emotionWords = ['嬉しい', '悲しい', '怒り', '不安', '楽しい', '寂しい', '心配'];
    const timeWords = ['昔', '今', '昨日', '明日', '若い頃', '最近', '前に', 'いつ'];
    const personWords = ['母', '父', '夫', '妻', '子供', '友達', '家族', '先生'];
    const memoryWords = ['覚えて', '忘れ', '思い出', '記憶', '知って', 'わからない'];
    const dailyWords = ['食事', '薬', '病院', '家', '外出', '買い物', 'テレビ'];
    const questionWords = ['どこ', 'いつ', 'だれ', 'なに', 'どう', 'なぜ'];
    
    const allKeywords = [...emotionWords, ...timeWords, ...personWords, ...memoryWords, ...dailyWords, ...questionWords];
    
    allKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  // 語彙構築とIDF計算
  public buildVocabularyAndIDF(texts: string[]): void {
    if (!texts || texts.length === 0) return;
    
    const wordDocFreq = new Map<string, number>();
    const totalDocs = texts.length;

    texts.forEach(text => {
      const uniqueWords = new Set(this.tokenize(text));
      uniqueWords.forEach(word => {
        if (!this.vocabulary.has(word)) {
          this.vocabulary.set(word, this.vocabulary.size);
        }
        wordDocFreq.set(word, (wordDocFreq.get(word) || 0) + 1);
      });
    });

    this.vocabulary.forEach((index, word) => {
      const docFreq = wordDocFreq.get(word) || 1;
      const idf = totalDocs > 0 ? Math.log(totalDocs / docFreq) : 0;
      this.idfScores.set(word, isNaN(idf) ? 0 : idf);
    });
  }

  // TF-IDF計算
  private calculateTFIDF(text: string): number[] {
    const words = this.tokenize(text);
    if (words.length === 0) return new Array(Math.max(this.vocabulary.size, 1)).fill(0);
    
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    const tfVector: number[] = new Array(Math.max(this.vocabulary.size, 1)).fill(0);
    this.vocabulary.forEach((index, word) => {
      const tf = (wordCounts.get(word) || 0) / words.length;
      const idf = this.idfScores.get(word) || 0;
      const tfidf = tf * idf;
      tfVector[index] = isNaN(tfidf) ? 0 : tfidf;
    });

    return tfVector;
  }

  // 意味的特徴抽出（強化版）
  private extractSemanticFeatures(text: string): number[] {
    const features: number[] = new Array(20).fill(0);
    const words = this.tokenize(text);
    
    if (words.length === 0) return features;
    
    const emotionWords = ['嬉しい', '悲しい', '怒り', '不安', '楽しい', '寂しい', '心配'];
    const timeWords = ['昔', '今', '昨日', '明日', '若い頃', '最近', '前に', 'いつ'];
    const personWords = ['母', '父', '夫', '妻', '子供', '友達', '家族', '先生'];
    const memoryWords = ['覚えて', '忘れ', '思い出', '記憶', '知って', 'わからない'];
    const dailyWords = ['食事', '薬', '病院', '家', '外出', '買い物', 'テレビ'];
    const questionWords = ['どこ', 'いつ', 'だれ', 'なに', 'どう', 'なぜ'];
    
    words.forEach(word => {
      if (emotionWords.some(ew => word.includes(ew))) features[0] += 1;
      if (timeWords.some(tw => word.includes(tw))) features[1] += 1;
      if (personWords.some(pw => word.includes(pw))) features[2] += 1;
      if (memoryWords.some(mw => word.includes(mw))) features[3] += 1;
      if (dailyWords.some(dw => word.includes(dw))) features[4] += 1;
      if (questionWords.some(qw => word.includes(qw))) features[5] += 1;
    });

    // 文の長さ特徴
    const lengthFeature = Math.min(words.length / 10, 1);
    features[6] = isNaN(lengthFeature) ? 0 : lengthFeature;
    
    // 繰り返し語の検出
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    const repeatFeature = Array.from(wordFreq.values()).filter(freq => freq > 1).length / words.length;
    features[7] = isNaN(repeatFeature) ? 0 : repeatFeature;

    // 文字数特徴
    const originalText = text.replace(/[、。！？\s]/g, '');
    features[8] = Math.min(originalText.length / 50, 1);

    return features;
  }

  // コサイン類似度計算
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (!vec1 || !vec2 || vec1.length !== vec2.length || vec1.length === 0) {
      return 0;
    }
    
    const dotProduct = vec1.reduce((sum, val, i) => {
      const product = (val || 0) * (vec2[i] || 0);
      return sum + (isNaN(product) ? 0 : product);
    }, 0);
    
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => {
      const square = (val || 0) * (val || 0);
      return sum + (isNaN(square) ? 0 : square);
    }, 0));
    
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => {
      const square = (val || 0) * (val || 0);
      return sum + (isNaN(square) ? 0 : square);
    }, 0));
    
    if (norm1 === 0 || norm2 === 0 || isNaN(norm1) || isNaN(norm2)) {
      return 0;
    }
    
    const similarity = dotProduct / (norm1 * norm2);
    return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
  }

  // Embedding類似度計算
  private calculateEmbeddingSimilarity(text1: string, text2: string): number {
    const features1 = this.extractSemanticFeatures(text1);
    const features2 = this.extractSemanticFeatures(text2);
    
    return this.cosineSimilarity(features1, features2);
  }

  // **完全修正された統合類似度計算**
  public calculateAdvancedSimilarity(text1: string, text2: string, allTexts: string[]): number {
    if (!text1 || !text2 || typeof text1 !== 'string' || typeof text2 !== 'string') {
      return 0;
    }

    // **最重要修正**: 完全一致チェック（正規化後）
    const normalize = (text: string) => text.trim().toLowerCase().replace(/[、。！？\s]/g, '');
    const normalized1 = normalize(text1);
    const normalized2 = normalize(text2);
    
    console.log('🔍 正規化結果:', {
      original1: text1,
      original2: text2,
      normalized1,
      normalized2,
      isEqual: normalized1 === normalized2
    });
    
    if (normalized1 === normalized2 && normalized1.length > 0) {
      console.log('🎯 完全一致検出:', text1, '===', text2);
      return 1.0;
    }

    // 高い文字列類似度チェック
    if (normalized1.length > 0 && normalized2.length > 0) {
      const longerLength = Math.max(normalized1.length, normalized2.length);
      const shorterLength = Math.min(normalized1.length, normalized2.length);
      
      // 文字列の包含関係チェック
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        const inclusionSimilarity = shorterLength / longerLength;
        if (inclusionSimilarity >= 0.8) {
          console.log('🎯 高い包含類似度検出:', inclusionSimilarity);
          return inclusionSimilarity;
        }
      }
    }

    // 語彙とIDFを構築
    this.buildVocabularyAndIDF(allTexts || []);
    
    // TF-IDF類似度
    const tfidfVec1 = this.calculateTFIDF(text1);
    const tfidfVec2 = this.calculateTFIDF(text2);
    const tfidfSimilarity = this.cosineSimilarity(tfidfVec1, tfidfVec2);

    // Embedding類似度
    const embeddingSimilarity = this.calculateEmbeddingSimilarity(text1, text2);

    // 重み付き統合
    const weightedTfidf = isNaN(tfidfSimilarity) ? 0 : tfidfSimilarity * this.config.tfidfWeight;
    const weightedEmbedding = isNaN(embeddingSimilarity) ? 0 : embeddingSimilarity * this.config.embeddingWeight;
    
    const combinedSimilarity = weightedTfidf + weightedEmbedding;
    const finalSimilarity = isNaN(combinedSimilarity) ? 0 : Math.max(0, Math.min(1, combinedSimilarity));
    
    console.log('🔍 類似度計算詳細:', {
      text1: text1.substring(0, 20) + '...',
      text2: text2.substring(0, 20) + '...',
      normalized1: normalized1.substring(0, 20) + '...',
      normalized2: normalized2.substring(0, 20) + '...',
      tfidfSimilarity,
      embeddingSimilarity,
      finalSimilarity
    });
    
    return finalSimilarity;
  }
}

// 時間ベースのフィルタリング関数
const getOneWeekAgo = (): Date => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return oneWeekAgo;
};

const isWithinLastWeek = (timestamp: Date): boolean => {
  const oneWeekAgo = getOneWeekAgo();
  return timestamp >= oneWeekAgo;
};

const filterConversationsByWeek = (conversations: Conversation[]): Conversation[] => {
  return conversations.filter(conv => isWithinLastWeek(conv.timestamp));
};

export const useConversationHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [repeatDetected, setRepeatDetected] = useState(false);
  const [lastAddedContent, setLastAddedContent] = useState('');
  const [lastAddedTime, setLastAddedTime] = useState(0);
  const [similarityCalculator] = useState(() => new AdvancedSimilarityCalculator());

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
        
        const filteredConversations = filterConversationsByWeek(conversationsWithDates);
        setConversations(filteredConversations);
        console.log('📚 会話履歴を読み込みました:', filteredConversations.length, '件（1週間以内）');
      } catch (error) {
        console.error('会話履歴の読み込みに失敗しました:', error);
      }
    }
  }, []);

  // 会話履歴をLocalStorageに保存
  useEffect(() => {
    if (conversations.length > 0) {
      const filteredConversations = filterConversationsByWeek(conversations);
      localStorage.setItem('conversation-history', JSON.stringify(filteredConversations));
      console.log('💾 会話履歴を保存しました:', filteredConversations.length, '件（1週間以内）');
      
      if (filteredConversations.length !== conversations.length) {
        setConversations(filteredConversations);
      }
    }
  }, [conversations]);

  // **修正された類似度計算（現在の状態を直接参照）**
  const calculateSimilarity = useCallback((text1: string, text2: string, currentConversations?: Conversation[]): number => {
    const conversationsToUse = currentConversations || conversations;
    const allTexts = conversationsToUse.map(conv => conv.content).filter(Boolean);
    const similarity = similarityCalculator.calculateAdvancedSimilarity(text1, text2, [...allTexts, text1, text2]);
    
    return isNaN(similarity) ? 0 : similarity;
  }, [similarityCalculator]);

  // 連続重複パターンの検出と除去
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

    // 段階2: 単語レベルでの分割と比較
    const words = trimmedText.split(/[、。！？\s]+/).filter(w => w.length > 0);
    if (words.length >= 2) {
      const halfLength = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, halfLength).join('');
      const secondHalf = words.slice(halfLength, halfLength * 2).join('');

      if (firstHalf === secondHalf && firstHalf.length > 2) {
        console.log('🚫 単語レベル重複検出:', trimmedText, '→', words.slice(0, halfLength).join(''));
        return words.slice(0, halfLength).join('');
      }

      for (let i = 1; i <= halfLength; i++) {
        const segment = words.slice(0, i).join('');
        const nextSegment = words.slice(i, i * 2).join('');
        if (segment === nextSegment && segment.length > 2) {
          console.log('🚫 部分重複パターンを検出:', trimmedText, '→', words.slice(0, i).join(''));
          return words.slice(0, i).join('');
        }
      }
    }

    console.log('✅ 重複なし:', trimmedText);
    return trimmedText;
  }, []);

  // **修正された会話分析（類似度詳細を含む）**
  const analyzeConversation = useCallback((content: string, currentConversations: Conversation[]): ConversationAnalysis => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { similarity: 0, category: 'new', isRepeated: false, similarityDetails: [] };
    }

    let maxSimilarity = 0;
    let semanticMatches = 0;
    let exactMatches = 0;
    const similarityDetails: SimilarityDetail[] = []; // **重要**: 類似度詳細を記録

    // **重要な修正**: 引数で渡された現在の会話リストを使用
    const recentConversations = filterConversationsByWeek(currentConversations);
    
    console.log('🔍 分析対象:', {
      newContent: trimmedContent,
      existingConversations: recentConversations.length,
      existingContents: recentConversations.map(c => c.content)
    });

    if (recentConversations.length > 0) {
      recentConversations.forEach((conv, index) => {
        const similarity = calculateSimilarity(trimmedContent, conv.content, currentConversations);
        const safeSimilarity = isNaN(similarity) ? 0 : similarity;
        maxSimilarity = Math.max(maxSimilarity, safeSimilarity);
        
        // **新規追加**: マッチタイプの判定
        let matchType: 'exact' | 'semantic' | 'low' = 'low';
        if (safeSimilarity >= 0.9) {
          matchType = 'exact';
          exactMatches++;
        } else if (safeSimilarity >= 0.7) {
          matchType = 'semantic';
          semanticMatches++;
        }

        // **重要**: すべての比較結果を記録
        similarityDetails.push({
          targetContent: conv.content,
          similarity: safeSimilarity,
          matchType,
          timestamp: conv.timestamp,
          id: conv.id
        });
        
        console.log(`📊 比較 ${index + 1}:`, {
          existing: conv.content,
          similarity: safeSimilarity,
          matchType
        });
      });

      // **重要**: 類似度順でソート
      similarityDetails.sort((a, b) => b.similarity - a.similarity);
    } else {
      // 最初の発話の場合
      maxSimilarity = 0.1;
    }

    // 分類ロジック
    let category: 'frequent' | 'occasional' | 'new' = 'new';
    let isRepeated = false;

    if (exactMatches >= 1) {
      category = 'frequent';
      isRepeated = true;
    } else if (semanticMatches >= 2) {
      category = 'frequent';
      isRepeated = true;
    } else if (semanticMatches >= 1) {
      category = 'occasional';
      isRepeated = true;
    }

    const finalSimilarity = isNaN(maxSimilarity) ? 0 : maxSimilarity;

    console.log('🔍 最終分析結果:', {
      content: trimmedContent,
      similarity: finalSimilarity,
      category,
      isRepeated,
      semanticMatches,
      exactMatches,
      similarityDetailsCount: similarityDetails.length
    });

    return { 
      similarity: finalSimilarity, 
      category, 
      isRepeated,
      semanticMatches,
      exactMatches,
      similarityDetails // **重要**: 類似度詳細を返す
    };
  }, [calculateSimilarity]);

  // **修正されたaddConversation（状態更新の同期化）**
  const addConversation = useCallback((content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const cleanedContent = removeConsecutiveDuplicates(trimmedContent);

    // 重複検出: 同じ内容が3秒以内に追加されようとした場合は無視
    const now = Date.now();
    if (cleanedContent === lastAddedContent && now - lastAddedTime < 3000) {
      console.log('🚫 重複したセリフを検出、追加をスキップ:', cleanedContent);
      return;
    }

    // **重要な修正**: setConversationsの関数型更新を使用して同期的に分析
    setConversations(prevConversations => {
      // 現在の状態を使って分析を実行
      const analysis = analyzeConversation(cleanedContent, prevConversations);

      const newConversation: Conversation = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: cleanedContent,
        timestamp: new Date(),
        isRepeated: analysis.isRepeated,
        category: analysis.category,
        similarity: analysis.similarity,
        // **重要**: 類似度詳細を保存
        similarityDetails: analysis.similarityDetails
      } as any;

      console.log('💬 新しい会話を追加:', {
        content: cleanedContent,
        category: analysis.category,
        similarity: analysis.similarity,
        semanticMatches: analysis.semanticMatches,
        exactMatches: analysis.exactMatches,
        similarityDetailsCount: analysis.similarityDetails?.length || 0
      });

      // 繰り返し検出の通知
      if (analysis.isRepeated) {
        setRepeatDetected(true);
        console.log('🔄 繰り返し会話を検出しました:', cleanedContent, {
          semanticMatches: analysis.semanticMatches,
          exactMatches: analysis.exactMatches,
          similarity: analysis.similarity
        });
        setTimeout(() => setRepeatDetected(false), 3000);
      }

      const updatedConversations = [newConversation, ...prevConversations];
      return filterConversationsByWeek(updatedConversations);
    });

    setLastAddedContent(cleanedContent);
    setLastAddedTime(now);
  }, [analyzeConversation, lastAddedContent, lastAddedTime, removeConsecutiveDuplicates]);

  const clearHistory = useCallback(() => {
    setConversations([]);
    setLastAddedContent('');
    setLastAddedTime(0);
    localStorage.removeItem('conversation-history');
    console.log('🗑️ 会話履歴をクリアしました');
  }, []);

  const getStats = useCallback(() => {
    const recentConversations = filterConversationsByWeek(conversations);
    const total = recentConversations.length;
    const frequent = recentConversations.filter(c => c.category === 'frequent').length;
    const occasional = recentConversations.filter(c => c.category === 'occasional').length;
    const newConv = recentConversations.filter(c => c.category === 'new').length;

    return {
      total,
      frequent,
      occasional,
      new: newConv,
      repeatRate: total > 0 ? ((frequent + occasional) / total * 100).toFixed(1) : '0'
    };
  }, [conversations]);

  return {
    conversations: filterConversationsByWeek(conversations),
    addConversation,
    clearHistory,
    repeatDetected,
    getStats,
    removeConsecutiveDuplicates
  };
};
