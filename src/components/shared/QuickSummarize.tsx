"use client";

import { useState, useRef, useEffect} from 'react';
import Link from 'next/link';
import { useAuthStore} from '@/store/auth';
import { Card, CardContent} from '@/components/ui/card';
import { Mic, Keyboard, X, Loader2, Sparkles, Volume2, Video, Play, Lock} from 'lucide-react';

type InputMode = 'idle' | 'camera' | 'voice' | 'text';

interface MediaPreview {
  type: 'image' | 'video';
  url: string;
  name: string;
}

export function QuickSummarize() {
  const { student} = useAuthStore();
  const [mode, setMode] = useState<InputMode>('idle');
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceReady, setVoiceReady] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [voiceVideoUploading, setVoiceVideoUploading] = useState(false);
  const [voiceVideoName, setVoiceVideoName] = useState('');
  const [textVideoUploading, setTextVideoUploading] = useState(false);
  const [textVideoName, setTextVideoName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const voiceVideoRef = useRef<HTMLInputElement>(null);
  const textVideoRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the text field when voice transcript is ready
    if (voiceReady && inputRef.current) inputRef.current.focus();
 }, [voiceReady]);

  if (!student) return null;

  const isCricket = student.interests.includes('Cricket');
  const isKan = student.preferredLanguage === 'Kannada';

  const playDemoVideo = () => {
    setIsVideoGenerating(true);
    setTimeout(() => {
      setIsVideoGenerating(false);
      setShowDemoVideo(true);
    }, 2000);
  };

  // ── AI call (used for photo/text) ────────────────────────────────────────────
  const callAI = async (message: string, fileName?: string, fileType?: string) => {
    setIsProcessing(true);
    setResult('');
    setShowDemoVideo(false);
    try {
      const isImage = fileType?.startsWith('image');
      const isVid = fileType?.startsWith('video');
      const prompt = fileName
        ? (isVid
          ? `A student uploaded a video named "${fileName}". Provide a helpful educational explanation using ${isCricket ? 'cricket examples.' : 'simple examples.'}`
          : `A student uploaded an image named "${fileName}". Explain what it shows ${isCricket ? 'using cricket analogies.' : 'simply.'}`)
        : message;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          message: prompt,
          context: { name: student.name, interest: student.interests[0], language: student.preferredLanguage, path: '/student/dashboard'}
       })
     });
      const data = await res.json();
      setResult(data.response || 'Could not process your request.');
      if (isImage || mode === 'text') setShowDemoVideo(true); // play default video after photo summary or text enter

   } catch {
      setResult(isKan ? 'AI ಸದ್ಯ ಲಭ್ಯವಿಲ್ಲ.' : 'AI is temporarily unavailable.');
   } finally {
      setIsProcessing(false);
   }
 };

  // ── VOICE: speak → live text → Enter → play video ────────────────────────────
  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert(isKan ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ.' : 'Voice not supported in this browser.'); return;}

    const rec = new SR();
    rec.lang = isKan ? 'kn-IN' : 'en-US';
    rec.interimResults = true; // show live transcript as you speak
    rec.start();
    setIsListening(true);
    setMode('voice');
    setLiveTranscript('');
    setVoiceReady(false);
    setShowDemoVideo(false);

    rec.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
     }
      setLiveTranscript(final || interim);
      if (final) setText(final);
   };

    rec.onerror = () => { setIsListening(false);};
    rec.onend = () => {
      setIsListening(false);
      setVoiceReady(true); // now show the text field + "Press Enter to play"
   };
 };

  // When user presses Enter in the voice transcript field → play video
  const handleVoiceEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      playDemoVideo(); setVoiceReady(false);
   }
 };

  // ── Photo / video file upload ────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVid = file.type.startsWith('video');
    const url = URL.createObjectURL(file);
    setMediaPreview({ type: isVid ? 'video' : 'image', url, name: file.name});
    setMode('camera');
    callAI('', file.name, file.type);
    e.target.value = '';
 };

  // Upload a video specifically for voice input → saved as /demo-voice-video.mp4
  const handleVoiceVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video')) return;
    setVoiceVideoUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('slot', 'voice'); // tells API to save as demo-voice-video.mp4
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form});
      const data = await res.json();
      if (data.success) setVoiceVideoName(file.name);
   } catch {}
    setVoiceVideoUploading(false);
    e.target.value = '';
 };

  const handleTextVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video')) return;
    setTextVideoUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('slot', 'text');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form});
      const data = await res.json();
      if (data.success) setTextVideoName(file.name);
   } catch {}
    setTextVideoUploading(false);
    e.target.value = '';
 };

  const handleSpeak = (str: string) => {
    const utt = new SpeechSynthesisUtterance(str);
    utt.lang = isKan ? 'kn-IN' : 'en-US';
    window.speechSynthesis.speak(utt);
 };

  const reset = () => {
    setMode('idle'); setText(''); setResult(''); setLiveTranscript('');
    setVoiceReady(false); setShowDemoVideo(false);
    if (mediaPreview?.url) URL.revokeObjectURL(mediaPreview.url);
    setMediaPreview(null);
    window.speechSynthesis.cancel();
 };

  const isActive = mode !== 'idle' || !!result || !!mediaPreview || showDemoVideo;

  return (
    <Card className="border-[var(--theme-primary)]/30 bg-gradient-to-br from-white to-[var(--theme-light)]/40 shadow-md">
      <CardContent className="p-5">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {isKan ? 'ತ್ವರಿತ ಸಹಾಯ' : isCricket ? '🏏 Quick Help — Ask AI' : 'Quick AI Help'}
            </h3>
            <p className="text-xs text-slate-500">
              {isKan ? 'ಫೋಟೋ/ವಿಡಿಯೋ, ಧ್ವನಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ' : 'Upload photo/video, speak, or type'}
            </p>
          </div>
          {isActive && (
            <button onClick={reset} className="ml-auto text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── 3 Input Buttons (shown when idle) ───────────────────── */}
        {!isActive && (
          <>
            <div className="grid grid-cols-3 gap-3">

              {/* Photo / Video */}
              <button
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group ${isCricket ? 'bg-[#061d0f]/60 border-green-800/50 hover:border-yellow-400 hover:bg-[#0a2f1c]/80' : 'bg-white border-slate-100 hover:border-[var(--theme-primary)] hover:bg-[var(--theme-light)]/50'}`}
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <span className={`text-xs font-bold text-center leading-tight transition-colors ${isCricket ? 'text-green-100 group-hover:text-yellow-400' : 'text-slate-600 group-hover:text-[var(--theme-primary)]'}`}>
                  {isKan ? 'ಫೋಟೋ / ವಿಡಿಯೋ' : 'Photo / Video'}
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />

              {/* Voice — LOCKED to play voice video, with its own upload */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleVoice}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group relative ${isCricket ? 'bg-[#061d0f]/60 border-green-800/50 hover:border-yellow-400 hover:bg-[#0a2f1c]/80' : 'bg-white border-slate-100 hover:border-[var(--theme-primary)] hover:bg-[var(--theme-light)]/50'}`}
                >
                  <div className="absolute top-2 right-2 bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className={`text-xs font-bold text-center leading-tight transition-colors ${isCricket ? 'text-green-100 group-hover:text-yellow-400' : 'text-slate-600 group-hover:text-[var(--theme-primary)]'}`}>
                    {isKan ? 'ಧ್ವನಿ ಇನ್‌ಪುಟ್' : 'Voice Input'}
                  </span>
                </button>

                {/* Hidden voice upload input for functionality to remain intact if ever triggered via code, but button is removed */}
                <input
                  ref={voiceVideoRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVoiceVideoUpload}
                />
              </div>

              {/* Type — LOCKED to play text video, with its own upload */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setMode('text')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group relative ${isCricket ? 'bg-[#061d0f]/60 border-green-800/50 hover:border-yellow-400 hover:bg-[#0a2f1c]/80' : 'bg-white border-slate-100 hover:border-[var(--theme-primary)] hover:bg-[var(--theme-light)]/50'}`}
                >
                  <div className="absolute top-2 right-2 bg-amber-400 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className={`text-xs font-bold text-center leading-tight transition-colors ${isCricket ? 'text-green-100 group-hover:text-yellow-400' : 'text-slate-600 group-hover:text-[var(--theme-primary)]'}`}>
                    {isKan ? 'ಟೈಪ್ ಮಾಡಿ' : 'Type Question'}
                  </span>
                </button>

                {/* Hidden text upload input for functionality to remain intact if ever triggered via code, but button is removed */}
                <input
                  ref={textVideoRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleTextVideoUpload}
                />
              </div>
            </div>

          </>

        )}

        {/* ── VOICE MODE: listening animation ─────────────────────── */}
        {mode === 'voice' && isListening && (
          <div className="flex flex-col items-center gap-4 py-6">
            {/* Pulsing mic */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl relative z-10">
                <Mic className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="font-bold text-slate-700 text-sm animate-pulse">
              {isKan ? '🎤 ಕೇಳುತ್ತಿದ್ದೇನೆ...' : '🎤 Listening... Speak now'}
            </p>
            {/* Live transcript as you speak */}
            {liveTranscript && (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium text-center min-h-[48px]">
                {liveTranscript}
              </div>
            )}
          </div>
        )}

        {/* ── VOICE MODE: done speaking → show text field → press Enter ── */}
        {mode === 'voice' && voiceReady && !showDemoVideo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <Lock className="w-3 h-3" />
              {isKan ? '🔒 ಧ್ವನಿ ಇನ್‌ಪುಟ್ — ಎಂಟರ್ ಒತ್ತಿ ವಿಡಿಯೋ ನೋಡಿ' : '🔒 Voice locked to default video — Press Enter to play'}
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleVoiceEnter}
                placeholder={isKan ? 'ಎಂಟರ್ ಒತ್ತಿ...' : 'Edit if needed, then press Enter to play video...'}
                className="w-full bg-white border-2 border-[var(--theme-primary)] rounded-xl px-4 py-3 pr-24 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              />
              <button
                onClick={() => { playDemoVideo(); setVoiceReady(false);}}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--theme-primary)] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:opacity-90"
              >
                <Play className="w-3 h-3" /> Play
              </button>
            </div>

            <p className="text-center text-xs text-slate-400">
              {isKan ? '↩ ಎಂಟರ್ ಒತ್ತಿ ಅಥವಾ Play ಕ್ಲಿಕ್ ಮಾಡಿ' : '↩ Press Enter or click Play to watch the video'}
            </p>
          </div>
        )}

        {/* ── Text input mode ──────────────────────────────────────── */}
        {mode === 'text' && !result && !isProcessing && !showDemoVideo && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs bg-blue-50 px-3 py-2 rounded-xl border border-blue-200">
              <Lock className="w-3 h-3" />
              {isKan ? '🔒 ಟೈಪ್ ಇನ್‌ಪುಟ್ — ಎಂಟರ್ ಒತ್ತಿ ವಿಡಿಯೋ ನೋಡಿ' : '🔒 Text locked to default video — Press Enter to play'}
            </div>

            <div className="relative flex gap-2">
              <input
                autoFocus
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && text.trim()) {
                    e.preventDefault();
                    playDemoVideo();
                 }
               }}
                placeholder={isKan ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...' : isCricket ? 'e.g. Explain probability using cricket...' : 'Type your question...'}
                className="flex-1 bg-white border-2 border-[var(--theme-primary)] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              />
              <button
                onClick={() => { if (text.trim()) playDemoVideo(); }}
                disabled={!text.trim()}
                className="px-6 py-3 bg-[var(--theme-primary)] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-1 shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">
              {isKan ? '↩ ಎಂಟರ್ ಒತ್ತಿ ಅಥವಾ Play ಕ್ಲಿಕ್ ಮಾಡಿ' : '↩ Press Enter or click Play to watch the video'}
            </p>
          </div>
        )}

        {/* ── Photo preview ────────────────────────────────────────── */}
        {mediaPreview?.type === 'image' && (
          <div className="rounded-2xl overflow-hidden border-2 border-[var(--theme-primary)] shadow-lg mb-4">
            {isCricket && (
              <div className="bg-[var(--theme-primary)] text-white text-xs font-bold px-4 py-2">
                🏏 Cricket Theme Active — Analyzing with cricket context
              </div>
            )}
            <img src={mediaPreview.url} alt="Uploaded" className="w-full max-h-52 object-contain bg-slate-50" />
            <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 border-t border-slate-200">
              📷 {mediaPreview.name}
            </div>
          </div>
        )}

        {/* ── Video preview (when video file uploaded) ─────────────── */}
        {mediaPreview?.type === 'video' && (
          <div className="rounded-2xl overflow-hidden bg-slate-900 border-2 border-[var(--theme-primary)] shadow-xl mb-4">
            {isCricket && (
              <div className="bg-[var(--theme-primary)] text-white text-xs font-bold px-4 py-2 flex items-center gap-2">
                🏏 Cricket Theme Active
              </div>
            )}
            <video ref={useRef(null)} src={mediaPreview.url} className="w-full max-h-64" controls autoPlay />
            <div className="px-4 py-2 bg-slate-800 text-slate-300 text-xs">
              📹 {mediaPreview.name}
            </div>
          </div>
        )}

        {/* ── Processing spinner ───────────────────────────────────── */}
        {isProcessing && (
          <div className="flex items-center gap-3 py-3">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--theme-primary)]" />
            <span className="text-sm text-slate-600 font-medium">
              {isKan ? 'ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ...' : isCricket ? '🏏 Analyzing with cricket lens...' : 'Thinking...'}
            </span>
          </div>
        )}

        {/* ── AI Result text ───────────────────────────────────────── */}
        {result && !isProcessing && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 leading-relaxed shadow-sm mb-4">
            {isCricket && (
              <p className="text-green-700 font-bold text-xs mb-2">🏏 Cricket-Contextual Explanation</p>
            )}
            <p>{result}</p>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
              <button onClick={() => handleSpeak(result)} className="flex items-center gap-1 text-xs text-[var(--theme-primary)] font-semibold hover:underline">
                <Volume2 className="w-3 h-3" /> {isKan ? 'ಕೇಳಿ' : 'Listen'}
              </button>
              <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-semibold">
                <X className="w-3 h-3" /> {isKan ? 'ಮುಚ್ಚಿ' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* ── VIDEO GENERATING STATE ───────────────────────────────── */}
        {isVideoGenerating && (
          <div className="flex flex-col items-center justify-center gap-4 py-10 bg-slate-900 rounded-2xl border-2 border-[var(--theme-primary)] shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl">🪄</span>
                </div>
              </div>
              <p className="font-bold text-white text-sm animate-pulse">
                {isKan ? 'ವಿಡಿಯೋ ರಚಿಸಲಾಗುತ್ತಿದೆ...' : isCricket ? 'Generating Cricket Video...' : 'Generating Video...'}
              </p>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-yellow-400 animate-pulse rounded-full" style={{ width: '60%', transition: 'width 2s linear' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* ── DEFAULT VIDEO PLAYER (after photo summary, voice Enter, or text Enter) ── */}
        {showDemoVideo && (
          <div className="rounded-2xl overflow-hidden border-2 border-[var(--theme-primary)] shadow-xl">
            <div className="px-3 py-2 bg-[var(--theme-primary)] text-white text-xs font-bold flex items-center gap-2">
              <Play className="w-3 h-3" />
              {mode === 'voice'
                ? (isKan ? '🎤 ಧ್ವನಿ ವಿಡಿಯೋ' : '🎤 Voice Video')
                : mode === 'text'
                  ? (isKan ? '⌨️ ಟೈಪ್ ವಿಡಿಯೋ' : '⌨️ Text Input Video')
                  : (isCricket ? '🏏 Related Cricket Explanation Video' : 'Related Explanation Video')}
            </div>
            <video
              src={mode === 'voice' ? '/demo-voice-video.mp4' : mode === 'text' ? '/demo-text-video.mp4' : '/demo-video.mp4'}
              className="w-full bg-black"
              autoPlay
              controls
              onError={(e) => {
                const el = e.currentTarget;
                el.style.display = 'none';
                const parent = el.parentNode as HTMLElement;
                if (parent && !parent.querySelector('.no-video-msg')) {
                  const msg = document.createElement('div');
                  msg.className = 'no-video-msg p-6 text-center text-slate-400 text-sm bg-slate-900';
                  msg.innerHTML = mode === 'voice'
                    ? '🎤 No voice video yet. Click <strong style="color:#4ade80">⬆ Add Video</strong> below the Voice Input button to upload one.'
                    : mode === 'text'
                      ? '⌨️ No text video yet. Click <strong style="color:#4ade80">⬆ Add Video</strong> below the Type Question button to upload one.'
                      : '📹 No default video yet. <a href="/upload-video" style="color:#4ade80;font-weight:bold">Upload one here →</a>';
                  parent.appendChild(msg);
               }
             }}
            />
          </div>
        )}

      </CardContent>
    </Card>
  );
}
