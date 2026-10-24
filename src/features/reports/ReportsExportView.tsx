import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Calendar, Search } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LSMSStorage } from '../../lib/storage-adapter';
import { formatDateTimeWIB, formatDateWIB } from '../../lib/formatters';

export const ReportsExportView: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<'visitors' | 'patrols' | 'incidents' | 'vehicles'>('visitors');
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  const visitors = LSMSStorage.getVisitorCheckins({ pageSize: 500 }).items;
  const patrols = LSMSStorage.getPatrolLogs();
  const incidents = LSMSStorage.getIncidents();
  const vehicles = LSMSStorage.getVehicleMovements();

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `laporan_${selectedModule}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (selectedModule === 'visitors') {
      headers = ['No Tiket', 'Nama Tamu', 'Kategori Instansi', 'Instansi', 'No HP', 'Host', 'Unit', 'No Kartu', 'Waktu Masuk', 'Waktu Keluar', 'Durasi Menit', 'Status'];
      rows = visitors.map((v) => [
        `"${v.ticketNo}"`,
        `"${v.visitorName}"`,
        `"${v.institutionCategory}"`,
        `"${v.institutionName || '-'}"`,
        `"${v.phone}"`,
        `"${v.hostName}"`,
        `"${v.unitName || '-'}"`,
        `"${v.cardNumber}"`,
        `"${formatDateTimeWIB(v.checkinTime)}"`,
        `"${v.checkoutTime ? formatDateTimeWIB(v.checkoutTime) : '-'}"`,
        `"${v.durationMinutes || 0}"`,
        `"${v.status}"`,
      ]);
    } else if (selectedModule === 'patrols') {
      headers = ['Waktu Scan', 'Titik Lokasi', 'Kode', 'Petugas', 'Jarak Meter', 'Status'];
      rows = patrols.map((p) => [
        `"${formatDateTimeWIB(p.scannedAt)}"`,
        `"${p.locationName || '-'}"`,
        `"${p.locationCode || '-'}"`,
        `"${p.staffName || '-'}"`,
        `"${p.distanceMeters || 0}"`,
        `"${p.status}"`,
      ]);
    } else if (selectedModule === 'incidents') {
      headers = ['No Insiden', 'Kategori', 'Lokasi', 'Waktu', 'Prioritas', 'Status', 'Kronologi'];
      rows = incidents.map((i) => [
        `"${i.incidentNo}"`,
        `"${i.categoryName || '-'}"`,
        `"${i.locationText}"`,
        `"${formatDateTimeWIB(i.incidentTime)}"`,
        `"${i.priority}"`,
        `"${i.status}"`,
        `"${i.chronology.replace(/"/g, '""')}"`,
      ]);
    } else if (selectedModule === 'vehicles') {
      headers = ['No Log', 'Plat Nomor', 'Driver', 'Tujuan', 'Jam Keluar', 'Jam Kembali', 'KM Awal', 'KM Akhir', 'Status'];
      rows = vehicles.map((v) => [
        `"${v.logNo}"`,
        `"${v.plateNumber}"`,
        `"${v.driverName}"`,
        `"${v.destination}"`,
        `"${formatDateTimeWIB(v.outTime)}"`,
        `"${v.inTime ? formatDateTimeWIB(v.inTime) : '-'}"`,
        `"${v.startKm}"`,
        `"${v.endKm || '-'}"`,
        `"${v.status}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rekap Laporan & Ekspor Data</h2>
          <p className="text-sm text-slate-500">
            Pratinjau laporan operasional, ekspor ke spreadsheet Excel (CSV), dan cetak lembar kepatuhan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            Cetak / PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Ekspor Excel (CSV)
          </Button>
        </div>
      </div>

      {/* Module Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setSelectedModule('visitors')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            selectedModule === 'visitors'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Laporan Buku Tamu (Visitor)
        </button>
        <button
          onClick={() => setSelectedModule('patrols')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            selectedModule === 'patrols'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Laporan Patroli QR & GPS
        </button>
        <button
          onClick={() => setSelectedModule('incidents')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            selectedModule === 'incidents'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Laporan Insiden & Kejadian
        </button>
        <button
          onClick={() => setSelectedModule('vehicles')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            selectedModule === 'vehicles'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Laporan Kendaraan Sekolah
        </button>
      </div>

      {/* Preview Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs printable-area">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Pratinjau Data Laporan {selectedModule.toUpperCase()}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Generated: {new Date().toLocaleDateString('id-ID')}
          </span>
        </div>

        <div className="overflow-x-auto">
          {selectedModule === 'visitors' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Tiket</th>
                  <th className="px-4 py-3">Nama Tamu</th>
                  <th className="px-4 py-3">Instansi</th>
                  <th className="px-4 py-3">Host / Unit</th>
                  <th className="px-4 py-3">Kartu</th>
                  <th className="px-4 py-3">Masuk</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.slice(0, 15).map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-800">{v.ticketNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{v.visitorName}</td>
                    <td className="px-4 py-3 text-slate-600">{v.institutionName || v.institutionCategory}</td>
                    <td className="px-4 py-3 text-slate-700">{v.hostName} ({v.unitName})</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.cardNumber}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDateTimeWIB(v.checkinTime)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={v.status === 'Masih di Sekolah' ? 'primary' : 'success'}>
                        {v.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'patrols' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Waktu Scan</th>
                  <th className="px-4 py-3">Titik Patroli</th>
                  <th className="px-4 py-3">Petugas</th>
                  <th className="px-4 py-3">Jarak</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patrols.slice(0, 15).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatDateTimeWIB(p.scannedAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.locationName}</td>
                    <td className="px-4 py-3 text-slate-700">{p.staffName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.distanceMeters} m</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'Completed' ? 'success' : 'danger'}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'incidents' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Insiden</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Prioritas</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.slice(0, 15).map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{i.incidentNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{i.categoryName}</td>
                    <td className="px-4 py-3 text-slate-600">{i.locationText}</td>
                    <td className="px-4 py-3">
                      <Badge variant={i.priority === 'Critical' ? 'danger' : 'neutral'}>{i.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={i.status === 'Closed' ? 'success' : 'warning'}>{i.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedModule === 'vehicles' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No Log</th>
                  <th className="px-4 py-3">Plat Mobil</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Tujuan</th>
                  <th className="px-4 py-3">KM Awal/Akhir</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.slice(0, 15).map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-800">{v.logNo}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{v.plateNumber}</td>
                    <td className="px-4 py-3 text-slate-800">{v.driverName}</td>
                    <td className="px-4 py-3 text-slate-600">{v.destination}</td>
                    <td className="px-4 py-3 font-mono text-xs">{v.startKm} {v.endKm ? `-> ${v.endKm}` : ''}</td>
                    <td className="px-4 py-3">
                      <Badge variant={v.status === 'Masih Keluar' ? 'warning' : 'success'}>{v.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
