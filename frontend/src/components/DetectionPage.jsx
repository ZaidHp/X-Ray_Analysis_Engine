import React, { useState, useRef, useCallback } from 'react';
import { Upload, FolderOpen, Search, Loader, Bone, Image as ImageIcon, ClipboardList, Microscope, RefreshCw, MapPin, CloudUpload } from 'lucide-react';

const DetectionPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // State management
  const [currentFile, setCurrentFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // File validation
  const isValidImageFile = (file) => {
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    return acceptedTypes.includes(file.type);
  };

  // Handle file selection
  const handleFiles = (files) => {
    const file = files[0];
    if (isValidImageFile(file)) {
      setCurrentFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (JPG or PNG).');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  // Browse button click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // File input change
  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Simulated multi-stage progress
  const simulateProgress = () => {
    const stages = [
      { percent: 20, message: 'Analysis complete! Preparing results...' },
      { percent: 40, message: 'Processing image analysis...' },
      { percent: 60, message: 'Identifying fracture patterns...' },
      { percent: 80, message: 'Generating visualization...' },
      { percent: 100, message: 'Finalizing report...' }
    ];

    let currentStage = 0;
    
    const stageInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].percent);
        setProgressMessage(stages[currentStage].message);
        currentStage++;
      } else {
        clearInterval(stageInterval);
      }
    }, 2000);

    return stageInterval;
  };

  // Upload and detect
  const uploadAndDetect = async () => {
    if (!currentFile) {
      alert('Please select an image first.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setProgressMessage('Uploading...');
    setResults(null);

    const formData = new FormData();
    formData.append('file', currentFile);

    try {
      const response = await fetch(`${API_URL}/api/v1/analysis/detect`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Start multi-stage progress
      const progressInterval = simulateProgress();

      // Wait for all stages to complete
      setTimeout(() => {
        clearInterval(progressInterval);
        setResults(data);
        setIsUploading(false);
      }, 12000); // 5 stages * 2 seconds + 2 seconds final display

    } catch (error) {
      console.error('Detection error:', error);
      setProgressMessage('Error occurred. Please try again.');
      setIsUploading(false);
      setTimeout(() => {
        setPreviewUrl(null);
        setCurrentFile(null);
      }, 2000);
    }
  };

  // Reset detector
  const resetDetector = () => {
    setCurrentFile(null);
    setPreviewUrl(null);
    setResults(null);
    setProgress(0);
    setProgressMessage('');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get confidence class
  const getConfidenceClass = (confidence) => {
    const percent = Math.round(confidence * 100);
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-4">
            Fracture Detection
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your X-ray image for instant fracture detection using our advanced AI algorithm
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-white/95">
          
          {/* Upload Area - Show only when no file is selected and not showing results */}
          {!previewUrl && !results && (
            <div
              ref={dropAreaRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer overflow-hidden
                ${isDragging 
                  ? 'border-blue-600 bg-blue-50 transform -translate-y-2 shadow-lg' 
                  : 'border-blue-300 bg-gradient-to-br from-slate-50 to-blue-50 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg hover:-translate-y-1'
                }`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83z' fill='%234A9FD8' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
              }}></div>

              <div className="relative z-10">
                <CloudUpload className="w-20 h-20 text-blue-600 mx-auto mb-6 animate-bounce" />
                <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                  Drag & Drop Your X-Ray Image
                </h3>
                <p className="text-lg text-slate-500 mb-6">
                  Supported formats: JPG, PNG
                </p>
                <button
                  onClick={handleBrowseClick}
                  className="group relative inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-xl font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                >
                  <span className="absolute inset-0 bg-blue-600 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0"></span>
                  <FolderOpen className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="relative z-10">Browse Files</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Preview Area */}
          {previewUrl && !isUploading && !results && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 border border-blue-100 shadow-lg">
              <div className="max-h-96 mb-6 flex items-center justify-center bg-white rounded-2xl p-4 shadow-inner">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-80 max-w-full object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={uploadAndDetect}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:from-blue-700 hover:to-blue-800"
                >
                  <Search className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                  Detect Fractures
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isUploading && (
            <div className="text-center py-16">
              <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-xl mb-6">
                <Bone className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                Analyzing Your X-Ray
              </h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Our AI is examining the image for possible fractures. This usually takes 10-15 seconds.
              </p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-4">
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm font-medium text-blue-600">
                {progressMessage}
              </p>
            </div>
          )}

          {/* Results Area */}
          {results && !isUploading && (
            <div className="space-y-8 animate-fadeIn">
              {/* Results Header */}
              <div className="text-center pb-6 border-b border-slate-200">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Detection Results
                </h2>
                <p className="text-slate-600">
                  Our AI has analyzed your X-ray image
                </p>
              </div>

              {/* Image Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Original Image</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-inner">
                    <img
                      src={previewUrl}
                      alt="Original X-Ray"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>

                {/* Detection Result */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Detection Result</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-inner">
                    {results.result_image ? (
                      <img
                        src={`${API_URL}${results.result_image}`}
                        alt="Detection Result"
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-slate-400">
                        No result image available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fracture Analysis */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-slate-800">Fracture Analysis</h3>
                </div>
                
                <div className="space-y-4">
                  {!results.detections || results.detections.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <h4 className="font-semibold text-slate-800 mb-2">No fractures detected</h4>
                      <p className="text-slate-600">The AI did not detect any fractures in this image.</p>
                    </div>
                  ) : (
                    results.detections.map((detection, index) => {
                      const confidencePercent = Math.round(detection.confidence * 100);
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 flex gap-4"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Bone className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-800 mb-3">
                              {detection.class} #{index + 1}
                            </h4>
                            
                            {/* Confidence */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Confidence:</span>
                                <span className={`text-sm font-bold ${
                                  confidencePercent >= 80 ? 'text-green-600' :
                                  confidencePercent >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {confidencePercent}%
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getConfidenceClass(detection.confidence)}`}
                                  style={{ width: `${confidencePercent}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>
                                Location: x: {Math.round(detection.box.x1)}-{Math.round(detection.box.x2)}, 
                                y: {Math.round(detection.box.y1)}-{Math.round(detection.box.y2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Grad-CAM Visualization */}
              {results.gradcam_image && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <Microscope className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-slate-800">Grad-CAM Visualization</h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md mb-4">
                    <h4 className="font-semibold text-slate-800 mb-2">Grad-CAM Visualization</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      This heat map highlights areas that influenced the AI's fracture detection decision
                    </p>
                    
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <img
                        src={`${API_URL}${results.gradcam_image}`}
                        alt="Grad-CAM Visualization"
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-red-500 rounded"></div>
                        <span className="text-sm text-slate-700">High Attention</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-yellow-400 rounded"></div>
                        <span className="text-sm text-slate-700">Medium Attention</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded"></div>
                        <span className="text-sm text-slate-700">Low Attention</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={resetDetector}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:from-blue-700 hover:to-blue-800"
                >
                  <RefreshCw className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                  Analyze Another X-Ray
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DetectionPage;