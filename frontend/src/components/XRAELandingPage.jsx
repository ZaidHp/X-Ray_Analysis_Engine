// frontend/src/components/XRAELandingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Zap, 
  Shield, 
  Play,
  Check,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  Users,
  ChevronDown
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const XRAELandingPage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Parallax mouse effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = (window.scrollY / documentHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Deep Learning AI',
      description: 'Advanced neural networks trained on 100K+ medical images',
      stat: '99.2%',
      label: 'Accuracy'
    },
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Get diagnostic insights in under 3 seconds',
      stat: '<3s',
      label: 'Response Time'
    },
    {
      icon: Shield,
      title: 'FDA Compliant',
      description: 'HIPAA-certified, SOC 2 Type II compliant infrastructure',
      stat: '100%',
      label: 'Secure'
    }
  ];

  const stats = [
    { value: '500K+', label: 'Scans Analyzed' },
    { value: '98.7%', label: 'Accuracy Rate' },
    { value: '2.8s', label: 'Avg. Detection Time' },
    { value: '1,200+', label: 'Healthcare Partners' }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Precision Detection',
      description: 'Identify hairline fractures missed by human eye',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Clock,
      title: 'Faster Diagnosis',
      description: 'Reduce waiting times from hours to seconds',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      title: 'Improved Outcomes',
      description: 'Early detection leads to better patient recovery',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Users,
      title: 'Radiologist Support',
      description: 'AI-assisted workflow enhances expert diagnosis',
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '299',
      period: 'month',
      description: 'Perfect for small clinics',
      features: [
        '500 scans per month',
        'Basic AI analysis',
        'Email support',
        'Web dashboard',
        'PDF reports'
      ],
      recommended: false
    },
    {
      name: 'Professional',
      price: '799',
      period: 'month',
      description: 'For growing practices',
      features: [
        '2,000 scans per month',
        'Advanced AI analysis',
        'Priority support',
        'API access',
        'Custom integrations',
        'Team collaboration',
        'Advanced analytics'
      ],
      recommended: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'month',
      description: 'For hospitals & networks',
      features: [
        'Unlimited scans',
        'White-label solution',
        'Dedicated support',
        'On-premise deployment',
        'Custom model training',
        'SLA guarantees',
        'Compliance assistance'
      ],
      recommended: false
    }
  ];

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
          />
          
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8 backdrop-blur-sm animate-fadeIn">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Powered by Advanced Deep Learning</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              AI-Powered
            </span>
            <span className="block mt-2">Fracture Detection</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Real-time X-ray analysis using cutting-edge deep learning. 
            Detect bone fractures with <span className="text-cyan-400 font-semibold">99.2% accuracy</span> in under 3 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsVideoPlaying(true)}
              className="group px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-full font-bold text-lg hover:bg-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
            >
              <Play className="w-5 h-5 text-cyan-400" />
              Watch Demo
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-cyan-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">XRAE</span>?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Cutting-edge technology that transforms medical imaging analysis
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`relative group cursor-pointer transition-all duration-500 ${
                    activeFeature === index ? 'scale-105' : ''
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20 rounded-3xl p-8 h-full overflow-hidden group-hover:border-cyan-500/50 transition-all duration-300">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>

                      {/* Description */}
                      <p className="text-slate-400 mb-6">{feature.description}</p>

                      {/* Stat */}
                      <div className="flex items-end gap-2">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                          {feature.stat}
                        </div>
                        <div className="text-sm text-slate-500 mb-1">{feature.label}</div>
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {activeFeature === index && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Simple. Fast. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Accurate.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three steps to revolutionary diagnostic insights
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 -translate-y-1/2" />

            {[
              { step: '01', title: 'Upload X-Ray', description: 'Drag and drop or upload your X-ray image securely', icon: '📤' },
              { step: '02', title: 'AI Analysis', description: 'Our deep learning model processes the image in real-time', icon: '🧠' },
              { step: '03', title: 'Get Results', description: 'Receive detailed fracture detection report instantly', icon: '📊' }
            ].map((item, index) => (
              <div key={index} className="relative text-center group">
                {/* Step Number Circle */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <span className="relative text-4xl">{item.icon}</span>
                </div>

                {/* Content */}
                <div className="relative bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-6 group-hover:border-cyan-500/50 transition-all duration-300">
                  <div className="text-sm font-bold text-cyan-400 mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Practice</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience the future of medical imaging
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <Icon className={`w-12 h-12 mb-4 bg-gradient-to-br ${benefit.gradient} bg-clip-text text-transparent`} />
                    <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-slate-400">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Simple <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Pricing</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your practice
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.recommended
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 scale-105 shadow-2xl shadow-cyan-500/50'
                    : 'bg-slate-900 border border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}

                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.recommended ? 'text-white' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={plan.recommended ? 'text-white/80' : 'text-slate-400'}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">
                      {plan.price === 'Custom' ? plan.price : `$${plan.price}`}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className={plan.recommended ? 'text-white/80' : 'text-slate-400'}>
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.recommended ? 'text-white' : 'text-cyan-400'
                      }`} />
                      <span className={plan.recommended ? 'text-white/90' : 'text-slate-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                  plan.recommended
                    ? 'bg-white text-blue-600 hover:bg-slate-100 hover:shadow-lg'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-12 md:p-16 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Transform Your Practice?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join 1,200+ healthcare providers using XRAE for faster, more accurate diagnoses
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Space Grotesk', sans-serif;
        }

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
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgb(2, 6, 23);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgb(6, 182, 212), rgb(37, 99, 235));
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgb(8, 145, 178), rgb(29, 78, 216));
        }
      `}</style>
    </div>
  );
};

export default XRAELandingPage;