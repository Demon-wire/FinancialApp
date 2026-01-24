import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const THEMES = {
  light: {
    name: 'Hell',
    primary: '#2196F3',
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    cardBackground: '#ffffff',
    headerBackground: '#2196F3',
    headerText: '#ffffff',
    shadow: '#00000010',
  },
  dark: {
    name: 'Dunkel',
    primary: '#42a5f5',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    cardBackground: '#1e293b',
    headerBackground: '#1e293b',
    headerText: '#ffffff',
    shadow: '#00000040',
  },
  darkPink: {
    name: 'Dunkel Pink',
    primary: '#FF69B4', // Hot Pink
    background: '#1a1a1a', // Very dark gray
    surface: '#2d2d2d', // Darker gray for cards/surfaces
    text: '#ffffff', // White text
    textSecondary: '#cccccc', // Light gray secondary text
    border: '#444444', // Gray border
    cardBackground: '#2d2d2d', // Same as surface
    headerBackground: '#212121', // Slightly darker header
    headerText: '#ffffff', // White header text
    shadow: '#00000060', // Dark shadow
  },
  midnight: {
    name: 'Mitternacht',
    primary: '#3b82f6',
    background: '#0a0e27',
    surface: '#151b3d',
    text: '#e0e7ff',
    textSecondary: '#818cf8',
    border: '#1e3a8a',
    cardBackground: '#151b3d',
    headerBackground: '#151b3d',
    headerText: '#ffffff',
    shadow: '#00000060',
  },
  brown: {
    name: 'Braun',
    primary: '#8b4513',
    background: '#faf5f0',
    surface: '#ffffff',
    text: '#3e2723',
    textSecondary: '#6d4c41',
    border: '#d7ccc8',
    cardBackground: '#fff8f0',
    headerBackground: '#8b4513',
    headerText: '#ffffff',
    shadow: '#00000015',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('darkPink'); // Standard-Theme ist jetzt dunkel pink
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && THEMES[savedTheme]) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Themes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      if (THEMES[newTheme]) {
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Themes:', error);
    }
  };

  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, availableThemes: Object.keys(THEMES), THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
