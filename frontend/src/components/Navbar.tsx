"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Activity, ChevronRight, User, Settings, LogOut, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ 
  links = [
    { label: 'Home', href: '/' },
    { label: 'Detection', href: '/detect' },
    { label: 'Report Analyzer', href: '/report-analysis' },
  ],
  actionButtons = {
    signIn: { label: 'Sign In', show: true },
    cta: { label: 'Get Started', show: false }
  }
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check auth status based on local storage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setDropdownOpen(false);
    router.push('/login');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md border-slate-200/50 shadow-sm py-3' 
            : 'bg-white/50 backdrop-blur-sm border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <Activity className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                XRAE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-blue-700' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-blue-50 rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Desktop Action Buttons / Profile */}
            <div className="hidden md:flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  {actionButtons.signIn?.show && (
                    <Link
                      href="/login"
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {actionButtons.signIn.label}
                    </Link>
                  )}
                  {actionButtons.cta?.show && (
                    <Link
                      href="/register"
                      className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium overflow-hidden transition-transform hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">{actionButtons.cta.label}</span>
                      <ChevronRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  )}
                  
                  {!actionButtons.cta?.show && actionButtons.signIn?.show && (
                      <Link href="/register" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-md shadow-blue-500/20">
                          Sign Up
                      </Link>
                  )}
                </>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100/80 hover:bg-slate-200 transition-colors rounded-full border border-slate-200/60"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Account</span>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 flex flex-col"
                        >
                          <div className="p-2 space-y-1">
                            <Link href="/history" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors">
                              <History className="w-4 h-4" />
                              Report History
                            </Link>
                            <Link href="/change-password" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors">
                              <Settings className="w-4 h-4" />
                              Change Password
                            </Link>
                          </div>
                          <div className="p-2 border-t border-slate-100">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white md:hidden pt-24 pb-6 px-4 flex flex-col h-[100dvh]"
          >
            <div className="flex-1 overflow-y-auto space-y-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-2xl text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              {isLoggedIn && (
                <>
                  <div className="h-px bg-slate-100 my-4 py-0" />
                  <Link href="/history" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    Report History
                  </Link>
                  <Link href="/change-password" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    Change Password
                  </Link>
                </>
              )}
            </div>
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3 pb-4">
              {!isLoggedIn ? (
                <>
                  {actionButtons.signIn?.show && (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 text-base font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors"
                    >
                      {actionButtons.signIn.label}
                    </Link>
                  )}
                  <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors shadow-md"
                    >
                      Sign Up
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
