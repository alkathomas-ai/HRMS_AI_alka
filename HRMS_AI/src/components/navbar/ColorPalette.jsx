import React, { useState, useEffect } from 'react';
import './ColorPalette.css';

const themes = [
  {
    name: 'Crimson',
    primary: '#E22D30',
    soft: '#F04D4D',
    hover: '#B52226',
    light: 'rgba(240, 77, 77, 0.23)',
    assistant: {
      baseStart: '#FFF1E6',
      baseEnd: '#FDD6D6',
      glowPrimary: 'rgba(255, 180, 180, 0.6)',
      glowSecondary: 'rgba(255, 220, 190, 0.45)',
      textPrimary: '#2B1C1C',
      textSecondary: '#6B4A4A'
    }
  },
  {
    name: 'Royal Blue',
    primary: '#1E40AF',
    soft: '#3B82F6',
    hover: '#1E3A8A',
    light: 'rgba(59, 130, 246, 0.23)',
    assistant: {
      baseStart: '#EEF3FF',
      baseEnd: '#DCE7FF',
      glowPrimary: 'rgba(180, 205, 255, 0.6)',
      glowSecondary: 'rgba(210, 225, 255, 0.45)',
      textPrimary: '#1C2B4A',
      textSecondary: '#415A8A'
    }
  },
  {
    name: 'Emerald',
    primary: '#047857',
    soft: '#10B981',
    hover: '#065F46',
    light: 'rgba(16, 185, 129, 0.23)',
    assistant: {
      baseStart: '#ECFDF7',
      baseEnd: '#D1FAE5',
      glowPrimary: 'rgba(180, 240, 215, 0.6)',
      glowSecondary: 'rgba(215, 250, 235, 0.45)',
      textPrimary: '#0F3D2E',
      textSecondary: '#2F6B57'
    }
  },
  {
    name: 'Amethyst',
    primary: '#6D28D9',
    soft: '#8B5CF6',
    hover: '#5B21B6',
    light: 'rgba(139, 92, 246, 0.23)',
    assistant: {
      baseStart: '#F4F1FF',
      baseEnd: '#E4DCFF',
      glowPrimary: 'rgba(220, 195, 255, 0.6)',
      glowSecondary: 'rgba(240, 225, 255, 0.45)',
      textPrimary: '#2B1C3D',
      textSecondary: '#5A3E85'
    }
  },
  {
    name: 'Amber',
    primary: '#C2410C',
    soft: '#F97316',
    hover: '#9A3412',
    light: 'rgba(249, 115, 22, 0.23)',
    assistant: {
      baseStart: '#FFF7ED',
      baseEnd: '#FFE4CC',
      glowPrimary: 'rgba(255, 205, 170, 0.6)',
      glowSecondary: 'rgba(255, 235, 210, 0.45)',
      textPrimary: '#4A260F',
      textSecondary: '#7A4A2D'
    }
  }
];

const ColorPalette = () => {
  const [showPalette, setShowPalette] = useState(false);

  const applyTheme = (theme) => {
    const root = document.documentElement;

    // Primary UI colors
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-soft', theme.soft);
    root.style.setProperty('--color-primary-hover', theme.hover);
    root.style.setProperty('--color-primary-light', theme.light);

    // Assistant bar colors
    root.style.setProperty('--assistant-base-start', theme.assistant.baseStart);
    root.style.setProperty('--assistant-base-end', theme.assistant.baseEnd);
    root.style.setProperty('--assistant-glow-primary', theme.assistant.glowPrimary);
    root.style.setProperty('--assistant-glow-secondary', theme.assistant.glowSecondary);
    root.style.setProperty('--assistant-text-primary', theme.assistant.textPrimary);
    root.style.setProperty('--assistant-text-secondary', theme.assistant.textSecondary);

    localStorage.setItem('theme', JSON.stringify(theme));
    setShowPalette(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) applyTheme(JSON.parse(saved));
  }, []);

  return (
    <div className="palette-wrapper">
      <span
        className="material-symbols-outlined color-palette"
        onClick={() => setShowPalette(!showPalette)}
      >
        palette
      </span>

      {showPalette && (
        <div className="palette-dropdown">
          {themes.map((theme) => (
            <div
              key={theme.name}
              className="palette-item"
              onClick={() => applyTheme(theme)}
            >
              <div
                className="palette-color"
                style={{ background: theme.primary }}
              />
              <span>{theme.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
