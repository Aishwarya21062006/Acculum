import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/GamifiedButton';
import { useTheme } from '@/context/ThemeContext';

type VerifState = 'idle' | 'requesting' | 'scanning' | 'detected' | 'verifying' | 'success' | 'error' | 'demo';

interface Props {
  studentName: string;
  onComplete: () => void;
}

export function VerificationStep({ studentName, onComplete }: Props) {
  const { isCricket } = useTheme();
  const [state, setState] = useState<VerifState>('idle');
  const [demoMsg, setDemoMsg] = useState('');
  const [demoProgress, setDemoProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const startCamera = async () => {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setState('scanning');
      setTimeout(() => setState('detected'), 2000);
      setTimeout(() => setState('verifying'), 3500);
      setTimeout(() => { streamRef.current?.getTracks().forEach(t => t.stop()); setState('success'); }, 5000);
    } catch { setState('error'); }
  };

  const startDemo = () => {
    setState('demo');
    const msgs = ['Initialising...', 'Scanning face...', 'Face detected ✓', 'Verifying...', 'Success ✓'];
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        setDemoMsg(msg);
        setDemoProgress(((i + 1) / msgs.length) * 100);
        if (i === msgs.length - 1) setTimeout(() => setState('success'), 500);
      }, i * 600);
    });
  };

  const done = state === 'success';
  const ringColor = done ? 'border-green-500' : isCricket ? 'border-yellow-400/60' : 'border-green-500/60';
  const t = (a: string, b: string) => (isCricket ? a : b);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full max-w-sm mx-auto px-4 text-center"
    >
      <h2 className={`text-3xl font-black mb-2 ${t('text-white', 'text-gray-900')}`}>
        {done ? '🎉 Verified!' : 'Face Verification'}
      </h2>
      <p className={`text-sm mb-3 ${t('text-green-300/70', 'text-gray-500')}`}>
        {done ? `Welcome to Cric Learn, ${studentName}!` : 'Look at the camera to verify your identity.'}
      </p>

      {/* Demo mode disclaimer */}
      {!done && (
        <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl mb-8 ${
          t('bg-yellow-400/10 text-yellow-300', 'bg-amber-50 text-amber-700 border border-amber-200')
        }`}>
          🔒 Face Detection Demo — No images stored
        </div>
      )}

      {/* Camera frame */}
      <div className="relative w-52 h-52 mx-auto mb-6">
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 ${ringColor}`} />

        {/* Scanning spinner */}
        {(state === 'scanning' || state === 'verifying') && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-yellow-400"
          />
        )}

        {/* Inner circle */}
        <div className="absolute inset-5 rounded-full overflow-hidden bg-gray-900 flex items-center justify-center">
          {(state === 'scanning' || state === 'detected' || state === 'verifying') && (
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          )}
          {(state === 'idle' || state === 'requesting' || state === 'error') && (
            <Camera className={`w-12 h-12 ${t('text-green-400/40', 'text-gray-400')}`} />
          )}
          {state === 'demo' && (
            <div className="flex flex-col items-center gap-2 p-4">
              <span className="text-3xl">👤</span>
              <span className="text-xs text-green-400 font-medium">{demoMsg}</span>
            </div>
          )}
          {done && (
            <div className="w-full h-full flex items-center justify-center bg-green-900">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
          )}
        </div>

        {/* Corner brackets */}
        {(['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'] as const).map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
            <div className={`absolute ${pos.includes('top') ? 'top-0' : 'bottom-0'} ${pos.includes('left') ? 'left-0' : 'right-0'} w-4 h-0.5 ${t('bg-yellow-400', 'bg-green-500')}`} />
            <div className={`absolute ${pos.includes('top') ? 'top-0' : 'bottom-0'} ${pos.includes('left') ? 'left-0' : 'right-0'} h-4 w-0.5 ${t('bg-yellow-400', 'bg-green-500')}`} />
          </div>
        ))}
      </div>

      {/* Status text */}
      <p className={`text-sm font-semibold min-h-5 mb-4 ${done ? 'text-green-400' : t('text-green-300/60', 'text-gray-500')}`}>
        {state === 'idle'       && 'Position your face inside the frame'}
        {state === 'requesting' && 'Requesting camera access...'}
        {state === 'scanning'   && '🔍 Scanning...'}
        {state === 'detected'   && '✓ Face detected'}
        {state === 'verifying'  && '🔄 Verifying...'}
        {state === 'demo'       && demoMsg}
        {done                   && '✅ Verification Successful!'}
        {state === 'error'      && '⚠️ Camera access unavailable'}
      </p>

      {/* Demo progress bar */}
      {state === 'demo' && (
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-5">
          <motion.div animate={{ width: `${demoProgress}%` }} transition={{ duration: 0.3 }}
            className="h-1.5 bg-green-500 rounded-full" />
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {state === 'idle' && (
          <>
            <Button size="lg" fullWidth onClick={startCamera}
              className={`font-black ${t('bg-yellow-400 hover:bg-yellow-300 text-gray-900 focus:ring-yellow-400', 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500')} shadow-lg`}>
              <Camera size={18} /> Start Camera
            </Button>
            <Button size="md" fullWidth onClick={startDemo}
              className={`font-semibold border-2 bg-transparent ${t('border-green-700 text-green-300 hover:bg-green-900/30', 'border-gray-300 text-gray-600 hover:bg-gray-50')}`}>
              Use Demo Verification
            </Button>
          </>
        )}
        {state === 'error' && (
          <>
            <p className={`text-xs mb-3 ${t('text-yellow-300', 'text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200')}`}>
              Camera access is unavailable. You can continue with Demo Verification.
            </p>
            <Button size="lg" fullWidth onClick={startDemo}
              className={`font-black ${t('bg-yellow-400 hover:bg-yellow-300 text-gray-900', 'bg-green-600 hover:bg-green-700 text-white')}`}>
              Use Demo Verification
            </Button>
            <Button size="sm" fullWidth onClick={() => setState('idle')}
              className={`bg-transparent font-semibold ${t('text-green-300 hover:text-white', 'text-gray-500 hover:text-gray-700')}`}>
              <RefreshCw size={14} /> Try Again
            </Button>
          </>
        )}
        {done && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}
                className="text-5xl mb-4"
              >🎉</motion.div>
              <p className={`text-xl font-black mb-6 ${t('text-yellow-400', 'text-green-600')}`}>
                Welcome to Cric Learn, {studentName}!
              </p>
              <Button size="lg" fullWidth onClick={onComplete}
                className={`font-black text-base ${t('bg-yellow-400 hover:bg-yellow-300 text-gray-900 shadow-lg shadow-yellow-900/30', 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200')}`}>
                Go to Dashboard 🏏
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
