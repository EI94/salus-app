import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { Trans } from '../utils/translationUtils';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (!user) return null;

  // Voci del menu di navigazione
  const menuItems = [
    { path: '/', label: 'dashboard', icon: '📊' },
    { path: '/symptoms', label: 'symptoms', icon: '🩺' },
    { path: '/medications', label: 'medications', icon: '💊' },
    { path: '/wellness', label: 'wellness', icon: '🧘' },
    { path: '/profile', label: 'profile', icon: '👤' },
    { path: '/settings', label: 'settings', icon: '⚙️' }
  ];

  return (
    <nav className="main-navigation">
      <ul className="nav-list">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                isActive || (item.path === '/' && location.pathname === '/') 
                  ? 'nav-link active' 
                  : 'nav-link'
              }
              title={<Trans i18nKey={`menu.${item.label}`} fallback={item.label} />}
              end={item.path === '/'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">
                <Trans i18nKey={`menu.${item.label}`} fallback={item.label} />
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation; 