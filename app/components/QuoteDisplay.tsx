"use client";

import { useState, useEffect } from "react";
import { Quote } from "@/lib/quotes";

export default function QuoteDisplay({ quote }: { quote: Quote }) {
    const [visible, setVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);

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
        <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[#fdfbf7] selection:bg-stone-200">
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

                <div className="mt-12 flex flex-col items-center justify-center gap-4">
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
                </div>
            </div>

            <footer className="absolute bottom-8 text-stone-300 text-xs tracking-widest uppercase">
                Daily Wisdom
            </footer>
        </main>
    );
}
