import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import XRAELandingPage from './components/XRAELandingPage';
import DetectionPage from './components/DetectionPage';
import ReportAnalyzer from './components/ReportAnalyzer'; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<XRAELandingPage />} />
        
        {/* Existing X-Ray Detection Route */}
        <Route path="/detect" element={
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            <main className="flex-1">
              <DetectionPage />
            </main>
          </div>
        } />

        {/* New Medical Report Analyzer Route */}
        <Route path="/report-analysis" element={
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-50">
             <main className="flex-1">
               <ReportAnalyzer />
             </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;