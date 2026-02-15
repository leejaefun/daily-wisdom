"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ko" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("ko");

    useEffect(() => {
        const saved = localStorage.getItem("language") as Language;
        if (saved) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: string) => {
        const translations: Record<string, Record<Language, string>> = {
            "nav.today": { ko: "오늘의 명언", en: "Today" },
            "nav.history": { ko: "지난 명언", en: "History" },
            "nav.favorites": { ko: "보관함", en: "Favorites" },
            "nav.settings": { ko: "설정", en: "Settings" },
            "settings.title": { ko: "설정", en: "Settings" },
            "settings.language": { ko: "언어 설정", en: "Language" },
            "settings.notification": { ko: "매일 알림 받기", en: "Daily Reminder" },
            "settings.notification.desc": { ko: "아침 7시에 오늘의 명언을 알려드립니다.", en: "Get notified with a daily quote at 7 AM." },
            "settings.notification.on": { ko: "켜기", en: "Enable" },
            "settings.notification.granted": { ko: "설정됨", en: "Enabled" },
            "settings.test": { ko: "알림 테스트 보내기", en: "Test Notification" },
            "history.title": { ko: "지난 명언", en: "Past Quotes" },
            "favorites.title": { ko: "보관함", en: "Favorites" },
            "favorites.empty": { ko: "아직 보관된 명언이 없습니다.", en: "No favorites yet." },
            "favorites.empty.desc": { ko: "오늘의 명언에서 하트를 눌러보세요.", en: "Tap the heart on today's quote." },
            "quote.prompt": { ko: "깊게 심호흡 하며, 1분간 마음의 소리에 귀 기울여보세요.", en: "Take a deep breath and listen to your heart for a minute." }
        };
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
