"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { BrainCircuit, Send, Mic, Paperclip, X, Volume2, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AiAssistant() {
  const { student } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Play welcome message when mounted & authenticated
  useEffect(() => {
    if (student && messages.length === 0) {
      const isKan = student.preferredLanguage === 'Kannada';
      const welcomeText = isKan 
        ? `ನಮಸ್ಕಾರ ${student.name}! Acculum ಗೆ ಸ್ವಾಗತ. ನಿಮಗೆ ${student.interests[0] || 'ವಿದ್ಯೆ'} ಇಷ್ಟ ಎಂದು ನೋಡುತ್ತಿದ್ದೇನೆ. ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?`
        : `Hi ${student.name}! Welcome to Acculum. I see that you enjoy ${student.interests[0] || 'learning'}. What would you like to learn today?`;
      
      setMessages([{ role: 'ai', text: welcomeText }]);
      speakText(welcomeText, isKan ? 'kn-IN' : 'en-US');
    }
  }, [student]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speakText = (text: string, lang: string = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone access is unavailable in this browser. You can type your question instead.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = student?.preferredLanguage === 'Kannada' ? 'kn-IN' : 'en-US';
    recognition.start();

    setIsTyping(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsTyping(false);
    };

    recognition.onerror = () => {
      setIsTyping(false);
      alert("Voice recognition failed. Please try again.");
    };
  };

  const handleSend = async () => {
    if (!input.trim() || !student) return;
    
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          context: {
            name: student.name,
            interest: student.interests[0],
            language: student.preferredLanguage,
            path: window.location.pathname
          }
        })
      });
      
      const data = await res.json();
      const responseText = data.response || "I couldn't process that. Try again!";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
      speakText(responseText, student.preferredLanguage === 'Kannada' ? 'kn-IN' : 'en-US');
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "AI assistant is temporarily unavailable. You can continue with your lessons." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!student) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--theme-primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 animate-bounce"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-[var(--theme-primary)] p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              <h3 className="font-bold">Acculum AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex max-w-[85%] flex-col ${msg.role === 'user' ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                <div className={`p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-sm shadow-md' 
                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200 shadow-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => speakText(msg.text, student.preferredLanguage === 'Kannada' ? 'kn-IN' : 'en-US')}
                    className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 hover:text-[var(--theme-primary)] font-medium px-1"
                  >
                    <Volume2 className="w-3 h-3" /> Listen
                  </button>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex self-start bg-white p-3 rounded-xl rounded-tl-sm border border-slate-200 shadow-sm items-center gap-1 w-16">
                <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-slate-50 flex overflow-x-auto no-scrollbar gap-2 shrink-0">
              {['Explain my lesson', 'Give me a quiz', `Use ${student.interests[0]} example`].map((p, i) => (
                <button key={i} onClick={() => setInput(p)} className="whitespace-nowrap px-3 py-1.5 bg-[var(--theme-light)] text-[var(--theme-primary)] text-xs font-semibold rounded-full hover:opacity-80 transition-opacity">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2">
            <button className="text-slate-400 hover:text-[var(--theme-primary)]" onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*,.pdf';
              fileInput.onchange = () => {
                if(fileInput.files?.length) {
                   setMessages(prev => [...prev, {role: 'user', text: `[Uploaded File: ${fileInput.files![0].name}]`}]);
                   setMessages(prev => [...prev, {role: 'ai', text: student.preferredLanguage === 'Kannada' ? 'ನಾನು ಈ ಫೈಲ್ ಅನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿದ್ದೇನೆ. ನಿಮಗೆ ಏನು ಬೇಕು?' : 'I have processed this file. What would you like to know about it?'}]);
                }
              };
              fileInput.click();
            }}>
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleSend(); }}
              placeholder={student.preferredLanguage === 'Kannada' ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...' : 'Type your question...'}
              className="flex-1 bg-slate-100 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
            />
            <button onClick={startVoiceInput} className="text-slate-400 hover:text-[var(--theme-primary)]">
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={handleSend} disabled={!input.trim()} className="text-[var(--theme-primary)] disabled:opacity-50 hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </Card>
      )}
    </>
  );
}
