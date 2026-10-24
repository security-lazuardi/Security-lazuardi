import React, { useState } from 'react';
import {
  Building2,
  Users2,
  Clock,
  MapPin,
  Car,
  AlertOctagon,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { Unit, StaffSecurity, PatrolLocation, Vehicle, Shift, IncidentCategory } from '../../types';

export const MasterDataView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'units' | 'staff' | 'shifts' | 'patrol' | 'vehicles' | 'categories'>('units');

  // State lists
  const [units, setUnits] = useState<Unit[]>(() => LSMSStorage.getUnits());
  const [staffList, setStaffList] = useState<StaffSecurity[]>(() => LSMSStorage.getStaff());
  const [patrolLocations, setPatrolLocations] = useState<PatrolLocation[]>(() => LSMSStorage.getPatrolLocations());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => LSMSStorage.getVehicles());
  const [categories, setCategories] = useState<IncidentCategory[]>(() => LSMSStorage.getCategories());
  const [shifts, setShifts] = useState<Shift[]>(() => LSMSStorage.getShifts());

  // Search filter
  const [search, setSearch] = useState('');

  // Modals for editing & adding
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [unitForm, setUnitForm] = useState({ code: '', name: '', picName: '', isActive: true });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffSecurity | null>(null);
  const [staffForm, setStaffForm] = useState({ name: '', nip: '', position: 'Anggota Security', phone: '', isActive: true });

  const [isPatrolModalOpen, setIsPatrolModalOpen] = useState(false);
  const [editingPatrol, setEditingPatrol] = useState<PatrolLocation | null>(null);
  const [patrolForm, setPatrolForm] = useState({
    code: '',
    name: '',
    description: '',
    latitude: -6.3725,
    longitude: 106.8285,
    radiusMeters: 50,
    qrToken: '',
    isActive: true,
  });

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ plateNumber: '', vehicleType: 'Mobil Dinas', brandModel: '', isActive: true });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IncidentCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    code: '',
    name: '',
    defaultPriority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    isActive: true,
  });

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({ name: 'Siang', startTime: '06:00', endTime: '18:00', description: '', isActive: true });

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRLocation, setSelectedQRLocation] = useState<PatrolLocation | null>(null);

  // Generic Deletion Confirmation Modal
  const [deletingTarget, setDeletingTarget] = useState<{
    type: 'unit' | 'staff' | 'patrol' | 'vehicle' | 'category' | 'shift';
    id: string;
    title: string;
  } | null>(null);

  // Unit handlers
  const handleOpenUnitModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({ code: unit.code, name: unit.name, picName: unit.picName, isActive: unit.isActive });
    } else {
      setEditingUnit(null);
      setUnitForm({ code: '', name: '', picName: '', isActive: true });
    }
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name || !unitForm.code) return;
    LSMSStorage.saveUnit({
      id: editingUnit?.id,
      code: unitForm.code.toUpperCase(),
      name: unitForm.name,
      picName: unitForm.picName,
      isActive: unitForm.isActive,
    });
    setUnits(LSMSStorage.getUnits());
    setIsUnitModalOpen(false);
  };

  // Staff handlers
  const handleOpenStaffModal = (staff?: StaffSecurity) => {
    if (staff) {
      setEditingStaff(staff);
      setStaffForm({
        name: staff.name,
        nip: staff.nip,
        position: staff.position,
        phone: staff.phone,
        isActive: staff.isActive,
      });
    } else {
      setEditingStaff(null);
      const nextNum = staffList.length + 1;
      setStaffForm({
        name: '',
        nip: `SEC-${String(nextNum).padStart(3, '0')}`,
        position: 'Anggota Security',
        phone: '0812',
        isActive: true,
      });
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.nip) return;
    LSMSStorage.saveStaff({
      id: editingStaff?.id,
      name: staffForm.name,
      nip: staffForm.nip,
      position: staffForm.position,
      phone: staffForm.phone,
      isActive: staffForm.isActive,
    });
    setStaffList(LSMSStorage.getStaff());
    setIsStaffModalOpen(false);
  };

  // Patrol location handlers
  const handleOpenPatrolModal = (loc?: PatrolLocation) => {
    if (loc) {
      setEditingPatrol(loc);
      setPatrolForm({
        code: loc.code,
        name: loc.name,
        description: loc.description,
        latitude: loc.latitude,
        longitude: loc.longitude,
        radiusMeters: loc.radiusMeters,
        qrToken: loc.qrToken,
        isActive: loc.isActive,
      });
    } else {
      setEditingPatrol(null);
      const code = `LOC-0${patrolLocations.length + 1}`;
      setPatrolForm({
        code,
        name: '',
        description: '',
        latitude: -6.3725,
        longitude: 106.8285,
        radiusMeters: 50,
        qrToken: `LAZ-PATROL-${code}`,
        isActive: true,
      });
    }
    setIsPatrolModalOpen(true);
  };

  const handleSavePatrol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patrolForm.code || !patrolForm.name) return;
    LSMSStorage.savePatrolLocation({
      id: editingPatrol?.id,
      code: patrolForm.code,
      name: patrolForm.name,
      description: patrolForm.description,
      latitude: Number(patrolForm.latitude),
      longitude: Number(patrolForm.longitude),
      radiusMeters: Number(patrolForm.radiusMeters),
      qrToken: patrolForm.qrToken,
      isActive: patrolForm.isActive,
    });
    setPatrolLocations(LSMSStorage.getPatrolLocations());
    setIsPatrolModalOpen(false);
  };

  const handleRegenerateQR = (locId: string) => {
    const newToken = LSMSStorage.regenerateQRToken(locId);
    setPatrolLocations(LSMSStorage.getPatrolLocations());
    if (selectedQRLocation && selectedQRLocation.id === locId) {
      setSelectedQRLocation({ ...selectedQRLocation, qrToken: newToken });
    }
  };

  // Vehicle handlers
  const handleOpenVehicleModal = (veh?: Vehicle) => {
    if (veh) {
      setEditingVehicle(veh);
      setVehicleForm({
        plateNumber: veh.plateNumber,
        vehicleType: veh.vehicleType,
        brandModel: veh.brandModel,
        isActive: veh.isActive,
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({
        plateNumber: '',
        vehicleType: 'Mobil Dinas',
        brandModel: '',
        isActive: true,
      });
    }
    setIsVehicleModalOpen(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.plateNumber || !vehicleForm.brandModel) return;
    LSMSStorage.saveVehicle({
      id: editingVehicle?.id,
      plateNumber: vehicleForm.plateNumber.toUpperCase(),
      vehicleType: vehicleForm.vehicleType,
      brandModel: vehicleForm.brandModel,
      isActive: vehicleForm.isActive,
    });
    setVehicles(LSMSStorage.getVehicles());
    setIsVehicleModalOpen(false);
  };

  // Category handlers
  const handleOpenCategoryModal = (cat?: IncidentCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        code: cat.code,
        name: cat.name,
        defaultPriority: cat.defaultPriority,
        isActive: cat.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        code: `CAT-0${categories.length + 1}`,
        name: '',
        defaultPriority: 'Medium',
        isActive: true,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.code || !categoryForm.name) return;
    LSMSStorage.saveCategory({
      id: editingCategory?.id,
      code: categoryForm.code.toUpperCase(),
      name: categoryForm.name,
      defaultPriority: categoryForm.defaultPriority,
      isActive: categoryForm.isActive,
    });
    setCategories(LSMSStorage.getCategories());
    setIsCategoryModalOpen(false);
  };

  // Shift handlers
  const handleOpenShiftModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setShiftForm({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        description: shift.description || '',
        isActive: shift.isActive,
      });
    } else {
      setEditingShift(null);
      setShiftForm({
        name: 'Tambahan',
        startTime: '08:00',
        endTime: '16:00',
        description: '',
        isActive: true,
      });
    }
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) return;
    LSMSStorage.saveShift({
      id: editingShift?.id || `shift-${Date.now()}`,
      name: shiftForm.name,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      description: shiftForm.description,
      isActive: shiftForm.isActive,
    });
    setShifts(LSMSStorage.getShifts());
    setIsShiftModalOpen(false);
  };

  // Confirm delete handler
  const handleExecuteDelete = () => {
    if (!deletingTarget) return;
    const { type, id } = deletingTarget;

    if (type === 'unit') {
      LSMSStorage.deleteUnit(id);
      setUnits(LSMSStorage.getUnits());
    } else if (type === 'staff') {
      LSMSStorage.deleteStaff(id);
      setStaffList(LSMSStorage.getStaff());
    } else if (type === 'patrol') {
      LSMSStorage.deletePatrolLocation(id);
      setPatrolLocations(LSMSStorage.getPatrolLocations());
    } else if (type === 'vehicle') {
      LSMSStorage.deleteVehicle(id);
      setVehicles(LSMSStorage.getVehicles());
    } else if (type === 'category') {
      LSMSStorage.deleteCategory(id);
      setCategories(LSMSStorage.getCategories());
    } else if (type === 'shift') {
      LSMSStorage.deleteShift(id);
      setShifts(LSMSStorage.getShifts());
    }

    setDeletingTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Master Data Keamanan</h2>
          <p className="text-sm text-slate-500">
            Kelola data master unit, staf security, lokasi patroli, kendaraan, kategori insiden, dan shift kerja.
            {isAdmin && (
              <span className="text-blue-700 font-semibold ml-1">
                (Role Administrator: Akses Penuh Edit & Hapus Master Data)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'units'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Unit Sekolah ({units.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Staff Security ({staffList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('patrol')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'patrol'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Titik Kontrol Patroli ({patrolLocations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'vehicles'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Armada Kendaraan ({vehicles.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Kategori Insiden ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'shifts'
              ? 'bg-[#1565C0] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Jadwal Shift ({shifts.length})</span>
        </button>
      </div>

      {/* Tab: Units */}
      {activeTab === 'units' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800">Daftar Unit Sekolah & Bagian</h3>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenUnitModal()}>
                Tambah Unit
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Unit</th>
                  <th className="px-4 py-3">Penanggung Jawab (PIC)</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">{unit.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{unit.name}</td>
                    <td className="px-4 py-3 text-slate-600">{unit.picName || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={unit.isActive ? 'success' : 'neutral'}>
                        {unit.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenUnitModal(unit)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                          onClick={() =>
                            setDeletingTarget({
                              type: 'unit',
                              id: unit.id,
                              title: `Unit ${unit.name} (${unit.code})`,
                            })
                          }
                        >
                          Hapus
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Staff Security */}
      {activeTab === 'staff' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Personel Staff Security Lazuardi</h3>
              <p className="text-xs text-slate-500">Personel Satpam Resmi Terdaftar</p>
            </div>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenStaffModal()}>
                Tambah Petugas
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">NIP</th>
                  <th className="px-4 py-3">Nama Petugas</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">Nomor Telepon / WhatsApp</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">{staff.nip}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{staff.name}</td>
                    <td className="px-4 py-3 text-slate-600">{staff.position}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{staff.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant={staff.isActive ? 'success' : 'neutral'}>
                        {staff.isActive ? 'Aktif Bertugas' : 'Nonaktif'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenStaffModal(staff)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                          onClick={() =>
                            setDeletingTarget({
                              type: 'staff',
                              id: staff.id,
                              title: `Petugas ${staff.name} (${staff.nip})`,
                            })
                          }
                        >
                          Hapus
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Patrol Locations */}
      {activeTab === 'patrol' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Master Titik Kontrol Patroli</h3>
              <p className="text-xs text-slate-500">Koordinat GPS & Identifier QR Code Anti-Tamper</p>
            </div>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenPatrolModal()}>
                Tambah Titik Patroli
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Lokasi</th>
                  <th className="px-4 py-3">Koordinat GPS</th>
                  <th className="px-4 py-3">Radius Toleransi</th>
                  <th className="px-4 py-3">QR Token</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patrolLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{loc.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{loc.name}</div>
                      <div className="text-xs text-slate-500">{loc.description}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {loc.latitude}, {loc.longitude}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{loc.radiusMeters} meter</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedQRLocation(loc);
                          setIsQRModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-mono font-medium"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Lihat QR</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenPatrolModal(loc)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                            onClick={() =>
                              setDeletingTarget({
                                type: 'patrol',
                                id: loc.id,
                                title: `Titik Patroli ${loc.name} (${loc.code})`,
                              })
                            }
                          >
                            Hapus
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-800">Armada Kendaraan Operasional Sekolah</h3>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenVehicleModal()}>
                Tambah Kendaraan
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nomor Polisi</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Merek / Model</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 bg-slate-50 inline-block m-2 rounded px-2 border border-slate-300">
                      {v.plateNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{v.vehicleType}</td>
                    <td className="px-4 py-3 text-slate-600">{v.brandModel}</td>
                    <td className="px-4 py-3">
                      <Badge variant={v.isActive ? 'success' : 'neutral'}>
                        {v.isActive ? 'Siap Operasional' : 'Nonaktif'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenVehicleModal(v)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                          onClick={() =>
                            setDeletingTarget({
                              type: 'vehicle',
                              id: v.id,
                              title: `Kendaraan ${v.plateNumber} (${v.brandModel})`,
                            })
                          }
                        >
                          Hapus
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Incident Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Master Kategori Insiden & Prioritas</h3>
              <p className="text-xs text-slate-500">Klasifikasi insiden dan prioritas eskalasi darurat</p>
            </div>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenCategoryModal()}>
                Tambah Kategori
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Prioritas Default</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{c.code}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          c.defaultPriority === 'Critical'
                            ? 'danger'
                            : c.defaultPriority === 'High'
                            ? 'warning'
                            : c.defaultPriority === 'Medium'
                            ? 'primary'
                            : 'neutral'
                        }
                      >
                        {c.defaultPriority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.isActive ? 'success' : 'neutral'}>
                        {c.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenCategoryModal(c)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                          onClick={() =>
                            setDeletingTarget({
                              type: 'category',
                              id: c.id,
                              title: `Kategori ${c.name} (${c.code})`,
                            })
                          }
                        >
                          Hapus
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Shifts */}
      {activeTab === 'shifts' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Shift Kerja Satpam</h3>
              <p className="text-xs text-slate-500">Pengaturan jadwal shift jaga security 24 jam</p>
            </div>
            {isAdmin && (
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenShiftModal()}>
                Tambah Shift
              </Button>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((s) => (
              <div key={s.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold text-slate-900">Shift {s.name}</span>
                    <Badge variant={s.isActive ? 'primary' : 'neutral'}>
                      {s.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#1565C0]">
                    {s.startTime} – {s.endTime} WIB
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {s.description || 'Pengaturan penugasan shift petugas keamanan sekolah.'}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenShiftModal(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      onClick={() =>
                        setDeletingTarget({
                          type: 'shift',
                          id: s.id,
                          title: `Shift ${s.name} (${s.startTime} - ${s.endTime})`,
                        })
                      }
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Modal */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        title={editingUnit ? 'Edit Unit Sekolah' : 'Tambah Unit Sekolah'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kode Unit</label>
            <input
              type="text"
              required
              value={unitForm.code}
              onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
              placeholder="Misal: SMA, LAB"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none uppercase font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Unit</label>
            <input
              type="text"
              required
              value={unitForm.name}
              onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
              placeholder="Misal: SMA Lazuardi"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Penanggung Jawab (PIC)</label>
            <input
              type="text"
              value={unitForm.picName}
              onChange={(e) => setUnitForm({ ...unitForm, picName: e.target.value })}
              placeholder="Nama kepala unit / PIC"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="unitActive"
              checked={unitForm.isActive}
              onChange={(e) => setUnitForm({ ...unitForm, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="unitActive" className="text-sm text-slate-700 font-medium">
              Status Unit Aktif
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsUnitModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={editingStaff ? 'Edit Data Petugas' : 'Tambah Petugas Security'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">NIP Petugas</label>
            <input
              type="text"
              required
              value={staffForm.nip}
              onChange={(e) => setStaffForm({ ...staffForm, nip: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              placeholder="Nama lengkap satpam"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jabatan</label>
            <select
              value={staffForm.position}
              onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value="Komandan Regu">Komandan Regu (Danru)</option>
              <option value="Anggota Security">Anggota Security</option>
              <option value="Petugas Patroli">Petugas Patroli</option>
              <option value="Petugas Pos Gerbang">Petugas Pos Gerbang</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor WhatsApp / HP</label>
            <input
              type="text"
              value={staffForm.phone}
              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              placeholder="0812xxxxxxxx"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="staffActive"
              checked={staffForm.isActive}
              onChange={(e) => setStaffForm({ ...staffForm, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="staffActive" className="text-sm text-slate-700 font-medium">
              Status Petugas Aktif Bertugas
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsStaffModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Patrol Location Modal */}
      <Modal
        isOpen={isPatrolModalOpen}
        onClose={() => setIsPatrolModalOpen(false)}
        title={editingPatrol ? 'Edit Titik Patroli' : 'Tambah Titik Patroli'}
        maxWidth="lg"
      >
        <form onSubmit={handleSavePatrol} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kode Titik</label>
              <input
                type="text"
                required
                value={patrolForm.code}
                onChange={(e) => setPatrolForm({ ...patrolForm, code: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Radius Toleransi (Meter)</label>
              <input
                type="number"
                required
                value={patrolForm.radiusMeters}
                onChange={(e) => setPatrolForm({ ...patrolForm, radiusMeters: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Titik Patroli</label>
            <input
              type="text"
              required
              value={patrolForm.name}
              onChange={(e) => setPatrolForm({ ...patrolForm, name: e.target.value })}
              placeholder="Misal: Pos Belakang & Pagar Barat"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Deskripsi & Instruksi Cek</label>
            <textarea
              rows={2}
              value={patrolForm.description}
              onChange={(e) => setPatrolForm({ ...patrolForm, description: e.target.value })}
              placeholder="Detail objek yang wajib diperiksa petugas saat berada di titik ini..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Latitude GPS</label>
              <input
                type="number"
                step="0.0000001"
                required
                value={patrolForm.latitude}
                onChange={(e) => setPatrolForm({ ...patrolForm, latitude: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Longitude GPS</label>
              <input
                type="number"
                step="0.0000001"
                required
                value={patrolForm.longitude}
                onChange={(e) => setPatrolForm({ ...patrolForm, longitude: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsPatrolModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Titik
            </Button>
          </div>
        </form>
      </Modal>

      {/* Vehicle Modal */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        title={editingVehicle ? 'Edit Armada Kendaraan' : 'Tambah Armada Kendaraan'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nomor Polisi *</label>
            <input
              type="text"
              required
              value={vehicleForm.plateNumber}
              onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
              placeholder="Misal: B 1234 SCL"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jenis Kendaraan</label>
            <select
              value={vehicleForm.vehicleType}
              onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value="Mobil Dinas">Mobil Dinas</option>
              <option value="Elf / Bus Sekolah">Elf / Bus Sekolah</option>
              <option value="Motor Operasional">Motor Operasional</option>
              <option value="Ambulans Sekolah">Ambulans Sekolah</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Merek & Model *</label>
            <input
              type="text"
              required
              value={vehicleForm.brandModel}
              onChange={(e) => setVehicleForm({ ...vehicleForm, brandModel: e.target.value })}
              placeholder="Misal: Toyota Innova Reborn Silver"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="vehActive"
              checked={vehicleForm.isActive}
              onChange={(e) => setVehicleForm({ ...vehicleForm, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="vehActive" className="text-sm text-slate-700 font-medium">
              Status Siap Operasional
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsVehicleModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Kendaraan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Kategori Insiden' : 'Tambah Kategori Insiden'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Kode Kategori *</label>
            <input
              type="text"
              required
              value={categoryForm.code}
              onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
              placeholder="Misal: KCL, PTK"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono uppercase focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Kategori *</label>
            <input
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Misal: Kecelakaan Siswa / Kerusakan Fasilitas"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prioritas Default</label>
            <select
              value={categoryForm.defaultPriority}
              onChange={(e) => setCategoryForm({ ...categoryForm, defaultPriority: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value="Low">Low (Rendah)</option>
              <option value="Medium">Medium (Sedang)</option>
              <option value="High">High (Tinggi)</option>
              <option value="Critical">Critical (Kritis)</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="catActive"
              checked={categoryForm.isActive}
              onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="catActive" className="text-sm text-slate-700 font-medium">
              Status Kategori Aktif
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsCategoryModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>

      {/* Shift Modal */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={editingShift ? 'Edit Jadwal Shift' : 'Tambah Jadwal Shift'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveShift} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Shift *</label>
            <input
              type="text"
              required
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              placeholder="Misal: Pagi, Siang, Malam"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jam Mulai (WIB)</label>
              <input
                type="time"
                required
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Jam Selesai (WIB)</label>
              <input
                type="time"
                required
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Keterangan / Tugas Pokok</label>
            <textarea
              rows={2}
              value={shiftForm.description}
              onChange={(e) => setShiftForm({ ...shiftForm, description: e.target.value })}
              placeholder="Deskripsi tugas pengawasan pada shift ini..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsShiftModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Shift
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Viewer Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="QR Code Titik Patroli"
        subtitle={selectedQRLocation ? `${selectedQRLocation.code} — ${selectedQRLocation.name}` : ''}
        maxWidth="md"
      >
        {selectedQRLocation && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-white border-2 border-dashed border-slate-300 rounded-2xl inline-block shadow-inner mx-auto">
              <div className="w-56 h-56 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <QrCode className="w-40 h-40 text-white opacity-95" />
                <div className="absolute bottom-2 text-[10px] font-mono tracking-wider text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
                  {selectedQRLocation.code}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block uppercase">QR Token Identifier</span>
              <span className="text-sm font-mono font-bold text-blue-700 select-all block mt-0.5">
                {selectedQRLocation.qrToken}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Cetak dan tempelkan QR Code ini pada plat akrilik di lokasi fisik. Petugas akan memindai QR ini melalui kamera PWA smartphone saat bertugas.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-200">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => handleRegenerateQR(selectedQRLocation.id)}
                >
                  Regenerasi Token
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
              >
                Cetak Lembar QR
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Deletion Modal */}
      {deletingTarget && (
        <Modal
          isOpen={Boolean(deletingTarget)}
          onClose={() => setDeletingTarget(null)}
          title="Konfirmasi Hapus Master Data"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Tindakan ini tidak dapat dibatalkan!</p>
                <p>
                  Apakah Anda yakin ingin menghapus data <strong>{deletingTarget.title}</strong>?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setDeletingTarget(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleExecuteDelete}
              >
                Ya, Hapus Data
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
