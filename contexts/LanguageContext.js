import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en';
import de from '../locales/de';
import hi from '../locales/hi';
import zh from '../locales/zh';
import it from '../locales/it';
import es from '../locales/es';
import pt from '../locales/pt';

const translations = { en, de, hi, zh, it, es, pt };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default: English

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('language');
      if (saved && translations[saved]) {
        setLanguage(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      try {
        await AsyncStorage.setItem('language', lang);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  };

  const t = (key, params) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    // Fallback to English if key not found
    if (value === undefined || value === null) {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
      }
    }
    // Fallback to key itself
    if (value === undefined || value === null) return key;
    if (typeof value !== 'string') return key;

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{{${k}}}`));
    }
    return value;
  };

  // Helper: translate a stored German name (category, account, etc.)
  const tName = (name) => {
    if (!name) return name;
    const translated = t(`names.${name}`);
    // If no translation found (returns the key), return original
    return translated === `names.${name}` ? name : translated;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, tName, availableLanguages: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
