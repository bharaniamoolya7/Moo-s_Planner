import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export function QuickThemeToggle() {
  const { theme, setTheme, THEMES } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const currentIndex = THEMES.findIndex(t => t.id === theme);
  const currentThemeObj = THEMES[currentIndex >= 0 ? currentIndex : 0];

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + THEMES.length) % THEMES.length;
    setTheme(THEMES[prevIndex].id);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 30) {
      handleNext(e);
    } else if (diff < -30) {
      handlePrev(e);
    }
    setTouchStart(null);
  };

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '100%' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          background: 'var(--white)',
          border: '2px solid var(--border-dark)',
          borderRadius: 'var(--radius-pixel)',
          boxShadow: '0 2px 0 var(--border-dark)',
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          title="Previous Theme (or Swipe Right)"
          style={{
            background: 'var(--bg-cream-light)',
            border: 'none',
            borderRight: '1.5px solid var(--border-dark)',
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            color: 'var(--brown-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}
        >
          ◄
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Click to select from all themes"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            padding: '6px 6px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--brown-text)',
            cursor: 'pointer',
            minWidth: 0,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: '13px', lineHeight: 1 }}>{currentThemeObj.icon}</span>
          <span style={{ 
            fontFamily: 'var(--font-pixel)', 
            fontSize: '9px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {currentThemeObj.name}
          </span>
          <span style={{ fontSize: '7px', opacity: 0.7 }}>▼</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          title="Next Theme (or Swipe Left)"
          style={{
            background: 'var(--bg-cream-light)',
            border: 'none',
            borderLeft: '1.5px solid var(--border-dark)',
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: '11px',
            color: 'var(--brown-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}
        >
          ►
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div style={{
            position: 'absolute',
            bottom: '115%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '230px',
            background: 'var(--white)',
            border: '2px solid var(--border-dark)',
            boxShadow: 'var(--shadow-pixel)',
            zIndex: 999,
            padding: '8px',
            borderRadius: 'var(--radius-pixel)',
            maxHeight: '260px',
            overflowY: 'auto'
          }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              padding: '6px 8px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '6px',
              color: 'var(--brown-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>SELECT THEME ✨</span>
              <span style={{ fontSize: '8px', color: 'var(--mauve)' }}>({currentIndex + 1}/{THEMES.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {THEMES.map(t => {
                const isActive = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTheme(t.id); setIsOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      border: isActive ? '2px solid var(--border-dark)' : '1px solid transparent',
                      background: isActive ? 'var(--pink-soft)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      borderRadius: 'var(--radius-pixel)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: 'var(--brown-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.name}
                      </div>
                      <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                        {t.preview.map((c, i) => (
                          <span key={i} style={{ width: '10px', height: '10px', background: c, border: '1px solid var(--border-dark)', display: 'inline-block' }} />
                        ))}
                      </div>
                    </div>
                    {isActive && <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--mauve)' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ThemeGallery() {
  const { theme, setTheme, THEMES } = useTheme();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
      {THEMES.map(t => {
        const isActive = t.id === theme;
        return (
          <div
            key={t.id}
            onClick={() => setTheme(t.id)}
            style={{
              border: isActive ? '3px solid var(--border-dark)' : '2px solid var(--border-light)',
              background: isActive ? 'var(--pink-soft)' : 'var(--white)',
              padding: '12px',
              borderRadius: 'var(--radius-pixel)',
              cursor: 'pointer',
              boxShadow: isActive ? 'var(--shadow-pixel)' : 'none',
              transform: isActive ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {isActive && (
              <span style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: 'var(--mauve)',
                color: 'var(--white)',
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                padding: '2px 6px',
                border: '1px solid var(--border-dark)'
              }}>
                ACTIVE
              </span>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px' }}>{t.icon}</span>
              <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', margin: 0 }}>{t.name}</h4>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--brown-muted)', marginBottom: '10px', lineHeight: '1.3', height: '32px' }}>
              {t.description}
            </p>

            {/* Color preview swatches */}
            <div style={{
              display: 'flex',
              gap: '4px',
              padding: '6px',
              background: 'var(--bg-cream-light)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-pixel)'
            }}>
              {t.preview.map((c, i) => (
                <div 
                  key={i} 
                  style={{ 
                    flex: 1, 
                    height: '18px', 
                    background: c, 
                    border: '1px solid var(--border-dark)',
                    title: c 
                  }} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
