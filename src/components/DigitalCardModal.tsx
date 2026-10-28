import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Download, 
  Share2, 
  QrCode, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  ScanLine
} from 'lucide-react';
import { GuestEntry } from '../types/ptsp';
import { MADRASAH_PROFILE } from '../data/mockData';

interface DigitalCardModalProps {
  guest: GuestEntry | null;
  onClose: () => void;
  onGoToQueue: () => void;
  onGoToSurvey: () => void;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({
  guest,
  onClose,
  onGoToQueue,
  onGoToSurvey
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [showScanVerificationInfo, setShowScanVerificationInfo] = useState(false);

  useEffect(() => {
    if (!guest) return;

    // Build the official verification payload URL with ticket parameter
    const baseUrl = window.location.origin + window.location.pathname;
    const verificationUrl = `${baseUrl}?ticket=${encodeURIComponent(guest.ticketNumber)}`;

    QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 1.5,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#064e3b', // Deep official Emerald green
        light: '#ffffff'
      }
    })
      .then((url) => {
        setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });
  }, [guest]);

  if (!guest) return null;

  const verificationUrl = `${window.location.origin}${window.location.pathname}?ticket=${encodeURIComponent(guest.ticketNumber)}`;

  // Download QR Code PNG image
  const handleDownloadQrOnly = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `QR_Tiket_PTSP_${guest.ticketNumber}_${guest.fullName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tiket PTSP MAN Kota Blitar - ${guest.ticketNumber}`,
          text: `Tiket Layanan PTSP MAN Kota Blitar: ${guest.fullName} | No: ${guest.ticketNumber} | Layanan: ${guest.serviceNeeded}`,
          url: verificationUrl
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:shadow-none print:border-none print:my-0">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-950/40 text-emerald-200 hover:text-white hover:bg-emerald-950/60 transition print:hidden"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wider text-emerald-200 uppercase font-mono">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight leading-snug">
            {MADRASAH_PROFILE.name}
          </h3>
          <p className="text-xs text-emerald-100 font-medium mt-0.5">
            KARTU TAMU & BUKTI TIKET PELAYANAN (PTSP ONLINE)
          </p>
        </div>

        {/* Big Ticket Banner */}
        <div className="p-6 text-center border-b border-dashed border-slate-200 bg-slate-50/60 relative">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            NOMOR ANTREAN PELAYANAN
          </span>
          <div className="text-5xl font-black text-emerald-900 tracking-tight my-2 font-mono drop-shadow-sm">
            {guest.ticketNumber}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Loket {guest.loketId || 1}: {guest.serviceNeeded}</span>
          </div>

          {/* Ticket punch notch aesthetics */}
          <div className="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-slate-900/65 print:hidden"></div>
          <div className="absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-slate-900/65 print:hidden"></div>
        </div>

        {/* QR Code & Visitor Verification Section */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
            {/* Real Scannable QR Code Canvas / Image */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 bg-white p-2 rounded-2xl border-2 border-emerald-600/30 shadow-md flex items-center justify-center relative overflow-hidden">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code ${guest.ticketNumber}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                    <QrCode className="w-8 h-8 animate-spin text-emerald-600 mb-1" />
                    <span>Membuat QR...</span>
                  </div>
                )}

                {/* Scan Frame Overlay corners */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-700 pointer-events-none"></div>
                <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-700 pointer-events-none"></div>
                <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-700 pointer-events-none"></div>
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-700 pointer-events-none"></div>
              </div>

              {/* Quick download button right under QR on mobile */}
              <button
                type="button"
                onClick={handleDownloadQrOnly}
                className="mt-2 w-full py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition print:hidden"
                title="Unduh QR Code sebagai gambar PNG"
              >
                <Download className="w-3 h-3 text-emerald-600" />
                <span>Unduh QR</span>
              </button>
            </div>

            {/* Visitor Details on side */}
            <div className="space-y-1.5 text-xs w-full text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-800">
                <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-bold text-sm text-slate-900 leading-tight">{guest.fullName}</span>
              </div>
              <p className="text-slate-600 font-medium">
                {guest.category} &bull; <span className="text-slate-500">{guest.institutionOrAddress}</span>
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-400 text-[11px]">
                <Calendar className="w-3 h-3" />
                <span>{guest.date}</span>
                <span className="mx-1">&bull;</span>
                <Clock className="w-3 h-3" />
                <span>{guest.timestamp}</span>
              </div>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                  Status: {guest.status}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ID: {guest.identifierNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Purpose & Target */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
            <div className="text-slate-600">
              <span className="font-bold text-slate-700">Perihal: </span>
              <span>{guest.purposeDetail}</span>
            </div>
            {guest.targetOfficerOrDepartment && (
              <div className="text-slate-600">
                <span className="font-bold text-slate-700">Ditujukan ke: </span>
                <span>{guest.targetOfficerOrDepartment}</span>
              </div>
            )}
          </div>

          {/* Optional Verified Photo */}
          {guest.photoDataUrl && (
            <div className="flex items-center gap-3 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
              <img
                src={guest.photoDataUrl}
                alt="Foto Pengunjung"
                className="w-12 h-12 rounded-lg object-cover border border-emerald-300 shadow-sm shrink-0"
              />
              <div className="text-[11px] text-emerald-950">
                <span className="font-bold block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Foto Pengunjung Terverifikasi
                </span>
                <span className="text-slate-500">Terekam di sistem buku tamu PTSP MAN Kota Blitar</span>
              </div>
            </div>
          )}

          {/* Quick Scanner Info Toggle */}
          <div className="print:hidden">
            <button
              type="button"
              onClick={() => setShowScanVerificationInfo(!showScanVerificationInfo)}
              className="w-full text-center text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center justify-center gap-1 py-1"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>{showScanVerificationInfo ? 'Sembunyikan Panduan Pindai' : 'Petunjuk Pindai QR oleh Petugas Loket'}</span>
            </button>

            {showScanVerificationInfo && (
              <div className="mt-2 p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Cara Kerja Verifikasi Cepat (QR Verification):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>Petugas loket atau satpam cukup mengarahkan kamera HP atau *barcode scanner* ke QR code di atas.</li>
                  <li>Sistem akan langsung membuka detail status tiket dan berkas permohonan pengunjung.</li>
                  <li>Pengunjung dapat mengunduh QR Code (tombol "Unduh QR") untuk disimpan di galeri foto HP.</li>
                </ol>
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verificationUrl}
                    className="w-full bg-white px-2 py-1 rounded text-[10px] font-mono border border-emerald-300 text-slate-600"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-2 py-1 rounded bg-emerald-700 text-white text-[10px] font-bold shrink-0 hover:bg-emerald-800"
                  >
                    {isCopied ? 'Tersalin!' : 'Salin URL'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[10px] text-slate-400 leading-tight">
            Tunjukkan kode QR ini ke petugas loket untuk proses verifikasi kilat tanpa antre manual.
          </p>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2.5 print:hidden">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownloadQrOnly}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
              title="Unduh QR Code PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh QR</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-sm"
              title="Cetak Tiket"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Tiket</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-sm"
              title="Bagikan / Salin Info Tiket"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isCopied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onGoToQueue();
              }}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Lihat Monitor Antrean
            </button>
            <button
              onClick={() => {
                onClose();
                onGoToSurvey();
              }}
              className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
            >
              Beri Ulasan IKM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
