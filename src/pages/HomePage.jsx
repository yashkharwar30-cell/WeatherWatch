import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="w-full px-4 md:px-margin-desktop max-w-container-max mx-auto py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content */}
        <div className="flex flex-col gap-6">
          <h1 className="font-display-lg text-display-lg text-primary">
            See what's happening. Report what you see.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Connecting citizens with actionable weather intelligence. WeatherWatch aggregates real-time, verified reports to build a comprehensive picture of extreme weather events as they unfold.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link
              to="/report"
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-DEFAULT text-center hover:bg-primary-container transition-colors border border-primary"
            >
              Submit a Report
            </Link>
            <Link
              to="/dashboard"
              className="border border-primary text-primary font-label-md text-label-md px-6 py-3 rounded-DEFAULT text-center hover:bg-surface-container transition-colors"
            >
              Explore Live Dashboard
            </Link>
          </div>
        </div>

        {/* Right: Map/Panel */}
        <div className="relative w-full aspect-square md:aspect-[4/3] bg-surface-container border border-outline-variant rounded-DEFAULT overflow-hidden shadow-sm">
          {/* Map Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6sNt1n1mn0wY3lJdH4HjrB9HRSdpqUBLgQkKTEfOJQij3IdkGXP8A1QDfBrycrvwZGXe-qpmS0RUELc_IwyKhch6vVajg7iRREy-ODF32sWNBslrz_-9Xx1ws2Q5gkCJ09Y6ZXY2LuNQsQXDuwQ_8t7-Buzyurqjysaupfazjk0SEA2DYhBGX8VyISCF7-_Jfv8ltKaMQHiXNMTiTlq6MT8nPDk3GVPZLJXfnrZ1gtjm6UUee4A6m-A')`
            }}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />

          {/* Event Markers */}
          <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
            <div className="w-4 h-4 bg-error rounded-none border border-on-error relative z-10 animate-pulse" />
            <span className="mt-1 bg-error-container text-on-error-container font-mono-md text-xs px-1 border border-error/20">
              Flood
            </span>
          </div>

          <div className="absolute top-1/2 left-2/3 flex flex-col items-center">
            <div className="w-4 h-4 bg-secondary rounded-none border border-on-secondary relative z-10 animate-pulse" />
            <span className="mt-1 bg-secondary-container text-on-secondary-container font-mono-md text-xs px-1 border border-secondary/20">
              Rain
            </span>
          </div>

          {/* Live Report Panel */}
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 bg-surface border border-outline-variant p-4 z-20 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Latest Verified
              </span>
              <span className="font-mono-md text-xs text-outline">Just now</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span 
                className="material-symbols-outlined text-error" 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                water_drop
              </span>
              <span className="font-headline-sm text-headline-sm text-primary">
                Heavy Flooding
              </span>
            </div>
            <div className="font-mono-md text-xs text-on-surface-variant flex flex-col gap-1">
              <div>LOC: 19.0760° N, 72.8777° E</div>
              <div>SRC: Verified Citizen (ID: 8492)</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNAL / STATS */}
      <section className="border-y border-outline-variant bg-surface-container-lowest">
        <div className="px-4 md:px-margin-desktop max-w-container-max mx-auto py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-outline-variant">
            <div className="flex flex-col md:px-8 first:px-0">
              <span className="font-mono-md text-3xl font-bold text-primary mb-1">14,291</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Citizen Reports
              </span>
            </div>
            <div className="flex flex-col md:px-8">
              <span className="font-mono-md text-3xl font-bold text-primary mb-1">8,405</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Verified Events
              </span>
            </div>
            <div className="flex flex-col md:px-8">
              <span className="font-mono-md text-3xl font-bold text-primary mb-1">1,204</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Locations Monitored
              </span>
            </div>
            <div className="flex flex-col md:px-8">
              <span className="font-mono-md text-3xl font-bold text-primary mb-1">2.4s</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">
                Live Update Latency
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / PIPELINE */}
      <section className="px-4 md:px-margin-desktop max-w-container-max mx-auto py-20">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-12 text-center">
          Data Integrity Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-surface border border-outline-variant p-6 flex flex-col h-full">
            <div className="w-12 h-12 bg-surface-container flex items-center justify-center border border-outline-variant mb-6">
              <span className="material-symbols-outlined text-primary">add_location_alt</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">1. Report</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Citizens submit localized weather anomalies via the mobile interface, capturing GPS coordinates and timestamped metadata.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-surface border border-outline-variant p-6 flex flex-col h-full">
            <div className="w-12 h-12 bg-surface-container flex items-center justify-center border border-outline-variant mb-6">
              <span className="material-symbols-outlined text-primary">fact_check</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">2. Verify</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Automated systems cross-reference submissions with satellite imagery and historical meteorological patterns to flag anomalies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-surface border border-outline-variant p-6 flex flex-col h-full">
            <div className="w-12 h-12 bg-surface-container flex items-center justify-center border border-outline-variant mb-6">
              <span className="material-symbols-outlined text-primary">monitoring</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">3. Understand</h3>
            <p className="font-body-md text-body-md text-on-surface-variant flex-grow">
              Verified data is aggregated into the live dashboard, providing authorities and the public with a high-fidelity operational picture.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
