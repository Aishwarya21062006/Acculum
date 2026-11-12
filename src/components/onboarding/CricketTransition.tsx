import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const SETUP_STEPS = [
  { text: 'Applying Cricket Theme', delay: 300 },
  { text: 'Personalizing Learning Content', delay: 700 },
  { text: 'Preparing Cricket Challenges', delay: 1100 },
  { text: 'Setting up your Learning Dashboard', delay: 1500 },
];

export function CricketTransition({ onComplete }: { onComplete: () => void }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    SETUP_STEPS.forEach((s, i) => {
      setTimeout(() => setCompleted(prev => [...prev, i]), s.delay);
    });
    setTimeout(() => setDone(true), 1900);
    setTimeout(onComplete, 2400);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #012910 0%, #022c1a 40%, #041c10 100%)' }}
    >
      {/* Animated ball crossing the screen */}
      <motion.div
        initial={{ x: '-110vw', y: '10vh', rotate: 0 }}
        animate={{ x: '110vw', y: '30vh', rotate: 1080 }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
        className="absolute w-10 h-10 rounded-full bg-red-600 border-2 border-red-900 shadow-lg shadow-red-900/50 flex items-center justify-center pointer-events-none"
        style={{ top: 0, left: 0 }}
      >
        {/* seam lines */}
        <div className="absolute w-full h-0.5 bg-white/30 rounded-full" />
        <div className="absolute w-0.5 h-full bg-white/20 rounded-full" />
      </motion.div>

      {/* Floodlight rays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[8%] w-1.5 h-40 bg-gradient-to-b from-yellow-300/40 to-transparent"
          style={{ transform: 'rotate(12deg)', transformOrigin: 'top', filter: 'blur(3px)' }} />
        <div className="absolute top-0 right-[8%] w-1.5 h-40 bg-gradient-to-b from-yellow-300/40 to-transparent"
          style={{ transform: 'rotate(-12deg)', transformOrigin: 'top', filter: 'blur(3px)' }} />
        {/* Pitch outline */}
        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-56 border border-white/10 rounded-sm origin-bottom"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-8 text-center">
        {/* Spinning ball icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-red-500 to-red-800
            border-4 border-red-900 shadow-2xl shadow-red-900/60 flex items-center justify-center relative"
        >
          <div className="absolute w-full h-0.5 bg-white/25 rounded-full" />
          <div className="absolute w-0.5 h-full bg-white/15 rounded-full" />
          <span className="text-2xl relative z-10">🏏</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white text-xl md:text-2xl font-black mb-2"
        >
          Setting up your Cricket Learning Experience...
        </motion.h2>
        <p className="text-green-400/60 text-sm mb-10">Personalizing everything just for you</p>

        {/* Progress checklist */}
        <div className="space-y-3 text-left max-w-xs mx-auto">
          {SETUP_STEPS.map((step, i) => {
            const isComplete = completed.includes(i);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 transition-all duration-400 ${
                  isComplete ? 'text-green-400' : 'text-white/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                  transition-all duration-300 ${
                  isComplete ? 'bg-green-500 border-green-400' : 'border-white/20'
                }`}>
                  {isComplete && <Check size={10} />}
                </div>
                <span className="text-sm font-semibold">{step.text}</span>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {done && (
            <motion.p
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-8 text-yellow-400 font-black text-lg"
            >
              ✨ Ready to play!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
