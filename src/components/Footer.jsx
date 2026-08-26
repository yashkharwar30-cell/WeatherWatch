import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant w-full mt-auto">
      <div className="w-full py-8 px-4 md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-gutter">
        {/* Brand & Copyright */}
        <div className="flex flex-col gap-2">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
            WeatherWatch
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 WeatherWatch Civic Technology platform. All rights reserved.
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Link 
            to="/analytics" 
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Data Interpretation
          </Link>
          <a 
            href="#privacy" 
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="#support" 
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Contact Support
          </a>
          <a 
            href="#terms" 
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Terms of Service
          </a>
        </nav>
      </div>
    </footer>
  );
}
