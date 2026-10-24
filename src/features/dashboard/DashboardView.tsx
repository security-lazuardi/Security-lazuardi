import React, { useState } from 'react';
import {
  Users,
  Compass,
  AlertTriangle,
  FileCheck2,
  PackageOpen,
  Briefcase,
  Truck,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LSMSStorage } from '../../lib/storage-adapter';
import { useAuth } from '../auth/AuthContext';
import { formatTimeWIB, formatDateTimeWIB } from '../../lib/formatters';

interface DashboardViewProps {
  setActiveView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveView }) => {
  const { currentUser, isManagement } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | '30days'>('today');

  const metrics = LSMSStorage.getSystemMetrics();
  const allVisitors = LSMSStorage.getVisitorCheckins({ pageSize: 100 }).items;
  const activeVisitors = allVisitors.filter((v) => v.status === 'Masih di Sekolah');
  const over4HoursVisitors = activeVisitors.filter((v) => {
    const elapsedMinutes = (Date.now() - new Date(v.checkinTime).getTime()) / (1000 * 60);
    return elapsedMinutes > 240;
  });

  const allIncidents = LSMSStorage.getIncidents();
  const activeIncidents = allIncidents.filter((i) => i.status !== 'Closed');
  const criticalIncidents = activeIncidents.filter((i) => i.priority === 'Critical');

  const allPatrols = LSMSStorage.getPatrolLogs();
  const completedPatrols = allPatrols.filter((p) => p.status === 'Completed');
  const latePatrols = allPatrols.filter((p) => p.status === 'Late');

  const activeVehicles = LSMSStorage.getVehicleMovements().filter((m) => m.status === 'Masih Keluar');
  const activeDeposits = LSMSStorage.getItemDeposits().filter((d) => d.status === 'Dititipkan');
  const unclaimedItems = LSMSStorage.getLostFound().filter((l) => l.status === 'Belum Diambil');
  const reports = LSMSStorage.getDailyReports();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#1565C0] to-[#0D47A1] rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-blue-200">
              Operasional Keamanan Lazuardi
            </span>
            <span className="text-xs text-blue-200">·</span>
            <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Sistem Aktif
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Selamat Datang, {currentUser.fullName}</h2>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            {isManagement
              ? 'Anda masuk dengan akses Manajemen Sekolah (Read-Only) untuk memantau ringkasan seluruh pos dan unit.'
              : 'Pantau situasi keamanan kampus sekolah, sirkulasi tamu, patroli QR, dan pergerakan kendaraan.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono">
            {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}
          </div>
        </div>
      </div>

      {/* 13 Core Summary Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Ringkasan Operasional Hari Ini
          </h3>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPeriod === 'today' ? 'bg-[#1565C0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setFilterPeriod('7days')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPeriod === '7days' ? 'bg-[#1565C0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setFilterPeriod('30days')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPeriod === '30days' ? 'bg-[#1565C0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 1. Visitor Hari Ini */}
          <div
            onClick={() => setActiveView('visitors')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Visitor Hari Ini</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {allVisitors.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Total masuk</span>
              <span className="text-blue-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                Buka <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* 2. Visitor Masih Aktif */}
          <div
            onClick={() => setActiveView('visitors')}
            className="p-4 bg-white border border-blue-200 bg-blue-50/20 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-900">Visitor di Sekolah</span>
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-blue-800 tabular-nums">
              {activeVisitors.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100 text-[11px] text-blue-700">
              <span>Kartu terpakai</span>
              <span className="font-semibold">{activeVisitors.length} kartu</span>
            </div>
          </div>

          {/* 3. Visitor Sudah Checkout */}
          <div
            onClick={() => setActiveView('visitors')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Visitor Checkout</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {allVisitors.filter((v) => v.status === 'Sudah Keluar').length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Selesai berkunjung</span>
              <span className="text-emerald-700 font-semibold">Tuntas</span>
            </div>
          </div>

          {/* 4. Visitor > 4 Jam */}
          <div
            onClick={() => setActiveView('visitors')}
            className="p-4 bg-white border border-amber-200 bg-amber-50/30 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-900">Belum Checkout &gt; 4 Jam</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
              {over4HoursVisitors.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/50 text-[11px] text-amber-800">
              <span>Perlu konfirmasi pos</span>
              <span className="font-semibold">{over4HoursVisitors.length > 0 ? 'Perhatian' : 'Nihil'}</span>
            </div>
          </div>

          {/* 5. Patroli Hari Ini */}
          <div
            onClick={() => setActiveView('patrol')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Total Scan Patroli</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {allPatrols.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Semua titik</span>
              <span className="text-purple-700 font-semibold">Lihat log</span>
            </div>
          </div>

          {/* 6. Patroli Selesai */}
          <div
            onClick={() => setActiveView('patrol')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Patroli Tepat Waktu</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {completedPatrols.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>GPS verified</span>
              <span className="text-emerald-700 font-semibold">Tepat</span>
            </div>
          </div>

          {/* 7. Patroli Terlambat */}
          <div
            onClick={() => setActiveView('patrol')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Patroli Terlambat</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {latePatrols.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Deviasi jadwal</span>
              <span className="text-amber-700 font-semibold">Evaluasi</span>
            </div>
          </div>

          {/* 8. Insiden Aktif */}
          <div
            onClick={() => setActiveView('incidents')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Insiden Belum Selesai</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {activeIncidents.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Status Open/Progress</span>
              <span className="text-rose-700 font-semibold">Pantau</span>
            </div>
          </div>

          {/* 9. Insiden Critical */}
          <div
            onClick={() => setActiveView('incidents')}
            className={`p-4 rounded-xl border transition-all cursor-pointer group ${
              criticalIncidents.length > 0
                ? 'bg-red-50/50 border-red-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-red-800">Insiden Kritis</span>
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-red-700 tabular-nums">
              {criticalIncidents.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Perlu tindakan darurat</span>
              <span className="text-red-700 font-semibold">
                {criticalIncidents.length > 0 ? 'Urgent!' : 'Aman'}
              </span>
            </div>
          </div>

          {/* 10. Laporan Harian DSR */}
          <div
            onClick={() => setActiveView('daily-report')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Laporan DSR</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {reports.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Shift Siang / Malam</span>
              <span className="text-blue-700 font-semibold">Buka DSR</span>
            </div>
          </div>

          {/* 11. Lost and Found */}
          <div
            onClick={() => setActiveView('lost-found')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Barang Temuan</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <PackageOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {unclaimedItems.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Belum diambil</span>
              <span className="text-amber-700 font-semibold">Amankan</span>
            </div>
          </div>

          {/* 12. Barang Titipan Aktif */}
          <div
            onClick={() => setActiveView('item-deposits')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Barang Titipan</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {activeDeposits.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Di pos satpam</span>
              <span className="text-slate-700 font-semibold">Tersimpan</span>
            </div>
          </div>

          {/* 13. Kendaraan Masih Keluar */}
          <div
            onClick={() => setActiveView('vehicles')}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Kendaraan Keluar</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {activeVehicles.length}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Mobil dinas / bus</span>
              <span className="text-blue-700 font-semibold">Monitor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Visitors Quick Glance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" />
              <span>Tamu yang Masih Berada di Lingkungan Sekolah</span>
            </h3>
            <button
              onClick={() => setActiveView('visitors')}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center"
            >
              Kelola Tamu <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>

          {activeVisitors.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Saat ini tidak ada tamu aktif di sekolah. Seluruh tamu telah check-out.
            </div>
          ) : (
            <div className="space-y-2">
              {activeVisitors.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{v.visitorName}</span>
                    <span className="text-slate-500 ml-2 font-mono">({v.cardNumber})</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Tujuan: <strong>{v.hostName}</strong> · Masuk: {formatTimeWIB(v.checkinTime)}
                    </div>
                  </div>
                  <Badge variant="primary">{v.institutionCategory}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Operational Directives */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Instruksi & Prosedur Satpam Lazuardi</span>
              </h3>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <p>
                  <strong>Visitor Check-in</strong>: Setiap tamu wajib dicatat kartu identitas dan diberikan nomor kartu fisik (CARD-001 s/d CARD-030).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <p>
                  <strong>Patroli QR & GPS</strong>: Scan titik kontrol sesuai jadwal shift. Validasi GPS harus berada dalam radius toleransi titik.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <p>
                  <strong>Serah Terima Shift</strong>: Lakukan serah terima barang inventaris, kendaraan dinas, dan checklist 8 area sebelum pergantian regu.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Standar Keamanan Lazuardi Community</span>
            <span className="font-mono font-semibold text-blue-700">WIB (Asia/Jakarta)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
