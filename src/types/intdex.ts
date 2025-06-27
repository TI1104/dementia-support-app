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
