// src/pages/HomePage/HomePage.tsx
import React, { FC } from 'react';
import Layout from '../../components/Layout/Layout';
import './HomePage.css';
import DebugInfo from '../../components/DebugInfo/DebugInfo';

const HomePage: FC = () => {
  return (
    <Layout title="ホーム - 思い出コミュニケーション支援">
      <div className="home-page">
        <div className="hero-section">
          <h2>🏠 ようこそ</h2>
          <p className="hero-description">
            3つの研究論文に基づいた認知症者コミュニケーション支援システムです
          </p>
        </div>
        
        <div className="system-status">
          <h3>📊 システム状況</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">フロントエンド</span>
              <span className="status-value active">✅ 稼働中</span>
            </div>
            <div className="status-item">
              <span className="status-label">音声認識</span>
              <span className="status-value pending">🔄 準備中</span>
            </div>
            <div className="status-item">
              <span className="status-label">データベース</span>
              <span className="status-value pending">🔄 準備中</span>
            </div>
          </div>
        </div>
      </div>
      <DebugInfo />
    </Layout>
    
  );
};

export default HomePage;
