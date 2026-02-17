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
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle play/pause and resume on interaction
    useEffect(() => {
        if (!audioRef.current) return;

        const playAudio = async () => {
            try {
                if (isPlaying) {
                    await audioRef.current?.play();
                } else {
                    audioRef.current?.pause();
                }
            } catch (error) {
                console.log("Auto-play prevented. Waiting for interaction...");
                const resumeAudio = async () => {
                    if (isPlaying && audioRef.current) {
                        try {
                            await audioRef.current.play();
                            document.removeEventListener('click', resumeAudio);
                            document.removeEventListener('touchstart', resumeAudio);
                        } catch (e) {
                            console.error("Resume failed:", e);
                        }
                    }
                };
                document.addEventListener('click', resumeAudio);
                document.addEventListener('touchstart', resumeAudio);
            }
        };

        playAudio();

        return () => {
            // Cleanup listeners if component unmounts or dependency changes
            document.removeEventListener('click', () => { });
            document.removeEventListener('touchstart', () => { });
        };
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
