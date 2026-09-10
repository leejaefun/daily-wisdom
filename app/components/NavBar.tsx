"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function NavBar() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-0 right-0 flex justify-center items-center pointer-events-none z-50 px-4">
            <nav className="pointer-events-auto bg-[#fdfbf7]/90 backdrop-blur-md border border-stone-300/60 shadow-md shadow-stone-900/5 rounded-full px-5 py-2.5 flex items-center justify-center gap-4 sm:gap-7 max-w-fit transition-all duration-300">
                <Link
                    href="/"
                    className={`text-xs tracking-widest uppercase transition-colors px-1 py-0.5 ${isActive("/") ? "text-stone-900 font-semibold border-b-2 border-stone-800" : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    {t("nav.today")}
                </Link>
                <Link
                    href="/history"
                    className={`text-xs tracking-widest uppercase transition-colors px-1 py-0.5 ${isActive("/history") ? "text-stone-900 font-semibold border-b-2 border-stone-800" : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    {t("nav.history")}
                </Link>
                <Link
                    href="/favorites"
                    className={`text-xs tracking-widest uppercase transition-colors px-1 py-0.5 ${isActive("/favorites") ? "text-stone-900 font-semibold border-b-2 border-stone-800" : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    {t("nav.favorites")}
                </Link>
                <Link
                    href="/settings"
                    className={`text-xs tracking-widest uppercase transition-colors px-1 py-0.5 ${isActive("/settings") ? "text-stone-900 font-semibold border-b-2 border-stone-800" : "text-stone-400 hover:text-stone-600"
                        }`}
                >
                    {t("nav.settings")}
                </Link>
            </nav>
        </div>
    );
}
