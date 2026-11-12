import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sparkles, HelpCircle, Layers, FileText,
  PlayCircle, Search, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft, Send
} from 'lucide-react';
import { studentTextbooksApi, textbooksApi } from '../api';
import { Textbook, TextbookTopic } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface StudentTextbooksPageProps {
  navigate?: (to: string) => void;
  selectedStudentId?: string;
}

export function StudentTextbooksPage({ navigate }: StudentTextbooksPageProps) {
  const [classGrade, setClassGrade] = useState('7');
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<(Textbook & { topics?: TextbookTopic[]; chapters?: any[] }) | null>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'pdf' | 'ask_ai'>('topics');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // RAG Ask AI State
  const [selectedTopicForAi, setSelectedTopicForAi] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [askingAi, setAskingAi] = useState(false);
  const [aiAnswerResult, setAiAnswerResult] = useState<{
    answer: string;
    references: { chapter: string; topic: string; page_number: number }[];
    sufficient_context: boolean;
  } | null>(null);

  useEffect(() => {
    fetchAssignedBooks();
  }, [classGrade]);

  const fetchAssignedBooks = async () => {
    setLoading(true);
    try {
      const books = await studentTextbooksApi.list(classGrade);
      setTextbooks(books);
      if (books.length > 0 && !selectedBook) {
        loadBookDetails(books[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch student textbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookDetails = async (id: string) => {
    try {
      const details = await studentTextbooksApi.getById(id);
      setSelectedBook(details);
      if (details.topics && details.topics.length > 0) {
        setSelectedTopicForAi(details.topics[0].topic_name);
      }
    } catch (err) {
      console.error('Failed to fetch book detail:', err);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !questionText.trim()) return;

    setAskingAi(true);
    setAiAnswerResult(null);

    try {
      const res = await studentTextbooksApi.explain(selectedBook.id, {
        question: questionText.trim(),
        topic: selectedTopicForAi || undefined,
      });
      setAiAnswerResult(res);
    } catch (err: any) {
      setAiAnswerResult({
        answer: 'Failed to retrieve answer from textbook: ' + (err.message || 'Unknown error'),
        references: [],
        sufficient_context: false,
      });
    } finally {
      setAskingAi(false);
    }
  };

  const handleStartQuiz = (topicName: string, chapterName?: string) => {
    if (navigate) {
      navigate(`quiz-generator?textbook_id=${selectedBook?.id}&class_grade=${classGrade}&subject=${encodeURIComponent(selectedBook?.subject || 'Science')}&topic=${encodeURIComponent(topicName)}&chapter=${encodeURIComponent(chapterName || '')}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-50/50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Learning Materials</h1>
            <p className="text-sm text-gray-500">
              Access your official textbooks, study chapters, ask verified AI questions, and test your mastery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Class:</label>
          <select
            value={classGrade}
            onChange={(e) => {
              setClassGrade(e.target.value);
              setSelectedBook(null);
            }}
            className="text-sm font-semibold bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left = Books list, Right = Book details/reader/Ask AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Books Shelf */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
            Assigned Books (Class {classGrade})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : textbooks.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">No textbooks assigned to Class {classGrade} yet.</p>
            </Card>
          ) : (
            textbooks.map((b) => {
              const isSelected = selectedBook?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => loadBookDetails(b.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-md">
                      {b.subject}
                    </span>
                    <span className="text-[11px] text-gray-400">{b.language}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{b.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Layers size={13} className="text-emerald-600" />
                      {b.chapter_count || 0} Ch · {b.topic_count || 0} Topics
                    </span>
                    <ChevronRight size={16} className={isSelected ? 'text-emerald-600' : 'text-gray-300'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Book Content & Interactive Area */}
        <div className="lg:col-span-8">
          {selectedBook ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
              {/* Top Tabs */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-gray-900 text-base">{selectedBook.title}</h2>
                  <p className="text-xs text-gray-500">Class {selectedBook.class_grade} · {selectedBook.subject}</p>
                </div>

                <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('topics')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'topics'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Chapters & Topics
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'pdf'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Read Textbook
                  </button>
                  <button
                    onClick={() => setActiveTab('ask_ai')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'ask_ai'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-gray-600 hover:text-emerald-700'
                    }`}
                  >
                    <Sparkles size={13} className="text-emerald-600" />
                    Ask AI Assistant
                  </button>
                </div>
              </div>

              {/* Tab 1: Chapters & Topics with Quiz Launchers */}
              {activeTab === 'topics' && (
                <div className="p-6 space-y-6 overflow-y-auto max-h-[680px]">
                  {selectedBook.chapters && selectedBook.chapters.length > 0 ? (
                    selectedBook.chapters.map((chap, cIdx) => (
                      <div key={cIdx} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                              {cIdx + 1}
                            </span>
                            {chap.chapter_name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {chap.topics.map((t: TextbookTopic, tIdx: number) => (
                            <div
                              key={t.id || tIdx}
                              className="p-4 bg-gray-50/70 hover:bg-white rounded-xl border border-gray-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between group shadow-2xs"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">
                                    {t.topic_name}
                                  </h4>
                                  {t.page_start && (
                                    <span className="text-[11px] text-gray-400">
                                      p. {t.page_start}
                                    </span>
                                  )}
                                </div>
                                {t.short_description && (
                                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                    {t.short_description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-gray-100/80 mt-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleStartQuiz(t.topic_name, chap.chapter_name)}
                                  className="w-full text-xs flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <PlayCircle size={14} /> Take Topic Quiz
                                </Button>
                                <button
                                  onClick={() => {
                                    setSelectedTopicForAi(t.topic_name);
                                    setActiveTab('ask_ai');
                                  }}
                                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Ask question on this topic"
                                >
                                  <HelpCircle size={15} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-sm text-gray-400">
                      No topics extracted yet. Upload processing may still be active.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Inline PDF Reader */}
              {activeTab === 'pdf' && (
                <div className="flex-1 w-full h-[650px] bg-gray-100">
                  <iframe
                    src={textbooksApi.getFileUrl(selectedBook.id)}
                    className="w-full h-full border-0"
                    title="Textbook Reader"
                  />
                </div>
              )}

              {/* Tab 3: RAG Ask AI Assistant */}
              {activeTab === 'ask_ai' && (
                <div className="p-6 flex flex-col h-full space-y-4">
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
                    <Sparkles size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-900">Textbook-Grounded AI Tutor</h4>
                      <p className="text-xs text-emerald-700">
                        Ask any question about your curriculum. Responses are retrieved directly from your textbook with verified chapter and page references.
                      </p>
                    </div>
                  </div>

                  {/* Topic context picker */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500">Focus Topic:</label>
                    <select
                      value={selectedTopicForAi}
                      onChange={(e) => setSelectedTopicForAi(e.target.value)}
                      className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">All Topics</option>
                      {selectedBook.topics?.map((top, idx) => (
                        <option key={idx} value={top.topic_name}>
                          {top.topic_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Response display */}
                  <div className="flex-1 min-h-[260px] max-h-[360px] overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    {askingAi ? (
                      <div className="py-12 text-center text-sm text-emerald-700 flex flex-col items-center gap-2">
                        <Sparkles size={24} className="animate-spin text-emerald-600" />
                        <span>Searching textbook passages and generating explanation...</span>
                      </div>
                    ) : aiAnswerResult ? (
                      <div className="space-y-3">
                        <div className="prose prose-sm max-w-none text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                          {aiAnswerResult.answer}
                        </div>

                        {aiAnswerResult.references && aiAnswerResult.references.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                              Textbook Citations:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {aiAnswerResult.references.map((ref, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-700 font-medium flex items-center gap-1 shadow-2xs"
                                >
                                  <FileText size={12} className="text-emerald-600" />
                                  {ref.chapter} · Page {ref.page_number}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-sm text-gray-400">
                        Type a question below (e.g. "What is the role of chlorophyll in photosynthesis?" or "Explain stomata").
                      </div>
                    )}
                  </div>

                  {/* Question input */}
                  <form onSubmit={handleAskAi} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about this textbook..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      disabled={askingAi}
                      className="flex-1 text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={askingAi || !questionText.trim()}
                      className="flex items-center gap-1.5 px-5"
                    >
                      <Send size={15} />
                      <span>Ask</span>
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-16 text-center">
              <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">Select a textbook from the left shelf to start learning.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

