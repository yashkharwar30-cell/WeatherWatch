import React from 'react';

export default function DashboardPage() {
  return (
    <div className="w-full px-4 md:px-margin-desktop max-w-container-max mx-auto py-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary text-3xl">dashboard</span>
        <h1 className="font-headline-lg text-headline-lg text-primary">Live Weather Dashboard</h1>
      </div>
      <p className="font-body-md text-on-surface-variant mb-8">
        Real-time telemetry and verified report monitoring grid.
      </p>

      <div className="bg-surface border border-outline-variant p-12 text-center text-on-surface-variant rounded-DEFAULT">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">map</span>
        <p className="font-headline-sm text-primary mb-1">Live Telemetry Grid</p>
        <p className="font-body-sm text-on-surface-variant">
          Interactive radar maps and live event feeds will be activated in the next development iteration.
        </p>
      </div>
    </div>
  );
}
