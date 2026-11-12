import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Upload, FileText, CheckCircle2, AlertCircle, Clock,
  Trash2, Eye, Plus, Layers, Sparkles, X, Filter, ExternalLink, Users
} from 'lucide-react';
import { textbooksApi } from '../api';
import { Textbook, TextbookTopic } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface TextbookManagementPageProps {
  navigate?: (to: string) => void;
}

export function TextbookManagementPage({ navigate }: TextbookManagementPageProps) {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload Form Fields
  const [title, setTitle] = useState('');
  const [classGrade, setClassGrade] = useState('7');
  const [subject, setSubject] = useState('Science');
  const [language, setLanguage] = useState('English');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Textbook for Details / Preview Modal
  const [selectedTextbook, setSelectedTextbook] = useState<(Textbook & { topics?: TextbookTopic[] }) | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Assign Modal
  const [assigningTextbook, setAssigningTextbook] = useState<Textbook | null>(null);
  const [assignedGrades, setAssignedGrades] = useState<string[]>([]);
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Filters
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    setLoading(true);
    try {
      const data = await textbooksApi.list();
      setTextbooks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load textbooks.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit.');
      return;
    }
    setSelectedFile(file);
    setError(null);
    if (!title) {
      // Auto-populate title from filename without .pdf extension
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file to upload.');
      return;
    }
    if (!title.trim() || !classGrade.trim() || !subject.trim()) {
      setError('Title, Class/Grade, and Subject are required.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('title', title.trim());
    formData.append('class_grade', classGrade.trim());
    formData.append('subject', subject.trim());
    formData.append('language', language.trim());
    formData.append('academic_year', academicYear.trim());
    formData.append('description', description.trim());

    try {
      setUploadProgress(65);
      const newBook = await textbooksApi.upload(formData);
      setUploadProgress(100);
      setSuccessMessage(`Textbook "${newBook.title}" uploaded successfully! Background processing and RAG indexing started.`);
      setShowUploadModal(false);
      resetForm();
      fetchTextbooks();
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload textbook.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle('');
    setClassGrade('7');
    setSubject('Science');
    setLanguage('English');
    setAcademicYear('2024-2025');
    setDescription('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleViewDetails = async (book: Textbook) => {
    setLoadingDetails(true);
    setSelectedTextbook(book);
    try {
      const details = await textbooksApi.getById(book.id);
      setSelectedTextbook(details);
    } catch (err: any) {
      console.error('Failed to load textbook details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (id: string, bookTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"? This will permanently remove its extracted chunks and generated quizzes.`)) {
      return;
    }
    try {
      await textbooksApi.delete(id);
      setTextbooks((prev) => prev.filter((b) => b.id !== id));
      if (selectedTextbook?.id === id) setSelectedTextbook(null);
      setSuccessMessage('Textbook deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete textbook.');
    }
  };

  const openAssignModal = (book: Textbook) => {
    setAssigningTextbook(book);
    setAssignedGrades(book.assignments || [book.class_grade]);
  };

  const handleSaveAssignment = async () => {
    if (!assigningTextbook) return;
    setSavingAssignment(true);
    try {
      await textbooksApi.assign(assigningTextbook.id, assignedGrades);
      setSuccessMessage(`Textbook assigned to classes: ${assignedGrades.join(', ')}`);
      setAssigningTextbook(null);
      fetchTextbooks();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update assignments.');
    } finally {
      setSavingAssignment(false);
    }
  };

  const toggleGradeAssignment = (grade: string) => {
    setAssignedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const filteredBooks = textbooks.filter((book) => {
    if (filterSubject !== 'all' && book.subject.toLowerCase() !== filterSubject.toLowerCase()) {
      return false;
    }
    if (filterGrade !== 'all' && book.class_grade !== filterGrade) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" label="Ready for Quizzes" />;
      case 'processing':
        return <Badge variant="warning" label="Processing Chunks" />;
      case 'failed':
        return <Badge variant="danger" label="Processing Failed" />;
      default:
        return <Badge variant="neutral" label="Queued" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#4e5cf4]/10 via-indigo-50/50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#4e5cf4] text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Textbook Management</h1>
            <p className="text-sm text-gray-500">
              Upload NCERT/State Board textbooks for AI chapter identification, RAG chunking, and adaptive quizzes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            <span>Upload Textbook</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm animate-fade-in">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <Filter size={14} /> Filter:
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Classes</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Social Science">Social Science</option>
            <option value="English">English</option>
          </select>
        </div>
        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filteredBooks.length}</span> of {textbooks.length} textbooks
        </div>
      </div>

      {/* Textbook Library Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-[#4e5cf4] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No textbooks found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Upload your curriculum textbooks (PDF) to start automated chapter structure extraction and generate adaptive RAG quizzes.
          </p>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            <Plus size={16} className="mr-2" /> Upload First Textbook
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-md">
                        Class {book.class_grade}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-md">
                        {book.subject}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                        {book.language}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                  </div>
                </div>

                {book.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{book.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-100 my-3 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Chapters / Topics</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Layers size={13} className="text-indigo-500" />
                      {book.chapter_count || 0} Ch · {book.topic_count || 0} Topics
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Assigned To</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Users size={13} className="text-indigo-500" />
                      {book.assignments && book.assignments.length > 0
                        ? `Class ${book.assignments.join(', ')}`
                        : `Class ${book.class_grade}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-400">
                    Uploaded: {new Date(book.created_at).toLocaleDateString()}
                  </span>
                  <div>{getStatusBadge(book.processing_status)}</div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleViewDetails(book)}
                    className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-gray-200"
                    title="View Chapters & Topics"
                  >
                    <Eye size={15} />
                    <span>Topics</span>
                  </button>
                  <button
                    onClick={() => setPreviewPdfUrl(textbooksApi.getFileUrl(book.id))}
                    className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-gray-200"
                    title="Preview PDF"
                  >
                    <FileText size={15} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => openAssignModal(book)}
                    className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-gray-200"
                    title="Assign to Classes"
                  >
                    <Users size={15} />
                    <span>Assign</span>
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(book.id, book.title)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Textbook"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Textbook Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-[#4e5cf4] rounded-xl flex items-center justify-center font-bold">
                  <Upload size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Upload New Textbook</h2>
                  <p className="text-xs text-gray-500">Provide curriculum details and attach the PDF file.</p>
                </div>
              </div>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#4e5cf4] bg-indigo-50/50'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
                      <FileText size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-50 text-[#4e5cf4] rounded-xl flex items-center justify-center mb-2">
                      <Upload size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Drag & Drop your textbook PDF here, or <span className="text-[#4e5cf4]">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports standard PDF up to 50MB</p>
                  </div>
                )}
              </div>

              {/* Form fields */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Textbook Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCERT Science Class 7"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Class / Grade *</label>
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
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
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
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024-2025"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context on curriculum or syllabus chapters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {uploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Uploading and saving metadata...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#4e5cf4] h-2 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploading}
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={uploading || !selectedFile}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Clock size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload & Process</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapters & Topics Drawer / Modal */}
      {selectedTextbook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-md">
                    Class {selectedTextbook.class_grade}
                  </span>
                  <span className="text-xs text-gray-400">{selectedTextbook.subject}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTextbook.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTextbook(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-[#4e5cf4]" />
                  Extracted Syllabus Structure
                </h3>
                <span className="text-xs text-gray-400">
                  {selectedTextbook.topics?.length || 0} Topics Identified
                </span>
              </div>

              {loadingDetails ? (
                <div className="py-12 text-center text-sm text-gray-400">Loading syllabus...</div>
              ) : selectedTextbook.topics && selectedTextbook.topics.length > 0 ? (
                <div className="space-y-3">
                  {selectedTextbook.topics.map((t, idx) => (
                    <div key={t.id || idx} className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                          {t.chapter_name}
                        </span>
                        {t.page_start && (
                          <span className="text-xs text-gray-400">
                            Pages {t.page_start}{t.page_end ? `–${t.page_end}` : ''}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">{t.topic_name}</h4>
                      {t.short_description && (
                        <p className="text-xs text-gray-500 mt-1">{t.short_description}</p>
                      )}
                      {t.subtopics && t.subtopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {t.subtopics.map((sub, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-[11px] rounded-md">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
                  <Clock size={28} className="mx-auto text-amber-500 mb-2 animate-spin" />
                  <p className="text-sm font-medium text-gray-700">Topic Extraction in Progress</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Gemini AI is currently parsing the textbook index and extracting chapter sections and topic boundaries.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <Button variant="secondary" onClick={() => setSelectedTextbook(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PDF In-browser Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText size={18} className="text-indigo-400" />
                <span>Textbook PDF Preview</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
                >
                  <ExternalLink size={14} /> Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <iframe
              src={previewPdfUrl}
              className="w-full flex-1 border-0"
              title="PDF Preview"
            />
          </div>
        </div>
      )}

      {/* Assign to Class Modal */}
      {assigningTextbook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-scale-up">
            <h3 className="font-bold text-gray-900 text-base mb-1">
              Assign "{assigningTextbook.title}"
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Select which classes should have access to this textbook in their Student Portal.
            </p>

            <div className="space-y-2 mb-6">
              {['6', '7', '8', '9', '10'].map((grade) => {
                const isSelected = assignedGrades.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGradeAssignment(grade)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-[#4e5cf4] bg-indigo-50/50 text-[#4e5cf4]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>Class {grade}</span>
                    {isSelected && <CheckCircle2 size={18} className="text-[#4e5cf4]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                disabled={savingAssignment}
                onClick={() => setAssigningTextbook(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={savingAssignment}
                onClick={handleSaveAssignment}
              >
                {savingAssignment ? 'Saving...' : 'Save Assignments'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
