import React, { useState, useRef, useEffect } from "react";
import { Mic, MessageCircle, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGeminiLive } from "@/helper/useGeminiLive";
import { Base64 } from "js-base64";
import AudioPlayer from "./AudioPlayer";

type Message = {
  sender: "User" | "Gemini";
  type: "text" | "audio";
  text?: string;
  audioData?: string;
  isComplete?: boolean;
};

const FloatingAIButton = () => {
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    connect,
    sendMediaChunk,
    disconnect,
    onFinalResponse,
    lastTranscription,
  } = useGeminiLive();

  useEffect(() => {
    if (!lastTranscription) return;

    setMessages((prev) => {
      const last = [...prev]
        .reverse()
        .find(
          (msg) => msg.sender === lastTranscription.sender && !msg.isComplete
        );

      if (last) {
        return prev.map((msg) =>
          msg === last
            ? {
                ...msg,
                text: (msg.text || "") + lastTranscription.text,
                isComplete: lastTranscription.finished === true,
              }
            : msg
        );
      } else {
        return [
          ...prev,
          {
            sender: lastTranscription.sender,
            type: "text",
            text: lastTranscription.text,
            isComplete: lastTranscription.finished === true,
          },
        ];
      }
    });
  }, [lastTranscription]);

  useEffect(() => {
    onFinalResponse((finalResponse) => {
      if (finalResponse.audio) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "Gemini",
            type: "audio",
            audioData: finalResponse.audio,
            isComplete: true,
          },
        ]);
        playBase64Audio(finalResponse.audio);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "Gemini",
            type: "text",
            text: finalResponse.text || "",
            isComplete: true,
          },
        ]);

        speak(finalResponse.text || "");
      }
    });
  }, [onFinalResponse]);

  const startAudioProcessing = async () => {
    try {
      await connect();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      audioContextRef.current = new AudioContext({
        sampleRate: 16000,
        latencyHint: "interactive",
      });
      const ctx = audioContextRef.current;

      await ctx.audioWorklet.addModule("/worklets/audio-processor.js");

      const source = ctx.createMediaStreamSource(stream);

      audioWorkletNodeRef.current = new AudioWorkletNode(
        ctx,
        "audio-processor",
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          processorOptions: {
            sampleRate: 16000,
            bufferSize: 4096,
          },
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "speakers",
        }
      );

      audioWorkletNodeRef.current.port.onmessage = (event) => {
        const { pcmData, level } = event.data;
        // Opcional: podrías usar level para animaciones o feedback visual

        if (pcmData) {
          const base64Data = Base64.fromUint8Array(new Uint8Array(pcmData));
          sendMediaChunk({
            mime_type: "audio/pcm",
            data: base64Data,
          });
        }
      };

      source.connect(audioWorkletNodeRef.current);
      audioWorkletNodeRef.current.connect(ctx.destination); // Para mantener el contexto activo

      mediaStreamRef.current = stream;
      setIsListening(true);
    } catch (error) {
      console.error("Error iniciando procesamiento de audio:", error);
      stopAudioProcessing();
    }
  };

  const stopAudioProcessing = () => {
    // Detener tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    // Desconectar y cerrar AudioWorkletNode
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }
    // Cerrar AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    disconnect();
    setIsListening(false);
  };

  const handleMicClick = () => {
    if (!isListening) {
      startAudioProcessing();
    } else {
      stopAudioProcessing();
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    speechSynthesis.speak(utterance);
  };

  const playBase64Audio = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext!)();
      }
      const audioContext = audioContextRef.current;

      const audioData = Uint8Array.from(atob(base64Audio), (c) =>
        c.charCodeAt(0)
      );
      const audioBuffer = await audioContext.decodeAudioData(audioData.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Error reproduciendo audio:", error);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]); // auto-scroll al agregar mensaje

  const hasValidMessages = messages.some(
    (msg) => msg.type === "audio" || (msg.text && msg.text.trim() !== "")
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2 font-sans">
      {/* Botón flotante para abrir/cerrar el chat */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat y micrófono visibles solo si está abierto */}
      {isOpen && (
        <div className="flex items-end space-x-3">
          {/* Chat */}
          {hasValidMessages && (
            <div
              ref={chatRef}
              className="max-w-sm w-80 bg-gradient-to-tr from-[#0f2027] via-[#203a43] to-[#2c5364] text-white rounded-3xl p-0 shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5"
            >
              {/* Encabezado fijo */}
              <div className="sticky top-0 z-10 bg-[#0f2027] bg-opacity-95 backdrop-blur-sm rounded-t-3xl px-4 py-3 flex items-center justify-between border-b border-cyan-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-300" />
                  <div>
                    <p className="font-semibold text-white">Gemini Assistant</p>
                    <p className="text-xs text-cyan-200">
                      {isListening ? "Escuchando..." : "En línea"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-cyan-300  hover:bg-[#2c5364]"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Área scrollable SOLO para mensajes */}
              <div
                className="flex flex-col space-y-3 px-4 py-3 overflow-y-auto max-h-80"
                style={{ scrollbarGutter: "stable" }}
              >
                {messages
                  .filter(
                    (msg) => msg.type === "audio" || msg.text?.trim() !== ""
                  )
                  .map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 ${
                        msg.sender === "User" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {msg.sender === "User" ? (
                          <User className="w-5 h-5 text-cyan-300" />
                        ) : (
                          <Bot className="w-5 h-5 text-green-300" />
                        )}
                      </div>
                      <div
                        className={`
              max-w-[75%]
              px-4 py-2
              rounded-2xl
              ${
                msg.sender === "User"
                  ? "bg-cyan-600 text-white rounded-br-none shadow-md self-end"
                  : "bg-cyan-900 text-cyan-100 rounded-bl-none shadow-md self-start"
              }
              break-words whitespace-pre-wrap leading-relaxed
            `}
                      >
                        {msg.type === "text" ? (
                          <>
                            {msg.text}
                            {!msg.isComplete && (
                              <span className="ml-2 italic text-cyan-300 animate-pulse">
                                (typing...)
                              </span>
                            )}
                          </>
                        ) : (
                          msg.audioData && (
                            <AudioPlayer base64Audio={msg.audioData} />
                          )
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Botón de micrófono */}
          <Button
            onClick={handleMicClick}
            size="lg"
            className={`
            relative w-14 h-14 rounded-full shadow-lg
            transition-all duration-300 transform hover:scale-105
            ${
              isListening
                ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                : "bg-gradient-to-r from-cyan-500 to-blue-600"
            }
          `}
          >
            {isListening && (
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
            )}
            <div className="relative z-10">
              <Mic className="w-5 h-5" />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FloatingAIButton;
