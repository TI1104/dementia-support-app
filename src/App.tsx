// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import ConversationPage from './pages/ConversationPage/ConversationPage';
import Navigation from './components/Navigation/Navigation';

function App() {
  console.log('🚀 認知症者コミュニケーション支援システム開始');
  
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/conversation" element={<ConversationPage />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
