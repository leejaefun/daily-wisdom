"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface SoundContextType {
    isPlaying: boolean;
    toggleSound: () => void;
    volume: number;
    setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3); // Default volume 30%
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio and load preference
    useEffect(() => {
        audioRef.current = new Audio("/sounds/forest_wind.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = volume;

        const savedPreference = localStorage.getItem("daily-wisdom-sound-enabled");
        if (savedPreference === "true") {
            setIsPlaying(true);
            // Auto-play might be blocked by browser policy until user interaction
            audioRef.current.play().catch(e => {
                console.log("Auto-play prevented by browser policy, waiting for interaction.");
                setIsPlaying(false); // Reset UI to off if blocked
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle play/pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Play failed:", e));
        } else {
            audioRef.current.pause();
        }
        localStorage.setItem("daily-wisdom-sound-enabled", String(isPlaying));
    }, [isPlaying]);

    // Handle volume change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const toggleSound = () => {
        setIsPlaying(prev => !prev);
    };

    return (
        <SoundContext.Provider value={{ isPlaying, toggleSound, volume, setVolume }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error("useSound must be used within a SoundProvider");
    }
    return context;
}
