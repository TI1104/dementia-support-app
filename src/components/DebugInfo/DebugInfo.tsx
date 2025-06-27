// src/components/DebugInfo/DebugInfo.tsx
import React, { FC } from 'react';

const DebugInfo: FC = () => {
  const currentTime = new Date().toLocaleString('ja-JP');
  const userAgent = navigator.userAgent;
  const screenSize = `${window.innerWidth}x${window.innerHeight}`;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '200px'
    }}>
      <div><strong>🕐 時刻:</strong> {currentTime}</div>
      <div><strong>📱 画面:</strong> {screenSize}</div>
      <div><strong>🌐 ブラウザ:</strong> {userAgent.includes('Chrome') ? 'Chrome' : 'Other'}</div>
      <div><strong>✅ React:</strong> 正常動作</div>
    </div>
  );
};

export default DebugInfo;
