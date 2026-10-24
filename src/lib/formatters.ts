/**
 * Lazuardi Security Management System (LSMS)
 * Indonesian Date, Currency, & Status Formatters
 */

export function formatDateWIB(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTimeWIB(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB';
  } catch {
    return dateString;
  }
}

export function formatDateTimeWIB(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB';
  } catch {
    return dateString;
  }
}

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '0 m';
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours} jam ${remMinutes > 0 ? remMinutes + ' m' : ''}`.trim();
  }
  return `${minutes} menit`;
}

export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'supervisor':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'officer':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'management':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'supervisor':
      return 'Supervisor Security';
    case 'officer':
      return 'Petugas Security';
    case 'management':
      return 'Manajemen Sekolah (Read-Only)';
    default:
      return role;
  }
}
