import { useRef, useState, useCallback } from "react";
import { Base64 } from "js-base64";

interface MediaChunk {
  mime_type: string;
  data: string;
}

interface TranscriptionMessage {
  text: string;
  sender: "User" | "Gemini";
  finished: boolean | null;
  audio?: string;
}

interface AudioChunkBuffer {
  data: ArrayBuffer;
  startTimestamp: number;
}

export function useGeminiLive() {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const audioBufferQueueRef = useRef<AudioChunkBuffer[]>([]);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const [lastTranscription, setLastTranscription] =
    useState<TranscriptionMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const responseCallbackRef = useRef<
    null | ((res: TranscriptionMessage) => void)
  >(null);

  const connect = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        return resolve();
      }

      try {
        const ws = new WebSocket("ws://localhost:9084");
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(JSON.stringify({ setup: {} }));
          resolve();
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
          reject(err);
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log("WebSocket closed");
          scheduleReconnect();
        };

        ws.onmessage = (event) => {
          // console.log("mensaje recibido:", event);
          try {
            const data = JSON.parse(event.data);
            // console.log("Data procesada:", data);

            if (data.transcription) {
              const msg: TranscriptionMessage = {
                text: data.transcription.text,
                sender: data.transcription.sender,
                finished: data.transcription.finished,
              };

              setLastTranscription(msg);
              console.log("Transcription recibida:", data.transcription);

              if (msg.finished && responseCallbackRef.current) {
                responseCallbackRef.current(msg);
              }
            }

            if (data.audio) {
              const audioBuffer = Base64.toUint8Array(data.audio);
              const now = Date.now();
              audioBufferQueueRef.current.push({
                data: audioBuffer.buffer,
                startTimestamp: now,
              });
              playNextWhenReady();
            }

            if (data.interrupted) {
              if (currentAudioSourceRef.current) {
                currentAudioSourceRef.current.stop();
                currentAudioSourceRef.current = null;
              }
              audioBufferQueueRef.current = [];
            }
          } catch (err) {
            console.error("Error procesando mensaje:", err);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }, []);

  const scheduleReconnect = () => {
    const backoff = Math.min(30000, 5000 * (reconnectAttemptsRef.current || 1));
    console.log(`Reconnect in ${backoff}ms`);
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, backoff);
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const sendMessage = (message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const sendMediaChunk = (chunk: MediaChunk) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          realtime_input: {
            media_chunks: [chunk],
          },
        })
      );
    }
  };

  const onFinalResponse = (cb: (res: TranscriptionMessage) => void) => {
    responseCallbackRef.current = cb;
  };

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({
        sampleRate: 24000, // tu sample rate
      });
    }
    return audioContextRef.current;
  }, []);

  const playNextWhenReady = useCallback(async () => {
    if (
      currentAudioSourceRef.current ||
      audioBufferQueueRef.current.length === 0
    ) {
      return;
    }

    try {
      const ctx = initAudioContext();

      const chunk = audioBufferQueueRef.current.shift();
      if (!chunk) return;

      const buffer = chunk.data;

      const int16Data = new Int16Array(buffer);
      const totalLength = int16Data.length;

      if (totalLength === 0) return;

      const audioBuffer = ctx.createBuffer(1, totalLength, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < totalLength; i++) {
        channelData[i] = int16Data[i] / 32768.0; // normalizar a float -1 a 1
      }

      // Fade in/out para evitar clicks
      const fadeSamples = Math.min(200, totalLength / 8);

      for (let i = 0; i < fadeSamples; i++) {
        const factor = Math.sin(((i / fadeSamples) * Math.PI) / 2);
        channelData[i] *= factor; // fade in
        channelData[totalLength - 1 - i] *= factor; // fade out
      }

      const source = ctx.createBufferSource();
      currentAudioSourceRef.current = source;
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.start();

      source.onended = () => {
        currentAudioSourceRef.current = null;
        if (audioBufferQueueRef.current.length > 0) {
          playNextWhenReady();
        }
      };
    } catch (err) {
      console.error("Error reproduciendo audio:", err);
      currentAudioSourceRef.current = null;
    }
  }, [initAudioContext]);

  return {
    connect,
    disconnect,
    sendMessage,
    sendMediaChunk,
    lastTranscription,
    isConnected,
    onFinalResponse,
  };
}
