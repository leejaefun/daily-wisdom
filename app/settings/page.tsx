"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { LocalNotifications } from '@capacitor/local-notifications';
import { useSound } from "../context/SoundContext";

export default function SettingsPage() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const { language, setLanguage, t } = useLanguage();
    const { isPlaying, toggleSound } = useSound();


    useEffect(() => {
        const checkPermission = async () => {
            try {
                const { display } = await LocalNotifications.checkPermissions();
                // Map Capacitor 'prompt'/'prompt-with-rationale' to Web 'default'
                if (display === 'granted') setPermission('granted');
                else if (display === 'denied') setPermission('denied');
                else setPermission('default');
            } catch (e) {
                console.log("LocalNotifications not available, falling back to web");
                if (typeof window !== "undefined" && "Notification" in window) {
                    setPermission(Notification.permission);
                }
            }
        };
        checkPermission();
    }, []);

    const requestPermission = async () => {
        try {
            const result = await LocalNotifications.requestPermissions();
            if (result.display === 'granted') {
                setPermission('granted');
                // Schedule a daily notification at 7:00 AM
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Daily Wisdom",
                            body: t("settings.notification.desc"),
                            id: 1,
                            schedule: {
                                on: {
                                    hour: 7,
                                    minute: 0,
                                },
                                allowWhileIdle: true
                            },
                        }
                    ]
                });
            } else {
                setPermission('denied');
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            // Fallback for web testing if plugin fails or not available
            if ("Notification" in window) {
                const result = await Notification.requestPermission();
                setPermission(result);
            }
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
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${permission === "granted"
                            ? "bg-stone-100 text-stone-400 cursor-default"
                            : "bg-stone-800 text-stone-100 hover:bg-stone-700"
                            }`}
                    >
                        {permission === "granted" ? t("settings.notification.granted") : t("settings.notification.on")}
                    </button>
                </div>
                {permission === "granted" && (
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={async () => {
                                await LocalNotifications.schedule({
                                    notifications: [
                                        {
                                            title: "Daily Wisdom",
                                            body: t("settings.notification.desc"),
                                            id: new Date().getTime(),
                                            schedule: { at: new Date(Date.now() + 1000) }, // 1 second later
                                        }
                                    ]
                                });
                            }}
                            className="text-xs text-stone-400 underline hover:text-stone-600"
                        >
                            {t("settings.test")}
                        </button>
                    </div>
                )}

                <div className="h-px bg-stone-100" />

                {/* Sound Toggle */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-stone-800 font-medium">{t("settings.sound")}</h2>
                        <p className="text-xs text-stone-400 mt-1">{t("settings.sound.desc")}</p>
                    </div>
                    <div className="flex bg-stone-100 rounded-lg p-1">
                        <button
                            onClick={() => isPlaying && toggleSound()}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!isPlaying
                                ? "bg-white shadow-sm text-stone-800"
                                : "text-stone-400 hover:text-stone-600"
                                }`}
                        >
                            {t("settings.sound.off")}
                        </button>
                        <button
                            onClick={() => !isPlaying && toggleSound()}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${isPlaying
                                ? "bg-white shadow-sm text-stone-800"
                                : "text-stone-400 hover:text-stone-600"
                                }`}
                        >
                            {t("settings.sound.on")}
                        </button>
                    </div>
                </div>

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
