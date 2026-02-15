"use client";

import { useState, useEffect } from "react";
import { Quote } from "@/lib/quotes";

export default function QuoteDisplay({ quote }: { quote: Quote }) {
    const [visible, setVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Load initial favorite state
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(favorites.some((q: Quote) => q.text === quote.text));
    }, [quote.text]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        let newFavorites;

        if (isFavorite) {
            newFavorites = favorites.filter((q: Quote) => q.text !== quote.text);
        } else {
            newFavorites = [...favorites, quote];
        }

        localStorage.setItem("favorites", JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
        window.dispatchEvent(new Event("favoritesUpdated"));
    };

    useEffect(() => {
        // Mount 후 애니메이션 트리거
        const timer = setTimeout(() => {
            setVisible(true);
        }, 500);

        // 60초 타이머 로직
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center p-8 text-center bg-[#fdfbf7] selection:bg-stone-200 pb-[env(safe-area-inset-bottom)]">
            <div
                className={`max-w-2xl transition-all duration-1000 ease-out transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <p className="text-xl md:text-3xl font-medium leading-loose md:leading-loose text-stone-800 break-keep mb-8">
                    "{quote.text}"
                </p>
                <p className="text-sm md:text-base text-stone-500 font-medium tracking-widest mt-6">
                    — {quote.author}
                </p>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className={`transition-opacity duration-1000 delay-500 ${visible ? "opacity-100" : "opacity-0"}`}>
                        <p className="text-stone-400 text-sm font-light tracking-wider mb-2">
                            깊게 심호흡 하며, 1분간 마음의 소리에 귀 기울여보세요.
                        </p>
                    </div>
                    <div className={`transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`}>
                        <div className="text-stone-300 font-light tracking-widest text-xs">
                            {timeLeft > 0 ? `${timeLeft}` : " "}
                        </div>
                    </div>

                    <button
                        onClick={toggleFavorite}
                        className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} p-3 rounded-full ${isFavorite ? "text-red-400 bg-red-50/10" : "text-stone-300 hover:text-stone-400"}`}
                        aria-label="Toggle Favorite"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.0" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-8 text-stone-300 text-xs tracking-widest uppercase">
                Daily Wisdom
            </footer>
        </main>
    );
}
