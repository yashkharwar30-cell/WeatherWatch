import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Live Dashboard', path: '/dashboard' },
    { label: 'Submit Report', path: '/report' },
    { label: 'Analytics', path: '/analytics' },
  ];

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop max-w-container-max mx-auto h-16">
        {/* Brand */}
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
          <span 
            className="material-symbols-outlined text-primary" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            radar
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary">
            WeatherWatch
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex gap-gutter items-center h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `h-full flex items-center font-label-md text-label-md transition-colors ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-on-surface-variant hover:text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Trailing Action */}
        <div className="hidden lg:flex items-center">
          <Link
            to="/admin/login"
            className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md border border-outline px-4 py-2 rounded-DEFAULT"
          >
            Admin Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-on-surface p-2 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu (Full Width Drawer) */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-surface border-b border-outline-variant shadow-sm w-full absolute top-16 left-0 z-40 divide-y divide-outline-variant">
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-4 px-margin-mobile py-4 ${
                isActive ? 'text-primary bg-surface-container font-semibold' : 'text-primary hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-headline-sm text-headline-sm">Home</span>
          </NavLink>
          <NavLink
            to="/dashboard"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-4 px-margin-mobile py-4 ${
                isActive ? 'text-primary bg-surface-container font-semibold' : 'text-primary hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-headline-sm text-headline-sm">Live Dashboard</span>
          </NavLink>
          <NavLink
            to="/report"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-4 px-margin-mobile py-4 ${
                isActive ? 'text-primary bg-surface-container font-semibold' : 'text-primary hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined">add_box</span>
            <span className="font-headline-sm text-headline-sm">Submit Report</span>
          </NavLink>
          <NavLink
            to="/analytics"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-4 px-margin-mobile py-4 ${
                isActive ? 'text-primary bg-surface-container font-semibold' : 'text-primary hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-headline-sm text-headline-sm">Analytics</span>
          </NavLink>
          <NavLink
            to="/admin/login"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-4 px-margin-mobile py-4 ${
                isActive ? 'text-primary bg-surface-container font-semibold' : 'text-primary hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined">login</span>
            <span className="font-headline-sm text-headline-sm">Admin Login</span>
          </NavLink>
        </nav>
      )}
    </header>
  );
}
