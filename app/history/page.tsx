"use client";

import { getPastQuotes, Quote } from "@/lib/quotes";
import QuoteCard from "../components/QuoteCard";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";

export default function HistoryPage() {
    const { t } = useLanguage();
    const [history, setHistory] = useState<{ date: string; quote: Quote }[]>([]);

    useEffect(() => {
        setHistory(getPastQuotes(30));
    }, []);

    if (history.length === 0) return <div className="min-h-screen bg-[#fdfbf7]" />;

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-[#fdfbf7] p-6 pb-24">
            <h1 className="text-xl font-serif text-stone-600 mb-8 mt-4 tracking-widest">
                {t("history.title")}
            </h1>
            <div className="w-full max-w-md">
                {history.map((item, index) => (
                    <QuoteCard key={index} quote={item.quote} date={item.date} />
                ))}
            </div>
        </main>
    );
}
