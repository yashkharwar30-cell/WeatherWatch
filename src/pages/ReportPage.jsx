import React from 'react';

export default function ReportPage() {
  return (
    <div className="w-full px-4 md:px-margin-desktop max-w-container-max mx-auto py-12">
      <div className="bg-surface border border-outline-variant p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">add_box</span>
          <h1 className="font-headline-lg text-headline-lg text-primary">Submit Weather Report</h1>
        </div>
        <p className="font-body-md text-on-surface-variant mb-6">
          Submit localized weather observations to assist emergency monitoring teams.
        </p>

        <div className="bg-surface-container border border-outline-variant p-6 text-center text-on-surface-variant rounded-DEFAULT">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">construction</span>
          <p className="font-headline-sm text-primary mb-1">Module Placeholder</p>
          <p className="font-body-sm text-on-surface-variant">
            The Report Submission workflow module will be implemented in subsequent phases.
          </p>
        </div>
      </div>
    </div>
  );
}
