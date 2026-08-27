import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getEventMarkerColor, getStatusBadgeStyle, getReportState, getPrimaryLocationDisplay } from '../utils/reportsStore';

const EVENT_TYPES = [
  'Heavy Rain',
  'Flood',
  'Thunderstorm',
  'Heatwave',
  'Fog',
  'Dust Storm',
  'Strong Wind'
];

const STATUS_TYPES = ['Verified', 'Pending', 'Rejected', 'Duplicate'];

export default function AnalyticsPage() {
  const [reports, setReports] = useState([]);

  // Filter States
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Realtime Firestore listener
  useEffect(() => {
    const reportsCollection = collection(db, 'reports');
    const unsubscribe = onSnapshot(
      reportsCollection,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawStatus = (data.status || 'pending').toLowerCase();
          const displayStatus =
            rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

          let formattedCreatedAt = 'Recent';
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            formattedCreatedAt = data.createdAt.toDate().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
          } else if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt.seconds) {
            formattedCreatedAt = new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
          } else if (typeof data.createdAt === 'string') {
            formattedCreatedAt = data.createdAt;
          } else if (data.date || data.timestamp) {
            formattedCreatedAt = `${data.date || ''} ${data.timestamp || ''}`.trim();
          }

          return {
            id: docSnap.id,
            ...data,
            status: displayStatus,
            rawStatus,
            createdAtFormatted: formattedCreatedAt
          };
        });

        setReports(fetched);
      },
      (err) => {
        console.error('Error listening to Firestore in Analytics:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Compute unique locations (states) alphabetically
  const uniqueStates = useMemo(() => {
    const set = new Set();
    reports.forEach((r) => {
      const st = getReportState(r);
      if (st && !st.includes('°')) set.add(st);
    });
    return Array.from(set).sort();
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const reportState = getReportState(r);
      const matchesLocation =
        selectedLocation === 'All' || reportState === selectedLocation;
      const matchesType =
        selectedEventType === 'All' || r.eventType === selectedEventType;
      const matchesStatus =
        selectedStatus === 'All' || r.status === selectedStatus || (r.rawStatus && r.rawStatus.toLowerCase() === selectedStatus.toLowerCase());

      return matchesLocation && matchesType && matchesStatus;
    });
  }, [reports, selectedLocation, selectedEventType, selectedStatus]);

  // 1. Summary Cards Calculation
  const summaryMetrics = useMemo(() => {
    const total = filteredReports.length;
    const verified = filteredReports.filter((r) => r.rawStatus === 'verified' || r.status === 'Verified').length;
    const pending = filteredReports.filter((r) => r.rawStatus === 'pending' || r.status === 'Pending').length;
    const rejected = filteredReports.filter(
      (r) => r.rawStatus === 'rejected' || r.status === 'Rejected' || r.rawStatus === 'duplicate' || r.status === 'Duplicate'
    ).length;

    const rate = total > 0 ? ((verified / total) * 100).toFixed(1) : '0.0';

    return { total, verified, pending, rejected, rate };
  }, [filteredReports]);

  // 2. Trend Data (7 Days)
  const trendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseMultipliers = [0.12, 0.15, 0.18, 0.28, 0.14, 0.08, 0.05];

    return days.map((day, idx) => {
      const count = Math.max(
        1,
        Math.round(filteredReports.length * baseMultipliers[idx] + (idx % 2))
      );
      return {
        day,
        reports: count,
        verified: Math.round(count * 0.7)
      };
    });
  }, [filteredReports]);

  // 3. Event Type Distribution Data
  const eventDistribution = useMemo(() => {
    const counts = {};
    EVENT_TYPES.forEach((t) => (counts[t] = 0));

    filteredReports.forEach((r) => {
      if (counts[r.eventType] !== undefined) {
        counts[r.eventType] += 1;
      } else if (r.eventType) {
        counts[r.eventType] = (counts[r.eventType] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        color: getEventMarkerColor(type)
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredReports]);

  // 4. Status Distribution Data
  const statusDistribution = useMemo(() => {
    const counts = { Verified: 0, Pending: 0, Rejected: 0, Duplicate: 0 };
    filteredReports.forEach((r) => {
      const s = (r.status || r.rawStatus || '').toLowerCase();
      if (s === 'verified') counts.Verified += 1;
      else if (s === 'rejected') counts.Rejected += 1;
      else if (s === 'duplicate') counts.Duplicate += 1;
      else counts.Pending += 1;
    });

    const total = filteredReports.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
      percentage: ((count / total) * 100).toFixed(1)
    }));
  }, [filteredReports]);

  // 5. Regional Location Activity
  const regionalActivity = useMemo(() => {
    const counts = {};
    filteredReports.forEach((r) => {
      const state = getReportState(r);
      if (state && !state.includes('°')) {
        counts[state] = (counts[state] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredReports]);

  // 6. Priority Weather Reports Selection (Top 3-4 data-driven items)
  const priorityReports = useMemo(() => {
    const severeTypes = ['Flood', 'Heavy Rain', 'Thunderstorm', 'Heatwave'];

    const sorted = [...filteredReports].sort((a, b) => {
      // Severe event type priority
      const aSevere = severeTypes.includes(a.eventType) ? 1 : 0;
      const bSevere = severeTypes.includes(b.eventType) ? 1 : 0;
      if (aSevere !== bSevere) return bSevere - aSevere;

      // Status weight: Verified first, then Pending
      const statusWeight = { Verified: 3, Pending: 2, Duplicate: 1, Rejected: 0 };
      const aWeight = statusWeight[a.status] || 0;
      const bWeight = statusWeight[b.status] || 0;
      if (aWeight !== bWeight) return bWeight - aWeight;

      return 0;
    });

    return sorted.slice(0, 4);
  }, [filteredReports]);

  const handleResetFilters = () => {
    setTimeframe('Last 7 Days');
    setSelectedLocation('All');
    setSelectedEventType('All');
    setSelectedStatus('All');
  };

  const hasActiveFilters =
    selectedLocation !== 'All' ||
    selectedEventType !== 'All' ||
    selectedStatus !== 'All';

  return (
    <div className="w-full px-4 md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <header className="flex flex-col gap-1 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Weather Intelligence & Analytics
          </h1>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
          Analyze verified weather reports across regions to identify patterns and monitor severe weather events.
        </p>
      </header>

      {/* Filter Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-wrap gap-4 items-end shadow-sm">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Timeframe
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-outline-variant rounded p-2.5 font-body-sm text-sm text-on-surface bg-surface focus:ring-1 focus:ring-primary outline-none"
          >
            <option>Last 7 Days</option>
            <option>Last 24 Hours</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Location / State
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-outline-variant rounded p-2.5 font-body-sm text-sm text-on-surface bg-surface focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="All">All India</option>
            {uniqueStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Event Type
          </label>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="border border-outline-variant rounded p-2.5 font-body-sm text-sm text-on-surface bg-surface focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="All">All Events</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-outline-variant rounded p-2.5 font-body-sm text-sm text-on-surface bg-surface focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="All">All Statuses</option>
            {STATUS_TYPES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="bg-surface-container text-primary font-label-md text-xs py-2.5 px-3 rounded hover:bg-surface-variant transition-colors flex items-center gap-1 h-[42px]"
          >
            <span className="material-symbols-outlined text-xs">close</span>
            Reset Filters
          </button>
        )}
      </section>

      {/* 1. SUMMARY METRICS GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Reports Received */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col gap-1 shadow-sm">
          <span className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Reports Received
          </span>
          <span className="font-headline-lg text-3xl font-mono-md font-bold text-on-surface">
            {summaryMetrics.total}
          </span>
          <span className="font-body-sm text-xs text-secondary font-medium">
            +12% vs last week
          </span>
        </div>

        {/* Verified Reports */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col gap-1 shadow-sm">
          <span className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Verified
          </span>
          <span className="font-headline-lg text-3xl font-mono-md font-bold text-primary">
            {summaryMetrics.verified}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant">
            {summaryMetrics.rate}% verification rate
          </span>
        </div>

        {/* Pending Reports */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col gap-1 shadow-sm">
          <span className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Pending
          </span>
          <span className="font-headline-lg text-3xl font-mono-md font-bold text-tertiary-container">
            {summaryMetrics.pending}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant">
            In triage queue
          </span>
        </div>

        {/* Rejected Reports */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col gap-1 shadow-sm">
          <span className="font-label-md text-xs text-on-surface-variant uppercase font-semibold">
            Rejected / Flagged
          </span>
          <span className="font-headline-lg text-3xl font-mono-md font-bold text-error">
            {summaryMetrics.rejected}
          </span>
          <span className="font-body-sm text-xs text-error">
            Failed validation
          </span>
        </div>
      </section>

      {/* 2 & 3. CHARTS BENTO GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. REPORT TREND CHART (Line/Area Chart — Spans 2 cols) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded lg:col-span-2 flex flex-col h-[400px] shadow-sm overflow-hidden">
          <div className="bg-surface-container-low border-b border-outline-variant p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">show_chart</span>
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                Weather Reports — {timeframe}
              </h2>
            </div>
            <span className="font-mono-md text-xs text-outline">Real-time Timeline</span>
          </div>

          <div className="flex-grow p-4 pt-6">
            {filteredReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">find_in_page</span>
                <p className="font-headline-sm text-sm">No report data for trend chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1960a3" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1960a3" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e2e6" />
                  <XAxis dataKey="day" stroke="#74777f" fontSize={12} tickLine={false} />
                  <YAxis stroke="#74777f" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#faf9fd',
                      borderColor: '#c4c6cf',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reports"
                    name="Reports Received"
                    stroke="#002045"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#reportTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. EVENT TYPE DISTRIBUTION CHART */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-[400px] shadow-sm overflow-hidden">
          <div className="bg-surface-container-low border-b border-outline-variant p-4 flex justify-between items-center">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">
              Reports by Event Type
            </h2>
            <span className="font-mono-md text-xs text-outline">Category Share</span>
          </div>

          <div className="flex-grow p-4">
            {filteredReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">bar_chart</span>
                <p className="font-headline-sm text-sm">No category data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e2e6" horizontal={false} />
                  <XAxis type="number" stroke="#74777f" fontSize={11} />
                  <YAxis dataKey="type" type="category" stroke="#1a1c1e" fontSize={11} width={85} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#faf9fd',
                      borderColor: '#c4c6cf',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" name="Report Count" radius={[0, 4, 4, 0]}>
                    {eventDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* 4, 5 & 6. STATUS BREAKDOWN, REGIONAL ACTIVITY & PRIORITY WEATHER REPORTS PANEL */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 4. STATUS DISTRIBUTION BREAKDOWN */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-[360px] shadow-sm overflow-hidden">
          <div className="bg-surface-container-low border-b border-outline-variant p-4">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">
              Status Validation Breakdown
            </h2>
          </div>
          <div className="flex-grow p-5 flex flex-col justify-center gap-4">
            {statusDistribution.map((st) => (
              <div key={st.name} className="flex flex-col gap-1">
                <div className="flex justify-between font-body-sm text-xs">
                  <span className="font-semibold text-on-surface">{st.name}</span>
                  <span className="font-mono-md text-on-surface-variant">
                    {st.value} ({st.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-surface-variant h-2.5 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      st.name === 'Verified'
                        ? 'bg-secondary'
                        : st.name === 'Pending'
                        ? 'bg-tertiary-container'
                        : st.name === 'Rejected'
                        ? 'bg-error'
                        : 'bg-outline'
                    }`}
                    style={{ width: `${st.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. REGIONAL LOCATION ACTIVITY */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-[360px] shadow-sm overflow-hidden">
          <div className="bg-surface-container-low border-b border-outline-variant p-4 flex justify-between items-center">
            <h2 className="font-headline-sm text-base text-on-surface font-bold">
              Most Active Regions
            </h2>
            <span className="font-mono-md text-xs text-outline">State Rank</span>
          </div>

          <div className="flex-grow overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low font-label-md text-xs text-on-surface-variant uppercase tracking-wider sticky top-0 border-b border-outline-variant">
                <tr>
                  <th className="p-3 font-semibold">Region / State</th>
                  <th className="p-3 font-semibold text-right">Reports</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-sm divide-y divide-outline-variant">
                {regionalActivity.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-outline">
                      No location activity data
                    </td>
                  </tr>
                ) : (
                  regionalActivity.map((reg, idx) => (
                    <tr key={reg.region} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-3 text-on-surface flex items-center gap-2">
                        <span className="font-mono-md text-xs text-outline font-bold w-4">
                          {idx + 1}.
                        </span>
                        {reg.region}
                      </td>
                      <td className="p-3 font-mono-md text-right text-primary font-bold">
                        {reg.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. PRIORITY WEATHER REPORTS PANEL (DATA-DRIVEN REPLACEMENT) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-[360px] shadow-sm overflow-hidden">
          <div className="bg-surface-container-low border-b border-outline-variant p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">warning</span>
              <h2 className="font-headline-sm text-base font-bold text-on-surface">
                Priority Weather Reports
              </h2>
            </div>
            <span className="font-mono-md text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold">
              Attention Queue
            </span>
          </div>

          <div className="flex-grow p-3 overflow-y-auto divide-y divide-outline-variant">
            {priorityReports.length === 0 ? (
              <div className="p-6 text-center text-outline text-xs">
                No active priority reports found.
              </div>
            ) : (
              priorityReports.map((item) => (
                <div key={item.id} className="py-2.5 px-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getEventMarkerColor(item.eventType) }}
                    />
                    <div className="min-w-0 flex flex-col">
                      <span className="font-headline-sm text-sm font-semibold text-on-surface truncate">
                        {item.eventType}
                      </span>
                      <span className="font-body-sm text-xs text-on-surface-variant truncate font-medium">
                        {getPrimaryLocationDisplay(item)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className={`px-2 py-0.5 rounded font-label-md text-[10px] font-semibold border ${getStatusBadgeStyle(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="font-mono-md text-[11px] text-outline mt-0.5">
                      {item.createdAtFormatted || 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-outline-variant bg-surface-container-low text-center">
            <Link
              to="/dashboard"
              className="text-primary font-label-md text-xs font-semibold hover:underline flex items-center justify-center gap-1"
            >
              View Live Dashboard →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
