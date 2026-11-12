import React, { useState, useEffect } from 'react';
import {
  Sparkles, Layers, Sliders, PlayCircle, Clock, BookOpen,
  CheckCircle2, AlertCircle, ArrowLeft, Brain
} from 'lucide-react';
import { textbooksApi, quizzesApi } from '../api';
import { Textbook, TextbookTopic } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface QuizGeneratorPageProps {
  navigate?: (to: string) => void;
}

export function QuizGeneratorPage({ navigate }: QuizGeneratorPageProps) {
  // Parse query params if available from URL hash (e.g. #quiz-generator?topic=Photosynthesis)
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.split('?')[1] : '';
  const urlParams = new URLSearchParams(queryString);

  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Form Fields
  const [selectedTextbookId, setSelectedTextbookId] = useState(urlParams.get('textbook_id') || '');
  const [classGrade, setClassGrade] = useState(urlParams.get('class_grade') || '7');
  const [subject, setSubject] = useState(urlParams.get('subject') || 'Science');
  const [chapter, setChapter] = useState(urlParams.get('chapter') || '');
  const [topic, setTopic] = useState(urlParams.get('topic') || 'Photosynthesis');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [language, setLanguage] = useState('English');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['MCQ']);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available topics for selected textbook
  const [availableTopics, setAvailableTopics] = useState<TextbookTopic[]>([]);

  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    setLoadingBooks(true);
    try {
      const data = await textbooksApi.list();
      setTextbooks(data);
      if (data.length > 0 && !selectedTextbookId) {
        setSelectedTextbookId(data[0].id);
        setClassGrade(data[0].class_grade);
        setSubject(data[0].subject);
      }
    } catch (err) {
      console.error('Failed to load textbooks:', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    if (!selectedTextbookId) return;
    textbooksApi.getById(selectedTextbookId)
      .then((tb) => {
        if (tb.topics && tb.topics.length > 0) {
          setAvailableTopics(tb.topics);
          if (!urlParams.get('topic')) {
            setTopic(tb.topics[0].topic_name);
            setChapter(tb.topics[0].chapter_name);
          }
        }
      })
      .catch(() => {});
  }, [selectedTextbookId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please specify or select a topic.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const quiz = await quizzesApi.generate({
        textbook_id: selectedTextbookId || undefined,
        class_grade: classGrade,
        subject,
        chapter,
        topic: topic.trim(),
        difficulty,
        question_count: questionCount,
        language,
        question_types: questionTypes,
      });

      // Navigate to quiz attempt
      if (navigate) {
        navigate(`quiz-attempt/${quiz.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz from textbook.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleQuestionType = (type: string) => {
    setQuestionTypes((prev) => {
      if (prev.includes(type)) {
        return prev.length > 1 ? prev.filter((t) => t !== type) : prev;
      }
      return [...prev, type];
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate && navigate('dashboard')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-[#4e5cf4]" size={24} />
            AI Quiz Generator
          </h1>
          <p className="text-sm text-gray-500">
            Generate adaptive, syllabus-aligned quizzes using RAG semantic retrieval and Gemini AI.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Configuration Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Textbook & Grade Selection */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              1. Select Source Material
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Textbook</label>
                <select
                  value={selectedTextbookId}
                  onChange={(e) => {
                    setSelectedTextbookId(e.target.value);
                    const found = textbooks.find((b) => b.id === e.target.value);
                    if (found) {
                      setClassGrade(found.class_grade);
                      setSubject(found.subject);
                    }
                  }}
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Custom Topic (No Book Selected)</option>
                  {textbooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Class {b.class_grade} {b.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Class / Grade</label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Chapter (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1: Nutrition in Plants"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Topic for Quiz Questions *
              </label>
              {availableTopics.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      const t = availableTopics.find((top) => top.topic_name === e.target.value);
                      if (t) setChapter(t.chapter_name);
                    }}
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2"
                  >
                    {availableTopics.map((t, idx) => (
                      <option key={idx} value={t.topic_name}>
                        {t.chapter_name ? `${t.chapter_name} → ` : ''}{t.topic_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or type custom topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-600"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Photosynthesis, Nutrition in Plants, Digestive System"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              2. Quiz Specifications
            </h3>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                      difficulty === lvl
                        ? 'bg-indigo-50 border-[#4e5cf4] text-[#4e5cf4] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Number of Questions</label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                      questionCount === num
                        ? 'bg-indigo-50 border-[#4e5cf4] text-[#4e5cf4] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Question Types</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'MCQ', label: 'Multiple Choice (MCQ)' },
                  { id: 'True_False', label: 'True / False' },
                  { id: 'Fill_Blanks', label: 'Fill in the Blanks' },
                  { id: 'Short_Answer', label: 'Short Answer' },
                ].map(({ id, label }) => {
                  const isSelected = questionTypes.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleQuestionType(id)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-400 text-indigo-700 font-semibold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Kannada">Kannada</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>
          </div>

          {generating && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 animate-pulse">
              <Brain size={24} className="text-[#4e5cf4] animate-spin" />
              <div className="text-xs text-indigo-900">
                <span className="font-bold block">RAG Retrieval & Gemini AI Processing...</span>
                Searching textbook passages via vector search and generating grounded questions.
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              disabled={generating || !topic.trim()}
              className="w-full sm:w-auto px-8 py-3 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {generating ? (
                <>
                  <Clock size={18} className="animate-spin" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Quiz</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

