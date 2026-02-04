"use client";

import { useState, useEffect } from "react";
import { Quote } from "@/lib/quotes";

export default function QuoteDisplay({ quote }: { quote: Quote }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Mount 후 애니메이션 트리거
        const timer = setTimeout(() => {
            setVisible(true);
        }, 500);

        return () => clearTimeout(timer);
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
            </div>

            <footer className="absolute bottom-8 text-stone-300 text-xs tracking-widest uppercase">
                Daily Wisdom
            </footer>
        </main>
    );
}
