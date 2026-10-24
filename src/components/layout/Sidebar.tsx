import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Compass,
  AlertTriangle,
  PackageOpen,
  Briefcase,
  Truck,
  Bell,
  FileSpreadsheet,
  BarChart3,
  Database,
  UserCheck,
  History,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { currentUser, isAdmin, isSupervisor } = useAuth();

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    roles: ('admin' | 'supervisor' | 'officer' | 'management')[];
  }

  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Operasional',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'visitors',
      label: 'Visitor Management',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'daily-report',
      label: 'Daily Security Report',
      icon: <FileCheck2 className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'patrol',
      label: 'Security Patrol (QR/GPS)',
      icon: <Compass className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'incidents',
      label: 'Incident Management',
      icon: <AlertTriangle className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'lost-found',
      label: 'Lost and Found',
      icon: <PackageOpen className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'item-deposits',
      label: 'Barang Titipan',
      icon: <Briefcase className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'vehicles',
      label: 'Kendaraan Sekolah',
      icon: <Truck className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
  ];

  const monitoringNavItems: NavItem[] = [
    {
      id: 'notifications',
      label: 'Notification Center',
      icon: <Bell className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'reports',
      label: 'Laporan & Ekspor',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
    {
      id: 'analytics',
      label: 'Advanced Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'supervisor', 'officer', 'management'],
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      id: 'master-data',
      label: 'Master Data',
      icon: <Database className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'audit-log',
      label: 'Audit Log Keamanan',
      icon: <History className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'system-health',
      label: 'System Health & Kuota',
      icon: <Activity className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'Pengaturan & Koneksi',
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin', 'supervisor'],
    },
  ];

  const filterByRole = (items: NavItem[]) =>
    items.filter((item) => item.roles.includes(currentUser.role));

  const renderSection = (title: string, items: NavItem[]) => {
    const allowed = filterByRole(items);
    if (allowed.length === 0) return null;

    return (
      <div className="mb-6">
        {!isCollapsed && (
          <h4 className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </h4>
        )}
        <div className="space-y-1">
          {allowed.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative ${
                  isActive
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate text-left whitespace-nowrap">{item.label}</span>
                )}
                {isCollapsed && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1565C0] rounded-l" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#1565C0] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none block">
                LSMS
              </span>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight truncate block mt-0.5">
                Lazuardi Security
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {renderSection('Operasional Utama', mainNavItems)}
        {renderSection('Pemantauan & Analitik', monitoringNavItems)}
        {(isAdmin || isSupervisor) && renderSection('Administrasi Sistem', adminNavItems)}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1565C0] flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono truncate">
                {currentUser.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
