import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, AlertCircle, ArrowLeft, ArrowRight,
  Clock, Award, RefreshCw, BookOpen, FileText, ChevronRight, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { quizzesApi, studentsApi } from '../api';
import { GeneratedQuiz, QuizQuestion, QuizAttempt, TopicMastery } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface QuizAttemptPageProps {
  quizId: string;
  navigate?: (to: string) => void;
}

export function QuizAttemptPage({ quizId, navigate }: QuizAttemptPageProps) {
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active question index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selected student (defaults to first student or demo Rahul)
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('Rahul');

  // Answers map: question_id -> student_answer
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submission results
  const [result, setResult] = useState<{
    attempt: QuizAttempt;
    responses: any[];
    mastery: TopicMastery;
    intervention_recommended?: {
      recommended: boolean;
      reason: string;
      suggested_action: string;
      intervention_id?: string;
    };
  } | null>(null);

  useEffect(() => {
    loadQuiz();
    fetchDefaultStudent();
  }, [quizId]);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const q = await quizzesApi.getById(quizId);
      setQuiz(q);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultStudent = async () => {
    try {
      const students = await studentsApi.list();
      if (students.length > 0) {
        // Look for Rahul or pick first student
        const rahul = students.find((s) => s.full_name.toLowerCase().includes('rahul'));
        const chosen = rahul || students[0];
        setStudentId(chosen.id);
        setStudentName(chosen.full_name);
      }
    } catch {
      // Default demo student
      setStudentId('STU-DEMO-001');
    }
  };

  const handleSelectOption = (questionId: string, optionText: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || isSubmitted) return;

    const unanswered = (quiz.questions || []).filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        question_id: qId,
        student_answer: ans,
      }));

      const res = await quizzesApi.submit(quiz.id, {
        student_id: studentId || 'STU-DEMO-001',
        answers: formattedAnswers,
        time_taken_seconds: secondsElapsed,
      });

      setResult(res);
      setIsSubmitted(true);

      if (res.attempt.score_percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
        <Clock size={36} className="mx-auto text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading quiz questions...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="p-8 text-center space-y-4">
          <AlertCircle size={40} className="mx-auto text-red-500" />
          <h2 className="text-lg font-bold text-gray-900">Quiz Unavailable</h2>
          <p className="text-sm text-gray-500">{error || 'Could not find the requested quiz.'}</p>
          <Button variant="primary" onClick={() => navigate && navigate('textbooks')}>
            Return to Textbooks
          </Button>
        </Card>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate && navigate('student-textbooks')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-md">
                Class {quiz.class_grade} {quiz.subject}
              </span>
              <span className="text-xs text-gray-400">{quiz.difficulty} Level</span>
            </div>
            <h1 className="font-bold text-gray-900 text-base sm:text-lg">{quiz.topic}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 font-semibold">
            <Clock size={14} className="text-indigo-600" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Student: <span className="font-bold text-gray-800">{studentName}</span>
          </div>
        </div>
      </div>

      {/* Main Container: Active Attempt or Results Summary */}
      {!isSubmitted ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Question Counter & Progress */}
          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>
              {Object.keys(answers).length} of {questions.length} Answered
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#4e5cf4] h-2 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Current Question Body */}
          {currentQuestion && (
            <div className="space-y-5 pt-2">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4e5cf4] font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {currentIndex + 1}
                </span>
                <p className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 pl-0 sm:pl-11">
                {(currentQuestion.options || ['True', 'False']).map((opt, oIdx) => {
                  const isSelected = answers[currentQuestion.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, opt)}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#4e5cf4] bg-indigo-50/60 text-[#4e5cf4] font-semibold shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isSelected ? 'bg-[#4e5cf4] text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-[#4e5cf4]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question Palette Grid */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 mr-2">Jump to:</span>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'ring-2 ring-[#4e5cf4] text-[#4e5cf4] bg-indigo-50'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1.5 text-xs"
            >
              <ArrowLeft size={14} /> Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 text-xs"
              >
                Next <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                variant="success"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-1.5 text-xs shadow-md"
              >
                {submitting ? 'Evaluating...' : 'Submit Quiz'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Results Card */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                <Award size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quiz Completed!</h2>
              <p className="text-sm text-gray-500">
                Results recorded for <span className="font-semibold text-gray-800">{studentName}</span>
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-1">Score</span>
                <span className="text-2xl font-bold text-gray-900">
                  {result?.attempt.score_numerator} / {result?.attempt.score_denominator}
                </span>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-xs text-indigo-500 block mb-1">Percentage</span>
                <span className="text-2xl font-bold text-indigo-700">
                  {result?.attempt.score_percentage}%
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 block mb-1">Time Taken</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatTime(result?.attempt.time_taken_seconds || secondsElapsed)}
                </span>
              </div>
            </div>

            {/* Topic Mastery & Adaptive Feedback */}
            {result?.mastery && (
              <div className="p-5 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 rounded-xl border border-indigo-100 flex items-start gap-4">
                <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-xs">
                  <Zap size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">Topic Mastery Updated</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        result.mastery.mastery_level === 'High'
                          ? 'bg-emerald-100 text-emerald-800'
                          : result.mastery.mastery_level === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.mastery.mastery_level} Mastery ({result.mastery.mastery_score}%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Mastery in <strong>{result.mastery.topic}</strong> based on {result.mastery.total_attempts} attempt(s).
                  </p>
                </div>
              </div>
            )}

            {/* Adaptive Intervention Recommendation (if score < 60%) */}
            {result?.intervention_recommended?.recommended && (
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertCircle size={18} />
                  <span>Acculum Adaptive Remedial Recommendation</span>
                </div>
                <p className="text-xs text-amber-800">
                  {result.intervention_recommended.reason}
                </p>
                <div className="p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                  <strong>Assigned Action:</strong> {result.intervention_recommended.suggested_action}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => navigate && navigate('student-textbooks')}
                className="flex items-center gap-1.5"
              >
                <BookOpen size={16} /> Learning Materials
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate && navigate('quiz-generator')}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw size={16} /> New Adaptive Quiz
              </Button>
            </div>
          </div>

          {/* Detailed Question Review with Explanations and Citations */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Question Review & Explanations</h3>
            {result?.responses.map((resp: any, idx: number) => {
              const q = questions.find((ques) => ques.id === resp.question_id);
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    resp.is_correct ? 'bg-emerald-50/30 border-emerald-200' : 'bg-red-50/30 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-bold text-sm text-gray-900">
                      Q{idx + 1}. {q?.question_text}
                    </span>
                    {resp.is_correct ? (
                      <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold flex-shrink-0">
                        <CheckCircle2 size={16} /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-bold flex-shrink-0">
                        <XCircle size={16} /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1 mb-3">
                    <p className="text-gray-600">
                      Your answer:{' '}
                      <span className={`font-semibold ${resp.is_correct ? 'text-emerald-700' : 'text-red-700'}`}>
                        {resp.student_answer || 'No answer submitted'}
                      </span>
                    </p>
                    {!resp.is_correct && (
                      <p className="text-gray-700">
                        Correct answer: <span className="font-bold text-emerald-700">{resp.correct_answer}</span>
                      </p>
                    )}
                  </div>

                  {resp.explanation && (
                    <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        <FileText size={13} className="text-indigo-600" /> Explanation & Citation:
                      </span>
                      <p>{resp.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

