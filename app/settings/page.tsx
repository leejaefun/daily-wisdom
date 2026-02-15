"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [permission, setPermission] = useState<NotificationPermission>("default");

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
                body: "알림이 설정되었습니다. 매일 아침 마음의 평화를 전해드릴게요. 🌿",
            });
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-[#fdfbf7] p-6 pb-24">
            <h1 className="text-xl font-serif text-stone-600 mb-8 mt-4 tracking-widest">
                설정
            </h1>

            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-stone-800 font-medium">매일 알림 받기</h2>
                        <p className="text-xs text-stone-400 mt-1">아침 7시에 오늘의 명언을 알려드립니다.</p>
                    </div>
                    <button
                        onClick={requestPermission}
                        disabled={permission === "granted"}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${permission === "granted"
                            ? "bg-stone-100 text-stone-400 cursor-default"
                            : "bg-stone-800 text-stone-100 hover:bg-stone-700"
                            }`}
                    >
                        {permission === "granted" ? "설정됨" : "켜기"}
                    </button>
                </div>
                {permission === "granted" && (
                    <button
                        onClick={() => new Notification("Daily Wisdom", { body: "테스트 알림입니다. 오늘도 평온한 하루 되세요! 🌿" })}
                        className="text-xs text-stone-400 underline hover:text-stone-600 mt-2"
                    >
                        알림 테스트 보내기
                    </button>
                )}
                {permission === "denied" && (
                    <p className="text-xs text-red-400 mt-2">
                        * 알림 권한이 차단되었습니다. 브라우저 설정에서 권한을 허용해 주세요.
                    </p>
                )}
            </div>

            <div className="w-full max-w-md mt-8 text-center">
                <p className="text-xs text-stone-300">Daily Wisdom v1.0.0</p>
            </div>
        </main>
    );
}
