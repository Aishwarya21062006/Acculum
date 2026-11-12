import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/GamifiedButton';
import { useTheme } from '@/context/ThemeContext';

const CLASSES = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6',
                 'Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
const SECTIONS = ['A','B','C','D','E','F'];

interface Props {
  defaultName?: string;
  onSubmit: (name: string, cls: string, school: string, section: string, roll?: string) => void;
}

export function DetailsStep({ defaultName = '', onSubmit }: Props) {
  const { isCricket } = useTheme();
  const [name, setName]       = useState(defaultName);
  const [cls, setCls]         = useState('');
  const [school, setSchool]   = useState('');
  const [section, setSection] = useState('');
  const [roll, setRoll]       = useState('');
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())   e.name   = 'Name is required';
    if (!cls)           e.cls    = 'Class is required';
    if (!school.trim()) e.school = 'School name is required';
    if (!section)       e.section = 'Section is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(name.trim(), cls, school.trim(), section, roll.trim() || undefined);
  };

  const inputCls = `w-full px-4 py-3 rounded-xl border-2 text-sm font-medium
    transition-all duration-200 focus:outline-none ${
    isCricket
      ? 'bg-green-950/50 border-green-700/60 text-white placeholder:text-green-300/40 focus:border-yellow-400'
      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500'
  }`;
  const labelCls = `block text-sm font-bold mb-1.5 ${isCricket ? 'text-green-200' : 'text-gray-700'}`;
  const errorCls = 'text-red-400 text-xs mt-1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="w-full max-w-lg mx-auto px-4"
    >
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-black mb-2 ${isCricket ? 'text-white' : 'text-gray-900'}`}>
          Tell us about yourself {isCricket ? '🏏' : '👤'}
        </h2>
        <p className={isCricket ? 'text-green-300/70' : 'text-gray-500'}>
          Help us create your personalized learning journey.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelCls} htmlFor="name">Full Name *</label>
          <input
            id="name" type="text" value={name}
            onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
            placeholder="Enter your name"
            className={`${inputCls} ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        {/* Class + Section */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="class">Class *</label>
            <select
              id="class" value={cls}
              onChange={e => { setCls(e.target.value); setErrors(prev => ({ ...prev, cls: '' })); }}
              className={`${inputCls} ${errors.cls ? 'border-red-500' : ''}`}
            >
              <option value="">Select class</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.cls && <p className={errorCls}>{errors.cls}</p>}
          </div>
          <div>
            <label className={labelCls} htmlFor="section">Section *</label>
            <select
              id="section" value={section}
              onChange={e => { setSection(e.target.value); setErrors(prev => ({ ...prev, section: '' })); }}
              className={`${inputCls} ${errors.section ? 'border-red-500' : ''}`}
            >
              <option value="">Select section</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.section && <p className={errorCls}>{errors.section}</p>}
          </div>
        </div>

        {/* School */}
        <div>
          <label className={labelCls} htmlFor="school">School *</label>
          <input
            id="school" type="text" value={school}
            onChange={e => { setSchool(e.target.value); setErrors(prev => ({ ...prev, school: '' })); }}
            placeholder="Enter your school name"
            className={`${inputCls} ${errors.school ? 'border-red-500' : ''}`}
          />
          {errors.school && <p className={errorCls}>{errors.school}</p>}
        </div>

        {/* Roll Number */}
        <div>
          <label className={labelCls} htmlFor="roll">
            Roll Number{' '}
            <span className={`font-normal text-xs ${isCricket ? 'text-green-400/60' : 'text-gray-400'}`}>(Optional)</span>
          </label>
          <input
            id="roll" type="text" value={roll}
            onChange={e => setRoll(e.target.value)}
            placeholder="Enter roll number"
            className={inputCls}
          />
        </div>
      </div>

      <Button
        size="lg" fullWidth onClick={handleSubmit}
        className={`mt-8 font-black text-base ${
          isCricket
            ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900 focus:ring-yellow-400 shadow-lg shadow-yellow-900/30'
            : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-lg shadow-green-200'
        }`}
      >
        Continue <ArrowRight size={20} />
      </Button>
    </motion.div>
  );
}
