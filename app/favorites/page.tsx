"use client";

import { Quote } from "@/lib/quotes";
import QuoteCard from "../components/QuoteCard";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Quote[]>([]);
    const { t } = useLanguage();

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
                {t("favorites.title")}
            </h1>
            <div className="w-full max-w-md">
                {favorites.length === 0 ? (
                    <div className="text-center text-stone-400 mt-20 font-light">
                        <p>{t("favorites.empty")}</p>
                        <p className="text-sm mt-2">{t("favorites.empty.desc")}</p>
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
