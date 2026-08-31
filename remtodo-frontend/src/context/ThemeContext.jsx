import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: 'strawberry',
    name: 'Strawberry Pink',
    icon: '🍓',
    description: 'Original cozy pixel cream & soft pink',
    preview: ['#F5F0DC', '#FFB5C2', '#8B5E6B', '#4A3728'],
    isDark: false
  },
  {
    id: 'matcha',
    name: 'Matcha Latte',
    icon: '🍵',
    description: 'Soothing mint, sage green & warm cream',
    preview: ['#EBF3EA', '#A2C499', '#4E6E4C', '#2D3A2B'],
    isDark: false
  },
  {
    id: 'midnight',
    name: 'Midnight Lavender',
    icon: '🌙',
    description: 'Sleek dark violet theme with glowing lilac accents',
    preview: ['#181524', '#9D72FF', '#B18CFF', '#F0EBFF'],
    isDark: true
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '⚡',
    description: 'Futuristic dark slate, cyan & magenta pixel glow',
    preview: ['#0D1117', '#06B6D4', '#EC4899', '#E2E8F0'],
    isDark: true
  },
  {
    id: 'gameboy',
    name: 'GameBoy Classic',
    icon: '🎮',
    description: 'Nostalgic 8-bit greenish-yellow LCD handheld aesthetic',
    preview: ['#CADC9F', '#8BAC0F', '#306230', '#0F380F'],
    isDark: false
  },
  {
    id: 'ocean',
    name: 'Cloud Ocean',
    icon: '🌊',
    description: 'Refreshing sky blue & ocean breeze palette',
    preview: ['#EBF4F6', '#86C5DA', '#2B6CB0', '#1E293B'],
    isDark: false
  },
  {
    id: 'sunset',
    name: 'Sunset Peach',
    icon: '🌅',
    description: 'Warm peach, coral & caramel terracotta glow',
    preview: ['#FDF3E7', '#FFB088', '#D95D39', '#42281D'],
    isDark: false
  }
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('moosplanner_theme') || 'strawberry';
  });

  const changeTheme = (newThemeId) => {
    if (THEMES.some(t => t.id === newThemeId)) {
      setThemeState(newThemeId);
      localStorage.setItem('moosplanner_theme', newThemeId);
      document.documentElement.setAttribute('data-theme', newThemeId);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
