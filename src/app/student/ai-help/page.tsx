"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Send, Mic, Sparkles, Volume2, Paperclip, X, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function AiHelpPage() {
  const { student } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student && messages.length === 0) {
      const isKan = student.preferredLanguage === 'Kannada';
      const welcomeText = isKan
        ? `ನಮಸ್ಕಾರ ${student.name}! ನಾನು ನಿಮ್ಮ Acculum AI ಶಿಕ್ಷಕ. ನೀವು ${student.interests[0] || 'ಕಲಿಕೆ'} ಇಷ್ಟಪಡುತ್ತೀರಿ ಎಂದು ತಿಳಿದಿದೆ. ಯಾವ ವಿಷಯ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ?`
        : `Hi ${student.name}! 👋 I'm your Acculum AI companion. I see you like ${student.interests[0] || 'learning'} — I'll always explain things using examples you'll love. What would you like to learn today?`;
      setMessages([{ role: 'ai', text: welcomeText }]);
      speakText(welcomeText, isKan ? 'kn-IN' : 'en-US');
    }
  }, [student]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    window.speechSynthesis.speak(utt);
  };

  const handleVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Microphone access is unavailable in this browser. You can type your question instead.');
      return;
    }
    const recognition = new SR();
    recognition.lang = student?.preferredLanguage === 'Kannada' ? 'kn-IN' : 'en-US';
    recognition.start();
    setIsListening(true);
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input;
    if (!text.trim() || !student) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            name: student.name,
            interest: student.interests[0],
            language: student.preferredLanguage,
            path: typeof window !== 'undefined' ? window.location.pathname : '',
          }
        })
      });
      const data = await res.json();
      const resp = data.response || 'AI assistant is temporarily unavailable. You can continue with your lessons.';
      setMessages(prev => [...prev, { role: 'ai', text: resp }]);
      speakText(resp, student.preferredLanguage === 'Kannada' ? 'kn-IN' : 'en-US');
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'AI assistant is temporarily unavailable. You can continue with your lessons.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isKan = student?.preferredLanguage === 'Kannada';
    setMessages(prev => [
      ...prev,
      { role: 'user', text: `📎 Uploaded: ${file.name}` },
      {
        role: 'ai',
        text: isKan
          ? `ನಾನು "${file.name}" ಅನ್ನು ಸ್ವೀಕರಿಸಿದ್ದೇನೆ. ಇದರ ಬಗ್ಗೆ ನಿಮಗೆ ಏನು ತಿಳಿಯಬೇಕು? ಸರಳ ವಿವರಣೆ ಅಥವಾ ರಸಪ್ರಶ್ನೆ ಬೇಕೇ?`
          : `I've received "${file.name}". What would you like me to do with it? I can explain it simply, create quiz questions, or summarize it using a ${student?.interests[0] || 'fun'} example.`
      }
    ]);
    e.target.value = '';
  };

  if (!student) return null;

  const QUICK_PROMPTS = student.preferredLanguage === 'Kannada'
    ? ['ಭಿನ್ನರಾಶಿ ವಿವರಿಸಿ', `${student.interests[0]} ಉದಾಹರಣೆ ಕೊಡಿ`, 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಹೇಳಿ']
    : [`Explain fractions`, `Use a ${student.interests[0]} example`, `Explain photosynthesis simply`, `What is electric current?`];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)] text-white flex items-center justify-center shadow-lg">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Acculum AI</h1>
          <p className="text-sm text-slate-500">
            {student.preferredLanguage === 'Kannada' ? 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಶಿಕ್ಷಕ' : 'Your personal learning companion'} · {student.interests[0]} theme
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col shadow-xl border-slate-200 overflow-hidden bg-white">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'self-end ml-auto flex-row-reverse' : 'self-start'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${msg.role === 'ai' ? 'bg-[var(--theme-light)] text-[var(--theme-primary)]' : 'bg-slate-900 text-white'}`}>
                {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : (student?.avatar?.includes('http') ? '??' : student?.avatar)}
              </div>
              <div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-sm'
                    : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                }`}>
                  {msg.text.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
                {msg.role === 'ai' && (
                  <button
                    onClick={() => speakText(msg.text, student.preferredLanguage === 'Kannada' ? 'kn-IN' : 'en-US')}
                    className="flex items-center gap-1 mt-1 ml-1 text-[11px] text-slate-400 hover:text-[var(--theme-primary)] font-medium"
                  >
                    <Volume2 className="w-3 h-3" /> Listen
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex self-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--theme-light)] text-[var(--theme-primary)] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 flex overflow-x-auto gap-2 bg-white border-t border-slate-100">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="whitespace-nowrap px-3 py-1.5 bg-[var(--theme-light)] text-[var(--theme-primary)] text-xs font-semibold rounded-full hover:opacity-80 transition-opacity border border-[var(--theme-primary)]/20"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          {isListening && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-semibold mb-2 px-1 animate-pulse">
              <Mic className="w-4 h-4" /> Listening...
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-[var(--theme-primary)] transition-colors rounded-xl hover:bg-[var(--theme-light)]"
              title="Upload file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx" className="hidden" onChange={handleFileUpload} />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={student.preferredLanguage === 'Kannada' ? 'ಏನು ಬೇಕಾದರೂ ಕೇಳಿ...' : 'Ask me anything... (Enter to send)'}
              className="flex-1 bg-slate-100 resize-none rounded-2xl py-3 px-4 text-sm max-h-32 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:bg-white transition-colors"
              rows={1}
            />

            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`p-3 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-light)]'}`}
              title="Voice input"
            >
              <Mic className="w-5 h-5" />
            </button>

            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="h-11 w-11 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 flex items-center justify-center p-0 shadow-md disabled:opacity-40"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
