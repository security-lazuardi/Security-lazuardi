import React, { useState } from 'react';
import { Settings, Key, Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LSMSStorage, initializeStorageIfNeeded } from '../../lib/storage-adapter';
import { resetSupabaseClient } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

export const SettingsView: React.FC = () => {
  const { isAdmin } = useAuth();
  const currentConfig = LSMSStorage.getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      LSMSStorage.saveSupabaseConfig({
        url: supabaseUrl.trim(),
        anonKey: anonKey.trim(),
      });
      resetSupabaseClient();
      setSavedStatus('success');
      setTimeout(() => setSavedStatus('idle'), 4000);
    } catch {
      setSavedStatus('error');
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data lokal ke pengaturan default sekolah Lazuardi?')) {
      localStorage.clear();
      initializeStorageIfNeeded();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem & Database</h2>
        <p className="text-sm text-slate-500">
          Konfigurasi koneksi Supabase Cloud, parameter keamanan, dan retensi data.
        </p>
      </div>

      {savedStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan koneksi berhasil disimpan dan diaktifkan.</span>
        </div>
      )}

      {/* Supabase Connection Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Koneksi Supabase PostgreSQL Cloud</h3>
            <p className="text-xs text-slate-500">
              Masukkan Project URL dan Anon Key untuk menghubungkan aplikasi ke database produksi Supabase.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              disabled={!isAdmin}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Supabase Anon Public Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              disabled={!isAdmin}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              *Hanya gunakan <strong>anon public key</strong>. Jangan pernah memasukkan service_role secret di frontend!
            </p>
          </div>

          {isAdmin && (
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="primary" type="submit">
                Simpan Konfigurasi
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Local Storage & Cache Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Reset Data Sampel Lokal</h3>
            <p className="text-xs text-slate-500">
              Mengembalikan seluruh data unit, 10 staf satpam, dan transaksi ke kondisi awal Lazuardi.
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4 text-red-600" />}
              onClick={handleResetSampleData}
            >
              Reset Data Awal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
