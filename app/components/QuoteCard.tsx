"use client";

import { Quote } from "@/lib/quotes";
import { useState, useEffect } from "react";

interface QuoteCardProps {
    quote: Quote;
    date?: string;
}

export default function QuoteCard({ quote, date }: QuoteCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
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

        // Dispatch event for other components to update
        window.dispatchEvent(new Event("favoritesUpdated"));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 mb-4 transition-all hover:shadow-md">
            {date && <p className="text-xs text-stone-400 mb-2">{date}</p>}
            <p className="font-serif text-stone-800 leading-relaxed mb-4 whitespace-pre-line">
                {quote.text}
            </p>
            <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500 font-medium">— {quote.author}</span>
                <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full transition-colors ${isFavorite ? "text-red-400 bg-red-50" : "text-stone-300 hover:text-stone-400"}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
