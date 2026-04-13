"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Bone, Image as ImageIcon, ClipboardList, Microscope, Stethoscope, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function XRayDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/api/v1/analysis/history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.detail || 'Failed to fetch X-ray detection details');
      }

      setResult(data.analysis);
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

  // Get confidence styling classes based on percentage (0-100)
  const getConfidenceColor = (percent: number) => {
    if (percent >= 80) return { bg: 'bg-green-500', text: 'text-green-600' };
    if (percent >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
    return { bg: 'bg-red-500', text: 'text-red-600' };
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Link 
            href="/history" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8 animate-fade-in-up"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Link>

          {isLoading ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-20 flex flex-col items-center justify-center animate-fade-in-up">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading X-Ray details...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 animate-fade-in-up">
              <div className="p-5 bg-red-50 text-red-700 rounded-2xl flex items-start gap-4">
                <AlertCircle className="w-8 h-8 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-1">Failed to load details</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          ) : result ? (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in-up">
              
              {/* Title Section */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm mb-4">
                      <Search className="w-4 h-4" />
                      Detection Result
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      X-Ray Scan Analysis
                    </h1>
                    <p className="text-blue-100 mt-2 flex items-center gap-2">
                       {new Date(result.created_at).toLocaleDateString(undefined, { 
                         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                         hour: '2-digit', minute: '2-digit'
                       })}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-blue-200 font-medium">Scan ID</p>
                    <p className="font-mono text-sm uppercase tracking-wider">{result.detection_id?.split('-')[0] || result.id.substring(0, 8)}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* AI Consultation / LLM Suggestion Section */}
                {result.ai_consultation && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 border-b border-indigo-100 pb-4">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Stethoscope className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-indigo-900">AI Medical Assistant</h3>
                        <p className="text-sm text-indigo-600">Preliminary consultation based on visual findings</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 rounded-xl p-6 border border-white backdrop-blur-sm text-slate-700">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                          p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />
                        }}
                      >
                        {result.ai_consultation}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Main Image Result */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-800">Detection Result Image</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-white text-blue-700 text-sm font-bold rounded-full border border-blue-200 shadow-sm">
                       {result.message}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-inner flex items-center justify-center min-h-[300px]">
                    {result.explanation_image_url || result.result_image_url ? (
                      <img
                        src={`${API_URL}${result.explanation_image_url || result.result_image_url}`}
                        alt="Detection Result"
                        className="max-h-96 max-w-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        No result image available
                      </div>
                    )}
                  </div>
                </div>

                {/* Fracture Analysis (Classification Format) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-slate-800">Fracture Analysis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {!result.classification || result.classification.class.toLowerCase() === 'normal' ? (
                      <div className="bg-slate-50 border border-green-200 rounded-xl p-6 text-center shadow-sm">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-semibold text-green-700 mb-1">No fractures detected</h4>
                        <p className="text-slate-600 text-sm">
                          The AI classified this X-Ray structure as Normal with a confidence of{' '}
                          <span className="font-bold text-green-700">{Math.round(result.classification?.confidence || 100)}%</span>.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-red-500 rounded-xl p-6 hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row gap-5">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                            <Bone className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-800 mb-3 capitalize flex items-center gap-2">
                            {result.classification.class.replace('_', ' ')}
                          </h4>
                          
                          {/* Confidence */}
                          <div className="mb-3 max-w-md">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-600">Model Confidence:</span>
                              <span className={`text-sm font-bold ${getConfidenceColor(Math.round(result.classification.confidence)).text}`}>
                                {Math.round(result.classification.confidence)}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getConfidenceColor(Math.round(result.classification.confidence)).bg}`}
                                style={{ width: `${Math.round(result.classification.confidence)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grad-CAM Visualization */}
                {result.gradcam_image_url && (
                  <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
                    <div className="flex items-center gap-2 mb-6">
                      <Microscope className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-semibold">Grad-CAM Activation Map</h3>
                    </div>
                    
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h4 className="font-semibold text-blue-300 mb-2">How Model "Sees"</h4>
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                          This heat map highlights the anatomical areas that influenced the AI's detection decision most strongly. Warmer colors indicate higher attention.
                        </p>
                        
                        {/* Legend */}
                        <div className="flex flex-col gap-3 bg-slate-900/50 rounded-lg p-5 border border-slate-700">
                          <h5 className="font-medium text-xs text-slate-400 uppercase tracking-wider mb-2">Attention Legend</h5>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-red-500 rounded shadow-sm"></div>
                            <span className="text-sm text-slate-200 font-medium">Critical Attention</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-yellow-400 rounded shadow-sm"></div>
                            <span className="text-sm text-slate-200 font-medium">Moderate Attention</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-500 rounded shadow-sm"></div>
                            <span className="text-sm text-slate-200 font-medium">Low/Background Attention</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-xl p-4 border border-slate-700 flex justify-center items-center min-h-[250px]">
                        <img
                          src={`${API_URL}${result.gradcam_image_url}`}
                          alt="Grad-CAM Visualization"
                          className="max-h-72 object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
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