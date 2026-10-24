import React, { useState } from 'react';
import { UserCheck, Plus, KeyRound, ShieldAlert, Mail } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { UserProfile, UserRole } from '../../types';
import { getRoleBadgeClass, getRoleLabel, formatDateTimeWIB } from '../../lib/formatters';

export const UserManagementView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>(() => LSMSStorage.getUsers());
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'officer' as UserRole,
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.fullName || !inviteForm.email) return;

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      email: inviteForm.email,
      fullName: inviteForm.fullName,
      role: inviteForm.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    LSMSStorage.logAudit({
      module: 'User Management',
      action: 'INVITE_USER',
      recordId: newUser.email,
      summary: `Undangan akun baru dikirim ke ${newUser.email} sebagai ${getRoleLabel(newUser.role)}`,
    });

    setUsers([...users, newUser]);
    setIsInviteModalOpen(false);
    setInviteForm({ fullName: '', email: '', role: 'officer' });
    setFeedbackMsg(`Undangan aktivasi akun berhasil dikirim ke ${newUser.email}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleResetPassword = (user: UserProfile) => {
    LSMSStorage.logAudit({
      module: 'User Management',
      action: 'RESET_PASSWORD',
      recordId: user.email,
      summary: `Permintaan reset kata sandi dikirimkan ke email ${user.email}`,
    });
    setFeedbackMsg(`Tautan reset password terkirim via email ke ${user.email}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna & Hak Akses</h2>
          <p className="text-sm text-slate-500">
            Kelola akun, peran otorisasi (RBAC), dan status kredensial login staf operasional.
          </p>
        </div>
        {isAdmin && (
          <Button
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Undang Pengguna Baru
          </Button>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg('')} className="text-xs font-semibold hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* RBAC Info Card */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Prinsip Hak Akses Minimal (Least Privilege):</p>
        <p>• <strong>Administrator</strong>: Konfigurasi sistem, master data, audit log lengkap, dan pengaturan retensi.</p>
        <p>• <strong>Supervisor</strong>: Monitoring operasional, approval DSR, penanganan insiden, dan penugasan patroli.</p>
        <p>• <strong>Petugas Security</strong>: Input check-in/out tamu, eksekusi checklist, scan QR patroli, lapor temuan.</p>
        <p>• <strong>Manajemen Sekolah</strong>: Akses pantau & unduh laporan (Strict Read-Only, terisolasi dari mutasi data).</p>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama Pengguna</th>
                <th className="px-4 py-3">Email Akun</th>
                <th className="px-4 py-3">Role Akses</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Terakhir Login</th>
                {isAdmin && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.fullName}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${getRoleBadgeClass(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isActive ? 'success' : 'neutral'}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                    {formatDateTimeWIB(u.lastLoginAt)}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<KeyRound className="w-3.5 h-3.5" />}
                        onClick={() => handleResetPassword(u)}
                      >
                        Reset Password
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Undang Pengguna Sistem Baru"
        subtitle="Undangan aktivasi akun dengan tautan verifikasi email"
        maxWidth="md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={inviteForm.fullName}
              onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
              placeholder="Misal: Moch Saepurrohman"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Resmi Sekolah</label>
            <input
              type="email"
              required
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="nama@lazuardi.sch.id"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role / Peran Akses</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value="officer">Petugas Security (Operasional Lapangan)</option>
              <option value="supervisor">Supervisor Security (Verifikasi & Disposisi)</option>
              <option value="management">Manajemen Sekolah (Read-Only)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" icon={<Mail className="w-4 h-4" />}>
              Kirim Undangan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
