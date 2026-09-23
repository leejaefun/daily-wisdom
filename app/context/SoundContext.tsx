"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

interface SoundContextType {
    isPlaying: boolean;
    toggleSound: () => void;
    volume: number;
    setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const CROSSFADE_DURATION = 4.5; // 4.5s overlapping crossfade
const SOUND_SRC = "/sounds/singing_bowl.mp3";

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.3); // Default volume 30%

    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const activeVoicesRef = useRef<Array<{ source: AudioBufferSourceNode; gain: GainNode }>>([]);
    const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    // Helper: Get or initialize AudioContext
    const getAudioContext = useCallback(() => {
        if (typeof window === "undefined") return null;
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return null;
            const ctx = new AudioContextClass();
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(volume, ctx.currentTime);
            masterGain.connect(ctx.destination);

            audioContextRef.current = ctx;
            masterGainRef.current = masterGain;
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume().catch(() => { });
        }
        return audioContextRef.current;
    }, [volume]);

    // Helper: Load & decode audio buffer
    const loadAudioBuffer = useCallback(async (): Promise<AudioBuffer | null> => {
        if (audioBufferRef.current) return audioBufferRef.current;
        const ctx = getAudioContext();
        if (!ctx) return null;

        try {
            const response = await fetch(SOUND_SRC);
            const arrayBuffer = await response.arrayBuffer();
            const decoded = await ctx.decodeAudioData(arrayBuffer);
            audioBufferRef.current = decoded;
            return decoded;
        } catch (error) {
            console.error("Failed to load singing bowl audio buffer:", error);
            return null;
        }
    }, [getAudioContext]);

    // Helper: Stop all currently active audio voices
    const stopAllVoices = useCallback((quickFade = true) => {
        if (loopTimerRef.current) {
            clearInterval(loopTimerRef.current);
            loopTimerRef.current = null;
        }

        const ctx = audioContextRef.current;
        const now = ctx ? ctx.currentTime : 0;

        activeVoicesRef.current.forEach(({ source, gain }) => {
            try {
                if (ctx && quickFade) {
                    gain.gain.cancelScheduledValues(now);
                    gain.gain.setValueAtTime(gain.gain.value, now);
                    gain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
                    setTimeout(() => {
                        try {
                            source.stop();
                            source.disconnect();
                            gain.disconnect();
                        } catch { }
                    }, 350);
                } else {
                    source.stop();
                    source.disconnect();
                    gain.disconnect();
                }
            } catch { }
        });

        if (!quickFade) {
            activeVoicesRef.current = [];
        } else {
            setTimeout(() => {
                activeVoicesRef.current = [];
            }, 400);
        }
    }, []);

    // Helper: Spawn a single voice with smooth crossfade envelope
    const spawnVoice = useCallback(async () => {
        if (!isPlayingRef.current) return;
        const ctx = getAudioContext();
        const buffer = await loadAudioBuffer();
        if (!ctx || !buffer || !masterGainRef.current || !isPlayingRef.current) return;

        const duration = buffer.duration;
        const now = ctx.currentTime;

        const sourceNode = ctx.createBufferSource();
        sourceNode.buffer = buffer;

        const voiceGain = ctx.createGain();
        // 1. Initial fade-in
        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(1, now + 1.2);

        // 2. Sustain until crossfade window starts
        const fadeOutStartTime = now + Math.max(0, duration - CROSSFADE_DURATION);
        voiceGain.gain.setValueAtTime(1, fadeOutStartTime);

        // 3. Smooth fade-out overlapping with next voice
        voiceGain.gain.linearRampToValueAtTime(0.0001, now + duration);

        sourceNode.connect(voiceGain);
        voiceGain.connect(masterGainRef.current);

        sourceNode.start(now);
        sourceNode.stop(now + duration + 0.1);

        const voiceEntry = { source: sourceNode, gain: voiceGain };
        activeVoicesRef.current.push(voiceEntry);

        sourceNode.onended = () => {
            activeVoicesRef.current = activeVoicesRef.current.filter(v => v.source !== sourceNode);
            try {
                sourceNode.disconnect();
                voiceGain.disconnect();
            } catch { }
        };
    }, [getAudioContext, loadAudioBuffer]);

    // Start Crossfade Loop
    const startPlayback = useCallback(async () => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === "suspended") {
            await ctx.resume().catch(() => { });
        }

        const buffer = await loadAudioBuffer();
        if (!buffer) return;

        stopAllVoices(false);
        await spawnVoice();

        const duration = buffer.duration;
        const intervalMs = Math.max(1000, (duration - CROSSFADE_DURATION) * 1000);

        loopTimerRef.current = setInterval(() => {
            if (isPlayingRef.current) {
                spawnVoice();
            }
        }, intervalMs);
    }, [getAudioContext, loadAudioBuffer, stopAllVoices, spawnVoice]);

    // Handle initial preference on mount
    useEffect(() => {
        const savedPreference = localStorage.getItem("daily-wisdom-sound-enabled");
        if (savedPreference === "true") {
            setIsPlaying(true);
        }

        const savedVolume = localStorage.getItem("daily-wisdom-sound-volume");
        if (savedVolume !== null) {
            const parsed = parseFloat(savedVolume);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
                setVolume(parsed);
            }
        }

        // Setup user interaction resume for iOS / Safari autoplay policies
        const handleUserInteraction = () => {
            if (audioContextRef.current && audioContextRef.current.state === "suspended") {
                audioContextRef.current.resume().catch(() => { });
            }
        };

        window.addEventListener("click", handleUserInteraction);
        window.addEventListener("touchstart", handleUserInteraction);

        return () => {
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("touchstart", handleUserInteraction);
            stopAllVoices(false);
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close().catch(() => { });
            }
        };
    }, [stopAllVoices]);

    // React to isPlaying changes
    useEffect(() => {
        if (isPlaying) {
            startPlayback();
        } else {
            stopAllVoices(true);
        }
    }, [isPlaying, startPlayback, stopAllVoices]);

    // React to volume changes
    useEffect(() => {
        if (masterGainRef.current && audioContextRef.current) {
            const ctx = audioContextRef.current;
            masterGainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
        }
    }, [volume]);

    const toggleSound = () => {
        setIsPlaying(prev => {
            const newState = !prev;
            localStorage.setItem("daily-wisdom-sound-enabled", String(newState));
            return newState;
        });
    };

    const handleSetVolume = (newVol: number) => {
        setVolume(newVol);
        localStorage.setItem("daily-wisdom-sound-volume", String(newVol));
    };

    return (
        <SoundContext.Provider value={{ isPlaying, toggleSound, volume, setVolume: handleSetVolume }}>
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

