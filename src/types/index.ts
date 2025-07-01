// src/types/index.ts を作成
export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: Date;
  location?: string;
  tags: string[];
  comments: Comment[];
  category: 'family' | 'personal' | 'social';
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  role: 'patient' | 'family' | 'caregiver';
}

export interface Conversation {
  id: string;
  content: string;
  timestamp: Date;
  isRepeated: boolean;
  category: 'frequent' | 'occasional' | 'new';
  similarity: number;
}

export interface User {
  id: string;
  name: string;
  role: 'patient' | 'family' | 'caregiver';
  avatar?: string;
}

export interface LifeStory {
  id: string;
  userId: string;
  community: string;
  category: 'public' | 'private' | 'family';
  keywords: string[];
  episode: string;
  photos: string[];
  location?: string;
  timeframe: string;
}

// src/types/index.ts に追加
export interface ConversationStats {
  total: number;
  frequent: number;
  occasional: number;
  new: number;
  repeatRate: string;
}

export interface SpeechRecognitionConfig {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
}

// src/types/index.ts に思い出システムの型定義を追加
export interface Memory {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: Date;
  location?: string;
  tags: string[];
  comments: Comment[];
  category: 'family' | 'personal' | 'social';
  episodes: Episode[];
  relatedMemories: string[]; // 関連する思い出のID
}

export interface Episode {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  emotions: string[];
  keywords: string[];
}

export interface LifeStory {
  id: string;
  userId: string;
  community: string;
  category: 'public' | 'private' | 'family';
  keywords: string[];
  episode: string;
  photos: string[];
  location?: string;
  timeframe: string;
  relatedConversations: string[]; // 関連する会話のID
}

export interface MemoryRecommendation {
  memory: Memory;
  relevanceScore: number;
  reason: string;
  triggerType: 'repetition' | 'keyword' | 'emotion' | 'time';
}

