-- ========================================================================
-- LAZUARDI SECURITY MANAGEMENT SYSTEM (LSMS)
-- Database Migration: 001_initial_schema.sql
-- Optimized for Supabase PostgreSQL & Supabase Free Plan
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. MASTER TABLES
-- ------------------------------------------------------------------------

-- Units (Sekolah & Unit Kerja Lazuardi)
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    pic_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (User RBAC linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'supervisor', 'officer', 'management')),
    unit_id UUID REFERENCES public.units(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Staff Security (Daftar Personel Petugas Satpam)
CREATE TABLE IF NOT EXISTS public.staff_security (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    nip VARCHAR(50) UNIQUE,
    position VARCHAR(50) DEFAULT 'Petugas Security',
    unit_id UUID REFERENCES public.units(id),
    phone VARCHAR(25),
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patrol Locations (Titik Kontrol Patroli QR & GPS)
CREATE TABLE IF NOT EXISTS public.patrol_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit_id UUID REFERENCES public.units(id),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    radius_meters INTEGER DEFAULT 50,
    qr_token VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Categories
CREATE TABLE IF NOT EXISTS public.incident_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    default_priority VARCHAR(20) DEFAULT 'Medium' CHECK (default_priority IN ('Low', 'Medium', 'High', 'Critical')),
    is_active BOOLEAN DEFAULT true
);

-- Visit Purposes (Tujuan Kunjungan)
CREATE TABLE IF NOT EXISTS public.visit_purposes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Vehicles (Armada Kendaraan Sekolah)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL, -- Mobil Dinas, Elf/Bus, Motor Operasional
    brand_model VARCHAR(100) NOT NULL,
    unit_id UUID REFERENCES public.units(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor Cards Inventory
CREATE TABLE IF NOT EXISTS public.visitor_cards (
    card_number VARCHAR(30) PRIMARY KEY,
    unit_id UUID REFERENCES public.units(id),
    is_in_use BOOLEAN DEFAULT false,
    last_visitor_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------
-- 2. OPERATIONAL TRANSACTIONS
-- ------------------------------------------------------------------------

-- Visitor Check-Ins & Check-Outs
CREATE TABLE IF NOT EXISTS public.visitor_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_no VARCHAR(30) UNIQUE NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    institution_category VARCHAR(50) NOT NULL, -- Dinas, Informasi Sekolah, Sales, Vendor, Lainnya
    institution_name VARCHAR(100),
    phone VARCHAR(25) NOT NULL,
    email VARCHAR(100),
    host_name VARCHAR(100) NOT NULL, -- Bertemu dengan siapa
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    purpose TEXT NOT NULL,
    card_number VARCHAR(30) REFERENCES public.visitor_cards(card_number),
    checkin_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checkout_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    checkin_officer_id UUID REFERENCES public.staff_security(id),
    checkout_officer_id UUID REFERENCES public.staff_security(id),
    notes TEXT,
    status VARCHAR(30) DEFAULT 'Masih di Sekolah' CHECK (status IN ('Masih di Sekolah', 'Sudah Keluar', 'Dibatalkan')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Security Reports (DSR)
CREATE TABLE IF NOT EXISTS public.daily_security_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_no VARCHAR(30) UNIQUE NOT NULL,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_id UUID REFERENCES public.shifts(id) NOT NULL,
    weather VARCHAR(30) NOT NULL CHECK (weather IN ('Cerah', 'Hujan', 'Berawan')),
    general_situation TEXT NOT NULL,
    handover_notes TEXT,
    outgoing_commander_id UUID REFERENCES public.staff_security(id),
    incoming_commander_id UUID REFERENCES public.staff_security(id),
    status VARCHAR(30) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Verified', 'Approved')),
    created_by UUID REFERENCES auth.users(id),
    verified_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Report Checklists (8 Area Inspeksi)
CREATE TABLE IF NOT EXISTS public.daily_report_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.daily_security_reports(id) ON DELETE CASCADE,
    area_name VARCHAR(50) NOT NULL, -- Gerbang, Gedung, CCTV, Pagar, Lampu, APAR, Parkir, Pos Security
    status VARCHAR(30) NOT NULL CHECK (status IN ('Baik', 'Perlu Perhatian', 'Bermasalah', 'Tidak Diperiksa')),
    notes TEXT,
    photo_url TEXT
);

-- Daily Report Assigned Officers
CREATE TABLE IF NOT EXISTS public.daily_report_officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.daily_security_reports(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff_security(id) ON DELETE RESTRICT
);

-- Patrol Schedules
CREATE TABLE IF NOT EXISTS public.patrol_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_id UUID REFERENCES public.shifts(id) NOT NULL,
    staff_id UUID REFERENCES public.staff_security(id) NOT NULL,
    patrol_location_id UUID REFERENCES public.patrol_locations(id) NOT NULL,
    target_time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Late', 'Missed', 'Location Unverified')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patrol Logs (Hasil Scan QR & Geolocation)
CREATE TABLE IF NOT EXISTS public.patrol_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES public.patrol_schedules(id),
    patrol_location_id UUID REFERENCES public.patrol_locations(id) NOT NULL,
    staff_id UUID REFERENCES public.staff_security(id) NOT NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy_meters NUMERIC(6, 2),
    distance_meters NUMERIC(8, 2),
    status VARCHAR(30) NOT NULL CHECK (status IN ('Completed', 'Late', 'Location Unverified')),
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_no VARCHAR(30) UNIQUE NOT NULL,
    category_id UUID REFERENCES public.incident_categories(id) NOT NULL,
    location_text VARCHAR(150) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    incident_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reporter_id UUID REFERENCES public.staff_security(id) NOT NULL,
    chronology TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'Progress', 'Closed')),
    assigned_pic VARCHAR(100),
    handling_notes TEXT,
    resolution_notes TEXT,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Media (Foto / Dokumen Pendukung)
CREATE TABLE IF NOT EXISTS public.incident_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL, -- image/webp, video/mp4
    storage_path TEXT NOT NULL,
    file_size_kb INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lost and Found (Barang Temuan)
CREATE TABLE IF NOT EXISTS public.lost_found (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_no VARCHAR(30) UNIQUE NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    found_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location_text VARCHAR(100) NOT NULL,
    found_by VARCHAR(100) NOT NULL,
    receiver_staff_id UUID REFERENCES public.staff_security(id) NOT NULL,
    storage_location VARCHAR(100) NOT NULL,
    photo_url TEXT,
    status VARCHAR(30) DEFAULT 'Belum Diambil' CHECK (status IN ('Belum Diambil', 'Sudah Diambil')),
    claimed_by VARCHAR(100),
    claimed_at TIMESTAMPTZ,
    handover_proof_url TEXT,
    handover_officer_id UUID REFERENCES public.staff_security(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item Deposits (Barang Titipan)
CREATE TABLE IF NOT EXISTS public.item_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deposit_no VARCHAR(30) UNIQUE NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    deposit_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    receiver_staff_id UUID REFERENCES public.staff_security(id) NOT NULL,
    storage_location VARCHAR(100) NOT NULL,
    photo_url TEXT,
    status VARCHAR(30) DEFAULT 'Dititipkan' CHECK (status IN ('Dititipkan', 'Sudah Diambil')),
    return_time TIMESTAMPTZ,
    return_staff_id UUID REFERENCES public.staff_security(id),
    signature_data TEXT, -- Base64 SVG or storage path
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Movements (Log Keluar-Masuk Mobil Sekolah)
CREATE TABLE IF NOT EXISTS public.vehicle_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_no VARCHAR(30) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    unit_id UUID REFERENCES public.units(id) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    out_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_km NUMERIC(10, 1) NOT NULL,
    out_officer_id UUID REFERENCES public.staff_security(id) NOT NULL,
    in_time TIMESTAMPTZ,
    end_km NUMERIC(10, 1),
    in_officer_id UUID REFERENCES public.staff_security(id),
    status VARCHAR(30) DEFAULT 'Masih Keluar' CHECK (status IN ('Masih Keluar', 'Sudah Kembali')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Center
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Info' CHECK (priority IN ('Info', 'Warning', 'High', 'Critical')),
    module VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (Append-Only Log Keamanan)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    user_role VARCHAR(30),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    record_id VARCHAR(100),
    summary TEXT NOT NULL,
    ip_address VARCHAR(50)
);

-- System Settings (Key-Value)
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- ------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-EFFICIENCY POSTGRES QUERIES
-- ------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_visitor_checkins_status ON public.visitor_checkins(status);
CREATE INDEX IF NOT EXISTS idx_visitor_checkins_checkin_time ON public.visitor_checkins(checkin_time DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_checkins_unit ON public.visitor_checkins(unit_id);
CREATE INDEX IF NOT EXISTS idx_patrol_logs_location ON public.patrol_logs(patrol_location_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_priority_status ON public.incidents(priority, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_movements_status ON public.vehicle_movements(status);

-- ------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrol_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Universal Read for Authenticated Users (Active Staff)
CREATE POLICY "Allow read units" ON public.units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read staff" ON public.staff_security FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read visitor" ON public.visitor_checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read reports" ON public.daily_security_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read patrol" ON public.patrol_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read lost_found" ON public.lost_found FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read deposits" ON public.item_deposits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read vehicles" ON public.vehicle_movements FOR SELECT TO authenticated USING (true);

-- Mutations restricted by Role:
-- Management role is STRICT READ ONLY (no INSERT/UPDATE/DELETE)
CREATE POLICY "Staff insert visitor" ON public.visitor_checkins FOR INSERT TO authenticated
    WITH CHECK (public.current_user_role() IN ('admin', 'supervisor', 'officer'));

CREATE POLICY "Staff update visitor" ON public.visitor_checkins FOR UPDATE TO authenticated
    USING (public.current_user_role() IN ('admin', 'supervisor', 'officer'));

CREATE POLICY "Admin audit log access" ON public.audit_logs FOR SELECT TO authenticated
    USING (public.current_user_role() = 'admin');

-- ------------------------------------------------------------------------
-- 5. INITIAL SEED DATA
-- ------------------------------------------------------------------------

-- Units
INSERT INTO public.units (code, name, pic_name) VALUES
('INF', 'Informasi', 'Ibu Rahmawati'),
('TK', 'TK Lazuardi', 'Ibu Nurhayati'),
('SD', 'SD Lazuardi', 'Bapak Bambang S.'),
('SMP', 'SMP Lazuardi', 'Ibu Farida'),
('SUP', 'Support', 'Bapak Agus Setiawan'),
('HRD', 'HRD', 'Ibu Dian Safitri'),
('LTB', 'Litbang', 'Bapak Hendra K.'),
('DIR', 'Direktorat', 'Bapak Dr. H. Lazuardi')
ON CONFLICT (code) DO NOTHING;

-- Staff Security (10 Personel Awal Sesuai Master Prompt)
INSERT INTO public.staff_security (name, nip, position, phone) VALUES
('Ismail', 'SEC-001', 'Komandan Regu', '081298765001'),
('Sarmdi', 'SEC-002', 'Anggota Security', '081298765002'),
('Ahmad Soleh', 'SEC-003', 'Anggota Security', '081298765003'),
('Andreas Maulana', 'SEC-004', 'Anggota Security', '081298765004'),
('Moch Saepurrohman', 'SEC-005', 'Anggota Security', '081298765005'),
('Rizki Maulana', 'SEC-006', 'Anggota Security', '081298765006'),
('Coirul Fikri', 'SEC-007', 'Anggota Security', '081298765007'),
('Andyka Jessy Saputra', 'SEC-008', 'Anggota Security', '081298765008'),
('Aditya Nugraha', 'SEC-009', 'Anggota Security', '081298765009'),
('Rizki Ramadhan', 'SEC-010', 'Anggota Security', '081298765010')
ON CONFLICT (nip) DO NOTHING;

-- Shifts
INSERT INTO public.shifts (name, start_time, end_time) VALUES
('Siang', '06:00:00', '18:00:00'),
('Malam', '18:00:00', '06:00:00')
ON CONFLICT DO NOTHING;

-- Incident Categories
INSERT INTO public.incident_categories (code, name, default_priority) VALUES
('KCL', 'Kecelakaan', 'High'),
('TBK', 'Tabrakan', 'High'),
('PTK', 'Pertengkaran', 'Medium'),
('MTI', 'Masuk Tanpa Izin', 'Critical'),
('KHL', 'Kehilangan', 'Medium'),
('LNN', 'Lainnya', 'Low')
ON CONFLICT (code) DO NOTHING;

-- Visit Purposes
INSERT INTO public.visit_purposes (code, name, description) VALUES
('DNS', 'Dinas', 'Kunjungan kedinasan / instansi pemerintah'),
('INF', 'Informasi Sekolah', 'Konsultasi pendaftaran / informasi akademik'),
('SLS', 'Sales', 'Presentasi produk / penawaran rekanan'),
('VND', 'Vendor', 'Pekerjaan teknis / pemeliharaan fasilitas'),
('LNN', 'Lainnya', 'Keperluan pribadi / urusan umum')
ON CONFLICT (code) DO NOTHING;

-- Patrol Locations (Titik Patroli Kampus Lazuardi)
INSERT INTO public.patrol_locations (code, name, description, latitude, longitude, radius_meters, qr_token) VALUES
('LOC-01', 'Gerbang Utama & Pos Satpam', 'Pintu masuk dan pos registrasi tamu', -6.3725000, 106.8285000, 50, 'LAZ-PATROL-GERBANG-UTAMA'),
('LOC-02', 'Lobby Utama & Gedung Informasi', 'Area penerimaan tamu dan ruang tunggu', -6.3727000, 106.8287000, 40, 'LAZ-PATROL-LOBBY-INFORMASI'),
('LOC-03', 'Gedung TK & Area Playground', 'Area bermain anak dan ruang kelas TK', -6.3729000, 106.8282000, 60, 'LAZ-PATROL-GEDUNG-TK'),
('LOC-04', 'Gedung SD (Lantai 1 - 3)', 'Koridor kelas dan tangga darurat SD', -6.3732000, 106.8288000, 75, 'LAZ-PATROL-GEDUNG-SD'),
('LOC-05', 'Gedung SMP & Lab Sains', 'Laboratorium komputer, sains, dan kelas SMP', -6.3735000, 106.8290000, 75, 'LAZ-PATROL-GEDUNG-SMP'),
('LOC-06', 'Area Parkir Mobil & Lapangan Olahraga', 'Lapangan rumput, basket, dan parkir kendaraan', -6.3731000, 106.8295000, 80, 'LAZ-PATROL-PARKIR-LAPANGAN'),
('LOC-07', 'Kantin & Area Dapur Sekolah', 'Fasilitas kantin siswa dan sanitasi', -6.3737000, 106.8284000, 50, 'LAZ-PATROL-KANTIN-DAPUR'),
('LOC-08', 'Pagar Belakang & Jalur Evakuasi', 'Perbatasan pagar keliling dan pos jaga belakang', -6.3740000, 106.8288000, 60, 'LAZ-PATROL-PAGAR-BELAKANG')
ON CONFLICT (code) DO NOTHING;

-- Vehicles
INSERT INTO public.vehicles (plate_number, vehicle_type, brand_model) VALUES
('B 1928 SCL', 'Mobil Dinas', 'Toyota Innova Reborn Silver'),
('B 7812 LZD', 'Elf / Bus Sekolah', 'Isuzu Elf White-Blue'),
('B 4410 SQK', 'Motor Operasional', 'Honda Beat ESP Hitam')
ON CONFLICT (plate_number) DO NOTHING;

-- Seed 30 Visitor Cards
INSERT INTO public.visitor_cards (card_number)
SELECT 'CARD-' || LPAD(s::text, 3, '0')
FROM generate_series(1, 30) AS s
ON CONFLICT (card_number) DO NOTHING;
