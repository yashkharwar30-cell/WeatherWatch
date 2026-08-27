import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { isAdminAuthenticated, clearAdminAuth, getAdminUser } from '../utils/authStore';
import {
  getEventMarkerColor,
  getStatusBadgeStyle,
  getAICategory,
  getReportState,
  getPrimaryLocationDisplay
} from '../utils/reportsStore';

const EVENT_TYPES = [
  'Heavy Rain',
  'Flood',
  'Thunderstorm',
  'Heatwave',
  'Fog',
  'Dust Storm',
  'Strong Wind'
];

const STATUS_OPTIONS = ['Pending', 'Verified', 'Rejected'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Report for Details Modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Check auth & subscribe to Firestore reports
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    setUser(getAdminUser());
    setLoading(true);
    setError(null);

    const reportsCollection = collection(db, 'reports');
    const unsubscribe = onSnapshot(
      reportsCollection,
      (snapshot) => {
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const docId = docSnap.id;

          let formattedCreatedAt = 'Just now';
          let timestampVal = 0;

          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            const dateObj = data.createdAt.toDate();
            formattedCreatedAt =
              dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) +
              ' at ' +
              dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timestampVal = dateObj.getTime();
          } else if (data.date || data.timestamp) {
            formattedCreatedAt = `${data.date || ''} ${data.timestamp || ''}`.trim();
          }

          const rawStatus = data.status || 'pending';
          const displayStatus =
            rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          return {
            id: docId,
            ...data,
            status: displayStatus,
            rawStatus: rawStatus,
            createdAtFormatted: formattedCreatedAt,
            createdAtTimestamp: timestampVal
          };
        });

        // Show reports with status pending first, then newest
        fetched.sort((a, b) => {
          const aPending = a.status.toLowerCase() === 'pending' ? 0 : 1;
          const bPending = b.status.toLowerCase() === 'pending' ? 0 : 1;
          if (aPending !== bPending) return aPending - bPending;
          return b.createdAtTimestamp - a.createdAtTimestamp;
        });

        console.log('[AdminDashboard] Firestore snapshot received. Document count:', fetched.length);

        setReports(fetched);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching reports from Firestore:', err);
        setError(`Failed to load reports. Please try again. (${err.message})`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    clearAdminAuth();
    navigate('/admin/login', { replace: true });
  };

  // Status Triage Handler - Updates Firestore document directly
  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setUpdatingId(reportId);
      setError(null);
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus
      });

      if (selectedReport && selectedReport.id === reportId) {
        const displayStatus =
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
        setSelectedReport((prev) => (prev ? { ...prev, status: displayStatus, rawStatus: newStatus } : null));
      }
    } catch (err) {
      console.error('Error updating report status in Firestore:', err);
      setError(`Failed to update status for ${reportId}: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered reports calculation (search matches ID, Event Type, Location, Description, Reporter)
  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesStatus =
        statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = eventTypeFilter === 'All' || r.eventType === eventTypeFilter;
      const matchesSearch =
        q === '' ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.eventType && r.eventType.toLowerCase().includes(q)) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.reporterName && r.reporterName.toLowerCase().includes(q));

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [reports, statusFilter, eventTypeFilter, searchQuery]);

  // Dynamic Summary Metrics calculated from actual reports
  const metrics = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status.toLowerCase() === 'pending').length;
    const verified = reports.filter((r) => r.status.toLowerCase() === 'verified').length;
    const rejected = reports.filter(
      (r) => r.status.toLowerCase() === 'rejected' || r.status.toLowerCase() === 'duplicate'
    ).length;

    return { total, pending, verified, rejected };
  }, [reports]);

  const hasActiveFilters = statusFilter !== 'All' || eventTypeFilter !== 'All' || searchQuery !== '';

  return (
    <div className="w-full px-4 md:px-margin-desktop py-6 max-w-container-max mx-auto flex flex-col gap-6">
      
      {/* 1. ADMIN HEADER */}
      <header className="bg-surface-container-lowest border border-outline-variant p-5 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
                Operations Overview
              </h1>
              <span className="text-outline font-headline-md text-headline-md">/</span>
              <span className="font-headline-sm text-base text-on-surface font-semibold">Admin Triage</span>
              <span className="bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-mono-md text-[11px] font-bold border border-secondary/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Signed in as: <code className="font-mono-md font-semibold text-primary">{user?.email || 'admin@weatherwatch.demo'}</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-transparent border border-error/40 text-error hover:bg-error/10 font-label-md text-xs font-semibold py-2 px-3.5 rounded transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Sign Out
        </button>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error p-3.5 rounded-lg flex items-center justify-between gap-3 text-sm font-body-md shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span className="text-xs font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-error font-semibold hover:underline text-xs shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. DYNAMIC SUMMARY CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-surface border border-outline-variant rounded-lg flex flex-col shadow-sm">
          <div className="bg-surface-container-lowest px-4 py-2 border-b border-outline-variant rounded-t-lg flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Reports
            </h2>
            <span className="material-symbols-outlined text-outline text-base">analytics</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-primary">
              {metrics.total}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              Live Data
            </span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-surface border border-outline-variant rounded-lg flex flex-col shadow-sm">
          <div className="bg-surface-container-lowest px-4 py-2 border-b border-outline-variant rounded-t-lg flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Pending Review
            </h2>
            <span className="material-symbols-outlined text-tertiary-container text-base">pending_actions</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-tertiary-container">
              {metrics.pending}
            </span>
            <span className="font-body-sm text-xs text-tertiary-container font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping" />
              Needs Triage
            </span>
          </div>
        </div>

        {/* Verified */}
        <div className="bg-surface border border-outline-variant rounded-lg flex flex-col shadow-sm">
          <div className="bg-surface-container-lowest px-4 py-2 border-b border-outline-variant rounded-t-lg flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Verified
            </h2>
            <span className="material-symbols-outlined text-secondary text-base">verified</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-secondary">
              {metrics.verified}
            </span>
            <span className="font-body-sm text-xs text-secondary font-semibold">
              Public Stream
            </span>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-surface border border-outline-variant rounded-lg flex flex-col shadow-sm">
          <div className="bg-surface-container-lowest px-4 py-2 border-b border-outline-variant rounded-t-lg flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Rejected
            </h2>
            <span className="material-symbols-outlined text-error text-base">block</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-error">
              {metrics.rejected}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              Filtered Out
            </span>
          </div>
        </div>
      </section>

      {/* 3. FILTER CONTROLS */}
      <section className="bg-surface border border-outline-variant rounded-lg p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-2 flex-grow items-center">
          {/* Search Input */}
          <div className="relative flex-grow min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, event, location, description, reporter..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">Status: All</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="py-2 px-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">Event Type: All</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setEventTypeFilter('All');
                setSearchQuery('');
              }}
              className="py-2 px-3 bg-surface-container text-primary hover:bg-surface-variant rounded font-body-sm text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">close</span>
              Reset
            </button>
          )}
        </div>

        <div className="font-mono-md text-xs text-outline self-end sm:self-auto shrink-0">
          Showing {filteredReports.length} of {reports.length} Reports
        </div>
      </section>

      {/* 4. REPORT REVIEW TABLE */}
      <section className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="bg-surface-container-lowest px-5 py-3.5 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
            <h2 className="font-headline-sm text-sm text-primary font-bold uppercase tracking-wider">
              Citizen Reports Triage Queue
            </h2>
          </div>
          <span className="font-mono-md text-xs text-outline flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Live Updates
          </span>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin text-primary">
              progress_activity
            </span>
            <span className="font-body-md text-sm font-medium">Loading reports...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low font-label-md text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Created Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-sm text-on-surface divide-y divide-outline-variant">
                {filteredReports.length === 0 ? (
                  /* PROFESSIONAL EMPTY STATE */
                  <tr>
                    <td colSpan={8} className="py-14 px-4 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
                          <span className="material-symbols-outlined text-2xl">find_in_page</span>
                        </div>
                        <h3 className="font-headline-sm text-base text-primary font-bold mb-1">
                          No Reports Found
                        </h3>
                        <p className="font-body-sm text-xs text-on-surface-variant mb-4">
                          {hasActiveFilters
                            ? 'No reports match your current search or filter criteria.'
                            : 'There are currently no reports submitted yet.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={() => {
                              setStatusFilter('All');
                              setEventTypeFilter('All');
                              setSearchQuery('');
                            }}
                            className="bg-primary text-on-primary font-label-md text-xs px-4 py-2 rounded hover:bg-primary-container transition-colors shadow-sm"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const color = getEventMarkerColor(report.eventType);

                    return (
                      <tr key={report.id} className="hover:bg-surface-container-low transition-colors">
                        {/* Report ID */}
                        <td className="py-3 px-4 font-mono-md text-xs font-bold text-primary">
                          {report.id}
                        </td>

                        {/* Event Type */}
                        <td className="py-3 px-4 font-semibold text-primary">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span>{report.eventType}</span>
                          </div>
                        </td>

                        {/* Location / State */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-xs text-on-surface font-semibold">{getPrimaryLocationDisplay(report)}</div>
                          {report.latitude && report.longitude && (
                            <div className="font-mono-md text-[10px] text-outline">
                              {Math.abs(report.latitude).toFixed(4)}° N, {Math.abs(report.longitude).toFixed(4)}° E
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 max-w-xs truncate text-xs text-on-surface-variant" title={report.description}>
                          {report.description || 'No description provided'}
                        </td>

                        {/* Reporter Name */}
                        <td className="py-3 px-4 text-xs font-medium text-on-surface">
                          {report.reporterName || 'Anonymous Citizen'}
                        </td>

                        {/* Created Time */}
                        <td className="py-3 px-4 font-mono-md text-xs text-outline whitespace-nowrap">
                          {report.createdAtFormatted}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded font-label-md text-[11px] font-semibold border ${getStatusBadgeStyle(report.status)}`}>
                            {report.status}
                          </span>
                        </td>

                        {/* Actions (View, Verify, Reject) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="bg-surface-container border border-outline-variant text-primary hover:bg-surface-variant font-label-md text-[11px] px-2.5 py-1 rounded font-semibold transition-colors"
                              title="View full details"
                            >
                              View
                            </button>

                            {report.status.toLowerCase() !== 'verified' && (
                              <button
                                onClick={() => handleUpdateStatus(report.id, 'verified')}
                                disabled={updatingId === report.id}
                                className="bg-primary text-on-primary font-label-md text-[11px] px-2.5 py-1 rounded hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
                                title="Approve & verify report"
                              >
                                {updatingId === report.id ? 'Updating...' : 'Verify'}
                              </button>
                            )}

                            {report.status.toLowerCase() !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(report.id, 'rejected')}
                                disabled={updatingId === report.id}
                                className="bg-transparent border border-error text-error hover:bg-error/10 font-label-md text-[11px] px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                                title="Reject report"
                              >
                                {updatingId === report.id ? 'Updating...' : 'Reject'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. REPORT DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-outline-variant rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-surface-container-lowest px-5 py-3.5 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getEventMarkerColor(selectedReport.eventType) }}
                />
                <h3 className="font-headline-md text-base font-bold text-primary">
                  Report Details | {selectedReport.id}
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
                <div className="w-full h-48 rounded border border-outline-variant overflow-hidden bg-surface-container relative">
                  <img
                    src={selectedReport.photoPreview}
                    alt={selectedReport.eventType}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Status and Category */}
              <div className="flex items-center justify-between bg-surface-container-low p-3 rounded border border-outline-variant font-mono-md text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-outline uppercase text-[10px]">Status:</span>
                  <span className={`px-2 py-0.5 rounded font-semibold border ${getStatusBadgeStyle(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-outline uppercase text-[10px]">AI Category:</span>
                  <span className="font-bold text-primary">{getAICategory(selectedReport.eventType)}</span>
                </div>
              </div>

              {/* Event & Report ID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Event Type</span>
                  <span className="font-headline-sm text-sm font-semibold text-primary">{selectedReport.eventType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Report ID</span>
                  <span className="font-mono-md text-sm text-on-surface font-semibold">{selectedReport.id}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Location / State</span>
                <span className="font-body-md text-sm text-on-surface font-medium">{getPrimaryLocationDisplay(selectedReport)}</span>
                {selectedReport.latitude && selectedReport.longitude && (
                  <span className="font-mono-md text-xs text-outline">
                    {Math.abs(selectedReport.latitude).toFixed(4)}° N, {Math.abs(selectedReport.longitude).toFixed(4)}° E
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Description</span>
                <p className="font-body-md text-xs text-on-surface bg-surface-container-low p-3 rounded border border-outline-variant">
                  {selectedReport.description || 'No description provided'}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-outline pt-2 border-t border-outline-variant font-mono-md">
                <span>Reporter: {selectedReport.reporterName || 'Anonymous Citizen'}</span>
                <span>{selectedReport.createdAtFormatted}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-surface-container-lowest p-4 border-t border-outline-variant flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                {selectedReport.status.toLowerCase() !== 'verified' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'verified')}
                    disabled={updatingId === selectedReport.id}
                    className="bg-primary text-on-primary font-label-md text-xs px-3 py-1.5 rounded hover:bg-primary-container transition-colors disabled:opacity-50"
                  >
                    Verify
                  </button>
                )}
                {selectedReport.status.toLowerCase() !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                    disabled={updatingId === selectedReport.id}
                    className="bg-transparent border border-error text-error hover:bg-error/10 font-label-md text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="border border-outline-variant text-on-surface px-4 py-1.5 rounded font-label-md text-xs font-semibold hover:bg-surface-container transition-colors"
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
