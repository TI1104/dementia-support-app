// src/components/Navigation/Navigation.tsx
import React, { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム', icon: '🏠' },
    { path: '/memories', label: '思い出', icon: '📸' },
    { path: '/conversation', label: '会話', icon: '💬' },
    { path: '/family', label: '家族', icon: '👨‍👩‍👧‍👦' },
  ];

  return (
    <nav className="bottom-navigation">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
