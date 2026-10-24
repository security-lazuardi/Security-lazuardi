import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sun,
  CloudRain,
  Cloud,
  Check,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { DailySecurityReport, DailyReportChecklist, StaffSecurity } from '../../types';
import { formatDateTimeWIB, formatDateWIB } from '../../lib/formatters';

const DEFAULT_AREAS: ('Gerbang' | 'Gedung' | 'CCTV' | 'Pagar' | 'Lampu' | 'APAR' | 'Parkir' | 'Pos Security')[] = [
  'Gerbang',
  'Gedung',
  'CCTV',
  'Pagar',
  'Lampu',
  'APAR',
  'Parkir',
  'Pos Security',
];

export const DailyReportView: React.FC = () => {
  const { currentUser, canMutateData } = useAuth();
  const [reports, setReports] = useState<DailySecurityReport[]>(() => LSMSStorage.getDailyReports());
  const staffList = LSMSStorage.getStaff();
  const shifts = LSMSStorage.getShifts();

  // Create report modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<DailySecurityReport | null>(null);

  // Form State
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shiftId, setShiftId] = useState(shifts[0]?.id || 'sh-1');
  const [weather, setWeather] = useState<'Cerah' | 'Hujan' | 'Berawan'>('Cerah');
  const [generalSituation, setGeneralSituation] = useState('Situasi lingkungan sekolah aman, kondusif, dan terkendali.');
  const [handoverNotes, setHandoverNotes] = useState('Kunci gerbang, HT 4 unit, senter patroli 2 unit, dan kartu tamu diserahterimakan lengkap.');
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([staffList[0]?.name || 'Ismail', staffList[1]?.name || 'Sarmdi']);

  // Checklist state for 8 areas
  const [checklists, setChecklists] = useState<DailyReportChecklist[]>(
    DEFAULT_AREAS.map((area, idx) => ({
      id: `chk-${idx}`,
      areaName: area,
      status: 'Baik',
      notes: '',
    }))
  );

  const handleToggleOfficer = (name: string) => {
    if (selectedOfficers.includes(name)) {
      if (selectedOfficers.length > 1) {
        setSelectedOfficers(selectedOfficers.filter((o) => o !== name));
      }
    } else {
      setSelectedOfficers([...selectedOfficers, name]);
    }
  };

  const handleUpdateChecklistStatus = (areaName: string, status: 'Baik' | 'Perlu Perhatian' | 'Bermasalah') => {
    setChecklists(
      checklists.map((c) => (c.areaName === areaName ? { ...c, status } : c))
    );
  };

  const handleSaveReport = () => {
    const shift = shifts.find((s) => s.id === shiftId);
    LSMSStorage.saveDailyReport({
      reportDate,
      shiftId,
      shiftName: shift?.name || 'Siang',
      weather,
      generalSituation,
      handoverNotes,
      officers: selectedOfficers,
      status: 'Terekam',
      checklists,
      createdBy: currentUser.id,
      createdByName: currentUser.fullName,
    });

    setReports(LSMSStorage.getDailyReports());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daily Security Report (DSR)</h2>
          <p className="text-sm text-slate-500">
            Pencatatan laporan harian jaga, checklist 8 area perimeter, dan serah terima shift antar-regu (langsung diinput dan terekam otomatis).
          </p>
        </div>
        {canMutateData && (
          <Button
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Buat Laporan Jaga Baru
          </Button>
        )}
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.length === 0 ? (
          <div className="col-span-full bg-white p-12 border border-slate-200 rounded-xl text-center text-slate-500">
            Belum ada laporan harian. Silakan buat laporan jaga untuk shift hari ini.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReportDetail(report)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-800">{report.reportNo}</span>
                  <Badge variant="success">Terekam</Badge>
                </div>

                <div className="text-base font-bold text-slate-900">
                  Shift {report.shiftName} · {formatDateWIB(report.reportDate)}
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                  <span>Cuaca: <strong>{report.weather}</strong></span>
                  <span>·</span>
                  <span>Petugas: <strong>{report.officers.length} personel</strong></span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {report.generalSituation}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Dibuat oleh: {report.createdByName || 'Petugas'}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terekam
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Laporan Harian Security (DSR)"
        subtitle="Pemeriksaan 8 Area, Situasi Umum, dan Serah Terima Shift"
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Shift & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tanggal Tugas</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Shift Jaga</label>
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    Shift {s.name} ({s.startTime} - {s.endTime} WIB)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kondisi Cuaca</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Cerah">Cerah</option>
                <option value="Hujan">Hujan</option>
                <option value="Berawan">Berawan</option>
              </select>
            </div>
          </div>

          {/* Officers Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Personel Petugas Jaga Bertugas (Pilih 2 atau lebih):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {staffList.map((staff) => {
                const isSelected = selectedOfficers.includes(staff.name);
                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleToggleOfficer(staff.name)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {staff.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist 8 Areas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Checklist Kondisi Fisik 8 Area Perimeter:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {checklists.map((item) => (
                <div
                  key={item.areaName}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-slate-800">{item.areaName}</span>
                  <div className="flex items-center gap-1">
                    {(['Baik', 'Perlu Perhatian', 'Bermasalah'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateChecklistStatus(item.areaName, st)}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                          item.status === st
                            ? st === 'Baik'
                              ? 'bg-emerald-600 text-white'
                              : st === 'Perlu Perhatian'
                              ? 'bg-amber-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Situasi Umum & Handover */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Catatan Situasi Umum Jaga *
            </label>
            <textarea
              rows={2}
              required
              value={generalSituation}
              onChange={(e) => setGeneralSituation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Catatan Inventaris & Serah Terima Jaga
            </label>
            <textarea
              rows={2}
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              type="button"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleSaveReport}
            >
              Simpan & Rekam Laporan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Detail Modal */}
      <Modal
        isOpen={Boolean(selectedReportDetail)}
        onClose={() => setSelectedReportDetail(null)}
        title={selectedReportDetail ? `Laporan ${selectedReportDetail.reportNo}` : ''}
        subtitle={selectedReportDetail ? `Shift ${selectedReportDetail.shiftName} · ${formatDateWIB(selectedReportDetail.reportDate)}` : ''}
        maxWidth="lg"
      >
        {selectedReportDetail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Status Laporan:</span>
                <Badge variant="success">Terekam</Badge>
              </div>
              <div>
                <span className="text-slate-500">Cuaca:</span>
                <span className="font-semibold text-slate-800 ml-1.5">{selectedReportDetail.weather}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Personel Petugas Shift</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedReportDetail.officers.map((name) => (
                  <span key={name} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Checklist 8 Area</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedReportDetail.checklists.map((c) => (
                  <div key={c.areaName} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{c.areaName}</span>
                    <Badge variant={c.status === 'Baik' ? 'success' : c.status === 'Perlu Perhatian' ? 'warning' : 'danger'}>
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Situasi Umum</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedReportDetail.generalSituation}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Serah Terima Jaga</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedReportDetail.handoverNotes || '-'}
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedReportDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
