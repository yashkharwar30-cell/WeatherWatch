import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, clearAdminAuth, getAdminUser } from '../utils/authStore';
import {
  getStoredReports,
  updateReportStatus,
  getEventMarkerColor,
  getStatusBadgeStyle,
  getAICategory
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

const STATUS_OPTIONS = ['Pending', 'Verified', 'Rejected', 'Duplicate'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Report for Details Modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Check auth & load reports
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login', { replace: true });
    } else {
      setUser(getAdminUser());
      setReports(getStoredReports());
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAdminAuth();
    navigate('/admin/login', { replace: true });
  };

  // Status Triage Handler
  const handleUpdateStatus = (reportId, newStatus) => {
    const updatedList = updateReportStatus(reportId, newStatus);
    setReports(updatedList);

    // If modal is currently showing this report, update its state
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesType = eventTypeFilter === 'All' || r.eventType === eventTypeFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.reporterName && r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [reports, statusFilter, eventTypeFilter, searchQuery]);

  // Dynamic Summary Metrics
  const metrics = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'Pending').length;
    const verified = reports.filter((r) => r.status === 'Verified').length;
    const rejected = reports.filter((r) => r.status === 'Rejected' || r.status === 'Duplicate').length;

    return { total, pending, verified, rejected };
  }, [reports]);

  const hasActiveFilters = statusFilter !== 'All' || eventTypeFilter !== 'All' || searchQuery !== '';

  return (
    <div className="w-full px-4 md:px-margin-desktop py-6 max-w-container-max mx-auto flex flex-col gap-6">
      
      {/* 1. ADMIN HEADER */}
      <header className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-md text-headline-md text-primary font-bold">
                Operations Overview
              </h1>
              <span className="text-on-surface-variant font-headline-md text-headline-md">/</span>
              <span className="font-headline-sm text-lg text-on-surface">Admin Dashboard</span>
              <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded font-mono-md text-xs font-semibold border border-secondary/20">
                SECURE OPERATOR
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Operator Identity: <code className="font-mono-md font-bold text-primary">{user?.email || 'admin@weatherwatch.demo'}</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-transparent border border-error text-error hover:bg-error/10 font-label-md text-xs font-semibold py-2.5 px-4 rounded transition-colors flex items-center gap-2 self-start md:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sign Out Operator
        </button>
      </header>

      {/* 2. DYNAMIC SUMMARY CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-surface border border-outline-variant rounded flex flex-col shadow-sm">
          <div className="bg-surface-container-low px-4 py-2.5 border-b border-outline-variant rounded-t flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Reports
            </h2>
            <span className="material-symbols-outlined text-outline text-sm">analytics</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-primary">
              {metrics.total}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant font-medium">
              Registered in Store
            </span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-surface border border-outline-variant rounded flex flex-col shadow-sm">
          <div className="bg-surface-container-low px-4 py-2.5 border-b border-outline-variant rounded-t flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Pending Review
            </h2>
            <span className="material-symbols-outlined text-outline text-sm">pending_actions</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-tertiary-container">
              {metrics.pending}
            </span>
            <span className="font-body-sm text-xs text-tertiary-container font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping" />
              Needs Triage
            </span>
          </div>
        </div>

        {/* Verified */}
        <div className="bg-surface border border-outline-variant rounded flex flex-col shadow-sm">
          <div className="bg-surface-container-low px-4 py-2.5 border-b border-outline-variant rounded-t flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Verified
            </h2>
            <span className="material-symbols-outlined text-secondary text-sm">verified</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-secondary">
              {metrics.verified}
            </span>
            <span className="font-body-sm text-xs text-secondary font-semibold">
              Public Live Stream
            </span>
          </div>
        </div>

        {/* Rejected / Duplicate */}
        <div className="bg-surface border border-outline-variant rounded flex flex-col shadow-sm">
          <div className="bg-surface-container-low px-4 py-2.5 border-b border-outline-variant rounded-t flex items-center justify-between">
            <h2 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Flagged / Rejected
            </h2>
            <span className="material-symbols-outlined text-error text-sm">block</span>
          </div>
          <div className="p-4 flex items-end justify-between">
            <span className="font-mono-md text-3xl font-bold text-error">
              {metrics.rejected}
            </span>
            <span className="font-body-sm text-xs text-on-surface-variant">
              Filtered Submissions
            </span>
          </div>
        </div>
      </section>

      {/* 3. FILTER CONTROLS */}
      <section className="bg-surface border border-outline-variant rounded p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-2 flex-grow items-center">
          {/* Search Input */}
          <div className="relative flex-grow min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, location, description..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              Reset Filters
            </button>
          )}
        </div>

        <div className="font-mono-md text-xs text-outline self-end sm:self-auto shrink-0">
          Showing {filteredReports.length} of {reports.length} Reports
        </div>
      </section>

      {/* 4. REPORT REVIEW TABLE */}
      <section className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="bg-surface-container-lowest px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
            <h2 className="font-headline-sm text-sm text-primary font-bold uppercase tracking-wider">
              Citizen Reports Triage Queue
            </h2>
          </div>
          <span className="font-mono-md text-xs text-outline">Real-time Local Storage Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-md text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                <th className="py-3 px-4">Attachment</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Category</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-center">Actions / Triage</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-sm text-on-surface divide-y divide-outline-variant">
              {filteredReports.length === 0 ? (
                /* 8. EMPTY STATE */
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <span className="material-symbols-outlined text-5xl text-outline mb-3">
                        find_in_page
                      </span>
                      <h3 className="font-headline-sm text-base text-primary font-bold mb-1">
                        No Matching Reports
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant mb-4">
                        There are currently no report entries that match the selected search or filter criteria.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={() => {
                            setStatusFilter('All');
                            setEventTypeFilter('All');
                            setSearchQuery('');
                          }}
                          className="bg-primary text-on-primary font-label-md text-xs px-4 py-2 rounded hover:bg-primary-container transition-colors"
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
                  const aiCat = getAICategory(report.eventType);

                  return (
                    <tr key={report.id} className="hover:bg-surface-container-low transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        {report.photoPreview ? (
                          <div
                            onClick={() => setSelectedReport(report)}
                            className="w-12 h-12 rounded border border-outline-variant overflow-hidden bg-surface-container cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={report.photoPreview}
                              alt={report.eventType}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedReport(report)}
                            className="w-12 h-12 rounded border border-outline-variant bg-surface-container flex items-center justify-center text-outline cursor-pointer hover:bg-surface-variant transition-colors"
                            title="No photo attached"
                          >
                            <span className="material-symbols-outlined text-lg">image</span>
                          </div>
                        )}
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4 font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <div>
                            <div>{report.eventType}</div>
                            <div className="font-mono-md text-[10px] text-outline font-normal">
                              {report.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="font-medium">{report.location}</div>
                        <div className="font-mono-md text-[10px] text-outline">
                          {report.state || 'India'}
                        </div>
                      </td>

                      {/* Submitted */}
                      <td className="py-3 px-4 font-mono-md text-xs text-outline whitespace-nowrap">
                        {report.createdAt || report.date}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded font-label-md text-[11px] font-semibold border ${getStatusBadgeStyle(report.status)}`}>
                          {report.status}
                        </span>
                      </td>

                      {/* AI Category */}
                      <td className="py-3 px-4">
                        <span className="bg-surface-container-high text-on-surface px-2 py-0.5 rounded font-mono-md text-xs">
                          {aiCat}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3 px-4 font-mono-md text-xs font-semibold text-primary">
                        {report.confidence || '88.0%'}
                      </td>

                      {/* Admin Actions (Verify, Reject, Mark Duplicate, Details) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {report.status !== 'Verified' && (
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'Verified')}
                              className="bg-primary text-on-primary font-label-md text-[11px] px-2.5 py-1 rounded hover:bg-primary-container transition-colors shadow-sm"
                              title="Approve & Verify report"
                            >
                              Verify
                            </button>
                          )}

                          {report.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'Rejected')}
                              className="bg-transparent border border-error text-error hover:bg-error/10 font-label-md text-[11px] px-2.5 py-1 rounded transition-colors"
                              title="Reject report"
                            >
                              Reject
                            </button>
                          )}

                          {report.status !== 'Duplicate' && (
                            <button
                              onClick={() => handleUpdateStatus(report.id, 'Duplicate')}
                              className="bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-variant font-label-md text-[11px] px-2 py-1 rounded transition-colors"
                              title="Mark as duplicate entry"
                            >
                              Duplicate
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-primary hover:underline font-label-md text-[11px] px-1.5 py-1 font-semibold"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. REPORT DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-on-surface/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-surface border border-outline-variant rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-surface-container-lowest px-5 py-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getEventMarkerColor(selectedReport.eventType) }}
                />
                <h3 className="font-headline-md text-base font-bold text-primary">
                  Admin Inspection | {selectedReport.id}
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

              {/* Status and Confidence */}
              <div className="flex items-center justify-between bg-surface-container-low p-3 rounded border border-outline-variant font-mono-md text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-outline uppercase text-[10px]">Status:</span>
                  <span className={`px-2 py-0.5 rounded font-semibold border ${getStatusBadgeStyle(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-outline uppercase text-[10px]">AI Conf:</span>
                  <span className="font-bold text-primary">{selectedReport.confidence || '88.5%'}</span>
                </div>
              </div>

              {/* Event & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Event Type</span>
                  <span className="font-headline-sm text-sm font-semibold text-primary">{selectedReport.eventType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">AI Category</span>
                  <span className="font-body-sm text-sm text-on-surface">{getAICategory(selectedReport.eventType)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Location</span>
                <span className="font-body-md text-sm text-on-surface font-medium">{selectedReport.location}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-label-md text-[10px] text-outline uppercase tracking-wider">Description</span>
                <p className="font-body-md text-xs text-on-surface bg-surface-container-low p-3 rounded border border-outline-variant">
                  {selectedReport.description}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-outline pt-2 border-t border-outline-variant font-mono-md">
                <span>Reporter: {selectedReport.reporterName || 'Anonymous'}</span>
                <span>{selectedReport.date || selectedReport.createdAt}</span>
              </div>
            </div>

            {/* Modal Quick Actions */}
            <div className="bg-surface-container-lowest p-4 border-t border-outline-variant flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'Verified')}
                  className="bg-primary text-on-primary font-label-md text-xs px-3 py-1.5 rounded hover:bg-primary-container transition-colors"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'Rejected')}
                  className="bg-transparent border border-error text-error hover:bg-error/10 font-label-md text-xs px-3 py-1.5 rounded transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'Duplicate')}
                  className="bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-variant font-label-md text-xs px-3 py-1.5 rounded transition-colors"
                >
                  Duplicate
                </button>
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
