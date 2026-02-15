```javascript
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function SettingsPage() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!("Notification" in window)) {
            alert("이 브라우저는 알림을 지원하지 않습니다.");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
            new Notification("Daily Wisdom", {
                body: t("settings.notification.desc"),
            });
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-[#fdfbf7] p-6 pb-24">
            <h1 className="text-xl font-serif text-stone-600 mb-8 mt-4 tracking-widest">
                {t("settings.title")}
            </h1>
            
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-sm border border-stone-100 gap-6 flex flex-col">
                {/* Language Selector */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-stone-800 font-medium">{t("settings.language")}</h2>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as "ko" | "en")}
                        className="bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-md focus:ring-stone-500 focus:border-stone-500 block p-2"
                    >
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Notification Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-stone-800 font-medium">{t("settings.notification")}</h2>
                        <p className="text-xs text-stone-400 mt-1">{t("settings.notification.desc")}</p>
                    </div>
                    <button
                        onClick={requestPermission}
                        disabled={permission === "granted"}
                        className={`px - 4 py - 2 rounded - full text - xs font - medium transition - colors ${
    permission === "granted"
        ? "bg-stone-100 text-stone-400 cursor-default"
        : "bg-stone-800 text-stone-100 hover:bg-stone-700"
} `}
                    >
                        {permission === "granted" ? t("settings.notification.granted") : t("settings.notification.on")}
                    </button>
                </div>
                {permission === "granted" && (
                    <button
                        onClick={() => new Notification("Daily Wisdom", { body: t("settings.notification.desc") })}
                        className="text-xs text-stone-400 underline hover:text-stone-600 mt-2 text-right"
                    >
                        {t("settings.test")}
                    </button>
                )}
                {permission === "denied" && (
                    <p className="text-xs text-red-400 mt-2">
                        * 알림 권한이 차단되었습니다. 브라우저 설정에서 권한을 허용해 주세요.
                    </p>
                )}
            </div>

            <div className="w-full max-w-md mt-8 text-center">
                <p className="text-xs text-stone-300">Daily Wisdom v1.1.0</p>
            </div>
        </main>
    );
}
```
