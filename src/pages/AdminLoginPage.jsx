import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminLoginPage() {
  return (
    <div className="w-full px-4 md:px-margin-desktop max-w-container-max mx-auto py-16 flex items-center justify-center">
      <div className="bg-surface border border-outline-variant p-8 w-full max-w-md shadow-sm">
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            admin_panel_settings
          </span>
          <h1 className="font-headline-md text-headline-md text-primary">Admin Portal Login</h1>
          <p className="font-body-sm text-on-surface-variant">
            Authorized personnel login for command & verification operations.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">
              Operator ID
            </label>
            <input
              type="text"
              placeholder="e.g. OP-8492"
              className="w-full bg-surface-container border border-outline-variant p-3 font-mono-md text-body-md focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">
              Security Token
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-surface-container border border-outline-variant p-3 font-mono-md text-body-md focus:outline-none focus:border-primary"
            />
          </div>

          <Link
            to="/admin/dashboard"
            className="mt-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-DEFAULT text-center hover:bg-primary-container transition-colors"
          >
            Authenticate Operator
          </Link>
        </form>
      </div>
    </div>
  );
}
