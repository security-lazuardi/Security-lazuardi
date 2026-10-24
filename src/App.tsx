/**
 * Lazuardi Security Management System (LSMS)
 * Integrated School Security Operations Platform
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';

// Feature Views
import { DashboardView } from './features/dashboard/DashboardView';
import { VisitorManagementView } from './features/visitors/VisitorManagementView';
import { DailyReportView } from './features/daily-report/DailyReportView';
import { SecurityPatrolView } from './features/patrol/SecurityPatrolView';
import { IncidentManagementView } from './features/incidents/IncidentManagementView';
import { LostFoundView } from './features/items/LostFoundView';
import { ItemDepositsView } from './features/items/ItemDepositsView';
import { VehicleTrackingView } from './features/vehicles/VehicleTrackingView';
import { NotificationCenterView } from './features/notifications/NotificationCenterView';
import { ReportsExportView } from './features/reports/ReportsExportView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { MasterDataView } from './features/master-data/MasterDataView';
import { UserManagementView } from './features/master-data/UserManagementView';
import { AuditLogView } from './features/master-data/AuditLogView';
import { SystemHealthView } from './features/master-data/SystemHealthView';
import { SettingsView } from './features/master-data/SettingsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes caching
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'visitors':
        return <VisitorManagementView />;
      case 'daily-report':
        return <DailyReportView />;
      case 'patrol':
        return <SecurityPatrolView />;
      case 'incidents':
        return <IncidentManagementView />;
      case 'lost-found':
        return <LostFoundView />;
      case 'item-deposits':
        return <ItemDepositsView />;
      case 'vehicles':
        return <VehicleTrackingView />;
      case 'notifications':
        return <NotificationCenterView setActiveView={setActiveView} />;
      case 'reports':
        return <ReportsExportView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'master-data':
        return <MasterDataView />;
      case 'users':
        return <UserManagementView />;
      case 'audit-log':
        return <AuditLogView />;
      case 'system-health':
        return <SystemHealthView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        {/* Topbar */}
        <Topbar
          activeView={activeView}
          setActiveView={setActiveView}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-6 mt-16 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </QueryClientProvider>
  );
}
