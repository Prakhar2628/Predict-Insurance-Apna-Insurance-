import React from 'react';
import { Github, Heart } from 'lucide-react';
import { LogoMark } from './Navbar';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/30 backdrop-blur-md py-10 transition-colors duration-300 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Logo - Just LogoMark */}
          <div className="flex items-center gap-3">
            <LogoMark className="w-6 h-6 text-white/80" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              InsurePredict Console
            </span>
          </div>

          {/* Credits */}
          <p className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
            Designed with <Heart className="h-3 w-3 text-[#A4F4FD] fill-[#A4F4FD]" /> & Machine Learning. All rights reserved. &copy; {new Date().getFullYear()}
          </p>

          {/* Icon Link */}
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              aria-label="GitHub Project"
            >
              <Github className="h-4.5 w-4.5" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
