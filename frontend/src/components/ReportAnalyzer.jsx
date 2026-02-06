import React, { useState } from 'react';
import { Upload, FileText, Activity, AlertCircle, X, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ReportAnalyzer() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
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
      // Pointing to the new FastAPI endpoint
      const response = await fetch(`${API_URL}/api/v1/medical-report/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar 
        links={[
          { label: 'Home', href: '/' },
          { label: 'Features', href: '/#features' },
          { label: 'X-Ray Detection', href: '/detect' },
          { label: 'Contact', href: '/#contact' },
        ]}
        actionButtons={{
          signIn: { label: 'Sign In', show: true },
          cta: { label: 'Get Started', show: false }
        }}
      />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex justify-center items-center gap-2">
              <Activity className="text-blue-600" />
              Medical Report AI
            </h1>
            <p className="text-slate-600">Upload your blood test or lab report for a simplified explanation.</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-slate-100">
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-10 text-center hover:bg-blue-50 transition-colors">
              {!file ? (
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-blue-500 mb-4" />
                  <span className="text-lg font-medium text-slate-700">Click to upload or drag & drop</span>
                  <span className="text-sm text-slate-500 mt-2">PDF, PNG, JPG (Max 10MB)</span>
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium text-slate-800 mb-4">{file.name}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setFile(null)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                      <X size={16} /> Remove
                    </button>
                    <button 
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isAnalyzing ? <Activity className="animate-spin" /> : <CheckCircle />}
                      {isAnalyzing ? "Analyzing..." : "Analyze Report"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <ReportResults data={result} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Sub-component for displaying results (Ported from ResultsCard.tsx)
function ReportResults({ data }) {
  const analysis = data.report.analysis;

  // Simple parser to extract key-value pairs formatted as | Key | Value | Range |
  const extractParameters = (text) => {
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Key Metrics Cards */}
      {parameters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parameters.map((param, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-sm text-slate-500 font-semibold uppercase">{param.name}</p>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xl font-bold text-slate-800">{param.value}</span>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Ref: {param.range}</span>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Full Analysis Text */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100 prose prose-blue max-w-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="text-blue-600" /> 
            Detailed Analysis
        </h2>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {analysis}
        </ReactMarkdown>
      </div>
    </div>
  );
}