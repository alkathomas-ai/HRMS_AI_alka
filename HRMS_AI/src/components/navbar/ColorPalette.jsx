import React, { useState, useEffect, useRef } from 'react';
import './ColorPalette.css';

const themes = [
  {
    name: 'Crimson',
    primary: '#E22D30',
    soft: '#F04D4D',
    hover: '#B52226',
    hover_secondary:'#ffe1e1',
    light: 'rgba(240, 77, 77, 0.23)',
    primary_medium: '#ed6669',
    primary_low: '#e5af78',
    background_light: '#ffdbdb',
    color_bg_dashboard: '#F5F6F7',
    color_bg_pages_primary: '#f04d4d3b',
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
    hover_secondary:'#e0e9ff',
    light: 'rgba(59, 130, 246, 0.23)',
    primary_medium: '#6397f4',
    primary_low: '#7dcefd',
    background_light: '#dbeafe',
    color_bg_dashboard: '#F5F6F7',
    color_bg_pages_primary: '#b4cdff99',
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
    primary: '#065F46',
    soft: '#16b480',
    hover: '#065F46',
    hover_secondary:'#e9fff9',
    light: 'rgba(16, 185, 129, 0.23)',
    primary_medium: '#058a64',
    primary_low: '#15bf87',
    background_light: '#c0e6db',
    color_bg_dashboard: '#F5F6F7',
    color_bg_pages_primary: '#b4f0d799',
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
    hover_secondary:'#f4ecff',
    light: 'rgba(139, 92, 246, 0.23)',
    primary_medium: '#b66dee',
    primary_low: '#d380ca',
    background_light: '#e9dbff',
    color_bg_dashboard: '#F5F6F7',
    color_bg_pages_primary: '#dcc3ff99',
    assistant: {
      baseStart: '#F4F1FF',
      baseEnd: '#E4DCFF',
      glowPrimary: 'rgba(220, 195, 255, 0.6)',
      glowSecondary: 'rgba(240, 225, 255, 0.45)',
      textPrimary: '#2B1C3D',
      textSecondary: '#5A3E85'
    }
  },
  // {
  //   name: 'Amber',
  //   primary: '#C2410C',
  //   soft: '#F97316',
  //   hover: '#9A3412',
  //   light: 'rgba(249, 115, 22, 0.23)',
  //   assistant: {
  //     baseStart: '#FFF7ED',
  //     baseEnd: '#FFE4CC',
  //     glowPrimary: 'rgba(255, 205, 170, 0.6)',
  //     glowSecondary: 'rgba(255, 235, 210, 0.45)',
  //     textPrimary: '#4A260F',
  //     textSecondary: '#7A4A2D'
  //   }
  // }
];

const ColorPalette = () => {
  const [showPalette, setShowPalette] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(themes[0].name);
  const paletteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setShowPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (theme) => {
    setSelectedTheme(theme.name);
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';

    // Primary UI colors
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-soft', theme.soft);
    root.style.setProperty('--color-primary-hover', theme.hover);
    root.style.setProperty('--color-secondary-hover', theme.hover_secondary);
    root.style.setProperty('--color-primary-light', isDark ? theme.light.replace(/[\d.]+\)$/, '0.62)') : theme.light);
    root.style.setProperty('--color-primary-medium', theme.primary_medium || theme.primary);
    root.style.setProperty('--color-primary-low', theme.primary_low || theme.soft);
    root.style.setProperty('--background-light', theme.background_light);
    root.style.setProperty('--color-bg-pages-primary', theme.color_bg_pages_primary);


    // Assistant bar colors
    if (isDark) {
      const darkStart = theme.assistant.baseStart.replace(/^#/, '').match(/.{2}/g).map(h => Math.max(0, parseInt(h, 16) - 200).toString(16).padStart(2, '0')).join('');
      const darkEnd = theme.assistant.baseEnd.replace(/^#/, '').match(/.{2}/g).map(h => Math.max(0, parseInt(h, 16) - 200).toString(16).padStart(2, '0')).join('');
      root.style.setProperty('--assistant-base-start', `#${darkStart}`);
      root.style.setProperty('--assistant-base-end', `#${darkEnd}`);
      root.style.setProperty('--assistant-glow-primary', theme.assistant.glowPrimary.replace(/[\d.]+\)$/, '0.15)'));
      root.style.setProperty('--assistant-glow-secondary', theme.assistant.glowSecondary.replace(/[\d.]+\)$/, '0.1)'));
      root.style.setProperty('--assistant-text-primary', '#E5E7EB');
      root.style.setProperty('--assistant-text-secondary', '#9CA3AF');
    } else {
      root.style.setProperty('--assistant-base-start', theme.assistant.baseStart);
      root.style.setProperty('--assistant-base-end', theme.assistant.baseEnd);
      root.style.setProperty('--assistant-glow-primary', theme.assistant.glowPrimary);
      root.style.setProperty('--assistant-glow-secondary', theme.assistant.glowSecondary);
      root.style.setProperty('--assistant-text-primary', theme.assistant.textPrimary);
      root.style.setProperty('--assistant-text-secondary', theme.assistant.textSecondary);
    }

    localStorage.setItem('theme', JSON.stringify(theme));
    setShowPalette(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      const theme = JSON.parse(saved);
      setSelectedTheme(theme.name);
      applyTheme(theme);
    }

    const observer = new MutationObserver(() => {
      const saved = localStorage.getItem('theme');
      if (saved) applyTheme(JSON.parse(saved));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="palette-wrapper" ref={paletteRef}>
      <span
        className={`material-symbols-outlined color-palette icon-btn ${showPalette ? 'active' : ''}`}
        onClick={() => setShowPalette(!showPalette)}
      >
        palette
      </span>

      {showPalette && (
        <div className="palette-dropdown">
          {themes.map((theme) => (
            <div
              key={theme.name}
              className={`palette-item ${selectedTheme === theme.name ? 'selected' : ''}`}
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
