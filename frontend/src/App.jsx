import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import XRAELandingPage from './components/XRAELandingPage';
import DetectionPage from './components/DetectionPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page as the home route */}
        <Route path="/" element={<XRAELandingPage />} />
        
        {/* Detection Page route */}
        <Route path="/detect" element={
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            <main className="flex-1">
              <DetectionPage />
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;