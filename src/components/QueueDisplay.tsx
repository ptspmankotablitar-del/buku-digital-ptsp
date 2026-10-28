import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Maximize2, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Radio,
  MessageCircle,
  Send,
  CheckCheck,
  BellRing,
  Megaphone,
  AlertTriangle,
  Sliders,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Tv,
  X,
  FileText
} from 'lucide-react';
import { GuestEntry, LoketInfo, SignageNotice } from '../types/ptsp';
import { announceTicket } from '../utils/audioAnnouncer';
import { dispatchWhatsAppNotification, getWhatsAppSendUrl, buildQueueCallWAMessage } from '../utils/whatsappNotification';
import { MADRASAH_PROFILE, INITIAL_SIGNAGE_NOTICES, DEFAULT_SIGNAGE_MARQUEE } from '../data/mockData';

interface QueueDisplayProps {
  lokets: LoketInfo[];
  guests: GuestEntry[];
  onCallTicket: (ticketNumber: string, loket: LoketInfo, guestName?: string) => void;
  openDigitalCard: (guest: GuestEntry) => void;
}

export const QueueDisplay: React.FC<QueueDisplayProps> = ({
  lokets,
  guests,
  onCallTicket,
  openDigitalCard
}) => {
  const [activeCallNotice, setActiveCallNotice] = useState<string | null>(null);
  const [lastWASentNotice, setLastWASentNotice] = useState<{
    guestName: string;
    phone: string;
    ticket: string;
    url: string;
  } | null>(null);

  // Digital Signage States
  const [signageNotices, setSignageNotices] = useState<SignageNotice[]>(() => {
    try {
      const saved = localStorage.getItem('ptsp_digital_signage_notices');
      return saved ? JSON.parse(saved) : INITIAL_SIGNAGE_NOTICES;
    } catch {
      return INITIAL_SIGNAGE_NOTICES;
    }
  });

  const [marqueeText, setMarqueeText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ptsp_signage_marquee');
      return saved || DEFAULT_SIGNAGE_MARQUEE;
    } catch {
      return DEFAULT_SIGNAGE_MARQUEE;
    }
  });

  const [isSignageManagerOpen, setIsSignageManagerOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // New notice form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLevel, setNewLevel] = useState<'info' | 'urgent' | 'announcement'>('info');
  const [newAuthor, setNewAuthor] = useState('Petugas PTSP');
  const [tempMarquee, setTempMarquee] = useState(marqueeText);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('ptsp_digital_signage_notices', JSON.stringify(signageNotices));
    } catch {
      // Ignore
    }
  }, [signageNotices]);

  useEffect(() => {
    try {
      localStorage.setItem('ptsp_signage_marquee', marqueeText);
    } catch {
      // Ignore
    }
  }, [marqueeText]);

  // Active notices
  const activeNotices = signageNotices.filter((n) => n.active);
  const urgentNotice = activeNotices.find((n) => n.level === 'urgent');

  // Auto-rotate announcement carousel every 7 seconds
  useEffect(() => {
    if (activeNotices.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % activeNotices.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeNotices.length]);

  const waitingGuests = guests.filter((g) => g.status === 'Menunggu');

  const handleManualRecall = (loket: LoketInfo) => {
    if (!loket.currentTicket) return;
    const guest = guests.find((g) => g.ticketNumber === loket.currentTicket);
    const guestName = guest?.fullName;
    
    setActiveCallNotice(`Memanggil ${loket.currentTicket} ke ${loket.name}...`);
    announceTicket(loket.currentTicket, loket.name, guestName);
    onCallTicket(loket.currentTicket, loket, guestName);

    // Automated WhatsApp Notification Dispatch
    if (guest && guest.phone) {
      const { url } = dispatchWhatsAppNotification(
        guest,
        loket.name,
        loket.officerName,
        false
      );

      setLastWASentNotice({
        guestName: guest.fullName,
        phone: guest.phone,
        ticket: guest.ticketNumber,
        url
      });

      setTimeout(() => {
        setLastWASentNotice(null);
      }, 7000);
    }

    setTimeout(() => {
      setActiveCallNotice(null);
    }, 4500);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Signage Handlers
  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Judul dan isi pengumuman wajib diisi.');
      return;
    }

    const now = new Date();
    const notice: SignageNotice = {
      id: `sn-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      level: newLevel,
      author: newAuthor.trim() || 'Petugas PTSP',
      timestamp: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      date: now.toISOString().slice(0, 10),
      active: true
    };

    setSignageNotices((prev) => [notice, ...prev]);
    setNewTitle('');
    setNewContent('');
    setActiveSlideIndex(0);
  };

  const handleToggleNotice = (id: string) => {
    setSignageNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n))
    );
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm('Hapus pengumuman ini dari Digital Signage?')) {
      setSignageNotices((prev) => prev.filter((n) => n.id !== id));
      setActiveSlideIndex(0);
    }
  };

  const handleSaveMarquee = () => {
    setMarqueeText(tempMarquee);
    alert('Teks berjalan (running-text marquee) berhasil diperbarui!');
  };

  const handleResetDefaultSignage = () => {
    if (confirm('Kembalikan pengumuman signage ke pengaturan standar madrasah?')) {
      setSignageNotices(INITIAL_SIGNAGE_NOTICES);
      setMarqueeText(DEFAULT_SIGNAGE_MARQUEE);
      setTempMarquee(DEFAULT_SIGNAGE_MARQUEE);
      setActiveSlideIndex(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* 1. URGENT BREAKING NOTICE BANNER (Digital Signage Urgent Alert) */}
      {urgentNotice && (
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white p-4 rounded-3xl shadow-lg border border-rose-500/80 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono">
                  PEMBERITAHUAN PENTING LOBI
                </span>
                <span className="text-[11px] text-rose-100 font-medium">
                  {urgentNotice.author} &bull; {urgentNotice.timestamp}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                {urgentNotice.title}
              </h4>
              <p className="text-xs text-rose-100 leading-snug">
                {urgentNotice.content}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSignageManagerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kelola Signage</span>
          </button>
        </div>
      )}

      {/* 2. Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Layar Monitor Antrean & Digital Signage Lobi
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Monitor resmi ruang tunggu PTSP MAN Kota Blitar dilengkapi audio suara & pengumuman digital
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Digital Signage Manager Button */}
          <button
            onClick={() => {
              setTempMarquee(marqueeText);
              setIsSignageManagerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition"
            title="Kelola Teks Berjalan & Pengumuman Digital Signage"
          >
            <Megaphone className="w-4 h-4 text-slate-950" />
            <span>Digital Signage ({activeNotices.length})</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WA Otomatis: </span>
            <span className="font-extrabold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
              AKTIF
            </span>
          </div>

          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            title="Layar Penuh Kiosk"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Layar Penuh (Kiosk)</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Dispatched Notification Banner */}
      {lastWASentNotice && (
        <div className="bg-emerald-700 text-white p-4 rounded-2xl shadow-lg border border-emerald-600 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="text-xs">
              <span className="font-bold block">
                Notifikasi WhatsApp Panggilan Berhasil Disiapkan & Dicatat
              </span>
              <span className="text-emerald-100">
                Pesan untuk: <strong className="text-white">{lastWASentNotice.guestName}</strong> ({lastWASentNotice.phone}) &bull; Tiket {lastWASentNotice.ticket}
              </span>
            </div>
          </div>
          <a
            href={lastWASentNotice.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-50 transition"
          >
            <Send className="w-3.5 h-3.5 text-emerald-700" />
            <span>Buka Chat WhatsApp</span>
          </a>
        </div>
      )}

      {/* Audio Announcement Alert Notice */}
      {activeCallNotice && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm animate-bounce">
          <Volume2 className="w-5 h-5" />
          <span>{activeCallNotice}</span>
        </div>
      )}

      {/* 3 Active Loket Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {lokets.map((loket) => {
          const currentGuest = guests.find((g) => g.ticketNumber === loket.currentTicket);

          return (
            <div
              key={loket.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col hover:border-emerald-500 transition-all duration-200"
            >
              {/* Loket Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-200">
                    LOKET {loket.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950/40 border border-emerald-400/40 text-emerald-100">
                    {loket.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white mt-1 line-clamp-1">{loket.name.replace(/Loket \d+ - /, '')}</h3>
                <p className="text-[11px] text-emerald-100/90 font-medium">Petugas: {loket.officerName}</p>
              </div>

              {/* Loket Calling Display */}
              <div className="p-6 text-center flex-1 flex flex-col justify-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SEDANG DILAYANI
                </span>
                <div className="text-5xl font-black text-emerald-900 my-2 font-mono tracking-tight drop-shadow-sm">
                  {loket.currentTicket || '- - -'}
                </div>

                {currentGuest ? (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 text-sm">{currentGuest.fullName}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-100 line-clamp-1">
                      {currentGuest.serviceNeeded}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      WA: {currentGuest.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada antrean yang dipanggil</p>
                )}
              </div>

              {/* Action: Panggil Suara & WhatsApp Dispatch */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleManualRecall(loket)}
                  disabled={!loket.currentTicket}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    loket.currentTicket
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Panggil Suara</span>
                </button>

                {currentGuest && (
                  <a
                    href={getWhatsAppSendUrl(
                      currentGuest.phone,
                      buildQueueCallWAMessage(currentGuest, loket.name, loket.officerName)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-sm transition"
                    title={`Kirim WhatsApp ke ${currentGuest.fullName}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Waiting List & Digital Signage Info Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Antrean Menunggu (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Daftar Antrean Menunggu ({waitingGuests.length})
                </h3>
                <p className="text-xs text-slate-500">Pengunjung yang sedang menunggu giliran dipanggil</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Realtime
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {waitingGuests.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                Tidak ada antrean yang sedang menunggu saat ini.
              </div>
            ) : (
              waitingGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-xl bg-emerald-800 text-white font-mono font-black text-sm flex items-center justify-center shadow-sm">
                      {guest.ticketNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{guest.fullName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                          {guest.category}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium">
                        {guest.serviceNeeded} &bull; <span className="text-slate-400">{guest.timestamp}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDigitalCard(guest)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      Lihat Tiket
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. DIGITAL SIGNAGE WIDGET & MADRASAH PROFILE (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* DIGITAL SIGNAGE CAROUSEL CARD */}
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-md overflow-hidden flex flex-col justify-between">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold tracking-wide uppercase">
                  PAPAN INFORMASI DIGITAL (SIGNAGE)
                </span>
              </div>
              <button
                onClick={() => {
                  setTempMarquee(marqueeText);
                  setIsSignageManagerOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-200 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg transition"
              >
                <Sliders className="w-3 h-3" />
                <span>Atur</span>
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              {activeNotices.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Tidak ada pengumuman digital aktif saat ini.
                </div>
              ) : (
                (() => {
                  const notice = activeNotices[activeSlideIndex % activeNotices.length];
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            notice.level === 'urgent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : notice.level === 'announcement'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {notice.level === 'urgent'
                            ? 'Mendesak / Penting'
                            : notice.level === 'announcement'
                            ? 'Pengumuman Resmi'
                            : 'Info Pelayanan'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {notice.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notice.content}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                        <span>Oleh: <strong className="text-slate-700">{notice.author}</strong></span>
                        <span>{notice.date}</span>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Navigation Indicators */}
              {activeNotices.length > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {activeNotices.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === activeSlideIndex % activeNotices.length
                            ? 'w-6 bg-emerald-600'
                            : 'w-2 bg-slate-200'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActiveSlideIndex((prev) =>
                          prev === 0 ? activeNotices.length - 1 : prev - 1
                        )
                      }
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveSlideIndex((prev) => (prev + 1) % activeNotices.length)
                      }
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                      title="Selanjutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maklumat Pelayanan */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>MAKLUMAT PELAYANAN PTSP</span>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed mb-3">
              "Kami menyatakan sanggup menyelenggarakan pelayanan sesuai standar pelayanan dan komitmen Wilayah Bebas dari Korupsi (WBK)."
            </p>
            <div className="text-[11px] text-emerald-300 font-mono border-t border-emerald-800/80 pt-2 flex justify-between">
              <span>Kepala Madrasah</span>
              <span className="font-bold text-white">{MADRASAH_PROFILE.headmaster}</span>
            </div>
          </div>

          {/* Jam Pelayanan */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 block text-sm">Jam Layanan PTSP:</span>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>Senin - Kamis:</span>
                <span className="font-semibold text-slate-800">07.30 - 15.30 WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Jumat:</span>
                <span className="font-semibold text-slate-800">07.30 - 15.00 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RUNNING TEXT MARQUEE TICKER (Digital Signage Ticker) */}
      <div className="bg-emerald-900 text-emerald-50 rounded-2xl py-2.5 px-4 shadow-sm flex items-center gap-3 overflow-hidden text-xs border border-emerald-800">
        <div className="flex items-center gap-1.5 bg-amber-400 text-emerald-950 font-black text-[10px] px-2.5 py-1 rounded-lg uppercase shrink-0 shadow-sm">
          <Megaphone className="w-3.5 h-3.5" />
          <span>INFO PTSP</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee font-medium text-xs sm:text-sm tracking-wide text-emerald-100">
            {marqueeText}
          </div>
        </div>

        <button
          onClick={() => {
            setTempMarquee(marqueeText);
            setIsSignageManagerOpen(true);
          }}
          className="p-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 hover:text-white transition shrink-0"
          title="Ubah teks berjalan"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. MODAL KELOLA DIGITAL SIGNAGE & PENGUMUMAN */}
      {isSignageManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Tv className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pengaturan Digital Signage & Pengumuman Lobi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Atur teks berjalan (marquee) dan publikasikan pesan penting untuk pengunjung lobi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSignageManagerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section A: Edit Scrolling Ticker (Marquee) */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-emerald-700" />
                  Teks Berjalan Layar Lobi (Running-Text Marquee)
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Tampil di footer monitor antrean</span>
              </label>
              <textarea
                rows={2}
                value={tempMarquee}
                onChange={(e) => setTempMarquee(e.target.value)}
                placeholder="Tuliskan pengumuman berjalan untuk lobi..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveMarquee}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                >
                  Simpan Teks Berjalan
                </button>
              </div>
            </div>

            {/* Section B: Create New Announcement */}
            <form onSubmit={handleCreateNotice} className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-700" />
                Posting Pengumuman Digital Baru
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Judul Pengumuman <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Jadwal Pelayanan Selama Ujian Madrasah..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tingkat Urgensi
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="info">Info Standar (Hijau)</option>
                    <option value="announcement">Pengumuman Khusus (Amber)</option>
                    <option value="urgent">Mendesak / Breaking News (Merah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Penulis / Bagian
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Contoh: Petugas PTSP / Waka Kesiswaan"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Isi Pesan Pengumuman <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Tuliskan isi pesan pengumuman untuk pengunjung..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publikasikan ke Layar Lobi</span>
                </button>
              </div>
            </form>

            {/* Section C: List of Announcements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Daftar Pengumuman Digital ({signageNotices.length})
                </span>
                <button
                  type="button"
                  onClick={handleResetDefaultSignage}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  Reset ke Standar Madrasah
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
                {signageNotices.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Belum ada pengumuman digital yang tersimpan.
                  </div>
                ) : (
                  signageNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-3 hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${
                              notice.level === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : notice.level === 'announcement'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {notice.level}
                          </span>
                          <span className="font-bold text-slate-900">{notice.title}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-1">{notice.content}</p>
                        <p className="text-[10px] text-slate-400">
                          {notice.author} &bull; {notice.timestamp} ({notice.date})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleNotice(notice.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                            notice.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {notice.active ? 'Aktif di Layar' : 'Nonaktif'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSignageManagerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
