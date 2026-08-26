import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, setAdminAuth } from '../utils/authStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // If already authenticated, redirect to /admin/dashboard
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      // Demo Credentials Check
      if (email.trim() === 'admin@weatherwatch.demo' && password === 'admin123') {
        setAdminAuth(email.trim());
        setIsLoading(false);
        navigate('/admin/dashboard', { replace: true });
      } else {
        setIsLoading(false);
        setGeneralError('Invalid Administrator credentials. Use demo login below.');
      }
    }, 600);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-surface text-on-surface font-body-md flex flex-col items-center justify-center relative py-12 px-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary-fixed/30 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Main Login Card Container */}
      <main className="w-full max-w-md z-10 relative">
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="bg-surface-container p-6 text-center border-b border-outline-variant">
            <div className="flex justify-center items-center gap-2 mb-1">
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                admin_panel_settings
              </span>
              <h1 className="font-headline-md text-headline-md text-primary font-bold">
                WeatherWatch
              </h1>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Admin Portal
            </h2>
          </div>

          {/* Form Body */}
          <div className="p-6 md:p-8">
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-6">
              Sign in to review, triage, and verify citizen weather reports.
            </p>

            {/* General Error Alert */}
            {generalError && (
              <div className="mb-6 p-3 bg-error/10 border border-error/30 rounded flex items-center gap-2 text-error font-body-sm text-xs animate-fadeIn">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Field */}
              <div>
                <label
                  className="block font-label-md text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold"
                  htmlFor="email"
                >
                  Administrator Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (generalError) setGeneralError('');
                    }}
                    placeholder="admin@weatherwatch.demo"
                    className={`w-full bg-surface border rounded pl-10 pr-3 py-2.5 font-body-md text-sm text-on-surface outline-none transition-colors ${
                      emailError ? 'border-error ring-1 ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="font-body-sm text-xs text-error mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    className="block font-label-md text-xs text-on-surface-variant uppercase tracking-widest font-semibold"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@weatherwatch.demo');
                      setPassword('admin123');
                      setGeneralError('');
                    }}
                    className="font-body-sm text-xs text-primary hover:underline"
                  >
                    Fill Demo Login
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      if (generalError) setGeneralError('');
                    }}
                    placeholder="••••••••"
                    className={`w-full bg-surface border rounded pl-10 pr-10 py-2.5 font-body-md text-sm text-on-surface outline-none transition-colors ${
                      passwordError ? 'border-error ring-1 ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface focus:outline-none"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {passwordError && (
                  <p className="font-body-sm text-xs text-error mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold py-3 px-4 rounded uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">
                      progress_activity
                    </span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-lg">login</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Reminder Helper Box */}
            <div className="mt-6 p-3 bg-surface-container border border-outline-variant rounded text-center font-mono-md text-xs text-on-surface-variant flex flex-col gap-1">
              <span className="font-bold text-primary text-xs uppercase tracking-wider">Demo Access Credentials</span>
              <div>Email: <code className="bg-surface px-1 py-0.5 rounded text-primary">admin@weatherwatch.demo</code></div>
              <div>Password: <code className="bg-surface px-1 py-0.5 rounded text-primary">admin123</code></div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-surface-container-low p-4 border-t border-outline-variant text-center">
            <div className="flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">security</span>
              <span className="font-label-md text-xs uppercase tracking-wider">
                Authorized Personnel Only
              </span>
            </div>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-mono-md text-xs text-on-surface-variant">
            System: Online | Protocol: Secure Demo Mode
          </span>
        </div>
      </main>
    </div>
  );
}
