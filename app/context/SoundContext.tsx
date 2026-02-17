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
        audioRef.current = new Audio("/sounds/singing_bowl.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = volume;

        const savedPreference = localStorage.getItem("daily-wisdom-sound-enabled");
        if (savedPreference === "true") {
            setIsPlaying(true);
            // Auto-play might be blocked by browser policy until user interaction
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.log("Auto-play prevented by browser policy, waiting for interaction.");
                    // Do not reset UI to off, keep it as user intended
                });
            }
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
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Auto-play prevented:", e);
                    // We do not reset isPlaying to false here to preserve user preference
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Handle volume change
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const toggleSound = () => {
        setIsPlaying(prev => {
            const newState = !prev;
            localStorage.setItem("daily-wisdom-sound-enabled", String(newState));
            return newState;
        });
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
