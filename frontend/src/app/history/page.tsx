"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { History as HistoryIcon, Search as SearchIcon, FileText, ChevronRight, AlertCircle, Loader2, Bone } from 'lucide-react';

export default function HistoryList() {
  const [activeTab, setActiveTab] = useState<'reports' | 'xrays'>('reports');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab]);

  const fetchHistory = async (tab: 'reports' | 'xrays') => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("Not authenticated");

      const endpoint = tab === 'reports' 
        ? `${API_URL}/api/v1/medical-report/history`
        : `${API_URL}/api/v1/analysis/history`;

      const response = await fetch(endpoint, {
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
        throw new Error(data.detail || 'Failed to fetch history');
      }

      setHistory(data.history || []);
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

  const filteredHistory = history.filter(item => {
    if (activeTab === 'reports') {
      return (item.original_filename || '').toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return ((item.detection_id || '') + ' ' + (item.message || '')).toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <ProtectedRoute>
      <div className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
            <div>
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-2xl mb-4">
                <HistoryIcon className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">History</h1>
              <p className="text-lg text-slate-500 mt-2">View and manage all your previously analyzed reports and scans.</p>
            </div>
            
            <div className="relative w-full md:w-80 mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={activeTab === 'reports' ? "Search filenames..." : "Search detections..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b border-slate-200 animate-fade-in-up">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Medical Reports
            </button>
            <button
              onClick={() => setActiveTab('xrays')}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'xrays'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              X-Ray Scans
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500">Loading your history...</p>
              </div>
            ) : error ? (
              <div className="p-8">
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Failed to load history</h3>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            ) : history.length === 0 ? (
               <div className="text-center py-24 px-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {activeTab === 'reports' ? (
                      <FileText className="w-10 h-10 text-slate-400" />
                    ) : (
                      <Bone className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No {activeTab === 'reports' ? 'Reports' : 'X-Ray Scans'} Found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                    You haven't analyzed any {activeTab === 'reports' ? 'medical reports' : 'X-ray images'} yet.
                  </p>
                  <Link href={activeTab === 'reports' ? "/report-analysis" : "/detect"} className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                    {activeTab === 'reports' ? 'Analyze a Report' : 'Detect Fractures'}
                  </Link>
               </div>
            ) : filteredHistory.length === 0 ? (
               <div className="text-center py-16 px-4 text-slate-500">
                  No items matching "{searchQuery}".
               </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <Link 
                    key={item.id} 
                    href={activeTab === 'reports' ? `/history/${item.id}` : `/history/xray/${item.id}`}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${activeTab === 'reports' ? 'bg-indigo-50 group-hover:bg-indigo-100' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                        {activeTab === 'reports' ? (
                          <FileText className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <Bone className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1">
                          {activeTab === 'reports' 
                            ? (item.original_filename || "Unnamed Report")
                            : (item.detection_id ? `X-Ray Scan ${item.detection_id.substring(0, 8)}...` : "Unnamed Scan")
                          }
                        </h4>
                        <p className="text-sm text-slate-500">
                          {activeTab === 'xrays' && item.message && (
                            <span className="mr-2 border-r border-slate-300 pr-2 font-medium">{item.message}</span>
                          )}
                          {new Date(item.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
