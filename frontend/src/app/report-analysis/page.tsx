"use client";

import React, { useState } from 'react';
import { Upload, FileText, Activity, AlertCircle, X, CheckCircle, FilePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ReportAnalyzer() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/v1/medical-report/analyze`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 pt-24 pb-12 px-4 bg-gradient-to-br from-slate-50 to-indigo-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-700 rounded-2xl mb-6 shadow-inner">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Medical Report AI
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Upload your blood test or lab report (PDF/IMG). Our AI will instantly parse the data and provide a simplified, actionable explanation.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 mb-8 border border-white relative animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-3xl p-10 md:p-16 text-center hover:bg-indigo-50/80 hover:border-indigo-300 transition-all duration-300">
            {!file ? (
              <label className="cursor-pointer flex flex-col items-center group">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FilePlus className="w-10 h-10 text-indigo-500" />
                </div>
                <span className="text-xl font-bold text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">Select a Medical Report</span>
                <span className="text-slate-500">Supports PDF, PNG, JPG (Max 10MB)</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            ) : (
              <div className="flex flex-col items-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center shadow-inner border border-green-100 mb-6 relative">
                  <FileText className="w-10 h-10 text-green-500" />
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-800 mb-8 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">{file.name}</p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => setFile(null)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full font-semibold hover:bg-slate-50 hover:text-red-600 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <X className="w-5 h-5" /> Remove
                  </button>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`px-8 py-3 rounded-full font-bold transition-all shadow-lg flex items-center gap-3 ${
                      isAnalyzing 
                        ? 'bg-indigo-400 text-white cursor-not-allowed shadow-indigo-200' 
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/30'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="w-5 h-5 animate-spin" />
                        Analyzing via AI...
                      </>
                    ) : (
                      <>
                        <Activity className="w-5 h-5" />
                        Analyze Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100 animate-fade-in-up">
              <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <ReportResults data={result} />
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
      </div>
    </ProtectedRoute>
  );
}

// Sub-component for displaying results
function ReportResults({ data }: { data: Record<string, any> }) {
  const analysis = data.report?.analysis || data.analysis || "No analysis generated.";

  const extractParameters = (text: string) => {
    const regex = /\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
    const params = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!match[1].toLowerCase().includes("parameter") && !match[1].includes("---")) {
        params.push({ name: match[1].trim(), value: match[2].trim(), range: match[3].trim() });
      }
    }
    return params;
  };

  const parameters = extractParameters(analysis);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Key Metrics Cards */}
      {parameters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parameters.map((param, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl group-hover:w-2 transition-all"></div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">{param.name}</p>
                    <div className="flex justify-between items-end">
                        <span className="text-2xl font-black text-slate-800">{param.value}</span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          Ref: {param.range}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Full Analysis Text */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-white">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Activity className="w-6 h-6" /> 
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
              Detailed Analysis
          </h2>
        </div>
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-indigo-600 prose-strong:text-indigo-900 prose-ul:bg-slate-50 prose-ul:p-6 prose-ul:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysis}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
