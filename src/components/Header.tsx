import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Tv2, 
  Search, 
  ClipboardCheck, 
  Star, 
  ShieldCheck, 
  Clock, 
  PhoneCall,
  Menu,
  X,
  Download
} from 'lucide-react';
import { MADRASAH_PROFILE } from '../data/mockData';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  waitingCount: number;
  isOnline?: boolean;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  waitingCount,
  isOnline = true,
  pendingCount = 0
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'guestbook', label: 'Buku Tamu', icon: FileText, badge: null },
    { id: 'queue', label: 'Monitor Antrean', icon: Tv2, badge: waitingCount > 0 ? `${waitingCount}` : null },
    { id: 'check-status', label: 'Cek Status', icon: Search, badge: null },
    { id: 'services', label: 'SOP & Layanan', icon: ClipboardCheck, badge: null },
    { id: 'survey', label: 'Survei IKM', icon: Star, badge: null },
    { id: 'admin', label: 'Panel Petugas', icon: ShieldCheck, badge: 'Admin' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Bar: Official Announcement & Time */}
      <div className="bg-emerald-800 text-emerald-50 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/40">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-semibold tracking-wide bg-emerald-700/80 px-2 py-0.5 rounded text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PELAYANAN TERPADU SATU PINTU (PTSP)
          </span>
          <span className="hidden sm:inline text-emerald-200">|</span>
          <div className="flex items-center gap-1.5 text-[11px]">
            {isOnline ? (
              <span className="inline-flex items-center gap-1 text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Online (Tersinkron)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-950 font-bold bg-amber-400 px-2 py-0.5 rounded shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                <span>Mode Offline (IndexedDB)</span>
                {pendingCount > 0 && <span className="ml-1 bg-amber-600 text-white px-1 rounded text-[9px]">{pendingCount}</span>}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-emerald-100 font-mono text-[11px] ml-auto">
          <div className="hidden md:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>{currentDate}</span>
            <span className="font-bold text-white ml-1">{currentTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-200 hover:text-white transition">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>Hotline: {MADRASAH_PROFILE.phone}</span>
          </div>
        </div>
      </div>

      {/* Main Header Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div 
          onClick={() => setActiveTab('guestbook')}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          {/* Logo Emblem MAN Kota Blitar / Kemenag */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 p-0.5 shadow-md shadow-emerald-700/20 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-emerald-950/20 rounded-[10px] flex items-center justify-center p-1 border border-emerald-400/30">
              <Building2 className="w-6 h-6 text-emerald-100" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-emerald-950 font-black text-[9px] px-1 rounded-sm border border-white font-mono shadow-sm">
              PTSP
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                PTSP <span className="text-emerald-700">MAN KOTA BLITAR</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Resmi Online
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-tight font-medium">
              Buku Tamu Digital & Sistem Pelayanan Terpadu Satu Pintu Madrasah
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PWA Install Button (Desktop) */}
        {isInstallable && (
          <button
            onClick={install}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pasang App (PWA)</span>
          </button>
        )}

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-emerald-950 font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('queue')}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          >
            <Tv2 className="w-3.5 h-3.5" />
            <span>Antrean</span>
            {waitingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {waitingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-amber-400 text-emerald-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
