import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/GamifiedButton';
import { INTERESTS } from '@/data/interests';
import type { Interest } from '@/data/onboardingTypes';

export function InterestsStep({ onSelect }: { onSelect: (interests: Interest[]) => void }) {
  const [selected, setSelected] = useState<Set<Interest>>(new Set());

  const toggle = (id: Interest) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const hasCricket = selected.has('cricket');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">What do you like? 🎯</h2>
        <p className="text-gray-500">Select your interests to personalize your learning experience.</p>
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.p
              key="count"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm font-bold text-green-600"
            >
              {selected.size} interest{selected.size > 1 ? 's' : ''} selected
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Cricket hint */}
      <AnimatePresence>
        {!hasCricket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center font-semibold">
              🏏 Select <strong>Cricket</strong> to unlock a premium Cricket Learning Experience!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cricket selected banner */}
      <AnimatePresence>
        {hasCricket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl text-sm text-white text-center font-bold shadow-lg shadow-green-200">
              🏏 Cricket selected! Your learning world is about to change ✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interest grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {INTERESTS.map(interest => {
          const isSelected = selected.has(interest.id);
          return (
            <motion.button
              key={interest.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(interest.id)}
              className={`relative p-4 rounded-2xl border-2 flex flex-col items-center gap-2
                transition-all duration-200 ${
                isSelected
                  ? `${interest.selectedBorder} ${interest.selectedBg} shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              } ${interest.id === 'cricket' && isSelected ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
              aria-pressed={isSelected}
              aria-label={interest.label}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
              <span className="text-3xl">{interest.emoji}</span>
              <span className={`text-xs font-bold ${isSelected ? interest.textColor : 'text-gray-600'}`}>
                {interest.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <Button
        size="lg" fullWidth
        disabled={selected.size === 0}
        onClick={() => onSelect(Array.from(selected))}
        className={`font-black text-base ${
          hasCricket
            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 focus:ring-green-500'
            : selected.size > 0
              ? 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {hasCricket ? '🏏 Set Up My Cricket Experience' : 'Continue'} <ArrowRight size={20} />
      </Button>
    </motion.div>
  );
}
