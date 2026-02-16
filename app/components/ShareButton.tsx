"use client";

import { Share } from '@capacitor/share';
import html2canvas from 'html2canvas';
import { useState } from 'react';

interface ShareButtonProps {
    targetId: string; // The ID of the element to capture
    text: string;     // Fallback text to share
}

export default function ShareButton({ targetId, text }: ShareButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleShare = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const element = document.getElementById(targetId);
        if (!element) {
            setIsLoading(false);
            return;
        }

        try {
            // 캔버스 생성 (이미지 캡처)
            const canvas = await html2canvas(element, {
                backgroundColor: "#fdfbf7",
                scale: 2,
            });

            const image = canvas.toDataURL("image/png");
            const blob = await (await fetch(image)).blob();
            const file = new File([blob], "daily-wisdom.png", { type: "image/png" });

            // 1. Web Share API (Image Support)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Daily Wisdom',
                });
            } else {
                // 2. Native File Share Logic would go here (Capacitor Filesystem required for robust image share)
                // For now, fallback to Text Share if native image share isn't straightforward without Filesystem
                await Share.share({
                    title: 'Daily Wisdom',
                    text: text,
                    dialogTitle: 'Share Daily Wisdom',
                });
            }

        } catch (error) {
            console.error("Share failed:", error);
            // Fallback to text share on error (e.g. image generation failed or share sheet dismissed)
            try {
                await Share.share({
                    title: 'Daily Wisdom',
                    text: text,
                    dialogTitle: 'Share Daily Wisdom',
                });
            } catch (textError) {
                console.error("Text share failed:", textError);
                alert("공유하기를 열 수 없습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={isLoading}
            className={`p-3 rounded-full transition-colors ${isLoading ? "text-stone-200 cursor-wait" : "text-stone-300 hover:text-stone-400"}`}
            aria-label="Share Quote"
        >
            {isLoading ? (
                <div className="w-6 h-6 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
            )}
        </button>
    );
}
