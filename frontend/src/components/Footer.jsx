import React from 'react';
import { Activity } from 'lucide-react';

const Footer = ({
  columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'API', href: '#' },
        { label: 'Documentation', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Compliance', href: '#' }
      ]
    }
  ]
}) => {
  return (
    <footer className="relative py-12 px-6 border-t border-slate-800 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-black">
                <span className="text-cyan-400">X</span>RAE
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              AI-powered bone fracture detection for the modern healthcare industry.
            </p>
          </div>

          {/* Dynamic Columns */}
          {columns.map((column, colIndex) => (
            <div key={colIndex}>
              <h4 className="font-bold mb-4">{column.title}</h4>
              <ul className="space-y-2 text-slate-400">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href} className="hover:text-cyan-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} XRAE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;