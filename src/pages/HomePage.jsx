import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getReportState, getPrimaryLocationDisplay, getEventMarkerColor, getStatusBadgeStyle } from '../utils/reportsStore';

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time Firestore reports snapshot
  useEffect(() => {
    const reportsCollection = collection(db, 'reports');
    const unsubscribe = onSnapshot(
      reportsCollection,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            rawStatus: (data.status || 'pending').toLowerCase()
          };
        });
        setReports(fetched);
        setLoading(false);
      },
      (err) => {
        console.error('Error in HomePage Firestore subscription:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute live metrics from actual Firestore data
  const metrics = useMemo(() => {
    const total = reports.length;
    const verified = reports.filter((r) => r.rawStatus === 'verified').length;
    const states = new Set();
    reports.forEach((r) => {
      const st = getReportState(r);
      if (st && !st.includes('°')) states.add(st);
    });
    return {
      total,
      verified,
      statesCount: states.size
    };
  }, [reports]);

  // Latest verified report for Hero live feed preview card
  const latestVerifiedReport = useMemo(() => {
    const verifiedReports = reports.filter((r) => r.rawStatus === 'verified');
    return verifiedReports.length > 0 ? verifiedReports[0] : null;
  }, [reports]);

  return (
    <>
      {/* 1. HERO SECTION */}
      <section className="w-full px-4 md:px-margin-desktop max-w-container-max mx-auto py-10 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: Content */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-mono-md text-xs font-bold self-start">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            NATIONAL CIVIC WEATHER NETWORK
          </div>

          <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl text-primary font-bold tracking-tight leading-tight">
            Crowdsourced Real-Time Weather Intelligence
          </h1>

          <p className="font-body-lg text-base md:text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Empowering citizens across India to report extreme weather events as they happen. Verified observations are aggregated live to assist community preparedness and disaster response.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            {/* Prominent Primary CTA */}
            <Link
              to="/report"
              className="bg-primary text-on-primary font-label-md text-base font-semibold px-7 py-3.5 rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">add_circle</span>
              Report Weather Event
            </Link>

            <Link
              to="/dashboard"
              className="border border-outline-variant text-primary font-label-md text-base font-semibold px-6 py-3.5 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">map</span>
              Explore Live Map
            </Link>
          </div>
        </div>

        {/* Right: Interactive Geospatial Preview */}
        <div className="relative w-full aspect-square md:aspect-[4/3] bg-surface-container border border-outline-variant rounded-xl overflow-hidden shadow-md">
          {/* Map Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6sNt1n1mn0wY3lJdH4HjrB9HRSdpqUBLgQkKTEfOJQij3IdkGXP8A1QDfBrycrvwZGXe-qpmS0RUELc_IwyKhch6vVajg7iRREy-ODF32sWNBslrz_-9Xx1ws2Q5gkCJ09Y6ZXY2LuNQsQXDuwQ_8t7-Buzyurqjysaupfazjk0SEA2DYhBGX8VyISCF7-_Jfv8ltKaMQHiXNMTiTlq6MT8nPDk3GVPZLJXfnrZ1gtjm6UUee4A6m-A')`
            }}
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/90 via-surface/30 to-transparent" />

          {/* Event Pins */}
          <div className="absolute top-1/3 left-1/3 flex flex-col items-center">
            <div className="w-3.5 h-3.5 bg-error rounded-full border-2 border-white shadow-md animate-ping" />
            <span className="mt-1 bg-surface/90 text-primary font-mono-md text-[10px] px-2 py-0.5 rounded border border-outline-variant font-bold shadow">
              Maharashtra
            </span>
          </div>

          <div className="absolute top-1/2 left-2/3 flex flex-col items-center">
            <div className="w-3.5 h-3.5 bg-secondary rounded-full border-2 border-white shadow-md animate-pulse" />
            <span className="mt-1 bg-surface/90 text-primary font-mono-md text-[10px] px-2 py-0.5 rounded border border-outline-variant font-bold shadow">
              Gujarat
            </span>
          </div>

          {/* Live Report Preview Panel (Driven by real Firestore data if available) */}
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 bg-surface/95 border border-outline-variant p-4 rounded-lg z-20 shadow-lg backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-outline-variant">
              <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Latest Verified Report
              </span>
              <span className="font-mono-md text-[10px] text-outline">Real-time</span>
            </div>

            {latestVerifiedReport ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-sm font-bold text-primary">
                    {latestVerifiedReport.eventType || 'Weather Incident'}
                  </span>
                  <span className="px-2 py-0.5 rounded font-label-md text-[10px] font-semibold border bg-secondary/10 text-secondary border-secondary/20">
                    Verified
                  </span>
                </div>
                <div className="font-body-sm text-xs text-on-surface flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                  {getPrimaryLocationDisplay(latestVerifiedReport)}
                </div>
                {latestVerifiedReport.latitude && latestVerifiedReport.longitude && (
                  <div className="font-mono-md text-[10px] text-outline">
                    {latestVerifiedReport.latitude.toFixed(4)}° N, {latestVerifiedReport.longitude.toFixed(4)}° E
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-sm font-bold text-primary">Heavy Rain</span>
                  <span className="px-2 py-0.5 rounded font-label-md text-[10px] font-semibold border bg-secondary/10 text-secondary border-secondary/20">
                    Verified
                  </span>
                </div>
                <div className="font-body-sm text-xs text-on-surface font-medium">Mumbai, Maharashtra</div>
                <div className="font-mono-md text-[10px] text-outline">19.0760° N, 72.8777° E</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. REAL FIRESTORE PLATFORM STATISTICS (NO FAKE / DEMO NUMBERS) */}
      <section className="border-y border-outline-variant bg-surface-container-lowest py-8">
        <div className="px-4 md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-outline-variant">
            {/* Stat 1 */}
            <div className="flex flex-col md:px-6 first:px-0">
              <span className="font-mono-md text-3xl md:text-4xl font-bold text-primary mb-1">
                {loading ? '—' : metrics.total}
              </span>
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Live Submissions
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col md:px-6">
              <span className="font-mono-md text-3xl md:text-4xl font-bold text-secondary mb-1">
                {loading ? '—' : metrics.verified}
              </span>
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Verified Reports
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col md:px-6">
              <span className="font-mono-md text-3xl md:text-4xl font-bold text-primary mb-1">
                {loading ? '—' : metrics.statesCount}
              </span>
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                States / UTs Active
              </span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col md:px-6">
              <span className="font-mono-md text-3xl md:text-4xl font-bold text-primary mb-1 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-secondary animate-pulse shrink-0" />
                Live
              </span>
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Firestore Sync
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DATA INTEGRITY PIPELINE */}
      <section className="px-4 md:px-margin-desktop max-w-container-max mx-auto py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-headline-lg text-2xl md:text-3xl text-primary font-bold mb-3">
            Civic Weather Intelligence Pipeline
          </h2>
          <p className="font-body-md text-sm md:text-base text-on-surface-variant">
            How crowd-sourced observations transition from field reporting to verified operational intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-surface border border-outline-variant p-6 rounded-lg flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-5">
              <span className="material-symbols-outlined text-2xl">add_location_alt</span>
            </div>
            <h3 className="font-headline-md text-lg text-primary font-bold mb-2">1. Field Submission</h3>
            <p className="font-body-md text-sm text-on-surface-variant flex-grow leading-relaxed">
              Citizens submit hyper-local weather observations with GPS coordinates, media proof, and categorized hazard details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-surface border border-outline-variant p-6 rounded-lg flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary mb-5">
              <span className="material-symbols-outlined text-2xl">fact_check</span>
            </div>
            <h3 className="font-headline-md text-lg text-primary font-bold mb-2">2. Operator Triage</h3>
            <p className="font-body-md text-sm text-on-surface-variant flex-grow leading-relaxed">
              Submissions undergo verification in the Admin Operations Dashboard before being published to the public feed.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-surface border border-outline-variant p-6 rounded-lg flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary-container mb-5">
              <span className="material-symbols-outlined text-2xl">monitoring</span>
            </div>
            <h3 className="font-headline-md text-lg text-primary font-bold mb-2">3. Public Intelligence</h3>
            <p className="font-body-md text-sm text-on-surface-variant flex-grow leading-relaxed">
              Verified reports are broadcast to the live map and analytical charts for public awareness and response tracking.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
