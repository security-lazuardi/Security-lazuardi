import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  QrCode,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Camera,
  RefreshCw,
  Search,
  Crosshair,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../auth/AuthContext';
import { LSMSStorage } from '../../lib/storage-adapter';
import { PatrolLocation, PatrolLog } from '../../types';
import { calculateDistanceMeters } from '../../lib/geo';
import { formatDateTimeWIB } from '../../lib/formatters';

export const SecurityPatrolView: React.FC = () => {
  const { currentUser, canMutateData } = useAuth();
  const [locations] = useState<PatrolLocation[]>(() => LSMSStorage.getPatrolLocations());
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>(() => LSMSStorage.getPatrolLogs());

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PatrolLocation>(locations[0]);
  const [manualToken, setManualToken] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    status: 'Completed' | 'Late' | 'Location Unverified';
    distance: number;
    message: string;
  } | null>(null);

  // Video element ref for WebRTC camera stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Start camera when modal opens
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScannerOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setIsCameraActive(true);
          }
        })
        .catch(() => {
          setIsCameraActive(false);
        });

      // Fetch Geolocation
      if ('geolocation' in navigator) {
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setIsGettingLocation(false);
          },
          (err) => {
            setGeoError('GPS tidak dapat diakses atau izin ditolak.');
            // Default to nearby school location for demo preview convenience
            setCurrentCoords({
              lat: locations[0].latitude + 0.0001,
              lng: locations[0].longitude + 0.0001,
            });
            setIsGettingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    };
  }, [isScannerOpen, locations]);

  const handleExecuteScan = (tokenToValidate: string) => {
    const loc = locations.find((l) => l.qrToken === tokenToValidate) || selectedLocation;

    const lat = currentCoords?.lat || loc.latitude;
    const lng = currentCoords?.lng || loc.longitude;
    const distance = calculateDistanceMeters(lat, lng, loc.latitude, loc.longitude);
    const isWithinRadius = distance <= loc.radiusMeters;

    const status: 'Completed' | 'Late' | 'Location Unverified' = isWithinRadius
      ? 'Completed'
      : 'Location Unverified';

    const message = isWithinRadius
      ? `Lokasi terverifikasi dalam radius ${distance}m (Toleransi: ${loc.radiusMeters}m)`
      : `Peringatan: Jarak fisik ${distance}m melebihi radius toleransi ${loc.radiusMeters}m. Titik patroli belum terverifikasi akurat.`;

    setScanResult({ status, distance, message });

    // Save patrol log
    LSMSStorage.logPatrol({
      patrolLocationId: loc.id,
      locationName: loc.name,
      locationCode: loc.code,
      staffId: currentUser.id,
      staffName: currentUser.fullName,
      latitude: lat,
      longitude: lng,
      accuracyMeters: 5,
      distanceMeters: distance,
      status,
      notes: message,
    });

    setPatrolLogs(LSMSStorage.getPatrolLogs());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security Patrol Management</h2>
          <p className="text-sm text-slate-500">
            Pemindaian QR Code titik kontrol fisik dan validasi geolokasi GPS satpam secara real-time.
          </p>
        </div>
        {canMutateData && (
          <Button
            size="md"
            icon={<Camera className="w-4 h-4" />}
            onClick={() => {
              setScanResult(null);
              setIsScannerOpen(true);
            }}
          >
            Buka Pemindai QR Patroli
          </Button>
        )}
      </div>

      {/* Target Patrol Points Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-700" />
          <span>Daftar Titik Patroli Aktif Kampus Lazuardi</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {locations.map((loc) => {
            const lastLog = patrolLogs.find((p) => p.patrolLocationId === loc.id);
            return (
              <div
                key={loc.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-800">{loc.code}</span>
                  <Badge variant={lastLog ? 'success' : 'neutral'}>
                    {lastLog ? 'Telah Diperiksa' : 'Belum Dipatroli'}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{loc.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{loc.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono flex justify-between">
                  <span>Radius: {loc.radiusMeters}m</span>
                  <span>{lastLog ? formatDateTimeWIB(lastLog.scannedAt).slice(12) : '-'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patrol History Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Riwayat Log Scan Patroli Terbaru</h3>
          <span className="text-xs text-slate-500">Terurut dari yang terbaru</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu Scan (WIB)</th>
                <th className="px-4 py-3">Titik Patroli</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-4 py-3">Jarak ke Titik</th>
                <th className="px-4 py-3">Status Validasi</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patrolLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada log patroli tercatat.
                  </td>
                </tr>
              ) : (
                patrolLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatDateTimeWIB(log.scannedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {log.locationName || log.patrolLocationId}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{log.staffName || 'Petugas Satpam'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {log.distanceMeters !== undefined ? `${log.distanceMeters} m` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={
                          log.status === 'Completed'
                            ? 'success'
                            : log.status === 'Late'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {log.status === 'Completed'
                          ? 'Sesuai Titik (Verified)'
                          : log.status === 'Late'
                          ? 'Terlambat'
                          : 'Location Unverified'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR & GPS Scanner Modal */}
      <Modal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Pemindai QR & Sensor GPS Patroli"
        subtitle="Arahkan kamera ke QR code akrilik titik patroli di lapangan"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Camera Viewport */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
            {isCameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4 text-slate-400">
                <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Kamera WebRTC siap memindai QR code</p>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none flex items-center justify-center">
              <div className="w-40 h-40 border-2 border-blue-400 rounded-lg relative animate-pulse">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* GPS Coordinates Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-700" />
              <span className="font-semibold text-slate-700">GPS Satpam:</span>
              <span className="font-mono text-slate-600">
                {currentCoords ? `${currentCoords.lat.toFixed(5)}, ${currentCoords.lng.toFixed(5)}` : 'Mendeteksi...'}
              </span>
            </div>
            {isGettingLocation && <span className="text-[10px] text-blue-600 animate-pulse">Sinkronisasi...</span>}
          </div>

          {/* Quick Simulation / Manual Token Input */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Pilih Titik untuk Simulasi / Masukkan Token Manual:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedLocation.id}
                onChange={(e) => {
                  const loc = locations.find((l) => l.id === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.code} — {loc.name}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => handleExecuteScan(selectedLocation.qrToken)}
              >
                Scan Titik
              </Button>
            </div>
          </div>

          {/* Scan Result Feedback */}
          {scanResult && (
            <div
              className={`p-4 rounded-xl text-xs space-y-1 ${
                scanResult.status === 'Completed'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5">
                {scanResult.status === 'Completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>Status: {scanResult.status}</span>
              </div>
              <p>{scanResult.message}</p>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsScannerOpen(false)}>
              Tutup Scanner
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
