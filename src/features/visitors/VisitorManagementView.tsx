import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  LogOut,
  Clock,
  Search,
  Filter,
  CreditCard,
  Building,
  Phone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { VisitorCheckIn, VisitorCard, Unit } from '../../types';
import { formatDateTimeWIB, formatTimeWIB, formatDuration } from '../../lib/formatters';

export const VisitorManagementView: React.FC = () => {
  const { currentUser, canMutateData, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Query states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Master data for select options
  const units = LSMSStorage.getUnits();
  const availableCards = LSMSStorage.getVisitorCards().filter((c) => !c.isInUse);

  // Check-In Modal & Form state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInError, setCheckInError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    visitorName: '',
    institutionCategory: 'Informasi Sekolah' as 'Dinas' | 'Informasi Sekolah' | 'Sales' | 'Vendor' | 'Lainnya',
    institutionName: '',
    phone: '',
    email: '',
    hostName: '',
    unitId: units[0]?.id || '',
    purpose: '',
    cardNumber: availableCards[0]?.cardNumber || '',
    notes: '',
  });

  // Check-Out Confirmation Modal
  const [selectedVisitorForCheckout, setSelectedVisitorForCheckout] = useState<VisitorCheckIn | null>(null);

  // Admin Edit & Delete states
  const [editingVisitor, setEditingVisitor] = useState<VisitorCheckIn | null>(null);
  const [editFormData, setEditFormData] = useState({
    visitorName: '',
    institutionCategory: 'Informasi Sekolah' as 'Dinas' | 'Informasi Sekolah' | 'Sales' | 'Vendor' | 'Lainnya',
    institutionName: '',
    phone: '',
    email: '',
    hostName: '',
    unitId: '',
    purpose: '',
    cardNumber: '',
    notes: '',
  });
  const [deletingVisitor, setDeletingVisitor] = useState<VisitorCheckIn | null>(null);

  // Fetch visitors
  const { items: visitorList, total } = LSMSStorage.getVisitorCheckins({
    page,
    pageSize,
    search,
    status: activeTab === 'active' ? 'Masih di Sekolah' : 'all',
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleOpenCheckIn = () => {
    setCheckInError('');
    const freshCards = LSMSStorage.getVisitorCards().filter((c) => !c.isInUse);
    setFormData({
      visitorName: '',
      institutionCategory: 'Informasi Sekolah',
      institutionName: '',
      phone: '',
      email: '',
      hostName: '',
      unitId: units[0]?.id || '',
      purpose: '',
      cardNumber: freshCards[0]?.cardNumber || '',
      notes: '',
    });
    setIsCheckInOpen(true);
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInError('');

    if (!formData.visitorName || !formData.phone || !formData.hostName || !formData.cardNumber) {
      setCheckInError('Harap lengkapi semua bidang bertanda wajib (*)');
      return;
    }

    try {
      const selectedUnit = units.find((u) => u.id === formData.unitId);
      const newVisitor = LSMSStorage.checkInVisitor({
        visitorName: formData.visitorName.trim(),
        institutionCategory: formData.institutionCategory,
        institutionName: formData.institutionName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        hostName: formData.hostName.trim(),
        unitId: formData.unitId,
        unitName: selectedUnit?.name || 'Sekolah',
        purpose: formData.purpose.trim(),
        cardNumber: formData.cardNumber,
        checkinOfficerId: currentUser.id,
        checkinOfficerName: currentUser.fullName,
        notes: formData.notes.trim(),
      });

      setIsCheckInOpen(false);
      setSuccessMsg(`Tamu ${newVisitor.visitorName} berhasil check-in dengan nomor kartu ${newVisitor.cardNumber} (Tiket: ${newVisitor.ticketNo})`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setCheckInError(err.message || 'Gagal menyimpan check-in tamu.');
    }
  };

  const handleConfirmCheckOut = () => {
    if (!selectedVisitorForCheckout) return;

    try {
      const checkedOut = LSMSStorage.checkOutVisitor(
        selectedVisitorForCheckout.id,
        currentUser.id,
        currentUser.fullName
      );
      setSelectedVisitorForCheckout(null);
      setSuccessMsg(`Tamu ${checkedOut.visitorName} berhasil check-out. Kartu ${checkedOut.cardNumber} telah dilepas.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenEdit = (visitor: VisitorCheckIn) => {
    setEditingVisitor(visitor);
    setEditFormData({
      visitorName: visitor.visitorName,
      institutionCategory: visitor.institutionCategory,
      institutionName: visitor.institutionName || '',
      phone: visitor.phone,
      email: visitor.email || '',
      hostName: visitor.hostName,
      unitId: visitor.unitId,
      purpose: visitor.purpose,
      cardNumber: visitor.cardNumber,
      notes: visitor.notes || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitor) return;
    const selectedUnit = units.find((u) => u.id === editFormData.unitId);
    LSMSStorage.updateVisitorCheckIn(editingVisitor.id, {
      visitorName: editFormData.visitorName.trim(),
      institutionCategory: editFormData.institutionCategory,
      institutionName: editFormData.institutionName.trim(),
      phone: editFormData.phone.trim(),
      email: editFormData.email.trim(),
      hostName: editFormData.hostName.trim(),
      unitId: editFormData.unitId,
      unitName: selectedUnit?.name || editingVisitor.unitName,
      purpose: editFormData.purpose.trim(),
      cardNumber: editFormData.cardNumber,
      notes: editFormData.notes.trim(),
    });
    setEditingVisitor(null);
    setSuccessMsg(`Data kunjungan tamu ${editFormData.visitorName} berhasil diperbarui.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleConfirmDelete = () => {
    if (!deletingVisitor) return;
    LSMSStorage.deleteVisitorCheckIn(deletingVisitor.id);
    setDeletingVisitor(null);
    setSuccessMsg(`Data kunjungan tamu berhasil dihapus.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Visitor Management System</h2>
          <p className="text-sm text-slate-500">
            Registrasi tamu sekolah, pengelolaan kartu visitor, monitoring durasi kunjungan, dan check-out terintegrasi.
          </p>
        </div>
        {canMutateData && (
          <Button
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={handleOpenCheckIn}
          >
            Registrasi Tamu Baru (Check-In)
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => {
              setActiveTab('active');
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'active'
                ? 'bg-[#1565C0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tamu Masih di Sekolah
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-[#1565C0] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Seluruh Riwayat Kunjungan
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, tiket, kartu, instansi..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Tiket</th>
                <th className="px-4 py-3">Nama Tamu & Kontak</th>
                <th className="px-4 py-3">Instansi / Kategori</th>
                <th className="px-4 py-3">Bertemu / Unit</th>
                <th className="px-4 py-3">No. Kartu</th>
                <th className="px-4 py-3">Waktu Masuk</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Status</th>
                {canMutateData && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitorList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    {activeTab === 'active'
                      ? 'Tidak ada tamu yang sedang aktif di sekolah saat ini.'
                      : 'Tidak ada data kunjungan yang sesuai kriteria pencarian.'}
                  </td>
                </tr>
              ) : (
                visitorList.map((visitor) => {
                  const checkinDate = new Date(visitor.checkinTime);
                  const isOver4Hours =
                    visitor.status === 'Masih di Sekolah' &&
                    (Date.now() - checkinDate.getTime()) / (1000 * 60) > 240;

                  return (
                    <tr
                      key={visitor.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isOver4Hours ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-800 whitespace-nowrap">
                        {visitor.ticketNo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{visitor.visitorName}</div>
                        <div className="text-xs text-slate-500 font-mono">{visitor.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-slate-700 block">
                          {visitor.institutionName || '-'}
                        </span>
                        <span className="text-[11px] text-slate-400">{visitor.institutionCategory}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{visitor.hostName}</div>
                        <div className="text-xs text-slate-500">{visitor.unitName || visitor.unitId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                          {visitor.cardNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {formatTimeWIB(visitor.checkinTime)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {visitor.durationMinutes ? (
                          formatDuration(visitor.durationMinutes)
                        ) : (
                          <span className={isOver4Hours ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                            {formatDuration(Math.round((Date.now() - checkinDate.getTime()) / 60000))}
                            {isOver4Hours && ' (>4j)'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {visitor.status === 'Masih di Sekolah' ? (
                          <Badge variant={isOver4Hours ? 'warning' : 'primary'}>
                            {isOver4Hours ? 'Masih di Sekolah (>4j)' : 'Masih di Sekolah'}
                          </Badge>
                        ) : (
                          <Badge variant="success">Sudah Keluar</Badge>
                        )}
                      </td>
                      {canMutateData && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {visitor.status === 'Masih di Sekolah' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<LogOut className="w-3.5 h-3.5 text-red-600" />}
                              onClick={() => setSelectedVisitorForCheckout(visitor)}
                            >
                              Check-Out
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            Halaman <span className="font-mono font-bold text-slate-800">{page}</span> dari{' '}
            <span className="font-mono font-bold text-slate-800">{totalPages}</span> (Total {total} data)
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

      {/* Check-In Modal */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Form Registrasi Tamu (Visitor Check-In)"
        subtitle="Nomor tiket dan jam masuk akan dicatat secara atomik dari server"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveCheckIn} className="space-y-4">
          {checkInError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{checkInError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nama Lengkap Tamu *
              </label>
              <input
                type="text"
                required
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                placeholder="Misal: Bapak Hendri Wijaya"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kategori Instansi *
              </label>
              <select
                value={formData.institutionCategory}
                onChange={(e) =>
                  setFormData({ ...formData, institutionCategory: e.target.value as any })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Informasi Sekolah">Informasi Sekolah (Calon Walimurid)</option>
                <option value="Dinas">Dinas (Pemerintah / Kemdikbud)</option>
                <option value="Sales">Sales / Rekanan</option>
                <option value="Vendor">Vendor / Teknisi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nama Asal Instansi / Perusahaan
              </label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                placeholder="Nama PT, Sekolah, atau Instansi"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nomor WhatsApp / HP Aktif *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Bertemu dengan (Host) *
              </label>
              <input
                type="text"
                required
                value={formData.hostName}
                onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                placeholder="Nama guru, staf, atau kepala bagian"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Unit Tujuan *
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nomor Kartu Visitor Fisik *
              </label>
              <select
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {availableCards.length === 0 ? (
                  <option value="">Semua kartu visitor sedang digunakan!</option>
                ) : (
                  availableCards.map((c) => (
                    <option key={c.cardNumber} value={c.cardNumber}>
                      {c.cardNumber} (Tersedia)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Petugas Penerima
              </label>
              <input
                type="text"
                disabled
                value={currentUser.fullName}
                className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-100 text-slate-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Keperluan Kunjungan *
            </label>
            <textarea
              required
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Deskripsi singkat keperluan kunjungan di sekolah Lazuardi..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsCheckInOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={availableCards.length === 0}>
              Simpan Check-In Tamu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Check-Out Confirmation Modal */}
      <Modal
        isOpen={Boolean(selectedVisitorForCheckout)}
        onClose={() => setSelectedVisitorForCheckout(null)}
        title="Konfirmasi Check-Out Tamu"
        maxWidth="md"
      >
        {selectedVisitorForCheckout && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin memproses kepulangan tamu berikut? Kartu visitor akan otomatis dilepaskan agar dapat digunakan kembali.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Nomor Tiket:</span>
                <span className="font-mono font-bold text-slate-900">{selectedVisitorForCheckout.ticketNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Tamu:</span>
                <span className="font-semibold text-slate-900">{selectedVisitorForCheckout.visitorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kartu Visitor:</span>
                <span className="font-mono font-bold text-blue-700">{selectedVisitorForCheckout.cardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jam Masuk:</span>
                <span className="font-mono">{formatTimeWIB(selectedVisitorForCheckout.checkinTime)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setSelectedVisitorForCheckout(null)}>
                Batal
              </Button>
              <Button variant="danger" icon={<LogOut className="w-4 h-4" />} onClick={handleConfirmCheckOut}>
                Konfirmasi Check-Out
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
