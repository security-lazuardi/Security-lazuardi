import React, { useState } from 'react';
import { Truck, Plus, LogIn, LogOut, Search, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { VehicleMovement, Vehicle } from '../../types';
import { formatDateTimeWIB, formatTimeWIB } from '../../lib/formatters';

export const VehicleTrackingView: React.FC = () => {
  const { currentUser, canMutateData } = useAuth();
  const [movements, setMovements] = useState<VehicleMovement[]>(() => LSMSStorage.getVehicleMovements());
  const vehicles = LSMSStorage.getVehicles();
  const units = LSMSStorage.getUnits();

  const [search, setSearch] = useState('');
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [returningMovement, setReturningMovement] = useState<VehicleMovement | null>(null);
  const [endKmInput, setEndKmInput] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [formOut, setFormOut] = useState({
    vehicleId: vehicles[0]?.id || '',
    driverName: '',
    unitId: units[0]?.id || '',
    destination: '',
    startKm: 12500,
    notes: '',
  });

  const filtered = movements.filter(
    (m) =>
      (m.plateNumber && m.plateNumber.toLowerCase().includes(search.toLowerCase())) ||
      m.driverName.toLowerCase().includes(search.toLowerCase()) ||
      m.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordOut = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formOut.driverName || !formOut.destination || !formOut.startKm) {
      setErrorMsg('Harap lengkapi semua bidang wajib!');
      return;
    }

    try {
      const selectedVehicle = vehicles.find((v) => v.id === formOut.vehicleId);
      LSMSStorage.recordVehicleOut({
        vehicleId: formOut.vehicleId,
        plateNumber: selectedVehicle?.plateNumber,
        vehicleType: selectedVehicle?.vehicleType,
        driverName: formOut.driverName,
        unitId: formOut.unitId,
        destination: formOut.destination,
        startKm: Number(formOut.startKm),
        outOfficerId: currentUser.id,
        outOfficerName: currentUser.fullName,
        notes: formOut.notes,
      });

      setMovements(LSMSStorage.getVehicleMovements());
      setIsOutModalOpen(false);
      setFormOut({
        vehicleId: vehicles[0]?.id || '',
        driverName: '',
        unitId: units[0]?.id || '',
        destination: '',
        startKm: 12500,
        notes: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mencatat kendaraan keluar.');
    }
  };

  const handleRecordIn = () => {
    if (!returningMovement) return;
    setErrorMsg('');

    try {
      LSMSStorage.recordVehicleIn(returningMovement.id, Number(endKmInput), currentUser.fullName);
      setMovements(LSMSStorage.getVehicleMovements());
      setReturningMovement(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses kepulangan mobil.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Monitoring Kendaraan Sekolah</h2>
          <p className="text-sm text-slate-500">
            Pencatatan keluar-masuk mobil dinas, bus jemputan, dan motor operasional beserta pemantauan odometer KM.
          </p>
        </div>
        {canMutateData && (
          <Button
            size="md"
            icon={<LogOut className="w-4 h-4" />}
            onClick={() => {
              setErrorMsg('');
              setIsOutModalOpen(true);
            }}
          >
            Catat Kendaraan Keluar
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari plat nomor, driver, tujuan..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Log</th>
                <th className="px-4 py-3">Kendaraan</th>
                <th className="px-4 py-3">Driver & Tujuan</th>
                <th className="px-4 py-3">Jam Keluar</th>
                <th className="px-4 py-3">Jam Kembali</th>
                <th className="px-4 py-3">KM Awal / Akhir</th>
                <th className="px-4 py-3">Jarak Tempuh</th>
                <th className="px-4 py-3">Status</th>
                {canMutateData && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Belum ada riwayat pergerakan kendaraan.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const distance = m.endKm && m.startKm ? m.endKm - m.startKm : null;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-800 whitespace-nowrap">
                        {m.logNo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-xs">
                          {m.plateNumber}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{m.vehicleType}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{m.driverName}</div>
                        <div className="text-xs text-slate-500">Menuju: {m.destination}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {formatTimeWIB(m.outTime)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {m.inTime ? formatTimeWIB(m.inTime) : '-'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">
                        <span>{m.startKm} km</span>
                        {m.endKm && <span> &rarr; {m.endKm} km</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                        {distance !== null ? `${distance} km` : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={m.status === 'Masih Keluar' ? 'warning' : 'success'}>
                          {m.status}
                        </Badge>
                      </td>
                      {canMutateData && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {m.status === 'Masih Keluar' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<LogIn className="w-3.5 h-3.5 text-blue-700" />}
                              onClick={() => {
                                setErrorMsg('');
                                setReturningMovement(m);
                                setEndKmInput(m.startKm + 10);
                              }}
                            >
                              Catat Kembali
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
      </div>

      {/* Modal Out */}
      <Modal
        isOpen={isOutModalOpen}
        onClose={() => setIsOutModalOpen(false)}
        title="Catat Kendaraan Sekolah Keluar"
        maxWidth="md"
      >
        <form onSubmit={handleRecordOut} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pilih Kendaraan *</label>
            <select
              value={formOut.vehicleId}
              onChange={(e) => setFormOut({ ...formOut, vehicleId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white font-mono"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} — {v.vehicleType} ({v.brandModel})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Pengemudi / Driver *</label>
              <input
                type="text"
                required
                value={formOut.driverName}
                onChange={(e) => setFormOut({ ...formOut, driverName: e.target.value })}
                placeholder="Nama sopir"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kilometer (KM) Awal *</label>
              <input
                type="number"
                required
                value={formOut.startKm}
                onChange={(e) => setFormOut({ ...formOut, startKm: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tujuan Perjalanan *</label>
            <input
              type="text"
              required
              value={formOut.destination}
              onChange={(e) => setFormOut({ ...formOut, destination: e.target.value })}
              placeholder="Misal: Kantor Dinas Pendidikan Depok / Antar Siswa Lomba"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={formOut.notes}
              onChange={(e) => setFormOut({ ...formOut, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsOutModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Konfirmasi Kendaraan Keluar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal In */}
      <Modal
        isOpen={Boolean(returningMovement)}
        onClose={() => setReturningMovement(null)}
        title="Pencatatan Kendaraan Kembali"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div>Kendaraan: <strong className="font-mono text-slate-900">{returningMovement?.plateNumber}</strong></div>
            <div>Driver: <strong>{returningMovement?.driverName}</strong></div>
            <div>KM Awal: <strong className="font-mono">{returningMovement?.startKm} km</strong></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Kilometer (KM) Akhir Odometer *
            </label>
            <input
              type="number"
              required
              value={endKmInput}
              onChange={(e) => setEndKmInput(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button variant="outline" onClick={() => setReturningMovement(null)}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleRecordIn}>
              Simpan Kepulangan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
