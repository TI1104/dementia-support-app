// src/components/VoiceRecorder/VoiceRecorder.tsx
import { FC, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onTranscriptChange?: (transcript: string) => void;
  onSpeechDetected?: (text: string, confidence: number, isFinal: boolean) => void; // isFinalを追加
}

const VoiceRecorder: FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  onSpeechDetected
}) => {
  const {
    transcript,
    isListening,
    resetTranscript,
    isSupported,
    startListening,
    stopListening,
    error,
    confidence,
    isFinal // 新しく追加
  } = useSpeechRecognition();

  useEffect(() => {
    if (isListening) {
      console.log('🎤 音声認識開始');
    } else {
      console.log('⏹️ 音声認識停止');
    }
  }, [isListening]);

  useEffect(() => {
    if (transcript && onTranscriptChange) {
      onTranscriptChange(transcript);
      console.log('✅ 認識結果:', transcript);
    }
  }, [transcript, onTranscriptChange]);

  useEffect(() => {
    if (transcript && onSpeechDetected) {
      onSpeechDetected(transcript, confidence, isFinal); // isFinalを渡す
    }
  }, [transcript, onSpeechDetected, confidence, isFinal]);

  if (!isSupported) {
    return (
      <div className="voice-recorder-error">
        <div className="error-icon">❌</div>
        <h3>音声認識非対応</h3>
        <p>お使いのブラウザは音声認識をサポートしていません</p>
        <p>Chrome、Edge、Safari（iOS 14.5以降）をHTTPS環境でお試しください</p>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      <div className="recorder-header">
        <h3>🎤 音声認識システム</h3>
        <div className="system-status">
          <div className={`status-dot ${isListening ? 'active' : 'inactive'}`}></div>
          <span className="status-text">{isListening ? '録音中' : '待機中'}</span>
        </div>
      </div>

      <div className="recording-controls">
        <button
          className={`record-btn ${isListening ? 'recording' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
        >
          <span className="record-icon">{isListening ? '⏹️' : '🎤'}</span>
          {isListening ? '録音停止' : '録音開始'}
        </button>
        <button
          className="reset-btn"
          onClick={resetTranscript}
          disabled={!transcript}
        >
          🗑️ リセット
        </button>
      </div>

      {isListening && (
        <div className="listening-indicator">
          <div className="pulse-animation"></div>
          <span>音声を聞いています...</span>
        </div>
      )}

      <div className="transcript-display">
        <h4>📝 認識結果</h4>
        <div className="transcript-content">
          {transcript || (
            <span className="placeholder">
              音声認識結果がここに表示されます。<br />
              「録音開始」ボタンを押して話してみてください。
            </span>
          )}
        </div>
        {transcript && (
          <div className="transcript-stats">
            <span>信頼度: {Math.round(confidence * 100)}%</span>
            <span>{isFinal ? '確定' : '認識中'}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
