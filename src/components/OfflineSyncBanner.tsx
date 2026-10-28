import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Download, 
  HardDrive, 
  Smartphone,
  X
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncToast: string | null;
  onTriggerSync: () => void;
  onDismissToast: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  syncToast,
  onTriggerSync,
  onDismissToast
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <div className="print:hidden">
      {/* 1. Offline Notification Bar (When Disconnected) */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs border-b border-amber-600">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            <WifiOff className="w-4 h-4 text-slate-950" />
            <span>Mode Offline Aktif: Koneksi internet terputus.</span>
            <span className="hidden sm:inline font-normal text-amber-950">
              Pendaftaran tamu tetap berjalan lancar dan otomatis tersimpan di IndexedDB lokal.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600/30 text-slate-950 font-mono text-[11px] font-bold">
              <HardDrive className="w-3.5 h-3.5" />
              <span>{pendingCount} Antrean Belum Tersinkron</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pending Sync Alert Bar (When Online but has un-synced items) */}
      {isOnline && pendingCount > 0 && (
        <div className="bg-emerald-800 text-white px-4 py-2 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs border-b border-emerald-900">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <Wifi className="w-4 h-4 text-emerald-300" />
            <span>Koneksi Internet Terhubung.</span>
            <span className="text-emerald-200">
              Ada {pendingCount} pendaftaran buku tamu yang dicatat saat offline.
            </span>
          </div>

          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      )}

      {/* 3. Sync Toast Confirmation */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-700 flex items-center justify-between gap-3 text-xs max-w-md animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <span>{syncToast}</span>
          </div>
          <button
            onClick={onDismissToast}
            className="p-1 text-emerald-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. iOS Safari Guided Install Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Pasang di iPhone / iPad</h3>
            <p className="text-xs text-slate-600 leading-relaxed text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
              1. Ketuk ikon tombol <strong>Bagikan (Share)</strong> di bilah bawah peramban Safari.<br />
              2. Gulir ke bawah lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.<br />
              3. Aplikasi PTSP MAN Kota Blitar siap digunakan secara mandiri dan offline!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
