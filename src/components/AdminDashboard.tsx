import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Search, 
  Download, 
  Printer, 
  Volume2, 
  Filter, 
  Eye, 
  RotateCcw, 
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Building,
  UserCheck,
  QrCode,
  ScanLine,
  MessageCircle,
  Send,
  Smartphone,
  CheckCheck,
  HardDrive
} from 'lucide-react';
import { GuestEntry, LoketInfo, TicketStatus, ServiceType } from '../types/ptsp';
import { exportGuestsToCSV } from '../utils/exportUtils';
import { announceTicket } from '../utils/audioAnnouncer';
import { 
  dispatchWhatsAppNotification, 
  buildQueueCallWAMessage, 
  getWhatsAppSendUrl, 
  getSavedWhatsAppLogs,
  WhatsAppNotificationLog 
} from '../utils/whatsappNotification';
import { MADRASAH_PROFILE } from '../data/mockData';
import { AdminAnalyticsCharts } from './AdminAnalyticsCharts';

interface AdminDashboardProps {
  guests: GuestEntry[];
  lokets: LoketInfo[];
  onUpdateGuestStatus: (guestId: string, status: TicketStatus, loketId?: number, notes?: string) => void;
  onUpdateLoket: (loketId: number, currentTicket: string | undefined) => void;
  openDigitalCard: (guest: GuestEntry) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  guests,
  lokets,
  onUpdateGuestStatus,
  onUpdateLoket,
  openDigitalCard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [selectedGuestForDetail, setSelectedGuestForDetail] = useState<GuestEntry | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedInput, setScannedInput] = useState('');
  const [isWaLogModalOpen, setIsWaLogModalOpen] = useState(false);
  const [waAlertToast, setWaAlertToast] = useState<string | null>(null);
  const [waLogs, setWaLogs] = useState<WhatsAppNotificationLog[]>([]);
  const [csvToast, setCsvToast] = useState<string | null>(null);

  const handleDownloadCsv = (dataToExport: GuestEntry[], typeLabel = 'Buku_Tamu') => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Buku_Tamu_PTSP_MAN_Kota_Blitar_${typeLabel}_${dateStr}.csv`;
    const count = exportGuestsToCSV(dataToExport, filename);
    if (count > 0) {
      setCsvToast(`Berhasil mengunduh ${count} baris data buku tamu ke file ${filename}`);
      setTimeout(() => setCsvToast(null), 5000);
    }
  };

  // Statistics
  const totalGuests = guests.length;
  const waitingGuests = guests.filter((g) => g.status === 'Menunggu').length;
  const inProgressGuests = guests.filter((g) => g.status === 'Sedang Dilayani').length;
  const completedGuests = guests.filter((g) => g.status === 'Selesai').length;

  // Filtered guest list
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm) ||
      g.institutionOrAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'Semua' || g.status === filterStatus;
    const matchesCategory = filterCategory === 'Semua' || g.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCallAndServe = (guest: GuestEntry, loketId: number) => {
    const loket = lokets.find((l) => l.id === loketId) || lokets[0];
    onUpdateGuestStatus(guest.id, 'Sedang Dilayani', loketId);
    onUpdateLoket(loketId, guest.ticketNumber);
    announceTicket(guest.ticketNumber, loket.name, guest.fullName);

    // Automated WhatsApp Notification Service
    if (guest.phone) {
      dispatchWhatsAppNotification(guest, loket.name, loket.officerName, false);
      setWaAlertToast(
        `Notifikasi WhatsApp berhasil dikirimkan ke ${guest.fullName} (${guest.phone}) untuk panggilan ke ${loket.name}.`
      );
      setTimeout(() => setWaAlertToast(null), 5000);
    }
  };

  const handleOpenWaLogs = () => {
    setWaLogs(getSavedWhatsAppLogs());
    setIsWaLogModalOpen(true);
  };

  const handleMarkComplete = (guest: GuestEntry) => {
    onUpdateGuestStatus(guest.id, 'Selesai', guest.loketId, 'Layanan selesai diproses oleh petugas');
    if (guest.loketId) {
      const activeLoket = lokets.find((l) => l.id === guest.loketId);
      if (activeLoket && activeLoket.currentTicket === guest.ticketNumber) {
        onUpdateLoket(guest.loketId, undefined);
      }
    }
  };

  const handleSaveNotes = () => {
    if (selectedGuestForDetail) {
      onUpdateGuestStatus(selectedGuestForDetail.id, selectedGuestForDetail.status, selectedGuestForDetail.loketId, editNoteText);
      setSelectedGuestForDetail({
        ...selectedGuestForDetail,
        notes: editNoteText
      });
    }
  };

  const handlePrintOfficialLog = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Official Madrasah Letterhead for Print Mode */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h3 className="text-base font-bold tracking-wider">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
        <h2 className="text-xl font-extrabold uppercase">{MADRASAH_PROFILE.fullName}</h2>
        <p className="text-xs">{MADRASAH_PROFILE.address} | Telp: {MADRASAH_PROFILE.phone}</p>
        <p className="text-xs font-semibold">BUKU REGISTER PELAYANAN TERPADU SATU PINTU (PTSP) TAHUN 2026</p>
      </div>

      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Panel Pengelola PTSP & Buku Tamu
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manajemen operasional loket, verifikasi kehadiran, panggil suara, dan ekspor buku tamu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition"
          >
            <ScanLine className="w-4 h-4" />
            <span>Pindai / Verifikasi QR</span>
          </button>
          <button
            onClick={handleOpenWaLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-sm transition"
            title="Lihat riwayat notifikasi WhatsApp otomatis"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Log Notifikasi WA</span>
          </button>
          <button
            onClick={() => handleDownloadCsv(guests, 'Semua_Data')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition"
            title="Download seluruh register tamu ke format CSV"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV ({guests.length})</span>
          </button>
          <button
            onClick={handlePrintOfficialLog}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Buku Tamu</span>
          </button>
        </div>
      </div>

      {/* CSV Download Success Toast Banner */}
      {csvToast && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3.5 rounded-2xl shadow-sm flex items-center justify-between gap-3 text-xs animate-fadeIn print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-semibold">{csvToast}</span>
          </div>
          <button
            onClick={() => setCsvToast(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* WhatsApp Dispatched Toast Alert */}
      {waAlertToast && (
        <div className="bg-emerald-800 text-white p-3.5 rounded-2xl shadow-md border border-emerald-700 flex items-center justify-between gap-3 text-xs animate-fadeIn print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
              <CheckCheck className="w-4 h-4 text-amber-300" />
            </div>
            <span>{waAlertToast}</span>
          </div>
          <button
            onClick={handleOpenWaLogs}
            className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 font-bold text-[11px] shrink-0"
          >
            Lihat Log WA
          </button>
        </div>
      )}

      {/* Statistics Cards (Hidden on Print) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Total Kunjungan</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">{totalGuests}</div>
          <span className="text-[11px] text-slate-400">Tercatat di sistem buku tamu</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Menunggu Antrean</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono">{waitingGuests}</div>
          <span className="text-[11px] text-slate-400">Siap dipanggil ke loket</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Sedang Dilayani</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600 font-mono">{inProgressGuests}</div>
          <span className="text-[11px] text-slate-400">Aktif di loket pelayanan</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Selesai Dilayani</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono">{completedGuests}</div>
          <span className="text-[11px] text-slate-400">Berkas / urusan tuntas</span>
        </div>
      </div>

      {/* Visual Analytics Charts (Recharts Bar & Pie) */}
      <AdminAnalyticsCharts guests={guests} />

      {/* Filter and Search Bar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, tiket, instansi, atau no. telepon..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Sedang Dilayani">Sedang Dilayani</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Kategori:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Wali Murid / Orang Tua">Wali Murid</option>
              <option value="Alumni">Alumni</option>
              <option value="Kedinasan / Kemenag / Pemda">Kedinasan</option>
              <option value="Lembaga Pendidikan / Mitra">Mitra</option>
              <option value="Siswa">Siswa</option>
              <option value="Masyarakat Umum">Umum</option>
            </select>
          </div>

          <button
            onClick={() => handleDownloadCsv(filteredGuests, `Filter_${filterStatus}_${filterCategory}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition"
            title="Download data buku tamu yang sedang tampil ke file CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV ({filteredGuests.length})</span>
          </button>
        </div>
      </div>

      {/* Main Table: Buku Tamu Digital */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. Tiket</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Nama Lengkap & NIK</th>
                <th className="py-3.5 px-4">Kategori & Asal</th>
                <th className="py-3.5 px-4">Layanan PTSP</th>
                <th className="py-3.5 px-4">Tujuan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center print:hidden">Aksi Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada catatan buku tamu yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  return (
                    <tr key={guest.id} className="hover:bg-slate-50/80 transition">
                      {/* Ticket Code */}
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-sm">
                        {guest.ticketNumber}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <span className="block font-semibold text-slate-800">{guest.timestamp}</span>
                        <span className="text-[10px] text-slate-400">{guest.date}</span>
                      </td>

                      {/* Visitor Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">{guest.fullName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {guest.identifierNumber} &bull; WA: {guest.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Institution */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{guest.category}</span>
                        <span className="text-slate-500 text-[11px] line-clamp-1">
                          {guest.institutionOrAddress}
                        </span>
                      </td>

                      {/* Service Needed */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-800 block">{guest.serviceNeeded}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1 italic">
                          "{guest.purposeDetail}"
                        </span>
                      </td>

                      {/* Target Officer */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <span className="font-medium">{guest.targetOfficerOrDepartment}</span>
                        {guest.loketId && (
                          <span className="block text-[10px] text-emerald-700 font-bold">
                            Loket {guest.loketId}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            guest.status === 'Menunggu'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : guest.status === 'Sedang Dilayani'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {guest.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 print:hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          {guest.status === 'Menunggu' && (
                            <button
                              onClick={() => handleCallAndServe(guest, guest.loketId || 1)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                              title="Panggil ke Loket"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Panggil</span>
                            </button>
                          )}

                          {guest.status === 'Sedang Dilayani' && (
                            <button
                              onClick={() => handleMarkComplete(guest)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                              title="Selesaikan Layanan"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesai</span>
                            </button>
                          )}

                          {guest.phone && (
                            <a
                              href={getWhatsAppSendUrl(
                                guest.phone,
                                buildQueueCallWAMessage(guest, `Loket ${guest.loketId || 1}`)
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title={`Kirim Pesan WhatsApp Panggilan ke ${guest.fullName}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setSelectedGuestForDetail(guest);
                              setEditNoteText(guest.notes || '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Detail & Verifikasi TTD"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openDigitalCard(guest)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Lihat / Cetak Kartu Tamu"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Print-only footer for official records */}
        <div className="hidden print:flex justify-between items-end p-8 mt-6 text-xs">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala MAN Kota Blitar</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{MADRASAH_PROFILE.headmaster}</p>
            <p>NIP. 196807151994031002</p>
          </div>
          <div className="text-center">
            <p>Kota Blitar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Koordinator PTSP MAN Kota Blitar</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{MADRASAH_PROFILE.ptspCoordinator}</p>
            <p>NIP. 197204121998032001</p>
          </div>
        </div>
      </div>

      {/* Detail Visitor Modal */}
      {selectedGuestForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 font-mono">
                  VERIFIKASI BUKU TAMU
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedGuestForDetail.fullName} ({selectedGuestForDetail.ticketNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedGuestForDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Kategori:</span>
                <span className="font-bold text-slate-800">{selectedGuestForDetail.category}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Telepon / WhatsApp:</span>
                <span className="font-bold text-slate-800">{selectedGuestForDetail.phone}</span>
              </div>
              <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Alamat / Instansi:</span>
                <span className="font-bold text-slate-800">{selectedGuestForDetail.institutionOrAddress}</span>
              </div>
              <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Layanan & Keperluan:</span>
                <span className="font-bold text-emerald-800 block">{selectedGuestForDetail.serviceNeeded}</span>
                <p className="text-slate-600 mt-0.5">{selectedGuestForDetail.purposeDetail}</p>
              </div>
            </div>

            {/* Signature & Photo Inspection */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Tanda Tangan Digital
                </span>
                {selectedGuestForDetail.signatureDataUrl ? (
                  <img
                    src={selectedGuestForDetail.signatureDataUrl}
                    alt="Tanda Tangan"
                    className="h-20 object-contain mx-auto bg-white rounded border border-slate-200 p-1"
                  />
                ) : (
                  <div className="h-20 flex items-center justify-center text-slate-400 text-xs italic">
                    Tanpa tanda tangan
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Foto Pengunjung
                </span>
                {selectedGuestForDetail.photoDataUrl ? (
                  <img
                    src={selectedGuestForDetail.photoDataUrl}
                    alt="Foto Pengunjung"
                    className="h-20 object-contain mx-auto rounded border border-slate-200"
                  />
                ) : (
                  <div className="h-20 flex items-center justify-center text-slate-400 text-xs italic">
                    Foto tidak disertakan
                  </div>
                )}
              </div>
            </div>

            {/* Officer Notes Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Petugas PTSP
              </label>
              <textarea
                rows={2}
                value={editNoteText}
                onChange={(e) => setEditNoteText(e.target.value)}
                placeholder="Tambahkan catatan tindak lanjut berkas..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner & Fast Verification Modal */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <ScanLine className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Pindai & Verifikasi Tiket QR
                  </h3>
                  <p className="text-xs text-slate-500">Scan barcode atau masukkan kode tiket pengunjung</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsQrScannerOpen(false);
                  setScannedInput('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Scanner Input / Barcode Gun Reader */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Pindai Barcode / Ketik Nomor Tiket (A-012 / Scan Kamera / Scanner Gun)
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  autoFocus
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  placeholder="Contoh: A-012 atau tempel URL QR Code..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                {scannedInput && (
                  <button
                    onClick={() => setScannedInput('')}
                    className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </div>

            {/* Scanned Result Match */}
            {(() => {
              const query = scannedInput.trim().toUpperCase();
              const match = guests.find(
                (g) =>
                  query.length > 0 &&
                  (g.ticketNumber.toUpperCase() === query ||
                    query.includes(g.ticketNumber.toUpperCase()) ||
                    g.phone.includes(query) ||
                    g.fullName.toUpperCase().includes(query))
              );

              if (match) {
                return (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Tiket Terverifikasi Valid
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-800 text-white">
                        {match.ticketNumber}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-extrabold text-sm text-slate-900">{match.fullName}</p>
                      <p className="text-slate-600">{match.category} &bull; {match.institutionOrAddress}</p>
                      <p className="text-emerald-900 font-semibold">
                        Layanan: {match.serviceNeeded} (Loket {match.loketId || 1})
                      </p>
                      <p className="text-slate-500 text-[11px]">Perihal: "{match.purposeDetail}"</p>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          handleCallAndServe(match, match.loketId || 1);
                          setIsQrScannerOpen(false);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Panggil ke Loket</span>
                      </button>

                      <button
                        onClick={() => {
                          openDigitalCard(match);
                          setIsQrScannerOpen(false);
                        }}
                        className="py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                      >
                        Buka Kartu Tamu
                      </button>
                    </div>
                  </div>
                );
              }

              if (scannedInput.trim()) {
                return (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-center">
                    Tiket tidak ditemukan. Periksa kembali kode tiket atau nomor pengunjung.
                  </div>
                );
              }

              return (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">
                    Pilih Cepat untuk Simulasi Pindai QR:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {guests.slice(0, 4).map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setScannedInput(g.ticketNumber)}
                        className="p-2 text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 rounded-xl border border-slate-200 text-xs transition"
                      >
                        <span className="font-mono font-bold text-emerald-800 block">{g.ticketNumber}</span>
                        <span className="text-slate-700 font-medium truncate block">{g.fullName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* WhatsApp Notification History Modal */}
      {isWaLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Log Notifikasi WhatsApp PTSP
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rekap pengiriman pesan WhatsApp otomatis pemanggilan nomor antrean
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWaLogModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Notifikasi WhatsApp terkirim otomatis saat petugas menekan tombol <strong>"Panggil"</strong> di loket atau tabel tamu. Pengunjung menerima pesan berisi nomor antrean, loket tujuan, nama petugas, dan tautan tiket digital.
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
              {waLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada notifikasi WhatsApp yang dikirimkan pada sesi ini.
                </div>
              ) : (
                waLogs.map((log) => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          {log.ticketNumber}
                        </span>
                        <span className="font-bold text-slate-900">{log.guestName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({log.phone})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Panggilan ke <strong>{log.loketName}</strong> &bull; {log.timestamp} ({log.date})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                      <a
                        href={getWhatsAppSendUrl(log.phone, log.messagePreview)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                        title="Buka / Kirim Ulang Chat WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400 text-[11px]">
                Total: {waLogs.length} notifikasi tercatat di sistem
              </span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('ptsp_wa_logs');
                  setWaLogs([]);
                }}
                className="text-rose-600 hover:text-rose-700 text-xs font-semibold"
              >
                Bersihkan Riwayat Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
