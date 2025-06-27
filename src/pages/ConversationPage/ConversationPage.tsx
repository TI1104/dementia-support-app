import { FC, useCallback, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import VoiceRecorder from '../../components/VoiceRecorder/VoiceRecorder';

const ConversationPage: FC = () => {
    console.log('📄 ConversationPage レンダリング - 第2論文の会話検出システム');

    // 会話履歴の状態
    const [conversations, setConversations] = useState<string[]>([]);
    const [repeatDetected, setRepeatDetected] = useState(false);

    // 会話履歴追加
    const addConversation = useCallback((sentence: string) => {
    setConversations(prev => {
        const isRepeat = prev.length > 0 && prev[prev.length - 1] === sentence;
        // setRepeatDetectedはここで呼ばない
        return [...prev, sentence];
    });
    setRepeatDetected(prev => {
        // conversationsの更新は非同期なので、ここで判定
        // 直前の会話が同じならtrue
        return conversations.length > 0 && conversations[conversations.length - 1] === sentence;
    });
}, [conversations]);

    // 履歴クリア
    const clearHistory = useCallback(() => {
        setConversations([]);
        setRepeatDetected(false);
    }, []);

    // 統計情報（例: 会話数）
    const getStats = useCallback(() => ({
        count: conversations.length,
    }), [conversations]);

    // 音声検出時の処理
    const handleSpeechDetected = useCallback((text: string, confidence: number) => {
        console.log('🔍 音声検出:', text, '信頼度:', confidence);
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim().length > 3);
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed) {
                addConversation(trimmed);
                console.log('💬 会話履歴に追加:', trimmed);
            }
        });
    }, [addConversation]);

    const stats = getStats();

    return (
        <Layout title="会話サポート - 認知症コミュニケーション支援">
            <div className="conversation-page">
                <div className="page-intro">
                    <h2>💬 会話サポートシステム</h2>
                    <p className="intro-text">
                        第2論文「同じ会話を繰り返す認知症患者」の研究成果を活用した
                        <br />
                        音声認識・会話パターン分析システムです
                    </p>
                </div>

                <VoiceRecorder
                    onSpeechDetected={handleSpeechDetected}
                />


                {repeatDetected && (
                    <div className="memory-trigger-notice">
                        <div className="notice-content">
                            <h4>🧠 思い出システム発動準備</h4>
                            <p>
                                繰り返し会話が検出されました。
                                <br />
                                第1論文・第3論文の思い出システムが自動的に発動します。
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ConversationPage;