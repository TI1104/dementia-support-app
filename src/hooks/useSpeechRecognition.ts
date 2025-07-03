// src/hooks/useSpeechRecognition.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  confidence: number;
  isFinal: boolean; // 新しく追加
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isFinal, setIsFinal] = useState(false); // 新しく追加
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ブラウザサポートの確認
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('🎤 音声認識開始');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;
      let hasFinalResult = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const resultText = result[0].transcript;
        const resultConfidence = result[0].confidence || 0.5;

        if (result.isFinal) {
          finalTranscript += resultText;
          maxConfidence = Math.max(maxConfidence, resultConfidence);
          hasFinalResult = true;
        } else {
          interimTranscript += resultText;
        }
      }

      // 最終結果または中間結果を設定
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setConfidence(maxConfidence);
        setIsFinal(true); // 発話確定
        console.log('✅ 認識結果:', finalTranscript, '信頼度:', maxConfidence);
      } else {
        setTranscript(interimTranscript);
        setConfidence(maxConfidence);
        setIsFinal(false); // 認識中
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ 音声認識エラー:', event.error);
      setError(`音声認識エラー: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('⏹️ 音声認識終了');
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('音声認識開始エラー:', error);
        setError('音声認識を開始できませんでした');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
    setConfidence(0);
    setIsFinal(false);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
    confidence,
    isFinal // 新しく追加
  };
};
