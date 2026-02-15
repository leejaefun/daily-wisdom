"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function NavBar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#fdfbf7]/90 backdrop-blur-md border-t border-stone-100 flex items-center justify-around z-50 pb-[env(safe-area-inset-bottom)]">
            <Link
                href="/"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/") ? "text-stone-800" : "text-stone-400"
                    }`}
            >
                <span className="text-xs tracking-widest uppercase mt-1">{t("nav.today")}</span>
            </Link>
            <Link
                href="/history"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/history") ? "text-stone-800" : "text-stone-400"
                    }`}
            >
                <span className="text-xs tracking-widest uppercase mt-1">{t("nav.history")}</span>
            </Link>
            <Link
                href="/favorites"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/favorites") ? "text-stone-800" : "text-stone-400"
                    }`}
            >
                <span className="text-xs tracking-widest uppercase mt-1">{t("nav.favorites")}</span>
            </Link>
            <Link
                href="/settings"
                className={`flex flex-col items-center justify-center w-full h-full ${isActive("/settings") ? "text-stone-800" : "text-stone-400"
                    }`}
            >
                <span className="text-xs tracking-widest uppercase mt-1">{t("nav.settings")}</span>
            </Link>
        </nav>
    );
}
