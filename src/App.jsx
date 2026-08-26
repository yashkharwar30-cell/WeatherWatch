import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
      </Route>
    </Routes>
  );
}
