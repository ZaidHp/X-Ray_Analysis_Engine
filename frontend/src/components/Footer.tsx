import React from 'react';
import Link from 'next/link';
import { Activity, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                XRAE
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Advanced X-Ray Analysis Engine powered by AI. Experience rapid, accurate fracture detection and comprehensive medical report insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Core Features</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/detect" className="hover:text-blue-400 transition-colors">Fracture Detection</Link>
              </li>
              <li>
                <Link href="/report-analysis" className="hover:text-blue-400 transition-colors">Report Analyzer</Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link>
              </li>
              <li>
                <Link href="/#technology" className="hover:text-blue-400 transition-colors">Technology</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-slate-400">Email:</span>
                <a href="mailto:support@xrae.com" className="hover:text-blue-400 transition-colors text-white">support@xrae.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-400">Phone:</span>
                <span className="text-white">+1 (800) XRAY-123</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} X-Ray Analysis Engine. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 inline mx-1" /> for healthcare innovation.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
