"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type LandQuality = "perfect" | "good" | "okay";

// ─── Audio context (module-level singleton) ─────────────────────────────────

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;

function getCtx(): [AudioContext, GainNode] {
  if (!_ctx) {
    _ctx = new AudioContext();
    _master = _ctx.createGain();
    _master.connect(_ctx.destination);
  }
  if (_ctx.state === "suspended") _ctx.resume();
  return [_ctx, _master!];
}

/**
 * Low-pass filter wrapper — connects src → filter → dest
 */
function withFilter(
  ctx: AudioContext,
  src: AudioNode,
  dest: AudioNode,
  freq: number
): AudioNode {
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = freq;
  src.connect(f);
  f.connect(dest);
  return f;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(false);
  // Use a ref so callbacks always see the latest mute state without re-creation
  const isMutedRef = useRef(false);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const musicUrlRef = useRef<string | null>(null);

  // Restore saved mute preference
  useEffect(() => {
    const saved = localStorage.getItem("stack-tower-muted") === "true";
    setIsMuted(saved);
    isMutedRef.current = saved;
    // Apply to master gain if context already exists
    if (_master && _ctx) {
      _master.gain.value = saved ? 0 : 1;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      localStorage.setItem("stack-tower-muted", String(next));
      try {
        const [ctx, master] = getCtx();
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(next ? 0 : 1, t + 0.2);
      } catch { }
      return next;
    });
  }, []);

  // ── Music Player ──────────────────────────────────────────────────────────
  const playMusic = useCallback((url: string) => {
    if (musicUrlRef.current === url) return;

    try {
      const [ctx, master] = getCtx();

      // Fade out current music if exists
      if (musicRef.current && musicGainRef.current) {
        const oldAudio = musicRef.current;
        const oldGain = musicGainRef.current;

        // Smooth fade out using Web Audio API GainNode instead of HTMLAudioElement.volume
        const t = ctx.currentTime;
        oldGain.gain.cancelScheduledValues(t);
        oldGain.gain.setValueAtTime(oldGain.gain.value, t);
        oldGain.gain.linearRampToValueAtTime(0, t + 1.0); // 1-second fade out

        // Actually pause the HTML audio element once the fade completes
        setTimeout(() => {
          oldAudio.pause();
        }, 1100);
      }

      const audio = new Audio(url);
      audio.loop = true;
      // We don't touch audio.volume here because iOS Safari ignores it

      const source = ctx.createMediaElementSource(audio);
      const gainNode = ctx.createGain();

      // Start the gain at 0 for fade in
      gainNode.gain.setValueAtTime(0, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(master);

      audio.play().catch(() => {
        console.warn("Autoplay blocked for music");
      });

      // Smooth fade in
      const t = ctx.currentTime;
      gainNode.gain.linearRampToValueAtTime(0.4, t + 1.5); // 1.5-second fade in

      musicRef.current = audio;
      musicGainRef.current = gainNode;
      musicSourceRef.current = source;
      musicUrlRef.current = url;
    } catch (err) {
      console.error("Error playing music:", err);
    }
  }, []);

  const stopMusic = useCallback(() => {
    if (musicRef.current && musicGainRef.current) {
      const audio = musicRef.current;
      const gain = musicGainRef.current;

      const [ctx] = getCtx();
      if (ctx) {
        const t = ctx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.5);

        setTimeout(() => {
          audio.pause();
        }, 600);
      } else {
        audio.pause();
      }

      musicRef.current = null;
      musicGainRef.current = null;
      musicUrlRef.current = null;
    }
  }, []);

  // ── Drop click ────────────────────────────────────────────────────────────
  const playDrop = useCallback(() => {
    if (isMutedRef.current) return;
    try {
      const [ctx, master] = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(master);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch { }
  }, []);

  // ── Block land ────────────────────────────────────────────────────────────
  const playLand = useCallback((quality: LandQuality, themeId?: string) => {
    if (isMutedRef.current) return;
    try {
      const [ctx, master] = getCtx();

      if (themeId === "classic") {
        if (quality === "perfect") {
          // Ascending chime (600-800-1000Hz arpeggio, 0.4s)
          [600, 800, 1000].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            gain.connect(master);
            const t = ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.start(t);
            osc.stop(t + 0.4);
          });
        } else {
          // Clean "click" (sine, 500Hz → 300Hz, 0.15s)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
          gain.connect(master);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
        return;
      }

      if (themeId === "neon") {
        // Neon City: electronic beep sequence
        if (quality === "perfect") {
          // Synth FM chord — cyberpunk arpeggio
          const notes = [261.63, 329.63, 392, 523.25]; // C major arp up
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.setValueAtTime(freq * 2, ctx.currentTime + 0.04);
            osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.08);
            gain.connect(master);
            withFilter(ctx, osc, gain, 3500);
            const t = ctx.currentTime + i * 0.06;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.18 / (i + 1), t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.35);
          });
        } else {
          // Electronic beep — short square wave blip
          const freq = quality === "good" ? 880 : 440;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.setValueAtTime(freq * 1.5, ctx.currentTime + 0.02);
          osc.frequency.setValueAtTime(freq * 0.8, ctx.currentTime + 0.06);
          withFilter(ctx, osc, gain, 2200);
          gain.connect(master);
          gain.gain.setValueAtTime(0.22, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
        return;
      }

      if (themeId === "ice") {
        // Ice Crystal: high-pitched crystal chimes
        if (quality === "perfect") {
          // Ice bell ring sequence
          [1200, 1400, 1600].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            gain.connect(master);
            const t = ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.start(t);
            osc.stop(t + 0.5);
          });
        } else {
          // Single crystal chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          gain.connect(master);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
        return;
      }

      // Default sounds for other themes
      if (quality === "perfect") {
        [800, 1200, 1600].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          withFilter(ctx, osc, gain, 3000);
          gain.connect(master);
          const t = ctx.currentTime + i * 0.045;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.22 / (i + 1), t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.start(t);
          osc.stop(t + 0.45);
        });
      } else {
        const freq = quality === "good" ? 500 : 190;
        const dur = quality === "good" ? 0.22 : 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = quality === "good" ? "sine" : "triangle";
        osc.frequency.value = freq;
        withFilter(ctx, osc, gain, quality === "good" ? 1200 : 600);
        gain.connect(master);
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur + 0.05);
      }
    } catch { }
  }, []);

  // ── Falling piece whoosh / Ice crack ─────────────────────────────────────
  const playFall = useCallback((themeId?: string) => {
    if (isMutedRef.current) return;
    try {
      const [ctx, master] = getCtx();

      if (themeId === "ice") {
        // Glass crack sound - white noise burst + filter
        const bufLen = Math.floor(ctx.sampleRate * 0.25);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const src = ctx.createBufferSource();
        src.buffer = buf;

        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(2000, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(master);
        src.start();
        return;
      }

      if (themeId === "jelly") {
        // Descending "blop" sound for falling jelly
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.connect(master);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        return;
      }

      const bufLen = Math.floor(ctx.sampleRate * 0.5);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start();
    } catch { }
  }, []);

  // ── Game over descending trombone-ish ─────────────────────────────────────
  const playGameOver = useCallback((themeId?: string) => {
    if (isMutedRef.current) return;
    try {
      const [ctx, master] = getCtx();

      if (themeId === "classic") {
        // Descending tone (400Hz → 200Hz, 0.5s)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
        gain.connect(master);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        return;
      }

      [440, 350, 280, 210].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        withFilter(ctx, osc, gain, 800);
        gain.connect(master);
        const t = ctx.currentTime + i * 0.24;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.32);
      });
    } catch { }
  }, []);

  // ── Ambient Wind Howl (Ice theme) ──────────────────────────────────────────
  const windNodeRef = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const stopAmbientWind = useCallback(() => {
    if (windNodeRef.current) {
      const { src, gain } = windNodeRef.current;
      if (_ctx) {
        gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + 1);
        src.stop(_ctx.currentTime + 1.1);
      }
      windNodeRef.current = null;
    }
  }, []);

  const playAmbientWind = useCallback(() => {
    if (isMutedRef.current) return;
    if (windNodeRef.current) return; // Already playing

    try {
      const [ctx, master] = getCtx();
      const bufLen = ctx.sampleRate * 2; // 2s loop-able buffer
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.value = 5;
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      // LFO for frequency modulation
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.2; // 5s cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 200;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2); // Very quiet as requested

      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start();

      windNodeRef.current = { src, gain };
    } catch { }
  }, []);

  return {
    isMuted,
    toggleMute,
    playDrop,
    playLand,
    playFall,
    playGameOver,
    playMusic,
    stopMusic,
    playAmbientWind,
    stopAmbientWind,
  };
}

export type SoundEffects = ReturnType<typeof useSoundEffects>;
