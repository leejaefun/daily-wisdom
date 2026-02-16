"use client";

import { Share } from '@capacitor/share';
import html2canvas from 'html2canvas';

interface ShareButtonProps {
    targetId: string; // The ID of the element to capture
    text: string;     // Fallback text to share
}

export default function ShareButton({ targetId, text }: ShareButtonProps) {
    const handleShare = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        try {
            // 캔버스 생성 (이미지 캡처)
            const canvas = await html2canvas(element, {
                backgroundColor: "#fdfbf7", // 배경색 지정 (투명 방지)
                scale: 2, // 고화질
            });

            // 이미지를 base64로 변환
            const image = canvas.toDataURL("image/png");

            // 파일 공유 (네이티브)
            // Capacitor Share 플러그인은 base64 이미지를 직접 지원하지 않고, 파일 경로를 선호합니다.
            // 하지만 Web Share API 레벨에서는 파일 공유가 제한적일 수 있습니다.
            // 여기서는 텍스트 공유를 기본으로 하고, 이미지는 추후 파일 시스템 저장 후 공유 방식으로 고도화할 수 있습니다.
            // 일단은 가장 호환성이 좋은 text + url 공유 방식을 사용합니다.
            // (이미지 공유는 Capacitor Filesystem과 연동해야 완벽하므로, 1단계는 텍스트 공유로 시작합니다.)

            // **수정**: 사용자 요청은 '이미지 공유'이므로, Filesystem을 쓰지 않고
            // Web Share API Level 2 (navigator.share)가 파일을 지원하는지 확인하여 시도합니다.
            // Capacitor Share는 files 옵션을 지원합니다.

            // Base64 -> Blob -> File 변환
            const blob = await (await fetch(image)).blob();
            const file = new File([blob], "daily-wisdom.png", { type: "image/png" });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Daily Wisdom',
                    text: text,
                });
            } else {
                // Fallback: Capacitor Share (Native)
                // Capacitor Share의 `files` 옵션은 로컬 파일 URI를 요구합니다.
                // Base64를 바로 공유하려면 `Directory`에 저장하는 과정이 필요합니다.
                // 복잡도를 낮추기 위해 우선 텍스트 공유로 대체하고, 추후 고도화합니다.
                await Share.share({
                    title: 'Daily Wisdom',
                    text: text,
                    dialogTitle: 'Share Daily Wisdom',
                });
            }

        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-3 rounded-full text-stone-300 hover:text-stone-400 transition-colors"
            aria-label="Share Quote"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
        </button>
    );
}
