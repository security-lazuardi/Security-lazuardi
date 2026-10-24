/**
 * Lazuardi Security Management System (LSMS)
 * Storage Adapter & Indexed Local / Supabase Cloud Engine
 * Designed for maximum efficiency, Supabase Free Tier optimization & resilience.
 */

import {
  UserProfile,
  Unit,
  StaffSecurity,
  Shift,
  PatrolLocation,
  IncidentCategory,
  Vehicle,
  VisitorCard,
  VisitorCheckIn,
  DailySecurityReport,
  PatrolLog,
  Incident,
  LostFoundItem,
  ItemDeposit,
  VehicleMovement,
  NotificationItem,
  AuditLogItem,
  SystemHealthMetrics,
} from '../types';

// Default initial units
export const INITIAL_UNITS: Unit[] = [
  { id: 'u-1', code: 'INF', name: 'Informasi', picName: 'Ibu Rahmawati', isActive: true },
  { id: 'u-2', code: 'TK', name: 'TK Lazuardi', picName: 'Ibu Nurhayati', isActive: true },
  { id: 'u-3', code: 'SD', name: 'SD Lazuardi', picName: 'Bapak Bambang S.', isActive: true },
  { id: 'u-4', code: 'SMP', name: 'SMP Lazuardi', picName: 'Ibu Farida', isActive: true },
  { id: 'u-5', code: 'SUP', name: 'Support', picName: 'Bapak Agus Setiawan', isActive: true },
  { id: 'u-6', code: 'HRD', name: 'HRD', picName: 'Ibu Dian Safitri', isActive: true },
  { id: 'u-7', code: 'LTB', name: 'Litbang', picName: 'Bapak Hendra K.', isActive: true },
  { id: 'u-8', code: 'DIR', name: 'Direktorat', picName: 'Bapak Dr. H. Lazuardi', isActive: true },
];

// Initial Security Staff (10 Personel sesuai Master Prompt)
export const INITIAL_STAFF: StaffSecurity[] = [
  { id: 's-01', name: 'Ismail', nip: 'SEC-001', position: 'Komandan Regu', phone: '081298765001', isActive: true },
  { id: 's-02', name: 'Sarmdi', nip: 'SEC-002', position: 'Anggota Security', phone: '081298765002', isActive: true },
  { id: 's-03', name: 'Ahmad Soleh', nip: 'SEC-003', position: 'Anggota Security', phone: '081298765003', isActive: true },
  { id: 's-04', name: 'Andreas Maulana', nip: 'SEC-004', position: 'Anggota Security', phone: '081298765004', isActive: true },
  { id: 's-05', name: 'Moch Saepurrohman', nip: 'SEC-005', position: 'Anggota Security', phone: '081298765005', isActive: true },
  { id: 's-06', name: 'Rizki Maulana', nip: 'SEC-006', position: 'Anggota Security', phone: '081298765006', isActive: true },
  { id: 's-07', name: 'Coirul Fikri', nip: 'SEC-007', position: 'Anggota Security', phone: '081298765007', isActive: true },
  { id: 's-08', name: 'Andyka Jessy Saputra', nip: 'SEC-008', position: 'Anggota Security', phone: '081298765008', isActive: true },
  { id: 's-09', name: 'Aditya Nugraha', nip: 'SEC-009', position: 'Anggota Security', phone: '081298765009', isActive: true },
  { id: 's-10', name: 'Rizki Ramadhan', nip: 'SEC-010', position: 'Anggota Security', phone: '081298765010', isActive: true },
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 'sh-1', name: 'Siang', startTime: '06:00', endTime: '18:00', isActive: true },
  { id: 'sh-2', name: 'Malam', startTime: '18:00', endTime: '06:00', isActive: true },
];

export const INITIAL_PATROL_LOCATIONS: PatrolLocation[] = [
  {
    id: 'loc-01',
    code: 'LOC-01',
    name: 'Gerbang Utama & Pos Satpam',
    description: 'Pintu masuk dan pos registrasi tamu',
    latitude: -6.3725000,
    longitude: 106.8285000,
    radiusMeters: 50,
    qrToken: 'LAZ-PATROL-GERBANG-UTAMA',
    isActive: true,
  },
  {
    id: 'loc-02',
    code: 'LOC-02',
    name: 'Lobby Utama & Gedung Informasi',
    description: 'Area penerimaan tamu dan ruang tunggu',
    latitude: -6.3727000,
    longitude: 106.8287000,
    radiusMeters: 40,
    qrToken: 'LAZ-PATROL-LOBBY-INFORMASI',
    isActive: true,
  },
  {
    id: 'loc-03',
    code: 'LOC-03',
    name: 'Gedung TK & Area Playground',
    description: 'Area bermain anak dan ruang kelas TK',
    latitude: -6.3729000,
    longitude: 106.8282000,
    radiusMeters: 60,
    qrToken: 'LAZ-PATROL-GEDUNG-TK',
    isActive: true,
  },
  {
    id: 'loc-04',
    code: 'LOC-04',
    name: 'Gedung SD (Lantai 1 - 3)',
    description: 'Koridor kelas dan tangga darurat SD',
    latitude: -6.3732000,
    longitude: 106.8288000,
    radiusMeters: 75,
    qrToken: 'LAZ-PATROL-GEDUNG-SD',
    isActive: true,
  },
  {
    id: 'loc-05',
    code: 'LOC-05',
    name: 'Gedung SMP & Lab Sains',
    description: 'Laboratorium komputer, sains, dan kelas SMP',
    latitude: -6.3735000,
    longitude: 106.8290000,
    radiusMeters: 75,
    qrToken: 'LAZ-PATROL-GEDUNG-SMP',
    isActive: true,
  },
  {
    id: 'loc-06',
    code: 'LOC-06',
    name: 'Area Parkir & Lapangan Olahraga',
    description: 'Lapangan rumput, basket, dan parkir kendaraan',
    latitude: -6.3731000,
    longitude: 106.8295000,
    radiusMeters: 80,
    qrToken: 'LAZ-PATROL-PARKIR-LAPANGAN',
    isActive: true,
  },
  {
    id: 'loc-07',
    code: 'LOC-07',
    name: 'Kantin & Area Dapur Sekolah',
    description: 'Fasilitas kantin siswa dan sanitasi',
    latitude: -6.3737000,
    longitude: 106.8284000,
    radiusMeters: 50,
    qrToken: 'LAZ-PATROL-KANTIN-DAPUR',
    isActive: true,
  },
  {
    id: 'loc-08',
    code: 'LOC-08',
    name: 'Pagar Belakang & Jalur Evakuasi',
    description: 'Perbatasan pagar keliling dan pos jaga belakang',
    latitude: -6.3740000,
    longitude: 106.8288000,
    radiusMeters: 60,
    qrToken: 'LAZ-PATROL-PAGAR-BELAKANG',
    isActive: true,
  },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v-01', plateNumber: 'B 1928 SCL', vehicleType: 'Mobil Dinas', brandModel: 'Toyota Innova Reborn Silver', isActive: true },
  { id: 'v-02', plateNumber: 'B 7812 LZD', vehicleType: 'Elf / Bus Sekolah', brandModel: 'Isuzu Elf White-Blue', isActive: true },
  { id: 'v-03', plateNumber: 'B 4410 SQK', vehicleType: 'Motor Operasional', brandModel: 'Honda Beat ESP Hitam', isActive: true },
];

export const INITIAL_CATEGORIES: IncidentCategory[] = [
  { id: 'cat-01', code: 'KCL', name: 'Kecelakaan', defaultPriority: 'High', isActive: true },
  { id: 'cat-02', code: 'TBK', name: 'Tabrakan', defaultPriority: 'High', isActive: true },
  { id: 'cat-03', code: 'PTK', name: 'Pertengkaran', defaultPriority: 'Medium', isActive: true },
  { id: 'cat-04', code: 'MTI', name: 'Masuk Tanpa Izin', defaultPriority: 'Critical', isActive: true },
  { id: 'cat-05', code: 'KHL', name: 'Kehilangan', defaultPriority: 'Medium', isActive: true },
  { id: 'cat-06', code: 'LNN', name: 'Lainnya', defaultPriority: 'Low', isActive: true },
];

// Helper to initialize visitor cards CARD-001 s/d CARD-030
export const INITIAL_VISITOR_CARDS: VisitorCard[] = Array.from({ length: 30 }, (_, i) => ({
  cardNumber: `CARD-${String(i + 1).padStart(3, '0')}`,
  isInUse: false,
}));

// Default sample Lost and Found items with sample photos
export const INITIAL_LOST_FOUND: LostFoundItem[] = [
  {
    id: 'lf-01',
    itemNo: 'LF-20261023-101',
    itemName: 'Botol Minum Tupperware Hitam 750ml',
    description: 'Botol minum merk Tupperware warna hitam doff bertutup merah, tertinggal di bawah bangku.',
    foundTime: '2026-10-23T08:15:00Z',
    locationText: 'Koridor Kelas 4 SD Lantai 2',
    foundBy: 'Ibu Ratna (Guru SD)',
    receiverStaffId: 's-01',
    receiverStaffName: 'Bapak Ismail (Danru)',
    storageLocation: 'Lemari Pos Satpam Utama - Rak 2',
    photoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e0f2fe'/%3E%3Crect x='150' y='60' width='100' height='190' rx='24' fill='%230284c7' stroke='%230369a1' stroke-width='4'/%3E%3Crect x='170' y='35' width='60' height='30' rx='8' fill='%230369a1'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='15' fill='%230369a1' font-weight='bold' text-anchor='middle'%3EBotol Minum Tupperware Hitam%3C/text%3E%3C/svg%3E",
    status: 'Belum Diambil',
  },
  {
    id: 'lf-02',
    itemNo: 'LF-20261022-204',
    itemName: 'Jaket Hoodie Biru Dongker Lazuardi',
    description: 'Jaket seragam tebal ukuran M dengan bordir nama Rafif di bagian kerah.',
    foundTime: '2026-10-22T14:30:00Z',
    locationText: 'Tribun Lapangan Basket Outdoor',
    foundBy: 'Ahmad Soleh (Satpam)',
    receiverStaffId: 's-02',
    receiverStaffName: 'Ahmad Soleh (Satpam)',
    storageLocation: 'Lemari Pos Satpam Utama - Rak 1',
    photoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Cpath d='M120 70 L170 120 L230 120 L280 70 L340 130 L300 240 L260 240 L260 150 L140 150 L140 240 L100 240 L60 130 Z' fill='%231e3a8a' stroke='%231e293b' stroke-width='3'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='15' fill='%23334155' font-weight='bold' text-anchor='middle'%3EJaket Almamater Navy%3C/text%3E%3C/svg%3E",
    status: 'Sudah Diambil',
    claimedBy: 'Ny. Hendra (Walimurid Rafif)',
    claimedAt: '2026-10-23T07:20:00Z',
    handoverProofUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dcfce7'/%3E%3Ccircle cx='200' cy='110' r='50' fill='%2316a34a'/%3E%3Cpath d='M130 240 C130 180 270 180 270 240 Z' fill='%2315803d'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' fill='%2314532d' font-weight='bold' text-anchor='middle'%3EBukti Serah Terima: Ny. Hendra%3C/text%3E%3C/svg%3E",
  },
  {
    id: 'lf-03',
    itemNo: 'LF-20261023-315',
    itemName: 'Tempat Pensil Karakter Marvel & Kacamata',
    description: 'Kotak pensil warna merah berisi alat tulis lengkap dan kacamata minus bingkai hitam.',
    foundTime: '2026-10-23T10:00:00Z',
    locationText: 'Perpustakaan Gedung SMP',
    foundBy: 'Petugas Kebersihan',
    receiverStaffId: 's-03',
    receiverStaffName: 'Bambang Irawan',
    storageLocation: 'Kotak Kaca Pos Security Depan',
    photoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fee2e2'/%3E%3Crect x='100' y='90' width='200' height='100' rx='16' fill='%23dc2626' stroke='%23991b1b' stroke-width='4'/%3E%3Ctext x='200' y='150' font-family='sans-serif' font-size='18' fill='%23ffffff' font-weight='bold' text-anchor='middle'%3EMARVEL%3C/text%3E%3Ctext x='200' y='265' font-family='sans-serif' font-size='14' fill='%23991b1b' font-weight='bold' text-anchor='middle'%3EKotak Pensil & Kacamata%3C/text%3E%3C/svg%3E",
    status: 'Belum Diambil',
  },
];

// Default sample Item Deposits with sample photos
export const INITIAL_ITEM_DEPOSITS: ItemDeposit[] = [
  {
    id: 'dep-01',
    depositNo: 'DEP-20261023-501',
    ownerName: 'Ibu Cindy (Wali Murid)',
    phone: '081288992211',
    itemDescription: 'Paperbag Cokelat berisi Dokumen Pendaftaran & Obat Alergi Siswa',
    quantity: 1,
    depositTime: '2026-10-23T07:45:00Z',
    receiverStaffId: 's-01',
    receiverStaffName: 'Bapak Ismail (Danru)',
    storageLocation: 'Loker Penitipan Pos Depan - Loker 04',
    photoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fef3c7'/%3E%3Crect x='120' y='70' width='160' height='160' rx='10' fill='%23d97706' stroke='%2392400e' stroke-width='4'/%3E%3Cpath d='M160 70 C160 40 240 40 240 70' fill='none' stroke='%2392400e' stroke-width='5'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' fill='%2392400e' font-weight='bold' text-anchor='middle'%3EPaperbag Dokumen & Obat%3C/text%3E%3C/svg%3E",
    status: 'Dititipkan',
  },
  {
    id: 'dep-02',
    depositNo: 'DEP-20261023-502',
    ownerName: 'Pak Hendra (Vendor IT)',
    phone: '081398765432',
    itemDescription: 'Kardus Perangkat Switch Hub Cisco & Kabel Fiber Optik',
    quantity: 2,
    depositTime: '2026-10-23T08:30:00Z',
    receiverStaffId: 's-02',
    receiverStaffName: 'Ahmad Soleh (Satpam)',
    storageLocation: 'Ruang Server Pos Utama',
    photoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e2e8f0'/%3E%3Crect x='90' y='80' width='220' height='130' rx='8' fill='%23475569' stroke='%231e293b' stroke-width='4'/%3E%3Ccircle cx='130' cy='145' r='8' fill='%2322c55e'/%3E%3Ccircle cx='160' cy='145' r='8' fill='%2322c55e'/%3E%3Ccircle cx='190' cy='145' r='8' fill='%2322c55e'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' fill='%23334155' font-weight='bold' text-anchor='middle'%3EKardus Switch Hub Cisco%3C/text%3E%3C/svg%3E",
    status: 'Dititipkan',
  },
  {
    id: 'dep-03',
    depositNo: 'DEP-20261022-401',
    ownerName: 'Ibu Farida (Wali Murid)',
    phone: '081122334455',
    itemDescription: 'Termos Sup Makanan Hangat & Kotak Tupperware',
    quantity: 1,
    depositTime: '2026-10-22T09:15:00Z',
    receiverStaffId: 's-01',
    receiverStaffName: 'Bapak Ismail (Danru)',
    storageLocation: 'Loker Penitipan Pos Depan - Loker 02',
    photoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fef3c7'/%3E%3Crect x='130' y='80' width='140' height='150' rx='16' fill='%23ea580c' stroke='%23c2410c' stroke-width='4'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' fill='%239a3412' font-weight='bold' text-anchor='middle'%3ETermos Sup Makanan%3C/text%3E%3C/svg%3E",
    status: 'Sudah Diambil',
    returnTime: '2026-10-22T12:45:00Z',
    returnStaffId: 'Ahmad Soleh (Satpam)',
    retrievedByName: 'Pak Joko (Driver Wali Murid)',
    returnPhotoUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23dcfce7'/%3E%3Ccircle cx='200' cy='110' r='50' fill='%2316a34a'/%3E%3Cpath d='M130 240 C130 180 270 180 270 240 Z' fill='%2315803d'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' fill='%2314532d' font-weight='bold' text-anchor='middle'%3EBukti Ambil: Pak Joko (Driver)%3C/text%3E%3C/svg%3E",
  },
];

// Default system users with 4 roles
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-admin',
    email: 'admin@lazuardi.sch.id',
    fullName: 'Administrator Keamanan',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    lastLoginAt: '2026-10-23T07:15:00Z',
  },
  {
    id: 'u-supervisor',
    email: 'supervisor@lazuardi.sch.id',
    fullName: 'Bapak Ismail (Danru)',
    role: 'supervisor',
    unitId: 'u-1',
    unitName: 'Informasi',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: '2026-10-23T06:00:00Z',
  },
  {
    id: 'u-officer',
    email: 'officer@lazuardi.sch.id',
    fullName: 'Ahmad Soleh (Satpam)',
    role: 'officer',
    unitId: 'u-1',
    unitName: 'Informasi',
    isActive: true,
    createdAt: '2026-02-01T08:00:00Z',
    lastLoginAt: '2026-10-23T06:30:00Z',
  },
  {
    id: 'u-management',
    email: 'management@lazuardi.sch.id',
    fullName: 'Kepala Sekolah / Yayasan',
    role: 'management',
    isActive: true,
    createdAt: '2026-01-05T08:00:00Z',
    lastLoginAt: '2026-10-22T14:20:00Z',
  },
];

// Storage Keys
const STORAGE_KEYS = {
  UNITS: 'lsms_units',
  STAFF: 'lsms_staff',
  SHIFTS: 'lsms_shifts',
  PATROL_LOCATIONS: 'lsms_patrol_locations',
  VEHICLES: 'lsms_vehicles',
  CATEGORIES: 'lsms_incident_categories',
  VISITOR_CARDS: 'lsms_visitor_cards',
  VISITOR_CHECKINS: 'lsms_visitor_checkins',
  DAILY_REPORTS: 'lsms_daily_reports',
  PATROL_LOGS: 'lsms_patrol_logs',
  INCIDENTS: 'lsms_incidents',
  LOST_FOUND: 'lsms_lost_found',
  ITEM_DEPOSITS: 'lsms_item_deposits',
  VEHICLE_MOVEMENTS: 'lsms_vehicle_movements',
  NOTIFICATIONS: 'lsms_notifications',
  AUDIT_LOGS: 'lsms_audit_logs',
  CURRENT_USER: 'lsms_current_user',
  SUPABASE_CONFIG: 'lsms_supabase_config',
};

// Safe LocalStorage helpers
function readStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Storage initialization
export function initializeStorageIfNeeded(): void {
  if (!localStorage.getItem(STORAGE_KEYS.UNITS)) {
    writeStorage(STORAGE_KEYS.UNITS, INITIAL_UNITS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
    writeStorage(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
    writeStorage(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PATROL_LOCATIONS)) {
    writeStorage(STORAGE_KEYS.PATROL_LOCATIONS, INITIAL_PATROL_LOCATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    writeStorage(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    writeStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.VISITOR_CARDS)) {
    writeStorage(STORAGE_KEYS.VISITOR_CARDS, INITIAL_VISITOR_CARDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    writeStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default: Admin
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    // Seed initial notification
    writeStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif-1',
        title: 'Sistem Operasional Aktif',
        message: 'Lazuardi Security Management System (LSMS) telah siap digunakan.',
        priority: 'Info',
        module: 'Sistem',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOST_FOUND)) {
    writeStorage(STORAGE_KEYS.LOST_FOUND, INITIAL_LOST_FOUND);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ITEM_DEPOSITS)) {
    writeStorage(STORAGE_KEYS.ITEM_DEPOSITS, INITIAL_ITEM_DEPOSITS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    writeStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'audit-1',
        createdAt: new Date().toISOString(),
        userId: 'u-admin',
        userName: 'Administrator Keamanan',
        userRole: 'admin',
        module: 'Sistem',
        action: 'INITIALIZE',
        recordId: 'SYS-INIT',
        summary: 'Inisialisasi sistem LSMS dan pemuatan master data awal',
        ipAddress: '127.0.0.1',
      },
    ]);
  }
}

// Ensure init runs
initializeStorageIfNeeded();

// -------------------------------------------------------------------------
// DATA ADAPTER API METHODS
// -------------------------------------------------------------------------

export const LSMSStorage = {
  // Current Auth User
  getCurrentUser(): UserProfile {
    return readStorage<UserProfile>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },

  setCurrentUser(user: UserProfile): void {
    writeStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.logAudit({
      module: 'Autentikasi',
      action: 'SWITCH_ROLE',
      recordId: user.id,
      summary: `Pengguna beralih ke role ${user.role.toUpperCase()} (${user.fullName})`,
    });
  },

  getUsers(): UserProfile[] {
    return INITIAL_USERS;
  },

  // Units
  getUnits(): Unit[] {
    return readStorage<Unit[]>(STORAGE_KEYS.UNITS, INITIAL_UNITS);
  },

  saveUnit(unit: Omit<Unit, 'id'> & { id?: string }): Unit {
    const list = this.getUnits();
    if (unit.id) {
      const idx = list.findIndex((u) => u.id === unit.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...unit };
        writeStorage(STORAGE_KEYS.UNITS, list);
        this.logAudit({ module: 'Master Unit', action: 'UPDATE', recordId: unit.id, summary: `Update unit ${unit.name}` });
        return list[idx];
      }
    }
    const newUnit: Unit = { ...unit, id: `u-${Date.now()}` };
    list.push(newUnit);
    writeStorage(STORAGE_KEYS.UNITS, list);
    this.logAudit({ module: 'Master Unit', action: 'CREATE', recordId: newUnit.id, summary: `Tambah unit baru ${newUnit.name}` });
    return newUnit;
  },

  deleteUnit(id: string): void {
    const list = this.getUnits().filter((u) => u.id !== id);
    writeStorage(STORAGE_KEYS.UNITS, list);
    this.logAudit({ module: 'Master Unit', action: 'DELETE', recordId: id, summary: `Menghapus unit ID ${id}` });
  },

  // Staff Security
  getStaff(): StaffSecurity[] {
    return readStorage<StaffSecurity[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  },

  saveStaff(staff: Omit<StaffSecurity, 'id'> & { id?: string }): StaffSecurity {
    const list = this.getStaff();
    if (staff.id) {
      const idx = list.findIndex((s) => s.id === staff.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...staff };
        writeStorage(STORAGE_KEYS.STAFF, list);
        this.logAudit({ module: 'Master Staff', action: 'UPDATE', recordId: staff.id, summary: `Update data petugas ${staff.name}` });
        return list[idx];
      }
    }
    const newStaff: StaffSecurity = { ...staff, id: `s-${Date.now()}` };
    list.push(newStaff);
    writeStorage(STORAGE_KEYS.STAFF, list);
    this.logAudit({ module: 'Master Staff', action: 'CREATE', recordId: newStaff.id, summary: `Pendaftaran petugas baru ${newStaff.name}` });
    return newStaff;
  },

  deleteStaff(id: string): void {
    const list = this.getStaff().filter((s) => s.id !== id);
    writeStorage(STORAGE_KEYS.STAFF, list);
    this.logAudit({ module: 'Master Staff', action: 'DELETE', recordId: id, summary: `Menghapus petugas ID ${id}` });
  },

  // Shifts
  getShifts(): Shift[] {
    return readStorage<Shift[]>(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  },

  saveShift(shift: Shift): Shift {
    const list = this.getShifts();
    const idx = list.findIndex((s) => s.id === shift.id);
    if (idx !== -1) {
      list[idx] = shift;
    } else {
      list.push(shift);
    }
    writeStorage(STORAGE_KEYS.SHIFTS, list);
    this.logAudit({ module: 'Master Shift', action: 'SAVE', recordId: shift.id, summary: `Update shift ${shift.name}` });
    return shift;
  },

  deleteShift(id: string): void {
    const list = this.getShifts().filter((s) => s.id !== id);
    writeStorage(STORAGE_KEYS.SHIFTS, list);
    this.logAudit({ module: 'Master Shift', action: 'DELETE', recordId: id, summary: `Menghapus shift ID ${id}` });
  },

  // Patrol Locations
  getPatrolLocations(): PatrolLocation[] {
    return readStorage<PatrolLocation[]>(STORAGE_KEYS.PATROL_LOCATIONS, INITIAL_PATROL_LOCATIONS);
  },

  savePatrolLocation(loc: Omit<PatrolLocation, 'id'> & { id?: string }): PatrolLocation {
    const list = this.getPatrolLocations();
    if (loc.id) {
      const idx = list.findIndex((l) => l.id === loc.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...loc };
        writeStorage(STORAGE_KEYS.PATROL_LOCATIONS, list);
        this.logAudit({ module: 'Master Patroli', action: 'UPDATE', recordId: loc.id, summary: `Update titik patroli ${loc.name}` });
        return list[idx];
      }
    }
    const newLoc: PatrolLocation = { ...loc, id: `loc-${Date.now()}` };
    list.push(newLoc);
    writeStorage(STORAGE_KEYS.PATROL_LOCATIONS, list);
    this.logAudit({ module: 'Master Patroli', action: 'CREATE', recordId: newLoc.id, summary: `Tambah titik patroli ${newLoc.name}` });
    return newLoc;
  },

  deletePatrolLocation(id: string): void {
    const list = this.getPatrolLocations().filter((l) => l.id !== id);
    writeStorage(STORAGE_KEYS.PATROL_LOCATIONS, list);
    this.logAudit({ module: 'Master Patroli', action: 'DELETE', recordId: id, summary: `Menghapus titik patroli ID ${id}` });
  },

  regenerateQRToken(locId: string): string {
    const list = this.getPatrolLocations();
    const idx = list.findIndex((l) => l.id === locId);
    if (idx === -1) return '';
    const newToken = `LAZ-${list[idx].code}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    list[idx].qrToken = newToken;
    writeStorage(STORAGE_KEYS.PATROL_LOCATIONS, list);
    this.logAudit({
      module: 'Master Patroli',
      action: 'REGENERATE_QR',
      recordId: locId,
      summary: `Regenerasi QR token untuk titik ${list[idx].name}`,
    });
    return newToken;
  },

  // Vehicles
  getVehicles(): Vehicle[] {
    return readStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
  },

  saveVehicle(veh: Omit<Vehicle, 'id'> & { id?: string }): Vehicle {
    const list = this.getVehicles();
    if (veh.id) {
      const idx = list.findIndex((v) => v.id === veh.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...veh };
        writeStorage(STORAGE_KEYS.VEHICLES, list);
        this.logAudit({ module: 'Master Kendaraan', action: 'UPDATE', recordId: veh.id, summary: `Update kendaraan ${veh.plateNumber}` });
        return list[idx];
      }
    }
    const newVeh: Vehicle = { ...veh, id: `v-${Date.now()}` };
    list.push(newVeh);
    writeStorage(STORAGE_KEYS.VEHICLES, list);
    this.logAudit({ module: 'Master Kendaraan', action: 'CREATE', recordId: newVeh.id, summary: `Tambah kendaraan ${newVeh.plateNumber}` });
    return newVeh;
  },

  deleteVehicle(id: string): void {
    const list = this.getVehicles().filter((v) => v.id !== id);
    writeStorage(STORAGE_KEYS.VEHICLES, list);
    this.logAudit({ module: 'Master Kendaraan', action: 'DELETE', recordId: id, summary: `Menghapus kendaraan ID ${id}` });
  },

  // Incident Categories
  getCategories(): IncidentCategory[] {
    return readStorage<IncidentCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategory(cat: Omit<IncidentCategory, 'id'> & { id?: string }): IncidentCategory {
    const list = this.getCategories();
    if (cat.id) {
      const idx = list.findIndex((c) => c.id === cat.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...cat };
        writeStorage(STORAGE_KEYS.CATEGORIES, list);
        this.logAudit({ module: 'Master Kategori', action: 'UPDATE', recordId: cat.id, summary: `Update kategori ${cat.name}` });
        return list[idx];
      }
    }
    const newCat: IncidentCategory = { ...cat, id: `cat-${Date.now()}` };
    list.push(newCat);
    writeStorage(STORAGE_KEYS.CATEGORIES, list);
    this.logAudit({ module: 'Master Kategori', action: 'CREATE', recordId: newCat.id, summary: `Tambah kategori ${newCat.name}` });
    return newCat;
  },

  deleteCategory(id: string): void {
    const list = this.getCategories().filter((c) => c.id !== id);
    writeStorage(STORAGE_KEYS.CATEGORIES, list);
    this.logAudit({ module: 'Master Kategori', action: 'DELETE', recordId: id, summary: `Menghapus kategori ID ${id}` });
  },

  // Visitor Cards
  getVisitorCards(): VisitorCard[] {
    return readStorage<VisitorCard[]>(STORAGE_KEYS.VISITOR_CARDS, INITIAL_VISITOR_CARDS);
  },

  // Visitor Check-Ins (with Server-side Pagination & Search)
  getVisitorCheckins(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    unitId?: string;
  }): { items: VisitorCheckIn[]; total: number } {
    let list = readStorage<VisitorCheckIn[]>(STORAGE_KEYS.VISITOR_CHECKINS, []);
    
    // Sort descending by check-in time
    list.sort((a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime());

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (v) =>
          v.visitorName.toLowerCase().includes(q) ||
          v.ticketNo.toLowerCase().includes(q) ||
          v.cardNumber.toLowerCase().includes(q) ||
          (v.institutionName && v.institutionName.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((v) => v.status === params.status);
    }

    if (params?.unitId && params.unitId !== 'all') {
      list = list.filter((v) => v.unitId === params.unitId);
    }

    const total = list.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return { items, total };
  },

  // Atomic Visitor Check-In
  checkInVisitor(data: Omit<VisitorCheckIn, 'id' | 'ticketNo' | 'checkinTime' | 'status'>): VisitorCheckIn {
    const cards = this.getVisitorCards();
    const cardIdx = cards.findIndex((c) => c.cardNumber === data.cardNumber);

    if (cardIdx !== -1 && cards[cardIdx].isInUse) {
      throw new Error(`Kartu ${data.cardNumber} sedang digunakan oleh tamu lain. Harap pilih kartu lain!`);
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
    const ticketNo = `VIS-${dateStr}-${randomSeq}`;

    const newCheckin: VisitorCheckIn = {
      ...data,
      id: `vis-${Date.now()}`,
      ticketNo,
      checkinTime: now.toISOString(),
      status: 'Masih di Sekolah',
    };

    // Update list
    const list = readStorage<VisitorCheckIn[]>(STORAGE_KEYS.VISITOR_CHECKINS, []);
    list.unshift(newCheckin);
    writeStorage(STORAGE_KEYS.VISITOR_CHECKINS, list);

    // Mark card as in use
    if (cardIdx !== -1) {
      cards[cardIdx].isInUse = true;
      cards[cardIdx].lastVisitorId = newCheckin.id;
      writeStorage(STORAGE_KEYS.VISITOR_CARDS, cards);
    }

    // Log audit
    this.logAudit({
      module: 'Visitor Management',
      action: 'CHECK_IN',
      recordId: newCheckin.ticketNo,
      summary: `Check-in tamu: ${newCheckin.visitorName} (${newCheckin.institutionCategory}), Kartu: ${newCheckin.cardNumber}`,
    });

    return newCheckin;
  },

  // Atomic Visitor Check-Out
  checkOutVisitor(id: string, officerId?: string, officerName?: string): VisitorCheckIn {
    const list = readStorage<VisitorCheckIn[]>(STORAGE_KEYS.VISITOR_CHECKINS, []);
    const idx = list.findIndex((v) => v.id === id);

    if (idx === -1) {
      throw new Error('Data kunjungan tidak ditemukan.');
    }

    const visitor = list[idx];
    if (visitor.status === 'Sudah Keluar') {
      throw new Error('Tamu ini sudah melakukan check-out sebelumnya.');
    }

    const checkoutTime = new Date();
    const checkinTime = new Date(visitor.checkinTime);
    const durationMinutes = Math.max(1, Math.round((checkoutTime.getTime() - checkinTime.getTime()) / (1000 * 60)));

    visitor.checkoutTime = checkoutTime.toISOString();
    visitor.durationMinutes = durationMinutes;
    visitor.status = 'Sudah Keluar';
    visitor.checkoutOfficerId = officerId;
    visitor.checkoutOfficerName = officerName;

    writeStorage(STORAGE_KEYS.VISITOR_CHECKINS, list);

    // Free card
    const cards = this.getVisitorCards();
    const cardIdx = cards.findIndex((c) => c.cardNumber === visitor.cardNumber);
    if (cardIdx !== -1) {
      cards[cardIdx].isInUse = false;
      writeStorage(STORAGE_KEYS.VISITOR_CARDS, cards);
    }

    // Log audit
    this.logAudit({
      module: 'Visitor Management',
      action: 'CHECK_OUT',
      recordId: visitor.ticketNo,
      summary: `Check-out tamu: ${visitor.visitorName}, durasi: ${durationMinutes} menit, kartu ${visitor.cardNumber} dilepas.`,
    });

    return visitor;
  },

  updateVisitorCheckIn(id: string, data: Partial<VisitorCheckIn>): VisitorCheckIn {
    const list = readStorage<VisitorCheckIn[]>(STORAGE_KEYS.VISITOR_CHECKINS, []);
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Data kunjungan tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    writeStorage(STORAGE_KEYS.VISITOR_CHECKINS, list);
    this.logAudit({
      module: 'Visitor Management',
      action: 'UPDATE',
      recordId: list[idx].ticketNo,
      summary: `Update data tamu: ${list[idx].visitorName} (${list[idx].ticketNo})`,
    });
    return list[idx];
  },

  deleteVisitorCheckIn(id: string): void {
    const list = readStorage<VisitorCheckIn[]>(STORAGE_KEYS.VISITOR_CHECKINS, []);
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    if (removed.status === 'Masih di Sekolah') {
      const cards = this.getVisitorCards();
      const cIdx = cards.findIndex((c) => c.cardNumber === removed.cardNumber);
      if (cIdx !== -1) {
        cards[cIdx].isInUse = false;
        writeStorage(STORAGE_KEYS.VISITOR_CARDS, cards);
      }
    }
    const updated = list.filter((v) => v.id !== id);
    writeStorage(STORAGE_KEYS.VISITOR_CHECKINS, updated);
    this.logAudit({
      module: 'Visitor Management',
      action: 'DELETE',
      recordId: removed.ticketNo,
      summary: `Menghapus data kunjungan tamu ${removed.visitorName} (${removed.ticketNo})`,
    });
  },

  // Daily Security Reports
  getDailyReports(): DailySecurityReport[] {
    const list = readStorage<DailySecurityReport[]>(STORAGE_KEYS.DAILY_REPORTS, []);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  saveDailyReport(report: Omit<DailySecurityReport, 'id' | 'reportNo' | 'createdAt'> & { id?: string }): DailySecurityReport {
    const list = this.getDailyReports();
    if (report.id) {
      const idx = list.findIndex((r) => r.id === report.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...report };
        writeStorage(STORAGE_KEYS.DAILY_REPORTS, list);
        this.logAudit({ module: 'Daily Report', action: 'UPDATE', recordId: list[idx].reportNo, summary: `Update laporan ${list[idx].reportNo}` });
        return list[idx];
      }
    }

    const now = new Date();
    const reportNo = `DSR-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newReport: DailySecurityReport = {
      ...report,
      status: report.status || 'Terekam',
      id: `dsr-${Date.now()}`,
      reportNo,
      createdAt: now.toISOString(),
    };
    list.unshift(newReport);
    writeStorage(STORAGE_KEYS.DAILY_REPORTS, list);
    this.logAudit({ module: 'Daily Report', action: 'CREATE', recordId: newReport.reportNo, summary: `Perekaman laporan harian ${newReport.reportNo} (Status: Terekam)` });
    return newReport;
  },

  deleteDailyReport(id: string): void {
    const list = this.getDailyReports();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    const updated = list.filter((r) => r.id !== id);
    writeStorage(STORAGE_KEYS.DAILY_REPORTS, updated);
    this.logAudit({
      module: 'Daily Report',
      action: 'DELETE',
      recordId: removed.reportNo,
      summary: `Menghapus laporan harian ${removed.reportNo}`,
    });
  },

  approveDailyReport(id: string, approverName: string): DailySecurityReport {
    const list = this.getDailyReports();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Laporan tidak ditemukan.');

    list[idx].status = 'Approved';
    list[idx].approvedBy = approverName;
    list[idx].approvedAt = new Date().toISOString();
    writeStorage(STORAGE_KEYS.DAILY_REPORTS, list);

    this.logAudit({
      module: 'Daily Report',
      action: 'APPROVE',
      recordId: list[idx].reportNo,
      summary: `Verifikasi & Persetujuan serah terima laporan ${list[idx].reportNo} oleh ${approverName}`,
    });

    return list[idx];
  },

  // Patrol Logs
  getPatrolLogs(): PatrolLog[] {
    const list = readStorage<PatrolLog[]>(STORAGE_KEYS.PATROL_LOGS, []);
    return list.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  },

  logPatrol(data: Omit<PatrolLog, 'id' | 'scannedAt'>): PatrolLog {
    const newLog: PatrolLog = {
      ...data,
      id: `patrol-${Date.now()}`,
      scannedAt: new Date().toISOString(),
    };
    const list = this.getPatrolLogs();
    list.unshift(newLog);
    writeStorage(STORAGE_KEYS.PATROL_LOGS, list);

    this.logAudit({
      module: 'Patrol Management',
      action: 'SCAN_QR',
      recordId: newLog.id,
      summary: `Scan patroli titik: ${newLog.locationName || newLog.patrolLocationId}, Status: ${newLog.status}, Jarak: ${newLog.distanceMeters || 0}m`,
    });

    return newLog;
  },

  updatePatrolLog(id: string, data: Partial<PatrolLog>): PatrolLog {
    const list = this.getPatrolLogs();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Log patroli tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    writeStorage(STORAGE_KEYS.PATROL_LOGS, list);
    this.logAudit({
      module: 'Patrol Management',
      action: 'UPDATE_LOG',
      recordId: id,
      summary: `Update log patroli titik ${list[idx].locationName || id}`,
    });
    return list[idx];
  },

  deletePatrolLog(id: string): void {
    const list = this.getPatrolLogs().filter((p) => p.id !== id);
    writeStorage(STORAGE_KEYS.PATROL_LOGS, list);
    this.logAudit({
      module: 'Patrol Management',
      action: 'DELETE_LOG',
      recordId: id,
      summary: `Menghapus log patroli ID ${id}`,
    });
  },

  clearPatrolLogs(): void {
    writeStorage(STORAGE_KEYS.PATROL_LOGS, []);
    this.logAudit({
      module: 'Patrol Management',
      action: 'CLEAR_LOGS',
      recordId: 'PATROL_ALL',
      summary: 'Membersihkan seluruh riwayat log patroli',
    });
  },

  // Incidents
  getIncidents(): Incident[] {
    const list = readStorage<Incident[]>(STORAGE_KEYS.INCIDENTS, []);
    return list.sort((a, b) => new Date(b.incidentTime).getTime() - new Date(a.incidentTime).getTime());
  },

  saveIncident(data: Omit<Incident, 'id' | 'incidentNo'> & { id?: string }): Incident {
    const list = this.getIncidents();
    if (data.id) {
      const idx = list.findIndex((i) => i.id === data.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        writeStorage(STORAGE_KEYS.INCIDENTS, list);
        this.logAudit({ module: 'Incident', action: 'UPDATE', recordId: list[idx].incidentNo, summary: `Update penanganan insiden ${list[idx].incidentNo}` });
        return list[idx];
      }
    }

    const now = new Date();
    const incidentNo = `INC-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newInc: Incident = {
      ...data,
      id: `inc-${Date.now()}`,
      incidentNo,
    };
    list.unshift(newInc);
    writeStorage(STORAGE_KEYS.INCIDENTS, list);

    if (newInc.priority === 'Critical') {
      this.createNotification({
        title: 'ALERT INSIDEN KRITIS!',
        message: `Insiden ${newInc.incidentNo} di ${newInc.locationText}: ${newInc.chronology.slice(0, 80)}...`,
        priority: 'Critical',
        module: 'Insiden',
        referenceId: newInc.incidentNo,
      });
    }

    this.logAudit({
      module: 'Incident',
      action: 'CREATE',
      recordId: newInc.incidentNo,
      summary: `Laporan insiden baru: [${newInc.priority}] ${newInc.incidentNo} di ${newInc.locationText}`,
    });

    return newInc;
  },

  deleteIncident(id: string): void {
    const list = this.getIncidents();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    const updated = list.filter((i) => i.id !== id);
    writeStorage(STORAGE_KEYS.INCIDENTS, updated);
    this.logAudit({
      module: 'Incident',
      action: 'DELETE',
      recordId: removed.incidentNo,
      summary: `Menghapus laporan insiden ${removed.incidentNo}`,
    });
  },

  // Lost and Found
  getLostFound(): LostFoundItem[] {
    const list = readStorage<LostFoundItem[]>(STORAGE_KEYS.LOST_FOUND, INITIAL_LOST_FOUND);
    if (!list || list.length === 0) {
      writeStorage(STORAGE_KEYS.LOST_FOUND, INITIAL_LOST_FOUND);
      return INITIAL_LOST_FOUND;
    }
    return list.sort((a, b) => new Date(b.foundTime).getTime() - new Date(a.foundTime).getTime());
  },

  saveLostFound(data: Omit<LostFoundItem, 'id' | 'itemNo' | 'foundTime' | 'status'> & { status?: 'Belum Diambil' | 'Sudah Diambil' }): LostFoundItem {
    const now = new Date();
    const itemNo = `LF-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newItem: LostFoundItem = {
      ...data,
      id: `lf-${Date.now()}`,
      itemNo,
      foundTime: now.toISOString(),
      status: data.status || 'Belum Diambil',
    };
    const list = this.getLostFound();
    list.unshift(newItem);
    writeStorage(STORAGE_KEYS.LOST_FOUND, list);

    this.logAudit({
      module: 'Lost & Found',
      action: 'CREATE',
      recordId: newItem.itemNo,
      summary: `Pencatatan barang temuan: ${newItem.itemName} di ${newItem.locationText}`,
    });

    return newItem;
  },

  claimLostFound(id: string, claimedBy: string, handoverProofUrl?: string): LostFoundItem {
    const list = this.getLostFound();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Barang tidak ditemukan.');

    list[idx].status = 'Sudah Diambil';
    list[idx].claimedBy = claimedBy;
    list[idx].claimedAt = new Date().toISOString();
    list[idx].handoverProofUrl = handoverProofUrl;
    writeStorage(STORAGE_KEYS.LOST_FOUND, list);

    this.logAudit({
      module: 'Lost & Found',
      action: 'CLAIM',
      recordId: list[idx].itemNo,
      summary: `Barang ${list[idx].itemName} telah diserahkan kepada ${claimedBy}`,
    });

    return list[idx];
  },

  updateLostFound(id: string, data: Partial<LostFoundItem>): LostFoundItem {
    const list = this.getLostFound();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Barang tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    writeStorage(STORAGE_KEYS.LOST_FOUND, list);
    this.logAudit({
      module: 'Lost & Found',
      action: 'UPDATE',
      recordId: list[idx].itemNo,
      summary: `Update data barang temuan: ${list[idx].itemName}`,
    });
    return list[idx];
  },

  deleteLostFound(id: string): void {
    const list = this.getLostFound();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    const updated = list.filter((i) => i.id !== id);
    writeStorage(STORAGE_KEYS.LOST_FOUND, updated);
    this.logAudit({
      module: 'Lost & Found',
      action: 'DELETE',
      recordId: removed.itemNo,
      summary: `Menghapus barang temuan ${removed.itemName} (${removed.itemNo})`,
    });
  },

  // Item Deposits
  getItemDeposits(): ItemDeposit[] {
    const list = readStorage<ItemDeposit[]>(STORAGE_KEYS.ITEM_DEPOSITS, INITIAL_ITEM_DEPOSITS);
    if (!list || list.length === 0) {
      writeStorage(STORAGE_KEYS.ITEM_DEPOSITS, INITIAL_ITEM_DEPOSITS);
      return INITIAL_ITEM_DEPOSITS;
    }
    return list.sort((a, b) => new Date(b.depositTime).getTime() - new Date(a.depositTime).getTime());
  },

  saveItemDeposit(data: Omit<ItemDeposit, 'id' | 'depositNo' | 'depositTime' | 'status'>): ItemDeposit {
    const now = new Date();
    const depositNo = `DEP-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newDep: ItemDeposit = {
      ...data,
      id: `dep-${Date.now()}`,
      depositNo,
      depositTime: now.toISOString(),
      status: 'Dititipkan',
    };
    const list = this.getItemDeposits();
    list.unshift(newDep);
    writeStorage(STORAGE_KEYS.ITEM_DEPOSITS, list);

    this.logAudit({
      module: 'Barang Titipan',
      action: 'DEPOSIT',
      recordId: newDep.depositNo,
      summary: `Penitipan barang: ${newDep.itemDescription} milik ${newDep.ownerName}`,
    });

    return newDep;
  },

  returnItemDeposit(
    id: string,
    staffName: string,
    retrievedByName?: string,
    returnPhotoUrl?: string,
    signatureData?: string
  ): ItemDeposit {
    const list = this.getItemDeposits();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Data penitipan tidak ditemukan.');

    list[idx].status = 'Sudah Diambil';
    list[idx].returnTime = new Date().toISOString();
    list[idx].returnStaffId = staffName;
    if (retrievedByName) list[idx].retrievedByName = retrievedByName;
    if (returnPhotoUrl) list[idx].returnPhotoUrl = returnPhotoUrl;
    if (signatureData) list[idx].signatureData = signatureData;
    writeStorage(STORAGE_KEYS.ITEM_DEPOSITS, list);

    this.logAudit({
      module: 'Barang Titipan',
      action: 'RETURN',
      recordId: list[idx].depositNo,
      summary: `Pengembalian barang titipan: ${list[idx].itemDescription} kepada ${retrievedByName || list[idx].ownerName}`,
    });

    return list[idx];
  },

  updateItemDeposit(id: string, data: Partial<ItemDeposit>): ItemDeposit {
    const list = this.getItemDeposits();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Data titipan tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    writeStorage(STORAGE_KEYS.ITEM_DEPOSITS, list);
    this.logAudit({
      module: 'Barang Titipan',
      action: 'UPDATE',
      recordId: list[idx].depositNo,
      summary: `Update data titipan: ${list[idx].itemDescription} (${list[idx].depositNo})`,
    });
    return list[idx];
  },

  deleteItemDeposit(id: string): void {
    const list = this.getItemDeposits();
    const idx = list.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    const updated = list.filter((d) => d.id !== id);
    writeStorage(STORAGE_KEYS.ITEM_DEPOSITS, updated);
    this.logAudit({
      module: 'Barang Titipan',
      action: 'DELETE',
      recordId: removed.depositNo,
      summary: `Menghapus titipan ${removed.itemDescription} (${removed.depositNo})`,
    });
  },

  // Vehicles
  getVehicleMovements(): VehicleMovement[] {
    const list = readStorage<VehicleMovement[]>(STORAGE_KEYS.VEHICLE_MOVEMENTS, []);
    return list.sort((a, b) => new Date(b.outTime).getTime() - new Date(a.outTime).getTime());
  },

  recordVehicleOut(data: Omit<VehicleMovement, 'id' | 'logNo' | 'outTime' | 'status'>): VehicleMovement {
    const list = this.getVehicleMovements();
    const active = list.find((m) => m.vehicleId === data.vehicleId && m.status === 'Masih Keluar');
    if (active) {
      throw new Error(`Kendaraan ${active.plateNumber || 'ini'} masih dalam status 'Masih Keluar'. Harap selesaikan kepulangan sebelumnya!`);
    }

    const now = new Date();
    const logNo = `VLOG-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newLog: VehicleMovement = {
      ...data,
      id: `vlog-${Date.now()}`,
      logNo,
      outTime: now.toISOString(),
      status: 'Masih Keluar',
    };
    list.unshift(newLog);
    writeStorage(STORAGE_KEYS.VEHICLE_MOVEMENTS, list);

    this.logAudit({
      module: 'Kendaraan Sekolah',
      action: 'VEHICLE_OUT',
      recordId: newLog.logNo,
      summary: `Kendaraan ${newLog.plateNumber} keluar menuju ${newLog.destination} (Driver: ${newLog.driverName})`,
    });

    return newLog;
  },

  recordVehicleIn(id: string, endKm: number, officerName: string): VehicleMovement {
    const list = this.getVehicleMovements();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Log pergerakan kendaraan tidak ditemukan.');

    if (endKm < list[idx].startKm) {
      throw new Error('Kilometer akhir tidak boleh lebih kecil daripada kilometer awal!');
    }

    list[idx].status = 'Sudah Kembali';
    list[idx].inTime = new Date().toISOString();
    list[idx].endKm = endKm;
    list[idx].inOfficerName = officerName;
    writeStorage(STORAGE_KEYS.VEHICLE_MOVEMENTS, list);

    this.logAudit({
      module: 'Kendaraan Sekolah',
      action: 'VEHICLE_IN',
      recordId: list[idx].logNo,
      summary: `Kendaraan ${list[idx].plateNumber} kembali. Jarak tempuh: ${endKm - list[idx].startKm} km`,
    });

    return list[idx];
  },

  updateVehicleMovement(id: string, data: Partial<VehicleMovement>): VehicleMovement {
    const list = this.getVehicleMovements();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Data pergerakan tidak ditemukan.');
    list[idx] = { ...list[idx], ...data };
    writeStorage(STORAGE_KEYS.VEHICLE_MOVEMENTS, list);
    this.logAudit({
      module: 'Kendaraan Sekolah',
      action: 'UPDATE_LOG',
      recordId: list[idx].logNo,
      summary: `Update log pergerakan kendaraan ${list[idx].logNo}`,
    });
    return list[idx];
  },

  deleteVehicleMovement(id: string): void {
    const list = this.getVehicleMovements();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return;
    const removed = list[idx];
    const updated = list.filter((m) => m.id !== id);
    writeStorage(STORAGE_KEYS.VEHICLE_MOVEMENTS, updated);
    this.logAudit({
      module: 'Kendaraan Sekolah',
      action: 'DELETE_LOG',
      recordId: removed.logNo,
      summary: `Menghapus log pergerakan kendaraan ${removed.logNo}`,
    });
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    const list = readStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createNotification(data: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    const list = this.getNotifications();
    list.unshift(newNotif);
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, list.slice(0, 50)); // Keep max 50 to conserve memory
    return newNotif;
  },

  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      writeStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // Audit Logs (Immutable append-only)
  getAuditLogs(params?: { page?: number; pageSize?: number; search?: string }): { items: AuditLogItem[]; total: number } {
    let list = readStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.summary.toLowerCase().includes(q) ||
          a.module.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.userName.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return { items, total };
  },

  logAudit(data: { module: string; action: string; recordId: string; summary: string }): void {
    const user = this.getCurrentUser();
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      module: data.module,
      action: data.action,
      recordId: data.recordId,
      summary: data.summary,
      ipAddress: '127.0.0.1 (Internal)',
    };
    const list = readStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    list.unshift(newLog);
    // Keep max 500 audit logs in local mode to avoid localStorage limits
    writeStorage(STORAGE_KEYS.AUDIT_LOGS, list.slice(0, 500));
  },

  deleteAuditLog(id: string): void {
    const list = readStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, []).filter((l) => l.id !== id);
    writeStorage(STORAGE_KEYS.AUDIT_LOGS, list);
  },

  clearAuditLogs(): void {
    const user = this.getCurrentUser();
    const resetLog: AuditLogItem = {
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      module: 'Audit Log',
      action: 'CLEAR_ALL',
      recordId: 'SYS-AUDIT',
      summary: `Administrator (${user.fullName}) membersihkan riwayat log audit sistem`,
      ipAddress: '127.0.0.1 (Internal)',
    };
    writeStorage(STORAGE_KEYS.AUDIT_LOGS, [resetLog]);
  },

  // System Health & Monitoring
  getSystemMetrics(): SystemHealthMetrics {
    const visitors = this.getVisitorCheckins({ pageSize: 1000 }).items;
    const activeVisitors = visitors.filter((v) => v.status === 'Masih di Sekolah').length;
    const patrols = this.getPatrolLogs().length;
    const incidents = this.getIncidents();
    const criticalIncidents = incidents.filter((i) => i.priority === 'Critical' && i.status !== 'Closed').length;
    const reports = this.getDailyReports().length;
    const vehicles = this.getVehicleMovements().filter((m) => m.status === 'Masih Keluar').length;
    const notifs = this.getNotifications().filter((n) => !n.isRead).length;

    // Approximate size of localStorage used
    let totalChars = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith('lsms_')) {
        totalChars += (localStorage.getItem(key) || '').length;
      }
    }

    const config = this.getSupabaseConfig();

    return {
      supabaseConnected: Boolean(config.url && config.anonKey),
      connectionMode: config.url && config.anonKey ? 'supabase_cloud' : 'local_indexed_storage',
      totalVisitors: visitors.length,
      totalPatrols: patrols,
      totalIncidents: incidents.length,
      totalReports: reports,
      activeVisitorsCount: activeVisitors,
      activeVehiclesCount: vehicles,
      criticalIncidentsCount: criticalIncidents,
      unreadNotificationsCount: notifs,
      estimatedStorageUsageKb: Math.round(totalChars / 1024),
      lastCheckedAt: new Date().toISOString(),
    };
  },

  // Supabase Configuration
  getSupabaseConfig(): { url: string; anonKey: string } {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    const saved = readStorage<{ url: string; anonKey: string }>(STORAGE_KEYS.SUPABASE_CONFIG, { url: '', anonKey: '' });
    return {
      url: saved.url || envUrl,
      anonKey: saved.anonKey || envKey,
    };
  },

  saveSupabaseConfig(config: { url: string; anonKey: string }): void {
    writeStorage(STORAGE_KEYS.SUPABASE_CONFIG, config);
    this.logAudit({
      module: 'Sistem',
      action: 'UPDATE_CONFIG',
      recordId: 'SUPABASE_CONFIG',
      summary: `Konfigurasi koneksi Supabase diperbarui (${config.url ? 'URL Terisi' : 'Kosong'})`,
    });
  },
};
