# Lazuardi Security Management System (LSMS)
### Integrated School Security Operations Platform — Architectural Blueprint

Sistem manajemen operasional keamanan terpadu untuk lingkungan sekolah Lazuardi, dirancang untuk mendigitalisasi pencatatan, pemantauan, dan evaluasi operasional satpam secara real-time, terstruktur, aman, dan beroperasi hemat kuota pada **Supabase Free Plan**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan arsitektur yang telah dikonfirmasi pada tahap klarifikasi:
> - **Dual-Mode Persistence**: Mendukung integrasi langsung ke Supabase PostgreSQL riil (URL & Anon Key) dengan fail-safe mode lokal terindeks agar sistem tetap dapat diuji di lingkungan preview tanpa terhambat ketiadaan environment variable awal.
> - **Eksekusi Bertahap (Phase 1 First)**: Fokus turn implementasi pertama pada **Phase 1 — Foundation** (Layout enterprise, autentikasi multi-role, RBAC, master data unit/staff/shift, audit log dasar, dan skema migrasi database).
> - **QR Patrol Scanner**: Menggunakan kamera smartphone WebRTC beresolusi optimal dengan fallback input token manual darurat jika izin kamera/sensor terhalang.

---

## 1. Ringkasan Arsitektur LSMS

LSMS mengadopsi arsitektur **Clean Client-Centric with Edge Backend (JAMstack + Supabase BaaS)**:
- **Frontend Layer**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + TanStack Query untuk caching agresif.
- **Data & Auth Layer**: Supabase PostgreSQL dengan Row Level Security (RLS), Supabase Auth (JWT), dan Supabase Storage untuk berkas foto/dokumen privat.
- **Zero-Waste Free Tier Pipeline**:
  - Semua tabel menggunakan server-side pagination (default 20 baris).
  - Foto dikompresi di sisi browser menjadi format WebP (150–250 KB) sebelum diunggah.
  - Supabase Realtime diisolasi hanya pada tabel `visitor_checkins` (aktif) dan `incidents` (kritis).
  - Seluruh query agregasi statistik dashboard dieksekusi melalui SQL view / RPC, bukan client-side array filtering.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT APPLICATION (React 19 SPA / PWA)               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Responsive UI / Mobile Shell (Android Touch-Optimized / Desktop Enterprise)│
│  ├── Main Navigation (Collapsible Sidebar, Breadcrumbs, Role-Gated Menus)   │
│  ├── Modules: Visitor, Daily Report, Patrol QR, Incidents, Items, Vehicles  │
│  └── TanStack Query Cache (Master: 30m, Summary: 5m, Active Visitors: 60s) │
└───────────────────────▲───────────────────────────────▲─────────────────────┘
                        │ HTTPS (REST / PostgREST)      │ WSS (Selective)
┌───────────────────────▼───────────────────────────────▼─────────────────────┐
│                    SUPABASE CLOUD / POSTGRESQL ENGINE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ├── Supabase Auth (JWT Token with User Role & Unit Claims)                 │
│  ├── Row Level Security (RLS) Policies (Role & Read-Only Isolation)         │
│  ├── PostgreSQL Tables & Relational Constraints                             │
│  ├── PostgreSQL RPC / Aggregation Views (Summary Statistics without Egress) │
│  ├── Storage Buckets (Private: Incident Media, Visitor Photos, Signatures)  │
│  └── Audit Logging Trigger (Append-Only Immutable Action Log)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagram Alur Sistem (Core Workflows)

```
[ Visitor Check-In Flow ]
Tamu Datang ──> Input Data Tamu ──> Validasi No. Kartu ──> Simpan Atomik VIS-YYYYMMDD-XXXX
                                                           ├──> Masuk Status: "Masih di Sekolah"
                                                           └──> Audit Log: VISITOR_CHECKIN
                                                                      │
                                                                      ▼
Tamu Pulang <── Simpan Jam Keluar <── Hitung Durasi <── Scan/Pilih No. Kartu (Check-Out)
                ├──> Status: "Sudah Keluar"
                └──> Kartu Bebas Digunakan Lagi

[ Security Patrol QR & GPS Flow ]
Petugas Jaga ──> Buka Kamera PWA ──> Scan QR Titik Patroli ──> Ambil Koordinat GPS
                                                                      │
                                                                      ▼
Tercatat di Log Patroli <── Validasi Radius (GPS vs Titik) <── Hitung Jarak (Haversine)
├── Status: Completed / Late / Location Unverified
└── Upload Foto WebP Bukti (Opsional/Kondisional)

[ Daily Security Report & Handover Flow ]
Shift Siang/Malam ──> Checklist 8 Area ──> Catatan Situasi ──> Submit Laporan (Draft/Submitted)
                                                                      │
                                                                      ▼
Laporan Terkunci (Approved) <── Persetujuan Komandan Shift <── Verifikasi Supervisor
```

---

## 3. Struktur Folder Proyek

```
/
├── public/
│   ├── favicon.ico
│   ├── manifest.json            # PWA Web App Manifest
│   └── icons/                   # PWA Icons (192x192, 512x512)
├── src/
│   ├── assets/                  # Brand assets & logos
│   ├── components/
│   │   ├── common/              # Button, Modal, Badge, Table, Input, EmptyState
│   │   ├── layout/              # Sidebar, Topbar, AppLayout, Breadcrumbs
│   │   └── notification/        # NotificationCenter bell & flyout
│   ├── features/
│   │   ├── auth/                # Login, ProtectedRoute, RoleGate, useAuth
│   │   ├── dashboard/           # SummaryCards, ActivityCharts, UnitFilter
│   │   ├── visitors/            # CheckInForm, CheckOutModal, VisitorTable
│   │   ├── daily-report/        # ReportForm, ChecklistArea, ShiftHandover
│   │   ├── patrol/              # QRScanner, ScheduleList, PatrolHistory, MapView
│   │   ├── incidents/           # IncidentForm, IncidentTimeline, MediaUpload
│   │   ├── items/               # LostFoundTable, ItemDepositForm, SignaturePad
│   │   ├── vehicles/            # VehicleMovementForm, VehicleLogTable
│   │   ├── reports/             # ExportPreview, ExcelExport, PDFExport
│   │   ├── analytics/           # ECharts visualizers (Visitor, Incident, Patrol)
│   │   └── master-data/         # Users, Staff, Units, PatrolPoints, Vehicles, Shifts
│   ├── hooks/                   # useDebounce, useGeolocation, usePWAInstall
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client singleton & dual-mode adapter
│   │   ├── image-optimizer.ts   # Client-side WebP compression utility
│   │   ├── geo.ts               # Haversine distance calculator
│   │   └── formatters.ts        # Indonesian currency, dates, timestamps (WIB)
│   ├── types/                   # Database schemas & application TypeScript interfaces
│   ├── App.tsx                  # Router & QueryProvider root
│   ├── main.tsx                 # Entrypoint
│   └── index.css                # Tailwind CSS v4 tokens & print styles
├── supabase/
│   ├── migrations/              # SQL Migration files (001_initial_schema.sql, etc.)
│   └── seed.sql                 # Initial seed data (Units, Security Staff, Shifts)
├── package.json
└── vite.config.ts
```

---

## 4. Rancangan Database PostgreSQL & RLS

### Entitas Inti:
1. `profiles` (`id` UUID PK, `full_name`, `email`, `role`, `unit_id`, `is_active`, `created_at`)
2. `staff_security` (`id` UUID PK, `name`, `nip`, `position`, `unit_id`, `phone`, `is_active`)
3. `units` (`id` UUID PK, `code`, `name`, `pic_name`, `is_active`)
4. `patrol_locations` (`id` UUID PK, `code`, `name`, `unit_id`, `latitude`, `longitude`, `radius_meters`, `qr_token`, `is_active`)
5. `incident_categories` (`id` UUID PK, `code`, `name`, `default_priority`, `is_active`)
6. `shifts` (`id` UUID PK, `name`, `start_time`, `end_time`, `is_active`)
7. `visitor_cards` (`card_number` VARCHAR(20) PK, `unit_id`, `is_in_use`, `last_visitor_id`)
8. `visitor_checkins` (`id` UUID PK, `ticket_no` UNIQUE, `visitor_name`, `institution`, `phone`, `email`, `host_name`, `unit_id`, `purpose`, `card_number`, `checkin_time`, `checkout_time`, `duration_minutes`, `checkin_officer_id`, `checkout_officer_id`, `status`)
9. `daily_security_reports` (`id` UUID PK, `report_no` UNIQUE, `report_date`, `shift_id`, `weather`, `general_situation`, `handover_notes`, `status`, `created_by`, `approved_by`, `approved_at`)
10. `daily_report_checklists` (`id` UUID PK, `report_id` FK, `area_name`, `status`, `notes`, `photo_url`)
11. `daily_report_officers` (`id` UUID PK, `report_id` FK, `staff_id` FK)
12. `patrol_schedules` (`id` UUID PK, `schedule_date`, `shift_id`, `staff_id`, `patrol_location_id`, `target_time`, `status`)
13. `patrol_logs` (`id` UUID PK, `schedule_id` FK, `patrol_location_id` FK, `staff_id` FK, `scanned_at`, `latitude`, `longitude`, `accuracy_meters`, `distance_meters`, `status`, `notes`, `photo_url`)
14. `incidents` (`id` UUID PK, `incident_no` UNIQUE, `category_id` FK, `location_text`, `unit_id` FK, `incident_time`, `reporter_id` FK, `chronology`, `priority`, `status`, `handling_notes`, `resolution_notes`, `closed_at`)
15. `incident_media` (`id` UUID PK, `incident_id` FK, `media_type`, `storage_path`, `file_size_kb`)
16. `lost_found` (`id` UUID PK, `item_no` UNIQUE, `item_name`, `description`, `found_time`, `location_text`, `found_by`, `receiver_staff_id` FK, `storage_location`, `status`, `claimed_by`, `claimed_at`, `handover_proof_url`)
17. `item_deposits` (`id` UUID PK, `deposit_no` UNIQUE, `owner_name`, `phone`, `item_description`, `quantity`, `deposit_time`, `receiver_staff_id` FK, `storage_location`, `status`, `return_time`, `return_staff_id` FK, `signature_data_url`)
18. `vehicles` (`id` UUID PK, `plate_number` UNIQUE, `vehicle_type`, `brand_model`, `unit_id`, `is_active`)
19. `vehicle_movements` (`id` UUID PK, `log_no` UNIQUE, `vehicle_id` FK, `driver_name`, `unit_id` FK, `destination`, `out_time`, `start_km`, `out_officer_id` FK, `in_time`, `end_km`, `in_officer_id` FK, `status`, `notes`)
20. `notifications` (`id` UUID PK, `title`, `message`, `priority`, `module`, `reference_id`, `is_read`, `created_at`)
21. `audit_logs` (`id` UUID PK, `created_at`, `user_id` FK, `user_role`, `module`, `action`, `record_id`, `summary`, `ip_address`)
22. `system_settings` (`key` VARCHAR(50) PK, `value` JSONB, `updated_at`, `updated_by`)

---

## 5. Matriks Role & Permission (RBAC & RLS)

| Modul / Tindakan | Administrator | Supervisor Security | Petugas Security | Manajemen Sekolah |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard Operasional** | Full Access | Full Access | View Tugas Saja | View Analytics Read-Only |
| **Visitor Check-In & Check-Out** | Manage/Koreksi | Monitor & Koreksi | Input & Check-Out | View Read-Only |
| **Laporan Harian (DSR)** | Audit & View All | Verifikasi & Approve | Buat Draft & Submit | View Approved Saja |
| **Patroli QR & GPS** | Kelola QR/Titik | Jadwalkan & Monitor | Scan & Eksekusi | View Rekap Saja |
| **Manajemen Insiden** | Full Access | Disposisi & Close | Lapor & Tindakan | View Non-Rahasia Saja |
| **Lost & Found** | Manage All | Monitor | Input & Serah Terima | View Saja |
| **Barang Titipan & Signature**| Manage All | Monitor | Input & Kembalikan | View Saja |
| **Kendaraan Sekolah** | Kelola Armada | Monitor | Catat Keluar/Masuk | View Saja |
| **Master Data (User/Unit/QR)**| Full CRUD | No Access | No Access | No Access |
| **Audit Log** | View All | No Access | No Access | No Access |
| **System Health & Config** | Full Access | No Access | No Access | No Access |

---

## 6. Strategi Caching & Penghematan Supabase Free Plan

1. **Pagination Mandatori**: Seluruh tabel diatur `limit: 20` dengan kueri server-side `range(offset, offset + limit - 1)`.
2. **Column Whitelisting**: Menghilangkan `SELECT *`. Hanya meminta kolom esensial (misal untuk tabel ringkasan: `id, ticket_no, visitor_name, checkin_time, status`).
3. **TanStack Query Caching**:
   - Master data (Unit, Staff, Kategori): `staleTime: 30 menit`.
   - Ringkasan Dashboard: `staleTime: 5 menit`.
   - Visitor aktif: `staleTime: 60 detik`.
   - Debounce search: minimal 400ms sebelum query REST dijalankan.
4. **Client-Side Compression**:
   - Canvas browser mengonversi gambar kamera ke WebP dengan kompresi kualitas 0.75, membatasi resolusi max 1280x720 (ukuran rata-rata ~150-250 KB). Egress dan storage berkurang hingga 85%.
5. **Realtime Berbatas**:
   - Hanya berlangganan perubahan status pada `visitor_checkins` (filter: `status=eq.Masih di Sekolah`) dan `incidents` (filter: `priority=eq.Critical`).
   - Subscription otomatis di-`unsubscribe` saat komponen unmount.

---

## 7. Strategi Keamanan & Perlindungan Data Sekolah

- **Data Privacy**: Nomor identitas pribadi pengunjung tidak disimpan utuh di tabel umum jika tidak diperlukan; hanya nomor kontak dan instansi.
- **Row Level Security (RLS)**:
  - Kebijakan PostgreSQL `auth.uid()` memvalidasi role dari token JWT.
  - Role `Manajemen Sekolah` memiliki policy SQL `FOR SELECT ONLY`.
  - User dinonaktifkan (`is_active = false`) langsung ditolak oleh RLS.
- **Tanda Tangan & Foto Privat**: Bucket Supabase Storage diset privat, hanya dapat diakses melalui Short-Lived Signed URL (masa berlaku 10-15 menit).
- **Anti-Tampering QR Patroli**: Token QR menggunakan hash UUID lokasi yang dapat di-regenerate berkala oleh Admin jika dicurigai terjadi kebocoran, dipadukan dengan radius toleransi GPS (50–100 meter).

---

## 8. Rencana Implementasi Bertahap (Phase 1–8)

- **PHASE 1 — Foundation (Current Turn Focus)**:
  - Setup UI theme enterprise ERP (Tailwind, Lucide, Palet Lazuardi Blue #1565C0 / #0D47A1).
  - Supabase client dual-mode adapter (koneksi aktif + indexed fallback data).
  - Shell layout (Collapsible Sidebar, Topbar, User Badge, Breadcrumbs).
  - Autentikasi 4 role dengan Role-Switch switcher untuk pengujian instan.
  - Modul Master Data (Units, Staff Security, Shifts, Patrol Locations, Vehicles).
  - Modul Audit Log dasar & System Health Dashboard.
  - File SQL Migrasi lengkap (`supabase/migrations/001_initial_schema.sql`).
- **PHASE 2 — Visitor Management**:
  - Check-In generator tiket otomatis (`VIS-YYYYMMDD-XXXX`), validasi kartu unik, Check-Out, durasi otomatis, dan filter durasi >4 jam.
- **PHASE 3 — Daily Security Report (DSR)**:
  - Form shift siang/malam, checklist 8 area, catatan cuaca/situasi, alur serah terima jaga, approval workflow.
- **PHASE 4 — Security Patrol Management**:
  - QR Code scanner via WebRTC smartphone kamera, validasi GPS Haversine, status tepat waktu vs terlambat.
- **PHASE 5 — Incident & Item Management**:
  - Laporan insiden (prioritas Critical alert), Lost & Found, Barang Titipan dengan Canvas Digital Signature.
- **PHASE 6 — Vehicle Tracking & Notifications**:
  - Keluar-masuk mobil sekolah, speedometer check, Notification Center dengan unread badge dan deduplikasi alarm.
- **PHASE 7 — Reports & Analytics**:
  - Visualisasi Apache ECharts (agregasi server), Export Excel, Export PDF, Print preview rapi.
- **PHASE 8 — Optimization & Production Verification**:
  - Audit egress, validasi PWA offline-safe shell, verifikasi RLS security rules, dan instruksi deployment Vercel.

---

## 9. Risiko Teknis & Mitigasinya

1. **Akurasi GPS Dalam Ruangan Gedung Sekolah**:
   - *Risiko*: Akurasi GPS smartphone turun saat satpam berada di koridor bertingkat/basement, memicu "Location Unverified".
   - *Mitigasi*: Parameter radius toleransi yang dapat disesuaikan per titik di Master Lokasi (misal 50m untuk pos gerbang, 100m untuk area gedung dalam), plus opsi form catatan kendala sinyal yang memerlukan verifikasi supervisor.
2. **Batas Egress Supabase Free Tier (2 GB/bulan)**:
   - *Risiko*: Banyak foto insiden atau kartu pengunjung menguras bandwidth egress.
   - *Mitigasi*: Kompresi WebP ketat di browser sebelum upload, lazy load thumbnail, caching TanStack Query.
3. **Kamera Tidak Diizinkan pada Browser Tertentu**:
   - *Risiko*: Pengguna menolak permission kamera WebRTC saat scan QR.
   - *Mitigasi*: Tombol fallback "Input Manual Token Titik" dengan pencatatan status verifikasi sekunder.

---

## 10. Checklist Pengujian (QA Standards)

- [ ] Validasi hak akses 4 role: Admin, Supervisor, Petugas, Manajemen (read-only terbukti tidak ada tombol aksi mutasi).
- [ ] Pencegahan duplikasi kartu visitor aktif: kartu yang sama tidak bisa di-checkin 2 kali.
- [ ] Keberhasilan kalkulasi durasi kunjungan secara otomatis saat check-out.
- [ ] Kompresi foto: gambar 5MB dari kamera dipastikan terkompresi menjadi <300KB WebP sebelum request storage.
- [ ] Tidak ada infinite loop atau repeated polling di network tab.
- [ ] Skrip SQL migrasi valid dan bebas syntax error di PostgreSQL 15+.

---

## 11. Langkah Konfigurasi Supabase, GitHub & Vercel

1. **Supabase Setup**:
   - Buat project gratis di `https://supabase.com`.
   - Buka menu **SQL Editor**, salin dan jalankan seluruh isi berkas `supabase/migrations/001_initial_schema.sql`.
   - Buat bucket Storage: `security-media` (Access: Private).
   - Salin **Project URL** dan **Anon Key** dari menu *Project Settings -> API*.
2. **Environment Variables**:
   - Masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` ke `.env` lokal atau menu Settings aplikasi.
3. **GitHub & Vercel**:
   - Push repository ke GitHub.
   - Import di dashboard Vercel, pilih framework preset `Vite`.
   - Masukkan environment variable yang sama di Vercel Settings -> Environment Variables.
   - Deploy dengan rewrite URL SPA di `vercel.json`.
