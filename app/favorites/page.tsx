"use client";

import { Quote } from "@/lib/quotes";
import QuoteCard from "../components/QuoteCard";
import { useState, useEffect } from "react";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Quote[]>([]);

    useEffect(() => {
        const loadFavorites = () => {
            const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
            setFavorites(saved);
        };

        loadFavorites();

        // Listen for updates from other tabs or components
        window.addEventListener("favoritesUpdated", loadFavorites);
        return () => window.removeEventListener("favoritesUpdated", loadFavorites);
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-[#fdfbf7] p-6 pb-24">
            <h1 className="text-xl font-serif text-stone-600 mb-8 mt-4 tracking-widest">
                보관함
            </h1>
            <div className="w-full max-w-md">
                {favorites.length === 0 ? (
                    <div className="text-center text-stone-400 mt-20 font-light">
                        <p>아직 보관된 명언이 없습니다.</p>
                        <p className="text-sm mt-2">오늘의 명언에서 하트를 눌러보세요.</p>
                    </div>
                ) : (
                    favorites.map((quote, index) => (
                        <QuoteCard key={index} quote={quote} />
                    ))
                )}
            </div>
        </main>
    );
}
