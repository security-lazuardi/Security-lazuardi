import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { Incident, IncidentCategory, Unit } from '../../types';
import { formatDateTimeWIB } from '../../lib/formatters';

export const IncidentManagementView: React.FC = () => {
  const { currentUser, canMutateData, isSupervisor } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>(() => LSMSStorage.getIncidents());
  const units = LSMSStorage.getUnits();
  const categories = LSMSStorage.getUnits(); // or categories

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: 'cat-01',
    categoryName: 'Kecelakaan',
    locationText: '',
    unitId: units[0]?.id || '',
    chronology: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    handlingNotes: '',
  });

  const [resolutionInput, setResolutionInput] = useState('');

  const filteredIncidents = incidents.filter((i) => {
    if (filterPriority !== 'all' && i.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.incidentNo.toLowerCase().includes(q) ||
        i.locationText.toLowerCase().includes(q) ||
        i.chronology.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationText || !formData.chronology) return;

    const unit = units.find((u) => u.id === formData.unitId);

    const newInc = LSMSStorage.saveIncident({
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      locationText: formData.locationText,
      unitId: formData.unitId,
      unitName: unit?.name || 'Sekolah',
      incidentTime: new Date().toISOString(),
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      chronology: formData.chronology,
      priority: formData.priority,
      status: 'Open',
      handlingNotes: formData.handlingNotes,
    });

    setIncidents(LSMSStorage.getIncidents());
    setIsModalOpen(false);
    setFormData({
      categoryId: 'cat-01',
      categoryName: 'Kecelakaan',
      locationText: '',
      unitId: units[0]?.id || '',
      chronology: '',
      priority: 'Medium',
      handlingNotes: '',
    });
  };

  const handleUpdateStatus = (incident: Incident, nextStatus: 'Progress' | 'Closed') => {
    LSMSStorage.saveIncident({
      ...incident,
      status: nextStatus,
      resolutionNotes: resolutionInput || incident.resolutionNotes,
      closedAt: nextStatus === 'Closed' ? new Date().toISOString() : undefined,
    });
    setIncidents(LSMSStorage.getIncidents());
    if (selectedIncident && selectedIncident.id === incident.id) {
      setSelectedIncident({
        ...selectedIncident,
        status: nextStatus,
        resolutionNotes: resolutionInput || incident.resolutionNotes,
        closedAt: nextStatus === 'Closed' ? new Date().toISOString() : undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Incident Management</h2>
          <p className="text-sm text-slate-500">
            Pelaporan kejadian/insiden keamanan sekolah, penanganan disposisi, dan evaluasi kronologi.
          </p>
        </div>
        {canMutateData && (
          <Button
            size="md"
            variant="danger"
            icon={<AlertOctagon className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Lapor Insiden Baru
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors whitespace-nowrap ${
                filterPriority === p
                  ? 'bg-[#1565C0] text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p === 'all' ? 'Semua Prioritas' : p}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor, lokasi, kronologi..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.length === 0 ? (
          <div className="col-span-full bg-white p-12 border border-slate-200 rounded-xl text-center text-slate-500">
            Tidak ada laporan insiden pada kategori ini.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                setSelectedIncident(inc);
                setResolutionInput(inc.resolutionNotes || '');
              }}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-sm ${
                inc.priority === 'Critical'
                  ? 'bg-rose-50/20 border-rose-300 hover:border-rose-400'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-800">{inc.incidentNo}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={
                        inc.priority === 'Critical'
                          ? 'danger'
                          : inc.priority === 'High'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {inc.priority}
                    </Badge>
                    <Badge variant={inc.status === 'Closed' ? 'success' : inc.status === 'Progress' ? 'primary' : 'warning'}>
                      {inc.status}
                    </Badge>
                  </div>
                </div>

                <div className="text-base font-bold text-slate-900">{inc.categoryName || 'Insiden'}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Lokasi: <strong>{inc.locationText}</strong> ({inc.unitName})
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 mt-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {inc.chronology}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{formatDateTimeWIB(inc.incidentTime)}</span>
                <span className="text-blue-700 font-sans font-semibold">Detail &rarr;</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Laporan Insiden Baru"
        subtitle="Laporkan insiden atau pelanggaran keamanan sekolah"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Kategori Insiden *
              </label>
              <select
                value={formData.categoryName}
                onChange={(e) =>
                  setFormData({ ...formData, categoryName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="Kecelakaan">Kecelakaan</option>
                <option value="Tabrakan">Tabrakan Kendaraan</option>
                <option value="Pertengkaran">Pertengkaran / Ketertiban</option>
                <option value="Masuk Tanpa Izin">Masuk Tanpa Izin</option>
                <option value="Kehilangan">Kehilangan Barang</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tingkat Prioritas *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white font-semibold"
              >
                <option value="Low">Low (Ringan)</option>
                <option value="Medium">Medium (Sedang)</option>
                <option value="High">High (Tinggi)</option>
                <option value="Critical">Critical (Kritis - Alarm Darurat)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Lokasi Spesifik Kejadian *
              </label>
              <input
                type="text"
                required
                value={formData.locationText}
                onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
                placeholder="Misal: Lapangan basket / Parkir barat"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Unit Terkait *
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Kronologi Kejadian *
            </label>
            <textarea
              required
              rows={3}
              value={formData.chronology}
              onChange={(e) => setFormData({ ...formData, chronology: e.target.value })}
              placeholder="Jelaskan secara kronologis waktu, pihak terlibat, dan fakta kejadian..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tindakan Penanganan Awal Satpam
            </label>
            <textarea
              rows={2}
              value={formData.handlingNotes}
              onChange={(e) => setFormData({ ...formData, handlingNotes: e.target.value })}
              placeholder="Tindakan pertama yang telah dilakukan petugas di pos/lokasi..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" type="submit">
              Kirim Laporan Insiden
            </Button>
          </div>
        </form>
      </Modal>

      {/* Incident Detail & Disposition Modal */}
      <Modal
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident ? `Insiden ${selectedIncident.incidentNo}` : ''}
        subtitle={selectedIncident ? `${selectedIncident.categoryName} · ${formatDateTimeWIB(selectedIncident.incidentTime)}` : ''}
        maxWidth="lg"
      >
        {selectedIncident && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-500">Prioritas:</span>
                <span className="font-bold text-slate-900 ml-1.5">{selectedIncident.priority}</span>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-blue-700 ml-1.5">{selectedIncident.status}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Kronologi</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {selectedIncident.chronology}
              </p>
            </div>

            {selectedIncident.handlingNotes && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1">Tindakan Penanganan Awal</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedIncident.handlingNotes}
                </p>
              </div>
            )}

            {isSupervisor && selectedIncident.status !== 'Closed' && (
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-slate-800 uppercase">
                  Catatan Penyelesaian Insiden (Supervisor):
                </label>
                <textarea
                  rows={2}
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  placeholder="Instruksi dan hasil investigasi penutupan insiden..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <div className="flex justify-end gap-2 pt-2">
                  {selectedIncident.status === 'Open' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedIncident, 'Progress')}
                    >
                      Tandai Sedang Diproses
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleUpdateStatus(selectedIncident, 'Closed')}
                  >
                    Tutup Insiden (Closed)
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedIncident(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
