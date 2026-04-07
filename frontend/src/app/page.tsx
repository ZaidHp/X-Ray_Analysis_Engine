import Link from 'next/link';
import { Search, FileText, ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-8 border border-blue-100 shadow-sm animate-fade-in-up">
              <Activity className="w-4 h-4" />
              <span>Next Generation Medical AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Advanced Healthcare <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                At Your Fingertips
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Upload your X-rays or Medical Reports and let our AI engine analyze them instantly. Get fast, reliable, and secure insights to help you make informed decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link 
                href="/detect" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group"
              >
                Try X-Ray Detection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/report-analysis" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-full font-semibold text-lg hover:bg-slate-50 border border-slate-200 transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group"
              >
                Analyze Report
                <FileText className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Yet Intuitive</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform is built with state-of-the-art machine learning models specifically trained for medical imaging and text analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Detection</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload your X-ray images and get immediate bounding box visualizations highlighting potential fractures.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Text Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Our NLP models can quickly parse complex medical jargon from clinical reports and explain them clearly.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6 text-teal-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed">
                We prioritize your data security. Uploaded images and reports are processed ephemerally with strict privacy standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works CTA */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Ready to Experience the Future of Medical AI?</h2>
          <p className="text-lg text-slate-600 mb-10">
            Join thousands of users who are speeding up their diagnostics process today. Connect with the AI seamlessly.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-colors shadow-xl"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Global CSS for some keyframe animations that might not be in Tailwind default */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
