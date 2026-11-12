import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, ArrowRight, BookOpen, Trophy, Brain } from 'lucide-react';
import { Button } from '@/components/ui/GamifiedButton';
import type { Role } from '@/data/onboardingTypes';

export function RoleStep({ onSelect }: { onSelect: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* Brand */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
            <span className="text-white text-2xl">🏏</span>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">CRIC LEARN</h1>
            <p className="text-[11px] font-black text-green-600 tracking-[0.2em] mt-0.5">PLAY • LEARN • GROW</p>
          </div>
        </div>

        {/* Decorative education icons */}
        <div className="flex justify-center gap-6 mb-6 text-3xl opacity-30 select-none">
          <span className="animate-[float_3s_ease-in-out_infinite]">📐</span>
          <span className="animate-[float_3s_ease-in-out_0.5s_infinite]">🔬</span>
          <span className="animate-[float_3s_ease-in-out_1s_infinite]">📖</span>
          <span className="animate-[float_3s_ease-in-out_1.5s_infinite]">✏️</span>
          <span className="animate-[float_3s_ease-in-out_2s_infinite]">🧮</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Let's get started! 👋</h2>
        <p className="text-gray-500 text-base">Choose how you want to continue</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Student */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected('student')}
          className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
            selected === 'student'
              ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
              : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
          }`}
          aria-pressed={selected === 'student'}
        >
          {selected === 'student' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-green-700" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1">Student</h3>
          <p className="text-sm text-gray-500 font-medium mb-4">Learn • Practice • Grow</p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: BookOpen, label: 'Subjects', color: 'bg-green-100 text-green-700' },
              { icon: Trophy, label: 'Rewards', color: 'bg-amber-100 text-amber-700' },
              { icon: Brain, label: 'AI Help', color: 'bg-purple-100 text-purple-700' },
            ].map(tag => (
              <span key={tag.label} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-semibold ${tag.color}`}>
                <tag.icon size={11} /> {tag.label}
              </span>
            ))}
          </div>
        </motion.button>

        {/* Facilitator */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected('facilitator')}
          className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
            selected === 'facilitator'
              ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
          }`}
          aria-pressed={selected === 'facilitator'}
        >
          {selected === 'facilitator' && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-blue-700" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1">Facilitator</h3>
          <p className="text-sm text-gray-500 font-medium mb-4">Teach • Track • Guide</p>
          <div className="flex flex-wrap gap-2">
            {['📊 Dashboard', '👥 Students', '📋 Reports'].map(tag => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-semibold">{tag}</span>
            ))}
          </div>
        </motion.button>
      </div>

      <Button
        size="lg" fullWidth
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        className={`font-black text-base ${
          selected === 'student'
            ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg shadow-green-200'
            : selected === 'facilitator'
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg shadow-blue-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue <ArrowRight size={20} />
      </Button>
    </motion.div>
  );
}
