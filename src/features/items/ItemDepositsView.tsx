import React, { useState, useRef } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  PenTool,
  RotateCcw,
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
import { ItemDeposit } from '../../types';
import { formatDateTimeWIB } from '../../lib/formatters';
import { compressImageToWebP } from '../../lib/image-optimizer';

export const ItemDepositsView: React.FC = () => {
  const { currentUser, canMutateData } = useAuth();
  const [deposits, setDeposits] = useState<ItemDeposit[]>(() => LSMSStorage.getItemDeposits());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Dititipkan' | 'Sudah Diambil'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Return / Handover Modal State
  const [returningDeposit, setReturningDeposit] = useState<ItemDeposit | null>(null);
  const [retrieverName, setRetrieverName] = useState('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');
  const [returnPhotoInfo, setReturnPhotoInfo] = useState('');
  const [isCompressingReturnPhoto, setIsCompressingReturnPhoto] = useState(false);
  const returnFileInputRef = useRef<HTMLInputElement>(null);

  // Photo preview lightbox
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // New Deposit Form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [form, setForm] = useState({
    ownerName: '',
    phone: '',
    itemDescription: '',
    quantity: 1,
    storageLocation: 'Loker Penitipan Pos Depan',
    photoUrl: '',
    photoInfo: '',
  });

  const filtered = deposits.filter((d) => {
    const matchSearch =
      d.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      d.itemDescription.toLowerCase().includes(search.toLowerCase()) ||
      d.depositNo.toLowerCase().includes(search.toLowerCase()) ||
      (d.retrievedByName && d.retrievedByName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'All' || d.status === filterStatus;
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
      console.error('Gagal mengompresi foto titipan:', err);
      alert('Gagal memproses foto. Silakan coba gunakan foto lain.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReturnPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingReturnPhoto(true);
      const res = await compressImageToWebP(file, 1200, 0.75);
      setReturnPhotoUrl(res.dataUrl);
      setReturnPhotoInfo(`${res.compressedSizeKb} KB WebP (hemat ${res.compressionRatioPercent}%)`);
    } catch (err) {
      console.error('Gagal mengompresi foto bukti pengambilan:', err);
      alert('Gagal memproses foto. Silakan coba gunakan foto lain.');
    } finally {
      setIsCompressingReturnPhoto(false);
      if (returnFileInputRef.current) returnFileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({
      ...prev,
      photoUrl: '',
      photoInfo: '',
    }));
  };

  const handleCreateDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ownerName || !form.itemDescription || !form.phone) return;

    LSMSStorage.saveItemDeposit({
      ownerName: form.ownerName,
      phone: form.phone,
      itemDescription: form.itemDescription,
      quantity: Number(form.quantity),
      receiverStaffId: currentUser.id,
      receiverStaffName: currentUser.fullName,
      storageLocation: form.storageLocation,
      photoUrl: form.photoUrl || undefined,
    });

    setDeposits(LSMSStorage.getItemDeposits());
    setIsModalOpen(false);
    setForm({
      ownerName: '',
      phone: '',
      itemDescription: '',
      quantity: 1,
      storageLocation: 'Loker Penitipan Pos Depan',
      photoUrl: '',
      photoInfo: '',
    });
  };

  // Canvas signature helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleOpenReturnModal = (item: ItemDeposit) => {
    setReturningDeposit(item);
    setRetrieverName(item.ownerName);
    setReturnPhotoUrl('');
    setReturnPhotoInfo('');
    setHasSignature(false);
    setTimeout(() => clearCanvas(), 50);
  };

  const handleReturnItem = () => {
    if (!returningDeposit || !retrieverName) return;

    let signatureData: string | undefined = undefined;
    if (hasSignature && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL('image/png');
    }

    LSMSStorage.returnItemDeposit(
      returningDeposit.id,
      currentUser.fullName,
      retrieverName,
      returnPhotoUrl || undefined,
      signatureData
    );

    setDeposits(LSMSStorage.getItemDeposits());
    setReturningDeposit(null);
    setRetrieverName('');
    setReturnPhotoUrl('');
    setReturnPhotoInfo('');
    clearCanvas();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-700" />
            Barang Titipan & Digital Signature
          </h2>
          <p className="text-sm text-slate-500">
            Penitipan barang bawaan pengunjung/wali murid dengan foto barang, identifikasi nama pengambil, foto serah terima, dan tanda tangan digital saat pengambilan.
          </p>
        </div>
        {canMutateData && (
          <Button size="md" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Catat Penitipan Barang
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
              placeholder="Cari pemilik, barang, pengambil..."
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
              Semua ({deposits.length})
            </button>
            <button
              onClick={() => setFilterStatus('Dititipkan')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus === 'Dititipkan' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif Dititipkan ({deposits.filter((d) => d.status === 'Dititipkan').length})
            </button>
            <button
              onClick={() => setFilterStatus('Sudah Diambil')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterStatus === 'Sudah Diambil' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sudah Diambil ({deposits.filter((d) => d.status === 'Sudah Diambil').length})
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
          <Briefcase className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700">Tidak ada barang titipan yang sesuai kriteria.</p>
          <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Catat Penitipan Barang" untuk mencatat titipan baru.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW WITH EXPLICIT FOTO COLUMN */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20 text-center">Foto Barang</th>
                  <th className="py-3 px-4 w-36">No. Titipan & Status</th>
                  <th className="py-3 px-4">Deskripsi Barang & Jumlah</th>
                  <th className="py-3 px-4">Pemilik & Kontak</th>
                  <th className="py-3 px-4">Loker Pos</th>
                  <th className="py-3 px-4">Petugas</th>
                  <th className="py-3 px-4 min-w-[210px]">Serah Terima (Pengambil & Foto)</th>
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
                              title: item.itemDescription,
                              subtitle: `Foto Barang Titipan • ${item.depositNo} • Milik: ${item.ownerName}`,
                            })
                          }
                          className="group relative inline-block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 hover:shadow-sm"
                          title="Klik untuk memperbesar foto barang titipan"
                        >
                          <img
                            src={item.photoUrl}
                            alt={item.itemDescription}
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

                    {/* NO. TITIPAN & STATUS */}
                    <td className="py-2.5 px-4">
                      <div className="font-mono text-xs font-bold text-blue-900">{item.depositNo}</div>
                      <div className="mt-1">
                        <Badge variant={item.status === 'Sudah Diambil' ? 'success' : 'primary'}>
                          {item.status}
                        </Badge>
                      </div>
                    </td>

                    {/* DESKRIPSI BARANG & JUMLAH */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.itemDescription}</div>
                      <div className="text-slate-600 text-xs mt-0.5">
                        Jumlah: <span className="font-mono font-semibold text-slate-800">{item.quantity} item</span>
                      </div>
                    </td>

                    {/* PEMILIK & KONTAK */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-800">{item.ownerName}</div>
                      <div className="font-mono text-slate-500 text-[11px] mt-0.5">{item.phone}</div>
                    </td>

                    {/* LOKASI LOKER */}
                    <td className="py-2.5 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-[11px] font-medium border border-slate-200">
                        {item.storageLocation}
                      </span>
                    </td>

                    {/* PENERIMA */}
                    <td className="py-2.5 px-4 text-slate-600">
                      <div>Penerima: {item.receiverStaffName || 'Petugas'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatDateTimeWIB(item.depositTime)}
                      </div>
                    </td>

                    {/* SERAH TERIMA PENGAMBILAN (NAMA & FOTO) */}
                    <td className="py-2.5 px-4">
                      {item.status === 'Sudah Diambil' ? (
                        <div className="flex items-center gap-2.5 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          {item.returnPhotoUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPhoto({
                                  url: item.returnPhotoUrl!,
                                  title: `Foto Pengambilan Titipan: ${item.itemDescription}`,
                                  subtitle: `Pengambil: ${item.retrievedByName || item.ownerName} • Waktu: ${formatDateTimeWIB(item.returnTime!)}`,
                                })
                              }
                              className="group relative w-11 h-11 shrink-0 rounded-md overflow-hidden border border-emerald-300 bg-white hover:ring-2 hover:ring-emerald-500"
                              title="Klik untuk melihat foto bukti pengambilan barang"
                            >
                              <img
                                src={item.returnPhotoUrl}
                                alt="Foto bukti ambil"
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
                              {item.retrievedByName || item.ownerName}
                            </div>
                            <div className="text-[10px] text-emerald-700 font-mono">
                              {item.returnTime ? formatDateTimeWIB(item.returnTime) : '-'}
                            </div>
                            {item.signatureData ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewPhoto({
                                    url: item.signatureData!,
                                    title: `Tanda Tangan Digital Pengambil: ${item.retrievedByName || item.ownerName}`,
                                    subtitle: `Nomor Titipan: ${item.depositNo}`,
                                  })
                                }
                                className="text-[9px] text-blue-700 hover:underline font-semibold flex items-center gap-0.5 mt-0.5"
                              >
                                <PenTool className="w-2.5 h-2.5" /> Lihat TTD
                              </button>
                            ) : (
                              <span className="text-[9px] text-slate-400">Tanpa TTD digital</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Masih di loker pos</span>
                      )}
                    </td>

                    {/* AKSI */}
                    <td className="py-2.5 px-4 text-right">
                      {canMutateData && item.status === 'Dititipkan' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<PenTool className="w-3.5 h-3.5 text-blue-700" />}
                          onClick={() => handleOpenReturnModal(item)}
                        >
                          Serah Ambil
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
                {/* Photo Header */}
                {item.photoUrl ? (
                  <div
                    onClick={() =>
                      setPreviewPhoto({
                        url: item.photoUrl!,
                        title: item.itemDescription,
                        subtitle: `${item.depositNo} • Milik ${item.ownerName} (${item.phone})`,
                      })
                    }
                    className="relative w-full h-44 bg-slate-100 cursor-pointer group overflow-hidden border-b border-slate-100"
                  >
                    <img
                      src={item.photoUrl}
                      alt={item.itemDescription}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-medium text-xs">
                      <ZoomIn className="w-4 h-4" /> Perbesar Foto Barang
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="font-mono text-xs font-bold bg-white/90 backdrop-blur-xs text-blue-900 px-2 py-0.5 rounded shadow-xs">
                        {item.depositNo}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant={item.status === 'Sudah Diambil' ? 'success' : 'primary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-mono text-xs font-bold text-blue-800">{item.depositNo}</span>
                    <Badge variant={item.status === 'Sudah Diambil' ? 'success' : 'primary'}>
                      {item.status}
                    </Badge>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-base font-bold text-slate-900">{item.itemDescription}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Pemilik: <strong>{item.ownerName}</strong> ({item.phone})
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>Jumlah: <strong className="text-slate-800">{item.quantity} item</strong></div>
                    <div>Penyimpanan: <strong className="text-slate-800">{item.storageLocation}</strong></div>
                    <div>Penerima: <strong className="text-slate-800">{item.receiverStaffName}</strong></div>
                  </div>

                  {/* Riwayat Pengambilan saat Sudah Diambil */}
                  {item.status === 'Sudah Diambil' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-emerald-900">Serah Terima Pengambilan</span>
                        <span className="text-[10px] font-mono text-emerald-700">
                          {item.returnTime ? formatDateTimeWIB(item.returnTime) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.returnPhotoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhoto({
                                url: item.returnPhotoUrl!,
                                title: `Foto Bukti Pengambilan: ${item.itemDescription}`,
                                subtitle: `Pengambil: ${item.retrievedByName || item.ownerName} (${formatDateTimeWIB(item.returnTime!)})`,
                              })
                            }
                            className="group relative w-12 h-12 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0 hover:ring-2 hover:ring-emerald-500"
                            title="Klik untuk perbesar foto bukti pengambilan"
                          >
                            <img
                              src={item.returnPhotoUrl}
                              alt="Bukti Pengambilan"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500">Nama Pengambil:</div>
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {item.retrievedByName || item.ownerName}
                          </div>
                          {item.signatureData && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewPhoto({
                                  url: item.signatureData!,
                                  title: `Tanda Tangan Digital Pengambil: ${item.retrievedByName || item.ownerName}`,
                                  subtitle: `Nomor Titipan: ${item.depositNo}`,
                                })
                              }
                              className="text-[10px] text-blue-700 hover:underline font-semibold flex items-center gap-0.5 mt-0.5"
                            >
                              <PenTool className="w-2.5 h-2.5" /> Lihat TTD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                <span className="font-mono text-slate-400">{formatDateTimeWIB(item.depositTime)}</span>
                {canMutateData && item.status === 'Dititipkan' && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<PenTool className="w-3.5 h-3.5 text-blue-700" />}
                    onClick={() => handleOpenReturnModal(item)}
                  >
                    Serah Ambil
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Deposit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Penitipan Barang Baru"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateDeposit} className="space-y-4">
          {/* FOTO UPLOAD SECTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Foto Dokumentasi Barang Titipan
            </label>

            {form.photoUrl ? (
              <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-50 p-2 flex items-center gap-4">
                <img
                  src={form.photoUrl}
                  alt="Preview Titipan"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Pemilik *</label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                placeholder="Nama wali murid / tamu"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0812xxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Isi & Deskripsi Barang *</label>
            <input
              type="text"
              required
              value={form.itemDescription}
              onChange={(e) => setForm({ ...form, itemDescription: e.target.value })}
              placeholder="Misal: Tas bekal makan & buku pelajaran siswa"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jumlah</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Lokasi Loker Pos</label>
              <input
                type="text"
                value={form.storageLocation}
                onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" disabled={isCompressing}>
              Simpan Titipan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Return & Digital Signature with Nama Pengambil & Foto */}
      <Modal
        isOpen={Boolean(returningDeposit)}
        onClose={() => setReturningDeposit(null)}
        title="Pengembalian Barang Titipan & Serah Terima"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-800 text-sm">{returningDeposit?.itemDescription}</div>
            <div className="text-slate-500 font-mono">No. Titipan: {returningDeposit?.depositNo}</div>
            <div className="text-slate-600">
              Pemilik Asal: <strong>{returningDeposit?.ownerName}</strong> ({returningDeposit?.phone})
            </div>
          </div>

          {/* Kolom Nama Pengambil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nama Lengkap Pengambil / Penerima *
            </label>
            <input
              type="text"
              required
              value={retrieverName}
              onChange={(e) => setRetrieverName(e.target.value)}
              placeholder="Nama pengambil (pemilik langsung / kurir / driver / perwakilan)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Dapat disesuaikan jika barang diambil oleh perwakilan keluarga atau driver.
            </p>
          </div>

          {/* Kolom Foto Bukti Pengambilan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Foto Dokumentasi Pengambilan / Bukti Serah Terima
            </label>

            {returnPhotoUrl ? (
              <div className="relative border border-emerald-300 rounded-xl overflow-hidden bg-emerald-50/50 p-2.5 flex items-center gap-3">
                <img
                  src={returnPhotoUrl}
                  alt="Bukti Pengambilan"
                  className="w-20 h-20 object-cover rounded-lg border border-emerald-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Foto Bukti Terlampir
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">{returnPhotoInfo}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => returnFileInputRef.current?.click()}
                      className="text-xs text-blue-700 hover:text-blue-900 font-medium underline"
                    >
                      Ganti Foto
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReturnPhotoUrl('');
                        setReturnPhotoInfo('');
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
                onClick={() => !isCompressingReturnPhoto && returnFileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors ${
                  isCompressingReturnPhoto ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isCompressingReturnPhoto ? (
                  <div className="flex flex-col items-center justify-center py-1 text-blue-700">
                    <Loader2 className="w-5 h-5 animate-spin mb-1" />
                    <span className="text-xs font-medium">Mengompresi foto bukti pengambilan...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Ambil Foto Pengambil / Dokumentasi Serah Terima
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Gunakan kamera HP atau file foto sebagai bukti verifikasi
                    </span>
                  </div>
                )}
              </div>
            )}

            <input
              ref={returnFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleReturnPhotoSelect}
              className="hidden"
            />
          </div>

          {/* Tanda Tangan Digital */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tanda Tangan Digital Pengambil *
            </label>
            <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-36 bg-white cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
                  Goreskan tanda tangan penerima di sini...
                </div>
              )}
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 text-xs flex items-center gap-1 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Bersihkan
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setReturningDeposit(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleReturnItem}
              disabled={!retrieverName || !hasSignature || isCompressingReturnPhoto}
            >
              Konfirmasi Selesai Ambil
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
