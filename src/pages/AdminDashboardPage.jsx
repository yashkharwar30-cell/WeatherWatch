import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="w-full px-4 md:px-margin-desktop max-w-container-max mx-auto py-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
        <h1 className="font-headline-lg text-headline-lg text-primary">Operations Center | Report Verification</h1>
      </div>
      <p className="font-body-md text-on-surface-variant mb-8">
        Command center interface for verifying incoming citizen reports and dispatching alerts.
      </p>

      <div className="bg-surface border border-outline-variant p-12 text-center text-on-surface-variant rounded-DEFAULT">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">fact_check</span>
        <p className="font-headline-sm text-primary mb-1">Verification Queue</p>
        <p className="font-body-sm text-on-surface-variant">
          Admin report verification and triage controls placeholder module.
        </p>
      </div>
    </div>
  );
}
