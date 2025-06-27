// src/pages/MemoryPage/MemoryPage.tsx
import React, { FC } from 'react';
import Layout from '../../components/Layout/Layout';

const MemoryPage: FC = () => {
  return (
    <Layout title="思い出アルバム">
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>📸 思い出アルバム</h2>
        <p>写真とエピソードを活用した思い出想起システム</p>
        <div style={{ 
          background: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '10px',
          margin: '20px 0'
        }}>
          <strong>✅ ページ作成完了</strong>
          <br />
          明日、詳細機能を実装予定
        </div>
      </div>
    </Layout>
  );
};

export default MemoryPage;
