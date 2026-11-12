"use client";

import { useState, useRef } from 'react';
import { Upload, CheckCircle, Film, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UploadVideoPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('video')) {
      setError('Please upload a video file (MP4, MOV, WebM, etc.)');
      return;
    }
    setUploading(true);
    setError('');
    setFileName(file.name);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        setError(data.error || 'Upload failed. Please try again.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Back link */}
        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black mb-1">Upload Demo Video</h1>
            <p className="text-green-100 text-sm">This video plays automatically after a photo is summarized</p>
          </div>

          <div className="p-8">
            {!done ? (
              <>
                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-green-500 bg-green-50 scale-[1.02]'
                      : 'border-slate-300 hover:border-green-400 hover:bg-green-50/40'
                  }`}
                >
                  <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                      <p className="font-bold text-slate-700">Uploading <span className="text-green-600">{fileName}</span>...</p>
                      <p className="text-sm text-slate-400">Please wait</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Upload className={`w-12 h-12 ${isDragging ? 'text-green-500' : 'text-slate-300'}`} />
                      <p className="text-lg font-bold text-slate-700">Drop your video here</p>
                      <p className="text-sm text-slate-400">or click to browse</p>
                      <p className="text-xs text-slate-300 mt-2">MP4, MOV, WebM, AVI supported</p>
                    </div>
                  )}
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600 font-semibold text-center bg-red-50 p-3 rounded-xl">
                    ⚠️ {error}
                  </p>
                )}
              </>
            ) : (
              /* Success */
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-900 mb-2">Video Uploaded! 🎉</h2>
                <p className="text-slate-500 mb-1"><strong className="text-slate-700">{fileName}</strong> is now set as the default video.</p>
                <p className="text-sm text-slate-400 mb-8">It will play automatically after a photo is summarized on the dashboard.</p>

                <div className="flex flex-col gap-3">
                  <Link href="/student/dashboard">
                    <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
                      Go to Dashboard & Try It
                    </button>
                  </Link>
                  <button
                    onClick={() => { setDone(false); setFileName(''); }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Upload a Different Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Video is saved to <code className="bg-slate-100 px-2 py-0.5 rounded">public/demo-video.mp4</code> inside the Acculum project
        </p>
      </div>
    </div>
  );
}
