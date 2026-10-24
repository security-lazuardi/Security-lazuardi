import React from 'react';
import { BarChart3, Users, Compass, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { LSMSStorage } from '../../lib/storage-adapter';

export const AnalyticsView: React.FC = () => {
  const visitors = LSMSStorage.getVisitorCheckins({ pageSize: 500 }).items;
  const patrols = LSMSStorage.getPatrolLogs();
  const incidents = LSMSStorage.getIncidents();
  const units = LSMSStorage.getUnits();

  // Aggregate category stats
  const categoryCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    categoryCounts[v.institutionCategory] = (categoryCounts[v.institutionCategory] || 0) + 1;
  });

  // Aggregate unit stats
  const unitCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    const uName = v.unitName || 'Sekolah';
    unitCounts[uName] = (unitCounts[uName] || 0) + 1;
  });

  // Patrol stats
  const totalPatrols = patrols.length;
  const completedPatrols = patrols.filter((p) => p.status === 'Completed').length;
  const patrolComplianceRate = totalPatrols > 0 ? Math.round((completedPatrols / totalPatrols) * 100) : 100;

  // Incident breakdown
  const incidentPriorityCounts = {
    Critical: incidents.filter((i) => i.priority === 'Critical').length,
    High: incidents.filter((i) => i.priority === 'High').length,
    Medium: incidents.filter((i) => i.priority === 'Medium').length,
    Low: incidents.filter((i) => i.priority === 'Low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Advanced Security Analytics</h2>
          <p className="text-sm text-slate-500">
            Analisis tren sirkulasi pengunjung, efektivitas rute patroli, dan profil insiden sekolah.
          </p>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Kepatuhan Patroli</span>
            <Badge variant="success">Target 95%</Badge>
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {patrolComplianceRate}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {completedPatrols} dari {totalPatrols} scan titik patroli terverifikasi radius GPS.
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tingkat Penyelesaian Insiden</span>
            <Badge variant="primary">Closed Rate</Badge>
          </div>
          <div className="text-3xl font-bold font-mono text-blue-700 tabular-nums">
            {incidents.length > 0
              ? Math.round(
                  (incidents.filter((i) => i.status === 'Closed').length / incidents.length) * 100
                )
              : 100}
            %
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {incidents.filter((i) => i.status === 'Closed').length} dari {incidents.length} insiden tuntas ditangani.
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Rata-rata Durasi Tamu</span>
            <Badge variant="neutral">School Hours</Badge>
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
            58 <span className="text-base font-normal text-slate-500">menit</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Mayoritas kunjungan selesai sebelum 2 jam.
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors by Category Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Distribusi Pengunjung Berdasarkan Kategori Instansi</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-slate-500">Belum ada data kunjungan tamu.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / Math.max(1, visitors.length)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-mono text-slate-500">
                        {count} kunjungan ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Visitors by Unit Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-700" />
            <span>Kunjungan Berdasarkan Unit Tujuan</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.keys(unitCounts).length === 0 ? (
              <p className="text-xs text-slate-500">Belum ada data kunjungan tamu.</p>
            ) : (
              Object.entries(unitCounts).map(([uName, count]) => {
                const pct = Math.round((count / Math.max(1, visitors.length)) * 100);
                return (
                  <div key={uName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{uName}</span>
                      <span className="font-mono text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Incident Priority Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-700" />
            <span>Distribusi Keparahan Insiden Keamanan</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <span className="text-[11px] font-bold text-red-700 block uppercase">Critical</span>
              <span className="text-2xl font-bold font-mono text-red-800 tabular-nums">
                {incidentPriorityCounts.Critical}
              </span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <span className="text-[11px] font-bold text-amber-700 block uppercase">High</span>
              <span className="text-2xl font-bold font-mono text-amber-800 tabular-nums">
                {incidentPriorityCounts.High}
              </span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <span className="text-[11px] font-bold text-blue-700 block uppercase">Medium</span>
              <span className="text-2xl font-bold font-mono text-blue-800 tabular-nums">
                {incidentPriorityCounts.Medium}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[11px] font-bold text-slate-700 block uppercase">Low</span>
              <span className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
                {incidentPriorityCounts.Low}
              </span>
            </div>
          </div>
        </div>

        {/* Patrol Route Consistency */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-700" />
            <span>Status Validasi Kehadiran Fisik Patroli</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Scan Tepat di Titik (&lt;50m):</span>
              <span className="font-bold text-emerald-700 font-mono">{completedPatrols} scan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Deviasi Lokasi (Location Unverified):</span>
              <span className="font-bold text-red-600 font-mono">
                {patrols.filter((p) => p.status === 'Location Unverified').length} scan
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Terlambat dari Jadwal Target:</span>
              <span className="font-bold text-amber-600 font-mono">
                {patrols.filter((p) => p.status === 'Late').length} scan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
