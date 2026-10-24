import React from 'react';
import { Bell, ShieldCheck, Database, UserCheck, Cloud, ServerOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { UserRole } from '../../types';
import { LSMSStorage } from '../../lib/storage-adapter';

interface TopbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isSidebarCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeView,
  setActiveView,
  isSidebarCollapsed,
}) => {
  const { currentUser, switchRole, availableUsers } = useAuth();
  const metrics = LSMSStorage.getSystemMetrics();

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard Operasional Keamanan';
      case 'visitors':
        return 'Visitor Management';
      case 'daily-report':
        return 'Daily Security Report (DSR)';
      case 'patrol':
        return 'Security Patrol (QR Code & GPS)';
      case 'incidents':
        return 'Incident Management';
      case 'lost-found':
        return 'Lost and Found (Barang Temuan)';
      case 'item-deposits':
        return 'Barang Titipan & Digital Signature';
      case 'vehicles':
        return 'Kendaraan Sekolah';
      case 'notifications':
        return 'Pusat Notifikasi Operasional';
      case 'reports':
        return 'Rekap Laporan & Ekspor';
      case 'analytics':
        return 'Advanced Security Analytics';
      case 'master-data':
        return 'Master Data Operasional';
      case 'users':
        return 'Manajemen Akun Pengguna';
      case 'audit-log':
        return 'Audit Log & Jejak Aktivitas';
      case 'system-health':
        return 'System Health & Pemantauan Supabase';
      case 'settings':
        return 'Pengaturan Sistem & Database';
      default:
        return 'Lazuardi Security Management System';
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 transition-all duration-200 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{getTitle()}</h1>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono text-slate-500 bg-slate-100">
          <span>Asia/Jakarta</span>
          <span>·</span>
          <span>WIB</span>
        </span>
      </div>

      {/* Topbar Actions */}
      <div className="flex items-center gap-3">
        {/* Supabase Connection Indicator */}
        <div
          onClick={() => setActiveView('system-health')}
          className="cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
          title="Status database"
        >
          {metrics.connectionMode === 'supabase_cloud' ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-700">Supabase Cloud</span>
            </>
          ) : (
            <>
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-700">Indexed DB (Local Safe)</span>
            </>
          )}
        </div>

        {/* Role Switcher for instant testing */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1.5 hidden md:block" />
          <span className="text-xs font-medium text-slate-500 hidden md:inline">Role:</span>
          <select
            value={currentUser.role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600"
            title="Ganti role untuk simulasi hak akses"
          >
            <option value="admin">Administrator</option>
            <option value="supervisor">Supervisor</option>
            <option value="officer">Petugas Satpam</option>
            <option value="management">Manajemen Sekolah (Read-Only)</option>
          </select>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={() => setActiveView('notifications')}
          className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="Buka notifikasi"
          aria-label="Pusat Notifikasi"
        >
          <Bell className="w-5 h-5" />
          {metrics.unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white tabular-nums">
              {metrics.unreadNotificationsCount > 9 ? '9+' : metrics.unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
