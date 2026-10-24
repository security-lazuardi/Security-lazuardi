import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LSMSStorage } from '../../lib/storage-adapter';
import { formatDateTimeWIB, getRoleBadgeClass } from '../../lib/formatters';

export const AuditLogView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { items, total } = LSMSStorage.getAuditLogs({
    page,
    pageSize,
    search,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExportCSV = () => {
    const all = LSMSStorage.getAuditLogs({ page: 1, pageSize: 500 }).items;
    const headers = ['Waktu (WIB)', 'User', 'Role', 'Modul', 'Aksi', 'Record ID', 'Ringkasan Aktivitas', 'IP'];
    const rows = all.map((l) => [
      `"${formatDateTimeWIB(l.createdAt)}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.recordId}"`,
      `"${l.summary.replace(/"/g, '""')}"`,
      `"${l.ipAddress || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_log_lazuardi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Audit Log Keamanan & Jejak Operasional</h2>
          <p className="text-sm text-slate-500">
            Catatan aktivitas immutable (tidak dapat dihapus/diedit oleh pengguna umum) untuk kepatuhan dan audit investigasi.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>
          Ekspor CSV Audit
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari user, modul, atau ringkasan aktivitas..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="font-mono font-semibold text-slate-800">{items.length}</span> dari{' '}
          <span className="font-mono font-semibold text-slate-800">{total}</span> total catatan log
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu (WIB)</th>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Ringkasan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada catatan audit yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                items.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-600 whitespace-nowrap">
                      {formatDateTimeWIB(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{log.userName}</div>
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold mt-0.5 ${getRoleBadgeClass(log.userRole)}`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-bold text-slate-800">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-blue-700">
                      {log.recordId}
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs leading-relaxed max-w-md">
                      {log.summary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Halaman <span className="font-mono font-bold text-slate-800">{page}</span> dari{' '}
            <span className="font-mono font-bold text-slate-800">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
