import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LSMSStorage } from '../../lib/storage-adapter';
import { NotificationItem } from '../../types';
import { formatDateTimeWIB } from '../../lib/formatters';

interface NotificationCenterViewProps {
  setActiveView: (view: string) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({ setActiveView }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => LSMSStorage.getNotifications());
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filterPriority === 'all') return true;
    return n.priority.toLowerCase() === filterPriority.toLowerCase();
  });

  const handleMarkAllRead = () => {
    LSMSStorage.markAllNotificationsRead();
    setNotifications(LSMSStorage.getNotifications());
  };

  const handleMarkOneRead = (id: string) => {
    LSMSStorage.markNotificationRead(id);
    setNotifications(LSMSStorage.getNotifications());
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Critical':
        return <Badge variant="danger">KRITIS</Badge>;
      case 'High':
        return <Badge variant="warning">TINGGI</Badge>;
      case 'Warning':
        return <Badge variant="warning">PERHATIAN</Badge>;
      default:
        return <Badge variant="neutral">INFO</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pusat Notifikasi Operasional</h2>
          <p className="text-sm text-slate-500">
            Peringatan otomatis untuk durasi tamu lebih dari 4 jam, patroli terlambat, dan insiden prioritas tinggi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<CheckCheck className="w-4 h-4 text-blue-700" />}
          onClick={handleMarkAllRead}
        >
          Tandai Semua Telah Dibaca
        </Button>
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-2">
        {['all', 'critical', 'high', 'warning', 'info'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              filterPriority === p
                ? 'bg-[#1565C0] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p === 'all' ? 'Semua Notifikasi' : p}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Tidak ada notifikasi aktif untuk kategori ini.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                item.isRead ? 'bg-white opacity-85' : 'bg-blue-50/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    item.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-700'
                      : item.priority === 'High' || item.priority === 'Warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.priority === 'Critical' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">{item.title}</span>
                    {getPriorityBadge(item.priority)}
                    <span className="text-xs text-slate-400 font-mono">
                      {formatDateTimeWIB(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.isRead && (
                  <button
                    onClick={() => handleMarkOneRead(item.id)}
                    className="text-xs text-blue-700 hover:underline font-medium"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
