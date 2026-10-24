/**
 * Lazuardi Security Management System (LSMS)
 * Core Domain Types & Interfaces
 */

export type UserRole = 'admin' | 'supervisor' | 'officer' | 'management';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  unitId?: string;
  unitName?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  picName: string;
  isActive: boolean;
}

export interface StaffSecurity {
  id: string;
  name: string;
  nip: string;
  position: string;
  unitId?: string;
  phone: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface PatrolLocation {
  id: string;
  code: string;
  name: string;
  description: string;
  unitId?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  qrToken: string;
  isActive: boolean;
}

export interface IncidentCategory {
  id: string;
  code: string;
  name: string;
  defaultPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  brandModel: string;
  unitId?: string;
  isActive: boolean;
}

export interface VisitorCard {
  cardNumber: string;
  unitId?: string;
  isInUse: boolean;
  lastVisitorId?: string;
}

export type VisitorStatus = 'Masih di Sekolah' | 'Sudah Keluar' | 'Dibatalkan';

export interface VisitorCheckIn {
  id: string;
  ticketNo: string;
  visitorName: string;
  institutionCategory: 'Dinas' | 'Informasi Sekolah' | 'Sales' | 'Vendor' | 'Lainnya';
  institutionName?: string;
  phone: string;
  email?: string;
  hostName: string;
  unitId: string;
  unitName?: string;
  purpose: string;
  cardNumber: string;
  checkinTime: string;
  checkoutTime?: string;
  durationMinutes?: number;
  checkinOfficerId?: string;
  checkinOfficerName?: string;
  checkoutOfficerId?: string;
  checkoutOfficerName?: string;
  notes?: string;
  status: VisitorStatus;
}

export interface DailyReportChecklist {
  id: string;
  areaName: 'Gerbang' | 'Gedung' | 'CCTV' | 'Pagar' | 'Lampu' | 'APAR' | 'Parkir' | 'Pos Security';
  status: 'Baik' | 'Perlu Perhatian' | 'Bermasalah' | 'Tidak Diperiksa';
  notes?: string;
  photoUrl?: string;
}

export interface DailySecurityReport {
  id: string;
  reportNo: string;
  reportDate: string;
  shiftId: string;
  shiftName?: string;
  weather: 'Cerah' | 'Hujan' | 'Berawan';
  generalSituation: string;
  handoverNotes?: string;
  officers: string[]; // staff IDs or names
  outgoingCommanderId?: string;
  incomingCommanderId?: string;
  status: 'Terekam' | 'Draft' | 'Submitted' | 'Verified' | 'Approved';
  checklists: DailyReportChecklist[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PatrolLog {
  id: string;
  scheduleId?: string;
  patrolLocationId: string;
  locationName?: string;
  locationCode?: string;
  staffId: string;
  staffName?: string;
  scannedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  distanceMeters?: number;
  status: 'Completed' | 'Late' | 'Location Unverified';
  notes?: string;
  photoUrl?: string;
}

export interface Incident {
  id: string;
  incidentNo: string;
  categoryId: string;
  categoryName?: string;
  locationText: string;
  unitId: string;
  unitName?: string;
  incidentTime: string;
  reporterId: string;
  reporterName?: string;
  chronology: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Progress' | 'Closed';
  assignedPic?: string;
  handlingNotes?: string;
  resolutionNotes?: string;
  closedAt?: string;
  mediaUrls?: string[];
}

export interface LostFoundItem {
  id: string;
  itemNo: string;
  itemName: string;
  description: string;
  foundTime: string;
  locationText: string;
  foundBy: string;
  receiverStaffId: string;
  receiverStaffName?: string;
  storageLocation: string;
  photoUrl?: string;
  status: 'Belum Diambil' | 'Sudah Diambil';
  claimedBy?: string;
  claimedAt?: string;
  handoverProofUrl?: string;
}

export interface ItemDeposit {
  id: string;
  depositNo: string;
  ownerName: string;
  phone: string;
  itemDescription: string;
  quantity: number;
  depositTime: string;
  receiverStaffId: string;
  receiverStaffName?: string;
  storageLocation: string;
  photoUrl?: string;
  status: 'Dititipkan' | 'Sudah Diambil';
  returnTime?: string;
  returnStaffId?: string;
  retrievedByName?: string;
  returnPhotoUrl?: string;
  signatureData?: string;
}

export interface VehicleMovement {
  id: string;
  logNo: string;
  vehicleId: string;
  plateNumber?: string;
  vehicleType?: string;
  driverName: string;
  unitId: string;
  destination: string;
  outTime: string;
  startKm: number;
  outOfficerId: string;
  outOfficerName?: string;
  inTime?: string;
  endKm?: number;
  inOfficerId?: string;
  inOfficerName?: string;
  status: 'Masih Keluar' | 'Sudah Kembali';
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  priority: 'Info' | 'Warning' | 'High' | 'Critical';
  module: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  createdAt: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  module: string;
  action: string;
  recordId: string;
  summary: string;
  ipAddress?: string;
}

export interface SystemHealthMetrics {
  supabaseConnected: boolean;
  connectionMode: 'supabase_cloud' | 'local_indexed_storage';
  totalVisitors: number;
  totalPatrols: number;
  totalIncidents: number;
  totalReports: number;
  activeVisitorsCount: number;
  activeVehiclesCount: number;
  criticalIncidentsCount: number;
  unreadNotificationsCount: number;
  estimatedStorageUsageKb: number;
  lastCheckedAt: string;
}
