// src/components/Layout/Layout.tsx
import React, { FC } from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: FC<LayoutProps> = ({ children, title = "思い出コミュニケーション支援" }) => {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="header-title">{title}</h1>
        <div className="header-status">
          <span className="status-indicator">✅ システム稼働中</span>
        </div>
      </header>
      <main className="layout-main">
        {children}
      </main>
      <footer className="layout-footer">
        <p>認知症者と家族のコミュニケーション支援システム</p>
      </footer>
    </div>
  );
};

export default Layout;
