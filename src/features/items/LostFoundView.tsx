import React, { useState, useRef } from 'react';
import {
  PackageOpen,
  Plus,
  Search,
  UserCheck,
  Camera,
  Image as ImageIcon,
  X,
  ZoomIn,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { LostFoundItem } from '../../types';
import { formatDateTimeWIB } from '../../lib/formatters';
import { compressImageToWebP } from '../../lib/image-optimizer';

export const LostFoundView: React.FC = () => {
  const { currentUser, canMutateData } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>(() => LSMSStorage.getLostFound());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Belum Diambil' | 'Sudah Diambil'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Claiming / Handover Modal state
  const [claimingItem, setClaimingItem] = useState<LostFoundItem | null>(null);
  const [claimName, setClaimName] = useState('');
  const [claimPhotoUrl, setClaimPhotoUrl] = useState('');
  const [claimPhotoInfo, setClaimPhotoInfo] = useState('');
  const [isCompressingClaimPhoto, setIsCompressingClaimPhoto] = useState(false);
  const claimFileInputRef = useRef<HTMLInputElement>(null);

  // Photo preview lightbox
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // New Item Form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [form, setForm] = useState({
    itemName: '',
    description: '',
    locationText: '',
    foundBy: '',
    storageLocation: 'Lemari Pos Satpam Utama',
    photoUrl: '',
    photoInfo: '',
  });

  const filtered = items.filter((i) => {
    const matchSearch =
      i.itemName.toLowerCase().includes(search.toLowerCase()) ||
      i.locationText.toLowerCase().includes(search.toLowerCase()) ||
      i.itemNo.toLowerCase().includes(search.toLowerCase()) ||
      (i.claimedBy && i.claimedBy.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'All' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const res = await compressImageToWebP(file, 1200, 0.75);
      setForm((prev) => ({
        ...prev,
        photoUrl: res.dataUrl,
        photoInfo: `${res.compressedSizeKb} KB WebP (hemat ${res.compressionRatioPercent}%)`,
      }));
    } catch (err) {
      console.error('Gagal mengompresi foto:', err);
      alert('Gagal memproses foto. Silakan coba gunakan foto lain.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClaimPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingClaimPhoto(true);
      const res = await compressImageToWebP(file, 1200, 0.75);
      setClaimPhotoUrl(res.dataUrl);
      setClaimPhotoInfo(`${res.compressedSizeKb} KB WebP (hemat ${res.compressionRatioPercent}%)`);
    } catch (err) {
      console.error('Gagal mengompresi foto penyerahan:', err);
      alert('Gagal memproses foto. Silakan coba gunakan foto lain.');
    } finally {
      setIsCompressingClaimPhoto(false);
      if (claimFileInputRef.current) claimFileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photoUrl: '',
      photoInfo: '',
    }));
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName || !form.locationText) return;

    LSMSStorage.saveLostFound({
      itemName: form.itemName,
      description: form.description,
      locationText: form.locationText,
      foundBy: form.foundBy || 'Siswa / Staf',
      receiverStaffId: currentUser.id,
      receiverStaffName: currentUser.fullName,
      storageLocation: form.storageLocation,
      photoUrl: form.photoUrl || undefined,
    });

    setItems(LSMSStorage.getLostFound());
    setIsModalOpen(false);
    setForm({
      itemName: '',
      description: '',
      locationText: '',
      foundBy: '',
      storageLocation: 'Lemari Pos Satpam Utama',
      photoUrl: '',
      photoInfo: '',
    });
  };

  const handleOpenClaimModal = (item: LostFoundItem) => {
    setClaimingItem(item);
    setClaimName('');
    setClaimPhotoUrl('');
    setClaimPhotoInfo('');
  };

  const handleClaim = () => {
    if (!claimingItem || !claimName) return;
    LSMSStorage.claimLostFound(claimingItem.id, claimName, claimPhotoUrl || undefined);
    setItems(LSMSStorage.getLostFound());
    setClaimingItem(null);
    setClaimName('');
    setClaimPhotoUrl('');
    setClaimPhotoInfo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PackageOpen className="w-6 h-6 text-blue-700" />
            Lost and Found (Barang Temuan)
          </h2>
          <p className="text-sm text-slate-500">
            Pencatatan barang tercecer di kampus sekolah dengan foto barang, verifikasi nama pengambil, dan foto bukti serah terima saat pengambilan.
          </p>
        </div>
        {canMutateData && (
          <Button size="md" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Catat Barang Temuan
          </Button>
        )}
      </div>

      {/* Control Bar: Search, Status Filter & View Toggle */}
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari barang, lokasi, pengambil..."
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus === 'All' ? 'bg-white text-blue-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({items.length})
            </button>
            <button
              onClick={() => setFilterStatus('Belum Diambil')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus === 'Belum Diambil' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Diambil ({items.filter((i) => i.status === 'Belum Diambil').length})
            </button>
            <button
              onClick={() => setFilterStatus('Sudah Diambil')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus === 'Sudah Diambil' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sudah Diambil ({items.filter((i) => i.status === 'Sudah Diambil').length})
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-medium ${
              viewMode === 'table' ? 'bg-white text-blue-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Tabel dengan Kolom Foto"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tabel & Foto</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded flex items-center gap-1.5 text-xs font-medium ${
              viewMode === 'cards' ? 'bg-white text-blue-800 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Tampilan Kartu Galeri"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kartu</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 border border-slate-200 rounded-xl text-center text-slate-500">
          <PackageOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700">Tidak ada barang temuan yang sesuai kriteria.</p>
          <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Catat Barang Temuan" untuk menambahkan barang baru.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW WITH EXPLICIT FOTO COLUMN */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20 text-center">Foto Barang</th>
                  <th className="py-3 px-4 w-36">No. Item & Status</th>
                  <th className="py-3 px-4">Nama Barang & Deskripsi</th>
                  <th className="py-3 px-4">Lokasi Temuan</th>
                  <th className="py-3 px-4">Penemu / Petugas</th>
                  <th className="py-3 px-4">Penyimpanan Pos</th>
                  <th className="py-3 px-4 min-w-[200px]">Serah Terima (Pengambil & Foto)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* FOTO BARANG COLUMN */}
                    <td className="py-2.5 px-4 text-center">
                      {item.photoUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPhoto({
                              url: item.photoUrl!,
                              title: item.itemName,
                              subtitle: `Foto Barang Ditemukan • ${item.itemNo} • Lokasi: ${item.locationText}`,
                            })
                          }
                          className="group relative inline-block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 hover:shadow-sm"
                          title="Klik untuk memperbesar foto barang temuan"
                        >
                          <img
                            src={item.photoUrl}
                            alt={item.itemName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        </button>
                      ) : (
                        <div
                          className="w-14 h-14 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 mx-auto"
                          title="Tidak ada foto barang"
                        >
                          <Camera className="w-4 h-4 mb-0.5 text-slate-300" />
                          <span className="text-[10px] leading-tight">No foto</span>
                        </div>
                      )}
                    </td>

                    {/* NO. ITEM & STATUS */}
                    <td className="py-2.5 px-4">
                      <div className="font-mono text-xs font-bold text-blue-900">{item.itemNo}</div>
                      <div className="mt-1">
                        <Badge variant={item.status === 'Sudah Diambil' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </div>
                    </td>

                    {/* NAMA BARANG */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.itemName}</div>
                      <div className="text-slate-500 text-xs mt-0.5 max-w-xs line-clamp-2">
                        {item.description || 'Tidak ada keterangan tambahan.'}
                      </div>
                    </td>

                    {/* LOKASI TEMUAN */}
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-slate-800">{item.locationText}</span>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">{formatDateTimeWIB(item.foundTime)}</div>
                    </td>

                    {/* PENEMU & PETUGAS */}
                    <td className="py-2.5 px-4 text-slate-600">
                      <div>Penemu: <strong className="text-slate-800">{item.foundBy}</strong></div>
                      <div className="text-slate-400 text-[11px]">Penerima: {item.receiverStaffName || 'Petugas'}</div>
                    </td>

                    {/* PENYIMPANAN */}
                    <td className="py-2.5 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-[11px] font-medium border border-slate-200">
                        {item.storageLocation}
                      </span>
                    </td>

                    {/* SERAH TERIMA: NAMA PENGAMBIL & FOTO BUKTI */}
                    <td className="py-2.5 px-4">
                      {item.status === 'Sudah Diambil' ? (
                        <div className="flex items-center gap-2.5 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          {item.handoverProofUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPhoto({
                                  url: item.handoverProofUrl!,
                                  title: `Bukti Serah Terima: ${item.itemName}`,
                                  subtitle: `Pengambil: ${item.claimedBy} • Waktu: ${formatDateTimeWIB(item.claimedAt!)}`,
                                })
                              }
                              className="group relative w-11 h-11 shrink-0 rounded-md overflow-hidden border border-emerald-300 bg-white hover:ring-2 hover:ring-emerald-500"
                              title="Klik untuk melihat foto bukti serah terima"
                            >
                              <img
                                src={item.handoverProofUrl}
                                alt="Bukti serah terima"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-11 h-11 shrink-0 rounded-md border border-dashed border-emerald-300 bg-white flex flex-col items-center justify-center text-emerald-400">
                              <Camera className="w-4 h-4 text-emerald-400" />
                              <span className="text-[9px]">No foto</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-emerald-900 truncate">
                              {item.claimedBy}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-mono">
                              {item.claimedAt ? formatDateTimeWIB(item.claimedAt) : '-'}
                            </div>
                            <span className="inline-block mt-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Telah Diambil
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Menunggu pemilik...</span>
                      )}
                    </td>

                    {/* AKSI */}
                    <td className="py-2.5 px-4 text-right">
                      {canMutateData && item.status === 'Belum Diambil' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<UserCheck className="w-3.5 h-3.5 text-blue-700" />}
                          onClick={() => handleOpenClaimModal(item)}
                        >
                          Serahkan
                        </Button>
                      ) : (
                        <span className="text-emerald-600 font-medium text-xs flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS / GALLERY VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Photo Header */}
                {item.photoUrl ? (
                  <div
                    onClick={() =>
                      setPreviewPhoto({
                        url: item.photoUrl!,
                        title: item.itemName,
                        subtitle: `${item.itemNo} • Ditemukan di ${item.locationText}`,
                      })
                    }
                    className="relative w-full h-44 bg-slate-100 cursor-pointer group overflow-hidden border-b border-slate-100"
                  >
                    <img
                      src={item.photoUrl}
                      alt={item.itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-medium text-xs">
                      <ZoomIn className="w-4 h-4" /> Perbesar Foto Barang
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-xs font-bold bg-white/90 backdrop-blur-xs text-blue-900 px-2 py-0.5 rounded shadow-xs">
                        {item.itemNo}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.status === 'Sudah Diambil' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold text-blue-800">{item.itemNo}</span>
                    <Badge variant={item.status === 'Sudah Diambil' ? 'success' : 'warning'}>
                      {item.status}
                    </Badge>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-base font-bold text-slate-900">{item.itemName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Ditemukan di: <strong className="text-slate-700">{item.locationText}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {item.description || 'Tidak ada deskripsi spesifik.'}
                  </p>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Disimpan di: <strong className="text-slate-700">{item.storageLocation}</strong></div>
                    <div>Penemu: <strong className="text-slate-700">{item.foundBy}</strong></div>
                  </div>

                  {/* Keterangan Pengambilan & Bukti Foto */}
                  {item.claimedBy && (
                    <div className="mt-3 pt-3 border-t border-slate-200 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-emerald-900">Serah Terima Pemilik</span>
                        <span className="text-[10px] font-mono text-emerald-700">
                          {item.claimedAt ? formatDateTimeWIB(item.claimedAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.handoverProofUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhoto({
                                url: item.handoverProofUrl!,
                                title: `Foto Bukti Serah Terima: ${item.itemName}`,
                                subtitle: `Pengambil: ${item.claimedBy} (${formatDateTimeWIB(item.claimedAt!)})`,
                              })
                            }
                            className="group relative w-12 h-12 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0 hover:ring-2 hover:ring-emerald-500"
                            title="Klik untuk perbesar foto serah terima"
                          >
                            <img
                              src={item.handoverProofUrl}
                              alt="Bukti Serah Terima"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500">Nama Pengambil:</div>
                          <div className="text-xs font-bold text-slate-900 truncate">{item.claimedBy}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                <span className="font-mono text-slate-400">{formatDateTimeWIB(item.foundTime)}</span>
                {canMutateData && item.status === 'Belum Diambil' && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<UserCheck className="w-3.5 h-3.5 text-blue-700" />}
                    onClick={() => handleOpenClaimModal(item)}
                  >
                    Serahkan ke Pemilik
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Item */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pencatatan Barang Temuan Baru"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          {/* FOTO UPLOAD SECTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Foto Dokumentasi Barang
            </label>

            {form.photoUrl ? (
              <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-50 p-2 flex items-center gap-4">
                <img
                  src={form.photoUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 text-emerald-700">
                    <ImageIcon className="w-4 h-4" /> Foto Terkompresi Siap Simpan
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{form.photoInfo}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium underline"
                    >
                      Ganti Foto
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Hapus Foto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-colors ${
                  isCompressing ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center py-2 text-blue-700">
                    <Loader2 className="w-6 h-6 animate-spin mb-1" />
                    <span className="text-xs font-medium">Mengompresi ke WebP hemat kuota...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Ambil Foto dengan Kamera atau Unggah File
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Otomatis dioptimasi ke WebP (&lt;200 KB) agar hemat kuota Supabase
                    </span>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Barang *</label>
              <input
                type="text"
                required
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                placeholder="Misal: Botol Minum Tupperware Hitam"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lokasi Ditemukan *</label>
              <input
                type="text"
                required
                value={form.locationText}
                onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                placeholder="Misal: Bawah bangku koridor SD Lt. 2"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ditemukan Oleh</label>
              <input
                type="text"
                value={form.foundBy}
                onChange={(e) => setForm({ ...form, foundBy: e.target.value })}
                placeholder="Nama siswa / guru / penemu"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lokasi Penyimpanan di Pos</label>
              <input
                type="text"
                value={form.storageLocation}
                onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi & Ciri Spesifik</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Warna, merk, stiker nama, atau kondisi fisik barang..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={isCompressing}>
              Simpan Barang Temuan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Claim (Penyerahan ke Pemilik) with Nama Pengambil & Foto */}
      <Modal
        isOpen={Boolean(claimingItem)}
        onClose={() => setClaimingItem(null)}
        title="Serah Terima Barang ke Pemilik"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-800 text-sm">{claimingItem?.itemName}</div>
            <div className="text-slate-500 font-mono">Kode: {claimingItem?.itemNo}</div>
            <div className="text-slate-600">Ditemukan di: {claimingItem?.locationText}</div>
          </div>

          {/* Kolom Nama Pengambil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nama Lengkap Pengambil / Pemilik *
            </label>
            <input
              type="text"
              required
              value={claimName}
              onChange={(e) => setClaimName(e.target.value)}
              placeholder="Nama lengkap wali murid / siswa / pengambil"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tuliskan nama jelas pihak yang menerima barang secara resmi.
            </p>
          </div>

          {/* Kolom Foto Bukti Serah Terima */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Foto Dokumentasi Serah Terima / Pengambil
            </label>

            {claimPhotoUrl ? (
              <div className="relative border border-emerald-300 rounded-xl overflow-hidden bg-emerald-50/50 p-2.5 flex items-center gap-3">
                <img
                  src={claimPhotoUrl}
                  alt="Bukti Serah Terima"
                  className="w-20 h-20 object-cover rounded-lg border border-emerald-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto Bukti Terlampir
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">{claimPhotoInfo}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => claimFileInputRef.current?.click()}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium underline"
                    >
                      Ganti Foto
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimPhotoUrl('');
                        setClaimPhotoInfo('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Hapus Foto
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isCompressingClaimPhoto && claimFileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors ${
                  isCompressingClaimPhoto ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isCompressingClaimPhoto ? (
                  <div className="flex flex-col items-center justify-center py-1 text-blue-700">
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                    <span className="text-xs font-medium">Mengompresi foto penyerahan...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Ambil Foto Pengambil / Dokumentasi Penyerahan
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Gunakan kamera HP atau pilih file foto sebagai bukti serah terima
                    </span>
                  </div>
                )}
              </div>
            )}

            <input
              ref={claimFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleClaimPhotoSelect}
              className="hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setClaimingItem(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleClaim}
              disabled={!claimName || isCompressingClaimPhoto}
            >
              Konfirmasi Serah Terima
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Lightbox Preview Modal */}
      {previewPhoto && (
        <Modal
          isOpen={Boolean(previewPhoto)}
          onClose={() => setPreviewPhoto(null)}
          title={previewPhoto.title}
          maxWidth="lg"
        >
          <div className="space-y-3">
            <div className="bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center max-h-[70vh]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            {previewPhoto.subtitle && (
              <p className="text-xs text-slate-500 text-center font-medium">{previewPhoto.subtitle}</p>
            )}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setPreviewPhoto(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
