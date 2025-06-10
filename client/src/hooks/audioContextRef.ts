import { useCallback, useRef } from "react";

const audioContextRef = useRef<AudioContext | null>(null);

const initAudioContext = useCallback(() => {
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext({
      sampleRate: 24000, // Coincide con el servidor
    });
  }
  return audioContextRef.current;
}, []);
