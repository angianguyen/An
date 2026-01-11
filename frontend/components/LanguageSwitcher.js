/**
 * Language Switcher Component
 * Allows users to switch between Vietnamese and English
 * Saves preference to localStorage
 */

'use client';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState('vi');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLang(i18n.language || 'vi');
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
    setIsOpen(false);
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  // Compact variant for header/navbar
  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 rounded-lg transition-all"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-slate-300">{currentLanguage.code.toUpperCase()}</span>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-20 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-all ${
                    currentLang === lang.code ? 'bg-slate-700/70' : ''
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-slate-200">{lang.name}</span>
                  {currentLang === lang.code && (
                    <svg className="w-5 h-5 ml-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant with more visual appeal
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="text-sm font-medium text-slate-400">Language</span>
      </div>
      
      <div className="flex gap-2 ml-auto">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              currentLang === lang.code
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span className="text-sm">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
