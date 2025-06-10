
import React, { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AssistantMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your Gemini Voice Assistant. How can I help you find the perfect product today?",
      timestamp: new Date(),
      type: 'assistant'
    }
  ]);

  const handleMicrophoneToggle = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate listening start
      console.log('Starting voice recording...');
      
      // Simulate a response after 3 seconds (for demo purposes)
      setTimeout(() => {
        const newMessage: AssistantMessage = {
          id: Date.now().toString(),
          text: "I heard you! This is where I would process your voice input and provide a helpful response about our products.",
          timestamp: new Date(),
          type: 'assistant'
        };
        setMessages(prev => [...prev, newMessage]);
        setIsListening(false);
      }, 3000);
    } else {
      console.log('Stopping voice recording...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <div className="w-full bg-card/50 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gemini Voice Assistant
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            Speak naturally to find your perfect tech products
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Response Area */}
        <div className="mb-8 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card/80 backdrop-blur-sm border-border/50'
                } glass-effect animate-fade-in`}
              >
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Voice Control Section */}
        <div className="text-center space-y-6">
          {/* Status Indicator */}
          {isListening && (
            <div className="flex items-center justify-center space-x-2 animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span className="text-sm text-muted-foreground ml-2">Listening...</span>
            </div>
          )}

          {/* Main Voice Button */}
          <div className="relative">
            <Button
              onClick={handleMicrophoneToggle}
              size="lg"
              className={`
                relative w-32 h-32 rounded-full text-white font-semibold text-lg
                transition-all duration-300 transform hover:scale-105
                ${isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
                  : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                }
                shadow-2xl hover:shadow-primary/25
              `}
            >
              {/* Animated Ring Effect */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
              )}
              
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                isListening ? 'opacity-100' : 'opacity-0'
              } bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl`}></div>
              
              {/* Icon */}
              <div className="relative z-10">
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </div>
            </Button>

            {/* Ripple Effect */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-[ping_2s_ease-in-out_infinite]"></div>
            )}
          </div>

          {/* Action Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isListening ? 'Listening...' : 'Talk to Assistant'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isListening 
                ? 'Speak now and I\'ll help you find the perfect product'
                : 'Click the microphone and tell me what you\'re looking for'
              }
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Sample Question
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-secondary/50 text-secondary hover:bg-secondary/10"
            >
              Product Recommendations
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              Compare Items
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-card/30 backdrop-blur-sm border-t border-border/50 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Gemini AI • Secure voice processing • Your privacy matters
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
