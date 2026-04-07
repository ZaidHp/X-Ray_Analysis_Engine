"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Activity, FileText, Target, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function HistoryDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (id) {
      fetchReportDetail();
    }
  }, [id]);

  const fetchReportDetail = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/v1/medical-report/history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load report');
      }

      setReport(data.report);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-slate-50">
           <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
           <p className="text-slate-600 font-medium">Fetching report details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !report) {
    return (
      <ProtectedRoute>
        <div className="flex-1 pt-24 pb-12 px-4 bg-slate-50 min-h-screen">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Error Loading Report</h1>
            <p className="text-slate-600 mb-8">{error || "Report not found"}</p>
            <button onClick={() => router.push('/history')} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition-colors">
              Return to History
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const parameters = extractParameters(report.analysis_result || "");

  return (
    <ProtectedRoute>
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
              <ArrowLeft className="w-4 h-4" /> Back to List
            </Link>
            <span className="text-sm font-medium text-slate-400">
              {new Date(report.created_at).toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="bg-slate-900 border-b border-slate-800 px-8 py-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h1 className="text-2xl font-bold text-white line-clamp-1">{report.original_filename}</h1>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" /> AI Analysis Record
              </p>
            </div>

            <div className="p-8 md:p-10">
               {/* Metrics */}
               {parameters.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {parameters.map((param, idx) => (
                          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transition-all"></div>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 line-clamp-1" title={param.name}>{param.name}</p>
                              <div className="flex justify-between items-end">
                                  <span className="text-xl font-black text-slate-800">{param.value}</span>
                                  <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                                    Ref: {param.range}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Text */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Full AI Interpretation
                </h3>
                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-a:text-indigo-600 prose-ul:bg-slate-50 prose-ul:p-4 prose-ul:rounded-xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {report.analysis_result || "*No analysis result available.*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </ProtectedRoute>
  );
}
