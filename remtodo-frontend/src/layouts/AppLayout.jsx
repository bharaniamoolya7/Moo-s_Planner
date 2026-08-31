import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PixelAvatar from '../components/PixelAvatar';
import { QuickThemeToggle } from '../components/ThemeSelector';
import './AppLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/tasks', label: 'Tasks', icon: '✓' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/reminders', label: 'Reminders', icon: '🔔' },
  { path: '/vault', label: 'Doc Vault', icon: '📦' },
  { path: '/learning', label: 'Learning Hub', icon: '📚' },
  { path: '/coding', label: 'Coding Lab', icon: '◇' },
  { path: '/goals', label: 'Goals', icon: '⭐' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Custom planner title state
  const [plannerName, setPlannerName] = useState(() => {
    return localStorage.getItem('moosplanner_custom_title') || "moo'splanner";
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(plannerName);

  const avatarConfig = user?.avatarConfig || {};

  const handleSaveTitle = (e) => {
    if (e) e.stopPropagation();
    const trimmed = tempTitle.trim();
    const finalTitle = trimmed.length > 0 ? trimmed : "moo'splanner";
    setPlannerName(finalTitle);
    localStorage.setItem('moosplanner_custom_title', finalTitle);
    setIsEditingTitle(false);
  };

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditingTitle(true);
    setTempTitle(plannerName);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="moo'splanner logo" className="brand-logo-img-sm" />
          <span 
            className="mobile-brand"
            onClick={handleStartEdit}
            title="Click to rename your planner"
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            {plannerName}
            <span style={{ fontSize: '10px', opacity: 0.6 }}>✏️</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '100px' }}>
            <QuickThemeToggle />
          </div>
          <div className="mobile-avatar" onClick={() => navigate('/profile')}>
            <PixelAvatar config={avatarConfig} size={32} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Profile section */}
        <div className="sidebar-profile">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <img src="/logo.png" alt="moo'splanner logo" className="brand-logo-img-sidebar" onClick={() => navigate('/dashboard')} title="moo'splanner" />
          </div>
          <div 
            className="sidebar-avatar" 
            onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
            title="View Profile"
            style={{ cursor: 'pointer' }}
          >
            <PixelAvatar config={avatarConfig} size={56} />
          </div>

          {/* Editable Planner Name */}
          <div style={{ marginTop: '6px' }}>
            {isEditingTitle ? (
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={e => setTempTitle(e.target.value)}
                  onKeyDown={e => { 
                    if (e.key === 'Enter') handleSaveTitle(e); 
                    else if (e.key === 'Escape') setIsEditingTitle(false); 
                  }}
                  autoFocus
                  placeholder="Planner Name..."
                  style={{
                    fontFamily: 'var(--font-retro)',
                    fontSize: '15px',
                    padding: '2px 6px',
                    width: '120px',
                    textAlign: 'center',
                    border: '2px solid var(--border-dark)',
                    borderRadius: '4px',
                    background: 'var(--white)',
                    color: 'var(--brown-text)'
                  }}
                />
                <button 
                  type="button"
                  onClick={handleSaveTitle} 
                  title="Save Name"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    padding: '4px 6px',
                    background: 'var(--pink-header)',
                    color: '#fff',
                    border: '1px solid var(--border-dark)',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  ✓
                </button>
              </div>
            ) : (
              <div 
                className="sidebar-brand-wrapper"
                onClick={handleStartEdit}
                title="Click to rename your planner"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  transition: 'background 0.2s ease'
                }}
              >
                <span className="sidebar-brand">{plannerName}</span>
                <span style={{ fontSize: '11px', opacity: 0.6 }} className="edit-icon">✏️</span>
              </div>
            )}
          </div>

          <div 
            className="sidebar-username"
            onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
            style={{ cursor: 'pointer' }}
          >
            {user?.displayName || 'User'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Theme Toggle & Logout button */}
        <div className="sidebar-bottom">
          <div style={{ marginBottom: '10px', width: '100%', textAlign: 'center' }}>
            <QuickThemeToggle />
          </div>
          <button 
            type="button"
            className="btn sidebar-logout-btn" 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: '#FFE8E8',
              border: '2px solid #D9534F',
              color: '#D9534F',
              fontFamily: 'var(--font-pixel)',
              borderRadius: 'var(--radius-pixel)',
              cursor: 'pointer',
              boxShadow: '0 2px 0 #D9534F'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
