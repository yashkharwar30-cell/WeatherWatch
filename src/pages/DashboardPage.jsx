import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import {
  getEventMarkerColor,
  getStatusBadgeStyle,
  getReportState,
  getPrimaryLocationDisplay
} from '../utils/reportsStore';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getEventIcon(eventType) {
  switch (eventType) {
    case 'Heatwave': return 'thermostat';
    case 'Flood': return 'flood';
    case 'Fog': return 'foggy';
    case 'Dust Storm': return 'air';
    case 'Thunderstorm': return 'thunderstorm';
    case 'Strong Wind': return 'air';
    default: return 'water_drop';
  }
}

function relativeTime(date) {
  if (!date) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function isToday(date) {
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

// ─── Map utilities ───────────────────────────────────────────────────────────

function createCustomMarkerIcon(eventType) {
  const color = getEventMarkerColor(eventType);
  return L.divIcon({
    className: 'custom-weather-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <span style="color:white;font-size:13px;line-height:1;">●</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
}

function MapViewController({ center, zoom }) {
  const map = useMap();
  const prevCenter = useRef(null);
  useEffect(() => {
    if (
      center &&
      (!prevCenter.current ||
        prevCenter.current[0] !== center[0] ||
        prevCenter.current[1] !== center[1])
    ) {
      map.flyTo(center, zoom || 8, { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, zoom, map]);
  return null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  'Heavy Rain', 'Flood', 'Thunderstorm',
  'Heatwave', 'Fog', 'Dust Storm', 'Strong Wind'
];

const TIME_RANGES = [
  { label: 'Last 30 min', value: 30 },
  { label: 'Last 1 hour', value: 60 },
  { label: 'Last 6 hours', value: 360 },
  { label: 'Today', value: 'today' },
  { label: 'All time', value: 'all' },
];

// ─── Connection status indicator ─────────────────────────────────────────────

function ConnectionBadge({ status, lastUpdated }) {
  const config = {
    connected: { color: 'text-secondary', dot: 'bg-secondary', label: 'LIVE' },
    reconnecting: { color: 'text-yellow-600', dot: 'bg-yellow-500', label: 'RECONNECTING' },
    offline: { color: 'text-error', dot: 'bg-error', label: 'OFFLINE' },
  }[status] || { color: 'text-outline', dot: 'bg-outline', label: 'CONNECTING' };

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container border border-outline-variant font-mono-md text-xs font-bold ${config.color}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot} ${status === 'connected' ? 'animate-pulse' : ''}`} />
        {config.label}
      </div>
      {lastUpdated && (
        <span className="font-body-sm text-[11px] text-outline">
          Updated {relativeTime(lastUpdated)}
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newReportId, setNewReportId] = useState(null); // highlight newest arrival
  const prevIdsRef = useRef(new Set());

  const [activeTab, setActiveTab] = useState('map');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Map states
  const [mapCenter, setMapCenter] = useState([22.5, 79.5]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedReport, setSelectedReport] = useState(null);

  // ─── Firestore subscription ──────────────────────────────────────────────
  useEffect(() => {
    setConnectionStatus('connecting');
    const q = query(
      collection(db, 'reports'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let dateObj = null;
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            dateObj = data.createdAt.toDate();
          }
          const rawStatus = (data.status || 'pending').toLowerCase();
          const displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
          return {
            id: docSnap.id,
            ...data,
            dateObj,
            status: displayStatus,
            rawStatus,
          };
        });

        // Detect new arrivals (for highlight animation)
        const currentIds = new Set(docs.map((r) => r.id));
        const newIds = docs.filter((r) => !prevIdsRef.current.has(r.id) && prevIdsRef.current.size > 0);
        if (newIds.length > 0) {
          setNewReportId(newIds[0].id);
          setTimeout(() => setNewReportId(null), 3000);
        }
        prevIdsRef.current = currentIds;

        setAllReports(docs);
        setLoading(false);
        setFirestoreError(null);
        setConnectionStatus('connected');
        setLastUpdated(new Date());
      },
      (err) => {
        console.error('[DashboardPage] Firestore error:', err);
        setFirestoreError(err.message);
        setConnectionStatus('offline');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ─── Only verified reports shown publicly ────────────────────────────────
  const verifiedReports = useMemo(
    () => allReports.filter((r) => r.rawStatus === 'verified'),
    [allReports]
  );

  // ─── Unique states from verified reports ──────────────────────────────
  const uniqueStates = useMemo(() => {
    const states = new Set();
    verifiedReports.forEach((r) => {
      const st = getReportState(r);
      if (st && !st.includes('°')) states.add(st);
    });
    return Array.from(states).sort();
  }, [verifiedReports]);

  // ─── Time range filter helper ────────────────────────────────────────────
  const passesTimeFilter = useCallback(
    (report) => {
      if (selectedTimeRange === 'all') return true;
      if (!report.dateObj) return false;
      if (selectedTimeRange === 'today') return isToday(report.dateObj);
      const cutoffMs = Date.now() - selectedTimeRange * 60 * 1000;
      return report.dateObj.getTime() >= cutoffMs;
    },
    [selectedTimeRange]
  );

  // ─── Filtered reports (from verified only) ───────────────────────────────
  const filteredReports = useMemo(() => {
    return verifiedReports.filter((r) => {
      const loc = (r.location || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const id = (r.id || '').toLowerCase();
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch =
        search === '' ||
        loc.includes(search) ||
        (r.eventType || '').toLowerCase().includes(search) ||
        desc.includes(search) ||
        id.includes(search) ||
        (r.reporterName || '').toLowerCase().includes(search);

      const matchesType =
        selectedEventType === 'All' || r.eventType === selectedEventType;

      const reportState = getReportState(r);
      const matchesState =
        selectedState === 'All' || reportState === selectedState;

      const matchesTime = passesTimeFilter(r);

      return matchesSearch && matchesType && matchesState && matchesTime;
    });
  }, [verifiedReports, searchQuery, selectedEventType, selectedState, passesTimeFilter]);

  // ─── Map-safe reports (must have valid lat/lng) ───────────────────────────
  const mappableReports = useMemo(
    () =>
      filteredReports.filter(
        (r) =>
          typeof r.latitude === 'number' &&
          typeof r.longitude === 'number' &&
          !isNaN(r.latitude) &&
          !isNaN(r.longitude)
      ),
    [filteredReports]
  );

  // ─── Real statistics (100% from Firestore data) ──────────────────────────
  const stats = useMemo(() => {
    const total = allReports.length;
    const verified = verifiedReports.length;
    const today = allReports.filter((r) => r.dateObj && isToday(r.dateObj)).length;

    const locationSet = new Set();
    verifiedReports.forEach((r) => {
      if (r.latitude && r.longitude) {
        locationSet.add(`${r.latitude.toFixed(2)},${r.longitude.toFixed(2)}`);
      }
    });

    const counts = {};
    allReports.forEach((r) => {
      if (r.eventType) counts[r.eventType] = (counts[r.eventType] || 0) + 1;
    });
    let mostReported = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostReported = type;
      }
    });

    return { total, verified, today, activeLocations: locationSet.size, mostReported };
  }, [allReports, verifiedReports]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSelectReport = (report) => {
    setSelectedReport(report);
    if (report.latitude && report.longitude) {
      setMapCenter([report.latitude, report.longitude]);
      setMapZoom(10);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedEventType('All');
    setSelectedState('All');
    setSelectedTimeRange('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedEventType !== 'All' ||
    selectedState !== 'All' ||
    selectedTimeRange !== 'all';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full px-4 md:px-margin-desktop py-6 max-w-container-max mx-auto flex flex-col gap-6">

      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-primary">
              Live Weather Dashboard
            </h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Real-time citizen-reported weather events across regions. Only verified reports are shown publicly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionBadge status={connectionStatus} lastUpdated={lastUpdated} />
          <Link
            to="/report"
            className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded hover:bg-primary-container transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Submit Report
          </Link>
        </div>
      </header>

      {/* ERROR BANNER */}
      {firestoreError && (
        <div className="bg-error/10 border border-error text-error p-3 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>Connection error: {firestoreError}</span>
        </div>
      )}

      {/* 2. STATISTICS — 100% from Firestore, no fake numbers */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-surface border border-outline-variant rounded flex flex-col">
          <div className="bg-surface-container-lowest px-4 py-2.5 border-b border-outline-variant rounded-t">
            <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Live Reports</h3>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-primary">
              {loading ? '—' : stats.total}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">Total in DB</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded flex flex-col">
          <div className="bg-surface-container-lowest px-4 py-2.5 border-b border-outline-variant rounded-t">
            <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Verified Events</h3>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-secondary">
              {loading ? '—' : stats.verified}
            </span>
            <span className="font-body-sm text-xs text-secondary font-semibold">Public</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded flex flex-col">
          <div className="bg-surface-container-lowest px-4 py-2.5 border-b border-outline-variant rounded-t">
            <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Reports Today</h3>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-primary">
              {loading ? '—' : stats.today}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">Since 00:00</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded flex flex-col">
          <div className="bg-surface-container-lowest px-4 py-2.5 border-b border-outline-variant rounded-t">
            <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Active Locations</h3>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-primary">
              {loading ? '—' : stats.activeLocations}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">Unique coords</span>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant rounded flex flex-col col-span-2 lg:col-span-1">
          <div className="bg-surface-container-lowest px-4 py-2.5 border-b border-outline-variant rounded-t">
            <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Top Event</h3>
          </div>
          <div className="p-4 flex items-center justify-between">
            {loading ? (
              <span className="font-mono-md text-sm text-outline">—</span>
            ) : stats.mostReported ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getEventMarkerColor(stats.mostReported)}20`, color: getEventMarkerColor(stats.mostReported) }}
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {getEventIcon(stats.mostReported)}
                  </span>
                </div>
                <span className="font-headline-sm text-sm text-primary font-bold">{stats.mostReported}</span>
              </div>
            ) : (
              <span className="font-body-sm text-xs text-outline">No data</span>
            )}
          </div>
        </div>
      </section>

      {/* 3. FILTER BAR + VIEW TOGGLE */}
      <section className="bg-surface border border-outline-variant rounded p-3 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-2 flex-grow items-center">
          {/* Search */}
          <div className="relative flex-grow min-w-[180px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, event, description..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Event Type */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="py-2 px-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">Event: All</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="py-2 px-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">State: All</option>
            {uniqueStates.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Time Range */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="py-2 px-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {TIME_RANGES.map((tr) => (
              <option key={tr.value} value={tr.value}>{tr.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="py-2 px-3 bg-surface-container text-primary hover:bg-surface-variant rounded font-body-sm text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">close</span>
              Clear
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded p-1 self-end lg:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded font-label-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${activeTab === 'map' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded font-label-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${activeTab === 'table' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-sm">table_rows</span>
            Table
          </button>
        </div>
      </section>

      {/* 4. LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <span className="font-body-md text-sm">Connecting to Live Stream...</span>
        </div>
      )}

      {/* 5. MAP VIEW */}
      {!loading && activeTab === 'map' && (
        <section className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Map */}
          <div className="w-full lg:w-[65%] bg-surface border border-outline-variant rounded relative flex flex-col overflow-hidden h-[560px] shadow-sm">
            <div className="bg-surface-container-lowest px-4 py-2.5 border-b border-outline-variant flex justify-between items-center z-10 shrink-0">
              <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">public</span>
                Geospatial Overview — {mappableReports.length} verified report{mappableReports.length !== 1 ? 's' : ''} mapped
              </h2>
              <button
                onClick={() => { setMapCenter([22.5, 79.5]); setMapZoom(5); }}
                className="font-mono-md text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">center_focus_strong</span>
                Reset View
              </button>
            </div>

            <div className="flex-grow relative z-0">
              <MapContainer
                center={[22.5, 79.5]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                <MapViewController center={mapCenter} zoom={mapZoom} />
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {mappableReports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={createCustomMarkerIcon(report.eventType)}
                  >
                    <Popup className="weatherwatch-map-popup">
                      <div className="p-1 min-w-[210px] flex flex-col gap-2 font-sans">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                          <span className="font-bold text-sm" style={{ color: getEventMarkerColor(report.eventType) }}>
                            {report.eventType}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${getStatusBadgeStyle(report.status)}`}>
                            {report.status}
                          </span>
                        </div>

                        <div className="font-medium text-xs text-gray-800 font-semibold">{getPrimaryLocationDisplay(report)}</div>

                        {report.latitude && report.longitude && (
                          <div className="font-mono text-[10px] text-gray-500">
                            {report.latitude.toFixed(4)}°N, {report.longitude.toFixed(4)}°E
                          </div>
                        )}

                        {report.description && (
                          <div className="text-[11px] text-gray-600 line-clamp-2">{report.description}</div>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                          <span>{report.dateObj ? relativeTime(report.dateObj) : 'Recently'}</span>
                          {report.confidence && <span>Conf: {report.confidence}</span>}
                        </div>

                        <button
                          onClick={() => handleSelectReport(report)}
                          className="w-full text-white text-xs py-1.5 rounded transition-colors text-center font-semibold"
                          style={{ backgroundColor: getEventMarkerColor(report.eventType) }}
                        >
                          View Full Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-surface/95 border border-outline-variant rounded p-2.5 shadow-md backdrop-blur-sm z-[400]">
              <h4 className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-1.5 font-bold">Legend</h4>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-body-sm text-xs">
                {[
                  ['Heavy Rain', '#1960a3'],
                  ['Flood', '#002045'],
                  ['Thunderstorm', '#6b21a8'],
                  ['Heatwave', '#ba1a1a'],
                  ['Fog', '#74777f'],
                  ['Dust Storm', '#c6955e'],
                  ['Strong Wind', '#0d9488'],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="truncate text-[10px]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty map overlay */}
            {mappableReports.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center z-[300] pointer-events-none">
                <div className="bg-surface/90 backdrop-blur-sm border border-outline-variant rounded-lg p-6 text-center shadow-lg pointer-events-auto max-w-xs">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2 block">location_off</span>
                  <p className="font-headline-sm text-sm text-primary font-bold mb-1">No mapped reports</p>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    {hasActiveFilters ? 'No verified reports match the current filters.' : 'No verified reports with coordinates yet.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Live Feed Panel */}
          <div className="w-full lg:w-[35%] bg-surface border border-outline-variant rounded flex flex-col h-[560px] shadow-sm overflow-hidden">
            <div className="bg-surface-container-lowest px-4 py-3 border-b border-outline-variant flex justify-between items-center shrink-0">
              <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Live Verified Feed
              </h2>
              <span className="font-mono-md text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
                {filteredReports.length} items
              </span>
            </div>

            <div className="flex-grow overflow-y-auto divide-y divide-outline-variant">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant flex flex-col items-center justify-center h-full">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">filter_alt_off</span>
                  <p className="font-headline-sm text-sm text-primary mb-1">No verified reports</p>
                  <p className="font-body-sm text-xs text-on-surface-variant mb-3">
                    {hasActiveFilters
                      ? 'No results match the current filters.'
                      : 'Submit a report and have it verified to see it here.'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={handleResetFilters} className="text-xs text-secondary underline">
                      Reset all filters
                    </button>
                  )}
                </div>
              ) : (
                filteredReports.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectReport(item)}
                    className={`p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 items-start group ${newReportId === item.id ? 'bg-secondary/5 ring-1 ring-inset ring-secondary/30' : ''}`}
                  >
                    <div
                      className="w-9 h-9 rounded flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${getEventMarkerColor(item.eventType)}18`,
                        color: getEventMarkerColor(item.eventType)
                      }}
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {getEventIcon(item.eventType)}
                      </span>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-headline-sm text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                          {item.eventType}
                          {newReportId === item.id && (
                            <span className="ml-2 text-[10px] bg-secondary text-on-primary px-1.5 py-0.5 rounded font-bold">NEW</span>
                          )}
                        </h4>
                        <span className="font-mono-md text-[11px] text-outline shrink-0">
                          {item.dateObj ? relativeTime(item.dateObj) : '—'}
                        </span>
                      </div>

                      <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 truncate font-medium">
                        <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                        {getPrimaryLocationDisplay(item)}
                      </p>

                      {item.latitude && item.longitude && (
                        <p className="font-mono-md text-[10px] text-outline mt-0.5">
                          {item.latitude.toFixed(4)}°N, {item.longitude.toFixed(4)}°E
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-md text-[10px] font-semibold border ${getStatusBadgeStyle(item.status)}`}>
                          <span className="material-symbols-outlined text-[11px]">verified</span>
                          {item.status}
                        </span>
                        {item.confidence && (
                          <span className="font-mono-md text-[11px] text-outline">
                            Conf: {item.confidence}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* 6. TABLE VIEW */}
      {!loading && activeTab === 'table' && (
        <section className="bg-surface border border-outline-variant rounded overflow-hidden shadow-sm">
          <div className="bg-surface-container-lowest px-4 py-3 border-b border-outline-variant flex justify-between items-center">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Verified Reports — {filteredReports.length} {hasActiveFilters ? 'filtered' : 'total'}
            </h2>
            <span className="font-mono-md text-xs text-outline flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Live Updates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low font-label-md text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Coordinates</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-sm text-on-surface divide-y divide-outline-variant">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
                        <p className="font-headline-sm text-sm text-primary font-bold">No verified reports</p>
                        <p className="font-body-sm text-xs">
                          {hasActiveFilters ? 'No results for current filters.' : 'No verified reports available yet.'}
                        </p>
                        {hasActiveFilters && (
                          <button onClick={handleResetFilters} className="text-xs text-secondary underline mt-1">
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-container-low transition-colors ${newReportId === item.id ? 'bg-secondary/5' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getEventMarkerColor(item.eventType) }} />
                          {item.eventType}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[160px] truncate font-medium" title={getPrimaryLocationDisplay(item)}>{getPrimaryLocationDisplay(item)}</td>
                      <td className="py-3 px-4 font-mono-md text-xs text-outline">
                        {item.latitude && item.longitude
                          ? `${item.latitude.toFixed(3)}°N, ${item.longitude.toFixed(3)}°E`
                          : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono-md text-xs text-outline whitespace-nowrap">
                        {item.dateObj ? relativeTime(item.dateObj) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-label-md text-[10px] font-semibold border ${getStatusBadgeStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-on-surface-variant">{item.reporterName || 'Anonymous'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleSelectReport(item)}
                          className="text-primary hover:underline font-semibold text-xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 7. REPORT DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-outline-variant rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-surface-container-lowest px-5 py-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getEventMarkerColor(selectedReport.eventType) }} />
                <h3 className="font-headline-md text-base font-bold text-primary">
                  {selectedReport.eventType} — Full Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              {selectedReport.photoPreview && (
                <div className="w-full h-44 rounded border border-outline-variant overflow-hidden bg-surface-container">
                  <img src={selectedReport.photoPreview} alt={selectedReport.eventType} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-container-low p-3 rounded border border-outline-variant font-mono-md text-xs">
                <div>
                  <span className="text-outline uppercase text-[10px] mr-1">ID:</span>
                  <span className="font-bold text-primary">{selectedReport.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-semibold border ${getStatusBadgeStyle(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                  {selectedReport.confidence && (
                    <span className="text-on-surface">Conf: {selectedReport.confidence}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-xs text-outline uppercase tracking-wider">Location & Coordinates</span>
                <p className="font-body-md text-sm text-on-surface font-medium">{getPrimaryLocationDisplay(selectedReport)}</p>
                {selectedReport.latitude && selectedReport.longitude && (
                  <p className="font-mono-md text-xs text-outline">
                    LAT: {selectedReport.latitude.toFixed(4)}°N · LNG: {selectedReport.longitude.toFixed(4)}°E
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-xs text-outline uppercase tracking-wider">Event Type</span>
                <p className="font-headline-sm text-sm font-semibold text-primary">{selectedReport.eventType}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-xs text-outline uppercase tracking-wider">Description</span>
                <p className="font-body-md text-sm text-on-surface bg-surface-container-low p-3 rounded border border-outline-variant">
                  {selectedReport.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-outline pt-2 border-t border-outline-variant font-mono-md">
                <span>Reporter: {selectedReport.reporterName || 'Anonymous'}</span>
                <span>{selectedReport.dateObj ? relativeTime(selectedReport.dateObj) : '—'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-surface-container-lowest p-4 border-t border-outline-variant flex justify-end gap-3">
              {selectedReport.latitude && selectedReport.longitude && (
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setActiveTab('map');
                    setMapCenter([selectedReport.latitude, selectedReport.longitude]);
                    setMapZoom(12);
                  }}
                  className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Focus on Map
                </button>
              )}
              <button
                onClick={() => setSelectedReport(null)}
                className="border border-outline-variant text-on-surface px-4 py-2 rounded font-label-md text-xs font-semibold hover:bg-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
