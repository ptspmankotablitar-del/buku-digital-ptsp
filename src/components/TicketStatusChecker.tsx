import React, { useState } from 'react';
import { 
  Search, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  User, 
  MapPin, 
  Phone, 
  Calendar,
  Sparkles,
  Printer
} from 'lucide-react';
import { GuestEntry } from '../types/ptsp';

interface TicketStatusCheckerProps {
  guests: GuestEntry[];
  openDigitalCard: (guest: GuestEntry) => void;
  openSurveyWithGuest: (guest: GuestEntry) => void;
}

export const TicketStatusChecker: React.FC<TicketStatusCheckerProps> = ({
  guests,
  openDigitalCard,
  openSurveyWithGuest
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<GuestEntry | null>(guests[0] || null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = guests.find(
      (g) =>
        g.ticketNumber.toLowerCase().includes(query) ||
        g.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
        g.fullName.toLowerCase().includes(query)
    );

    setSelectedResult(match || null);
  };

  const handleQuickPick = (guest: GuestEntry) => {
    setSearchQuery(guest.ticketNumber);
    setSelectedResult(guest);
    setHasSearched(true);
  };

  const getWorkflowSteps = (status: string) => {
    const steps = [
      { id: 1, title: 'Registrasi Diajukan', desc: 'Buku tamu online terdaftar' },
      { id: 2, title: 'Menunggu di Loket', desc: 'Antrean diverifikasi oleh resepsionis' },
      { id: 3, title: 'Proses Pelayanan', desc: 'Petugas sedang memproses berkas' },
      { id: 4, title: 'Layanan Selesai', desc: 'Dokumen diserahkan & selesai' }
    ];

    let currentStepIndex = 1;
    if (status === 'Menunggu') currentStepIndex = 2;
    if (status === 'Sedang Dilayani') currentStepIndex = 3;
    if (status === 'Selesai') currentStepIndex = 4;

    return { steps, currentStepIndex };
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tracking Layanan Mandiri</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cek Status Pengajuan & Berkas
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Masukkan Nomor Tiket Antrean (misal: <span className="font-mono font-bold text-emerald-700">A-012</span>) atau Nomor WhatsApp yang terdaftar untuk melihat progres pelayanan secara langsung.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nomor Tiket (A-012), No. WA (0812...), atau Nama..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
          <button
            type="submit"
            className="py-3.5 px-7 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
          >
            <Search className="w-4 h-4" />
            <span>Cari Tiket</span>
          </button>
        </form>

        {/* Quick Click Samples */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Contoh Cepat:</span>
          {guests.slice(0, 4).map((g) => (
            <button
              key={g.id}
              onClick={() => handleQuickPick(g)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold transition"
            >
              {g.ticketNumber} ({g.fullName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Display */}
      {selectedResult ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Top */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-200 font-mono">
                  PTSP MAN KOTA BLITAR
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                  {selectedResult.status}
                </span>
              </div>
              <h3 className="text-xl font-black">{selectedResult.fullName}</h3>
              <p className="text-xs text-emerald-100">
                {selectedResult.category} &bull; {selectedResult.institutionOrAddress}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-[11px] font-extrabold text-emerald-200 block uppercase">
                NOMOR TIKET
              </span>
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {selectedResult.ticketNumber}
              </span>
            </div>
          </div>

          {/* Workflow Progress Steps */}
          {(() => {
            const { steps, currentStepIndex } = getWorkflowSteps(selectedResult.status);
            return (
              <div className="p-6 bg-slate-50/60 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4">
                  Tahapan Alur Pelayanan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {steps.map((st) => {
                    const isDone = st.id <= currentStepIndex;
                    const isCurrent = st.id === currentStepIndex;
                    return (
                      <div
                        key={st.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                            : isDone
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-50 border-slate-200/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              isDone ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isDone ? '✓' : st.id}
                          </div>
                          <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {st.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Detailed Info Grid */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Layanan yang Dituju:</span>
                <span className="font-bold text-slate-800 text-sm">{selectedResult.serviceNeeded}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Loket Pelayanan:</span>
                <span className="font-bold text-emerald-800 text-sm">Loket {selectedResult.loketId || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Tanggal & Waktu Masuk:</span>
                <span className="font-medium text-slate-800">{selectedResult.date} &bull; {selectedResult.timestamp}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-0.5">Kontak Terdaftar:</span>
                <span className="font-medium text-slate-800">{selectedResult.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs">
              <span className="font-bold text-emerald-900 block mb-1">Keterangan / Catatan Petugas PTSP:</span>
              <p className="text-emerald-800">{selectedResult.notes || 'Permohonan sedang dalam antrean pelayanan standar.'}</p>
            </div>

            {/* Actions for this ticket */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => openDigitalCard(selectedResult)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Lihat Kartu Tamu / QR Code</span>
              </button>

              <button
                onClick={() => openSurveyWithGuest(selectedResult)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition"
              >
                <span>Beri Penilaian Layanan (IKM)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h4 className="font-bold text-slate-800">Tiket Tidak Ditemukan</h4>
          <p className="text-xs max-w-sm mx-auto">
            Tidak ditemukan data kunjungan dengan kata kunci "{searchQuery}". Pastikan nomor tiket atau nomor WhatsApp yang Anda masukkan sesuai.
          </p>
        </div>
      ) : null}
    </div>
  );
};
