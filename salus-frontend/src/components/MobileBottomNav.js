import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MobileBottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'dashboard' },
    { path: '/sintomi', icon: 'fas fa-heartbeat', label: 'symptoms' },
    { path: '/farmaci', icon: 'fas fa-pills', label: 'medications' },
    { path: '/benessere', icon: 'fas fa-heart', label: 'wellness' },
    { path: '/profile', icon: 'fas fa-user', label: 'profile' }
  ];

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <i className={item.icon}></i>
          <span>{t(item.label)}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileBottomNav; 