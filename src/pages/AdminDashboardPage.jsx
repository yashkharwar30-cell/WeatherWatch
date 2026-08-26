import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, clearAdminAuth, getAdminUser } from '../utils/authStore';
import { getStoredReports } from '../utils/reportsStore';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);

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

  return (
    <div className="w-full px-4 md:px-margin-desktop py-8 max-w-container-max mx-auto flex flex-col gap-6">
      {/* Admin Operations Command Header */}
      <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-headline-md text-primary font-bold">
                Operations Center | Report Verification
              </h1>
              <span className="bg-secondary/15 text-secondary px-2 py-0.5 rounded font-mono-md text-xs font-semibold">
                ADMIN ACCESS
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Authenticated Operator: <code className="font-mono-md font-bold text-primary">{user?.email || 'admin@weatherwatch.demo'}</code>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="bg-transparent border border-error text-error hover:bg-error/10 font-label-md text-xs font-semibold py-2.5 px-4 rounded transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sign Out Operator
        </button>
      </div>

      {/* Admin Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-outline-variant p-4 rounded flex justify-between items-center">
          <div>
            <span className="font-label-md text-xs text-on-surface-variant uppercase">Pending Triage Queue</span>
            <div className="font-mono-md text-2xl font-bold text-primary mt-1">
              {reports.filter(r => r.status === 'Pending').length} Reports
            </div>
          </div>
          <span className="material-symbols-outlined text-3xl text-outline">pending_actions</span>
        </div>

        <div className="bg-surface border border-outline-variant p-4 rounded flex justify-between items-center">
          <div>
            <span className="font-label-md text-xs text-on-surface-variant uppercase">Verified Local Submissions</span>
            <div className="font-mono-md text-2xl font-bold text-secondary mt-1">
              {reports.filter(r => r.status === 'Verified').length} Reports
            </div>
          </div>
          <span className="material-symbols-outlined text-3xl text-secondary">verified</span>
        </div>

        <div className="bg-surface border border-outline-variant p-4 rounded flex justify-between items-center">
          <div>
            <span className="font-label-md text-xs text-on-surface-variant uppercase">System Security Protocol</span>
            <div className="font-mono-md text-sm font-semibold text-on-surface mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Active Session
            </div>
          </div>
          <span className="material-symbols-outlined text-3xl text-outline">lock</span>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
        <div className="bg-surface-container-lowest px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h2 className="font-headline-sm text-sm text-primary font-bold uppercase tracking-wider">
            Verification & Triage Stream ({reports.length} Entries)
          </h2>
          <span className="font-mono-md text-xs text-outline">Sorted by Latest Submission</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-label-md text-xs text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-sm text-on-surface divide-y divide-outline-variant">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-mono-md text-xs font-bold text-primary">{r.id}</td>
                  <td className="py-3 px-4 font-medium">{r.eventType}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{r.location}</td>
                  <td className="py-3 px-4 text-outline">{r.reporterName || 'Anonymous'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-label-md text-[10px] font-semibold border ${
                      r.status === 'Verified' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-outline/10 text-outline border-outline/20'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Reviewing report ${r.id}: ${r.description}`)}
                      className="bg-surface-container border border-outline-variant text-primary hover:bg-primary hover:text-on-primary font-label-md text-xs py-1 px-3 rounded transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
