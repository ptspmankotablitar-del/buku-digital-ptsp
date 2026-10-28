import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Phone, 
  MapPin, 
  FileCheck2, 
  PenTool, 
  Camera, 
  CheckCircle2, 
  RotateCcw, 
  Info, 
  Upload, 
  AlertCircle,
  Building,
  Sparkles,
  WifiOff,
  HardDrive
} from 'lucide-react';
import { GuestCategory, ServiceType, GuestEntry } from '../types/ptsp';
import { SERVICES_CATALOG } from '../data/mockData';
import { saveGuestOffline } from '../utils/offlineStorage';

interface GuestbookFormProps {
  onSuccessSubmit: (newGuest: GuestEntry) => void;
  openDigitalCard: (guest: GuestEntry) => void;
  initialService?: ServiceType | null;
  clearInitialService?: () => void;
}

const CATEGORIES: GuestCategory[] = [
  'Wali Murid / Orang Tua',
  'Alumni',
  'Kedinasan / Kemenag / Pemda',
  'Lembaga Pendidikan / Mitra',
  'Siswa',
  'Masyarakat Umum'
];

export const GuestbookForm: React.FC<GuestbookFormProps> = ({ 
  onSuccessSubmit, 
  openDigitalCard,
  initialService,
  clearInitialService
}) => {
  const [category, setCategory] = useState<GuestCategory>('Wali Murid / Orang Tua');
  const [fullName, setFullName] = useState('');
  const [identifierNumber, setIdentifierNumber] = useState('');
  const [institutionOrAddress, setInstitutionOrAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState<ServiceType>(initialService || 'Legalisir Ijazah / Rapor');
  const [purposeDetail, setPurposeDetail] = useState('');
  const [targetOfficer, setTargetOfficer] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);

  React.useEffect(() => {
    if (initialService) {
      setServiceNeeded(initialService);
      if (clearInitialService) {
        clearInitialService();
      }
    }
  }, [initialService, clearInitialService]);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Selected service metadata
  const selectedServiceObj = SERVICES_CATALOG.find((s) => s.title === serviceNeeded) || SERVICES_CATALOG[0];

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#065f46'; // dark emerald ink
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Camera capture handlers
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsCapturingCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError('Kamera tidak dapat diakses atau izin ditolak. Anda dapat mengunggah file foto sebagai alternatif.');
      setIsCapturingCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoDataUrl(dataUrl);
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturingCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi.';
    if (!institutionOrAddress.trim()) errors.institutionOrAddress = 'Asal instansi atau alamat wajib diisi.';
    if (!phone.trim()) errors.phone = 'Nomor WhatsApp / telepon wajib diisi.';
    if (!purposeDetail.trim()) errors.purposeDetail = 'Mohon jelaskan secara singkat detail keperluan Anda.';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    // Get signature data URL if drawn
    let signatureUrl = undefined;
    if (canvasRef.current && hasSignature) {
      signatureUrl = canvasRef.current.toDataURL('image/png');
    }

    // Determine Ticket Prefix based on Service Loket
    const prefix = selectedServiceObj.loket === 1 ? 'A' : selectedServiceObj.loket === 2 ? 'B' : 'C';
    const randomSeq = Math.floor(10 + Math.random() * 89);
    const ticketNumber = `${prefix}-0${randomSeq}`;

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const dateString = now.toISOString().slice(0, 10);

    const newGuest: GuestEntry = {
      id: `gst-${Date.now()}`,
      ticketNumber,
      timestamp: timeString,
      date: dateString,
      fullName: fullName.trim(),
      identifierNumber: identifierNumber.trim() || '-',
      category,
      institutionOrAddress: institutionOrAddress.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      serviceNeeded,
      purposeDetail: purposeDetail.trim(),
      targetOfficerOrDepartment: targetOfficer.trim() || selectedServiceObj.officerInCharge,
      status: 'Menunggu',
      loketId: selectedServiceObj.loket,
      signatureDataUrl: signatureUrl,
      photoDataUrl: photoDataUrl,
      notes: 'Pendaftaran mandiri via Buku Tamu Online'
    };

    // If offline, save to IndexedDB sync queue
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      newGuest.notes = 'Dicatat Offline (Tersimpan di IndexedDB)';
      saveGuestOffline(newGuest).catch((err) => console.warn('Failed saving offline:', err));
    }

    onSuccessSubmit(newGuest);

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Reset form
    setFullName('');
    setIdentifierNumber('');
    setInstitutionOrAddress('');
    setPhone('');
    setEmail('');
    setPurposeDetail('');
    setTargetOfficer('');
    setPhotoDataUrl(undefined);
    clearSignature();
    setFormErrors({});

    // Automatically show digital visitor card / receipt modal
    openDigitalCard(newGuest);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Banner Maklumat / Sambutan */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Registrasi Tamu & Layanan Terpadu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Selamat Datang di PTSP MAN Kota Blitar
          </h2>
          <p className="text-sm text-emerald-100 leading-relaxed mb-4">
            Silakan isi buku digital kunjungan ini untuk memperoleh nomor antrean resmi, perlindungan hak layanan, serta penerbitan Kartu Bukti Tamu Digital. Seluruh pelayanan <span className="font-bold underline decoration-amber-400">100% Bebas Biaya (Gratis)</span>.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5 bg-emerald-900/50 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Langsung Masuk Antrean
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-900/50 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Cetak e-Tiket & QR Code
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-900/50 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              Notifikasi Update Berkas
            </span>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Formulir Buku Tamu & Tiket Pelayanan</h3>
              <p className="text-xs text-slate-500">Lengkapi data diri dan keperluan berkunjung Anda</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-500">* Wajib diisi</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
          {/* 1. Kategori Pengunjung */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Kategori Pengunjung <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                    category === cat
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cat}</span>
                    {category === cat && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Identitas Pengunjung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Ihsan / Drs. Joko..."
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                    formErrors.fullName ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
              </div>
              {formErrors.fullName && <p className="text-xs text-rose-500 mt-1">{formErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NIK / NIP / NISN <span className="text-slate-400 font-normal">(Nomor Identitas)</span>
              </label>
              <input
                type="text"
                value={identifierNumber}
                onChange={(e) => setIdentifierNumber(e.target.value)}
                placeholder="16 digit NIK / NIP Dinas / NISN Siswa"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Asal Instansi / Alamat Domisili <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={institutionOrAddress}
                  onChange={(e) => setInstitutionOrAddress(e.target.value)}
                  placeholder="Contoh: Jl. Diponegoro No. 12, Sananwetan / Kantor Kemenag / Komite Madrasah"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                    formErrors.institutionOrAddress ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
              </div>
              {formErrors.institutionOrAddress && <p className="text-xs text-rose-500 mt-1">{formErrors.institutionOrAddress}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                No. WhatsApp / HP Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx (untuk konfirmasi berkas)"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                    formErrors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
              </div>
              {formErrors.phone && <p className="text-xs text-rose-500 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* 3. Pilihan Layanan PTSP */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
                Layanan PTSP Yang Diperlukan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FileCheck2 className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={serviceNeeded}
                  onChange={(e) => setServiceNeeded(e.target.value as ServiceType)}
                  className="w-full pl-10 pr-8 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                >
                  {SERVICES_CATALOG.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Live Preview of requirements & time */}
            <div className="bg-white/90 rounded-xl p-3.5 border border-emerald-200/60 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 border-b border-emerald-100 pb-2">
                <div>
                  <span className="font-semibold text-slate-700">Estimasi Pengerjaan: </span>
                  <span className="text-emerald-700 font-bold">{selectedServiceObj.estimatedTime}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Biaya: </span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                    {selectedServiceObj.cost}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Tujuan: </span>
                  <span className="text-slate-800 font-medium">Loket {selectedServiceObj.loket}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Persyaratan Dokumen:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {selectedServiceObj.requirements.map((req, idx) => (
                    <li key={idx} className="leading-tight">{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Rincian Keperluan & Pejabat Dituju */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detail Keperluan Kunjungan / Uraian Berkas <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={purposeDetail}
                onChange={(e) => setPurposeDetail(e.target.value)}
                placeholder="Jelaskan secara spesifik maksud kedatangan atau dokumen yang hendak diajukan..."
                className={`w-full p-3 bg-slate-50/50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition ${
                  formErrors.purposeDetail ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                }`}
              />
              {formErrors.purposeDetail && <p className="text-xs text-rose-500 mt-1">{formErrors.purposeDetail}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pejabat / Bagian yang Dituju <span className="text-slate-400 font-normal">(Opsional jika spesifik)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={targetOfficer}
                  onChange={(e) => setTargetOfficer(e.target.value)}
                  placeholder={`Default: ${selectedServiceObj.officerInCharge}`}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>
          </div>

          {/* 5. Tanda Tangan Digital & Foto Wajah / Selfie Pengunjung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Signature Pad */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tanda Tangan Digital</span>
                  <span className="text-slate-400 font-normal text-[11px]">(Gunakan jari/mouse)</span>
                </label>
                {hasSignature && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Hapus
                  </button>
                )}
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/80 p-1 relative flex flex-col items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-32 bg-white rounded-lg cursor-crosshair touch-none"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                    Goreskan tanda tangan Anda di sini
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tanda tangan akan dicantumkan pada Lembar Registrasi Resmi PTSP MAN Kota Blitar.
              </p>
            </div>

            {/* Photo / Selfie */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Foto Pengunjung</span>
                  <span className="text-slate-400 font-normal text-[11px]">(Verifikasi identitas)</span>
                </label>
                {photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(undefined)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Hapus Foto
                  </button>
                )}
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/80 p-2 min-h-32 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {photoDataUrl ? (
                  <div className="relative group w-full h-32 flex items-center justify-center">
                    <img
                      src={photoDataUrl}
                      alt="Foto Pengunjung"
                      className="max-h-32 object-contain rounded-lg border border-slate-200"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                ) : isCapturingCamera ? (
                  <div className="flex flex-col items-center gap-2">
                    <video ref={videoRef} autoPlay playsInline className="w-48 h-32 rounded-lg bg-black object-cover" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow"
                      >
                        Ambil Jepretan
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Buka Kamera
                      </button>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Upload Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Opsional. Diperlukan untuk penerbitan ID Card / Kartu Tamu Digital.
                    </p>
                  </div>
                )}

                {cameraError && (
                  <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy & Anti-Pungli Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              Dengan menekan tombol registrasi, Anda menyatakan bahwa data yang diisikan adalah benar. Seluruh informasi dijaga kerahasiaannya oleh Kementerian Agama RI dan dimanfaatkan semata-mata untuk peningkatan mutu pelayanan publik bebas pungutan liar.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-extrabold text-base tracking-wide shadow-lg shadow-emerald-800/30 flex items-center justify-center gap-2 transform active:scale-[0.99] transition"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              <span>KIRIM BUKU TAMU & DAPATKAN NOMOR ANTREAN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
