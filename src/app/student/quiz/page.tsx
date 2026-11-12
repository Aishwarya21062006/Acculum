"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trophy, BrainCircuit, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { PersonalizationEngine } from '@/lib/ai/personalization';
import { getQuizQuestions, getTheme, getScoreAnnouncement } from '@/lib/themes';

export default function QuizPage() {
  const router = useRouter();
  const { student } = useAuthStore();
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  
  const handleAction = (act: string) => {
    if (act.toLowerCase().includes('review') || act.toLowerCase().includes('learn')) {
      router.push('/student/learn');
    } else {
      window.location.reload();
    }
  };

  const [confidence, setConfidence] = useState(3);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  if (!student) return null;

  const theme = getTheme(student.interests);
  const isCricket = theme.implemented;
  const isKan = student.preferredLanguage === 'Kannada';
  const questions = getQuizQuestions(student.interests, student.preferredLanguage);

  const handleStart = () => setStep('quiz');

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelected(index);
    setIsAnswered(true);
    if (index === questions[currentQ].correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setIsAnswered(false);
    } else {
      setStep('result');
    }
  };

  const finalScorePercent = Math.round((score / questions.length) * 100);
  const signal = step === 'result' ? PersonalizationEngine.detectLearningSignal(confidence, finalScorePercent) : null;
  const recommendation = step === 'result' ? PersonalizationEngine.getAdaptiveRecommendation(finalScorePercent) : null;
  const announcement = step === 'result' ? getScoreAnnouncement(student.interests, finalScorePercent) : '';

  const quizLabel = isCricket ? theme.terms.quiz : (isKan ? 'ರಸಪ್ರಶ್ನೆ' : 'Quiz');
  const pointsLabel = isCricket ? theme.terms.points : 'XP';

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-[80vh] flex flex-col justify-center animate-fade-in">

      {step === 'intro' && (
        <Card className="border-0 shadow-2xl bg-white overflow-hidden relative">
          <div className="absolute top-0 w-full h-2 bg-[var(--theme-gradient)]"></div>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-[var(--theme-light)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              {isCricket ? '🏏' : '⚡'}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isCricket ? `🏏 ${quizLabel}` : 'Electricity & Circuits Quiz'}
            </h1>
            <p className="text-slate-500 mb-1">{questions.length} Questions • Medium Difficulty</p>
            {isCricket && (
              <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full inline-block mb-4 font-semibold">
                🏏 Cricket-contextual questions active!
              </p>
            )}

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-500" />
                {isKan ? 'ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು...' : 'Before we begin...'}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {isKan ? 'ಈ ವಿಷಯದ ಬಗ್ಗೆ ನಿಮಗೆ ಎಷ್ಟು ಆತ್ಮವಿಶ್ವಾಸವಿದೆ?' : 'How confident are you about this topic?'}
              </p>
              <div className="flex justify-between items-center mb-2 px-2">
                {['😟', '😕', '😐', '🙂', '😎'].map((emoji, i) => (
                  <span key={i} className={`text-2xl cursor-pointer hover:scale-125 transition-transform ${confidence === i+1 ? 'scale-125' : ''}`} onClick={() => setConfidence(i+1)}>{emoji}</span>
                ))}
              </div>
              <input type="range" min="1" max="5" value={confidence} onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-xs font-semibold text-slate-400 mt-2">
                <span>{isKan ? 'ಆತ್ಮವಿಶ್ವಾಸವಿಲ್ಲ' : 'Not Confident'}</span>
                <span>{isKan ? 'ತುಂಬಾ ಆತ್ಮವಿಶ್ವಾಸವಿದೆ' : 'Very Confident'}</span>
              </div>
            </div>

            <Button onClick={handleStart} className="w-full h-14 text-lg bg-[var(--theme-primary)] hover:opacity-90 font-bold rounded-xl shadow-lg">
              {isCricket ? '🏏 Start Learning Match' : (isKan ? 'ರಸಪ್ರಶ್ನೆ ಪ್ರಾರಂಭಿಸಿ' : 'Start Quiz')}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'quiz' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-500">
              {isKan ? 'ಪ್ರಶ್ನೆ' : 'Question'} {currentQ + 1} {isKan ? 'ಯ' : 'of'} {questions.length}
            </span>
            <span className="text-sm font-bold text-[var(--theme-primary)]">
              {isKan ? 'ಅಂಕ' : (isCricket ? pointsLabel : 'Score')}: {score}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--theme-primary)] transition-all duration-300" style={{ width: `${(currentQ / questions.length) * 100}%` }}></div>
          </div>

          {/* Topic badge */}
          {isCricket && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">🏏 {questions[currentQ].topic}</span>
              <span className="text-xs text-slate-400">{questions[currentQ].concept}</span>
            </div>
          )}

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-10">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-snug">
                {questions[currentQ].text}
              </h2>

              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => {
                  let cls = "bg-white border-slate-200 text-slate-700 hover:border-[var(--theme-primary)] hover:bg-[var(--theme-light)]";
                  let Icon = null;
                  if (isAnswered) {
                    if (i === questions[currentQ].correct) {
                      cls = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold scale-[1.01] shadow-md";
                      Icon = <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" />;
                    } else if (i === selected) {
                      cls = "bg-red-50 border-red-500 text-red-800";
                      Icon = <XCircle className="w-6 h-6 text-red-500 ml-auto" />;
                    } else {
                      cls = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                    }
                  } else if (selected === i) {
                    cls = "bg-[var(--theme-light)] border-[var(--theme-primary)] text-[var(--theme-primary)]";
                  }
                  return (
                    <button key={i} disabled={isAnswered} onClick={() => handleAnswer(i)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center text-base md:text-lg ${cls}`}>
                      <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center mr-4 text-sm font-bold shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                      {Icon}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-100 animate-slide-up">
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-slate-400" /> {isKan ? 'ವಿವರಣೆ' : 'Explanation'}
                  </h4>
                  <p className="text-slate-600">{questions[currentQ].explanation}</p>
                  {isCricket && selected === questions[currentQ].correct && (
                    <p className="mt-2 text-green-700 font-bold text-sm">{theme.terms.greatAnswer}</p>
                  )}
                </div>
              )}

              {isAnswered && (
                <div className="mt-8 flex justify-end animate-fade-in">
                  <Button onClick={handleNext} className="h-12 px-8 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                    {currentQ < questions.length - 1 ? (isKan ? 'ಮುಂದಿನ ಪ್ರಶ್ನೆ' : 'Next Question') : (isKan ? 'ಫಲಿತಾಂಶ ನೋಡಿ' : (isCricket ? 'See Match Result' : 'See Results'))}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'result' && (
        <Card className="border-0 shadow-2xl bg-white overflow-hidden text-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-[var(--theme-light)] opacity-50"></div>
          <CardContent className="p-8 md:p-12 relative z-10 flex flex-col items-center">

            <div className="text-6xl mb-4">
              {finalScorePercent >= 85 ? '🏆' : finalScorePercent >= 60 ? '🎯' : '📚'}
            </div>

            <div className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[var(--theme-primary)] mb-6">
              <span className="text-4xl font-black text-[var(--theme-primary)]">{finalScorePercent}%</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">{announcement}</h2>
            <p className="text-slate-500 mb-2 font-medium">You got {score} out of {questions.length} correct</p>
            {isCricket && (
              <p className="text-sm text-green-700 bg-green-50 px-4 py-1 rounded-full font-bold mb-6">
                {finalScorePercent >= 85 ? '🏏 Century! Outstanding knock!' : finalScorePercent >= 60 ? '🏏 Half-century — building your innings!' : '🏏 Wicket down — review & come back stronger!'}
              </p>
            )}

            {signal && (
              <div className={`w-full p-5 rounded-2xl mb-8 text-left border ${
                signal.level === 'red' ? 'bg-red-50 border-red-100' :
                signal.level === 'green' ? 'bg-emerald-50 border-emerald-100' :
                'bg-amber-50 border-amber-100'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {signal.level === 'red' && <AlertTriangle className="text-red-500 w-5 h-5" />}
                    {signal.level === 'green' && <Trophy className="text-emerald-500 w-5 h-5" />}
                    {signal.level === 'yellow' && <BrainCircuit className="text-amber-500 w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`font-bold ${signal.level === 'red' ? 'text-red-800' : signal.level === 'green' ? 'text-emerald-800' : 'text-amber-800'}`}>{signal.label}</h4>
                    <p className={`text-sm mt-1 ${signal.level === 'red' ? 'text-red-600' : signal.level === 'green' ? 'text-emerald-600' : 'text-amber-700'}`}>{signal.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 text-left">
              <h4 className="font-bold text-slate-900 mb-2">{recommendation?.message}</h4>
              <p className="text-sm text-slate-500 mb-4">Based on your performance, here's what you should do next:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {recommendation?.actions.map((act, i) => (
                  <Button key={i} variant={i === 0 ? 'default' : 'outline'} className={`flex-1 ${i === 0 ? 'bg-[var(--theme-primary)]' : ''}`} onClick={() => handleAction(act)}>
                    {isCricket && i === 0 ? '🏏 ' : ''}{act}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-amber-500 font-bold bg-amber-50 px-6 py-3 rounded-full animate-bounce">
              ⭐ +{finalScorePercent > 80 ? 150 : 100} {pointsLabel} Earned!
            </div>

            <div className="mt-8 w-full text-center">
              <Link href="/student/dashboard" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">
                {isCricket ? '🏏 Return to Pavilion' : isKan ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Return to Dashboard'}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
