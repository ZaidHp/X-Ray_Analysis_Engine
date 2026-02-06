import React from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ 
  logoText = "XRAE",
  logoColor = "text-cyan-400",
  links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'X-Ray Detection', href: '/detect' },
    { label: 'Report Analyzer', href: '/report-analysis' },
    { label: 'Contact', href: '#contact' },
  ],
  actionButtons = {
    signIn: { label: 'Sign In', show: true },
    cta: { label: 'Get Started', show: true, path: '/detect' }
  }
}) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <Activity className={`w-8 h-8 ${logoColor} relative`} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              <span className={logoColor}>{logoText.charAt(0)}</span>
              {logoText.slice(1)}
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <a 
                key={index}
                href={link.href} 
                className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            {actionButtons.signIn.show && (
              <button className="hidden md:block px-4 py-2 text-slate-300 hover:text-white transition-colors font-medium">
                {actionButtons.signIn.label}
              </button>
            )}
            
            {actionButtons.cta.show && (
              <button 
                onClick={() => navigate(actionButtons.cta.path)}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:-translate-y-0.5 text-white"
              >
                {actionButtons.cta.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;