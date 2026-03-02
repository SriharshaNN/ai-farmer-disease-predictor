import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import en from '../i18n/en.json';
import kn from '../i18n/kn.json';
import hi from '../i18n/hi.json';
import te from '../i18n/te.json';

export type Language = 'en' | 'kn' | 'hi' | 'te';

const translations: Record<Language, Record<string, string>> = { en, kn, hi, te };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('farmguard-language');
        return (stored as Language) || 'en';
    });

    const setLanguage = useCallback((lang: Language) => {
        localStorage.setItem('farmguard-language', lang);
        setLanguageState(lang);
    }, []);

    const t = useCallback((key: string): string => {
        return translations[language][key] || translations['en'][key] || key;
    }, [language]);

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
