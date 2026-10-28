export type GuestCategory = 
  | 'Wali Murid / Orang Tua'
  | 'Alumni'
  | 'Kedinasan / Kemenag / Pemda'
  | 'Lembaga Pendidikan / Mitra'
  | 'Masyarakat Umum'
  | 'Siswa';

export type ServiceType = 
  | 'Legalisir Ijazah / Rapor'
  | 'Surat Keterangan Siswa Aktif'
  | 'Surat Mutasi / Pindah Madrasah'
  | 'Pengambilan Ijazah / Dokumen'
  | 'Pengantaran Surat Dinas / Ekspedisi'
  | 'Konsultasi / Audiensi Kamad'
  | 'Konsultasi BK (Bimbingan Konseling)'
  | 'Informasi PPDB / Madrasah'
  | 'Pengajuan Rekomendasi / Beasiswa (PIP)'
  | 'Layanan Pengaduan Masyarakat'
  | 'Kunjungan Umum Lainnya';

export type TicketStatus = 'Menunggu' | 'Sedang Dilayani' | 'Selesai' | 'Dibatalkan';

export interface GuestEntry {
  id: string;
  ticketNumber: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  fullName: string;
  identifierNumber: string; // NIK or NIP or NISN
  category: GuestCategory;
  institutionOrAddress: string;
  phone: string;
  email?: string;
  serviceNeeded: ServiceType;
  purposeDetail: string;
  targetOfficerOrDepartment: string;
  status: TicketStatus;
  loketId?: number;
  signatureDataUrl?: string;
  photoDataUrl?: string;
  notes?: string;
  servedAt?: string;
  completedAt?: string;
  rating?: number; // 1 - 5
}

export interface ServiceDetail {
  id: string;
  title: ServiceType;
  category: 'Kesiswaan' | 'Kurikulum & Administrasi' | 'Umum & Humas' | 'Kepala Madrasah & BK';
  estimatedTime: string;
  cost: string; // Rp 0 (Gratis)
  requirements: string[];
  outputDocument: string;
  officerInCharge: string;
  loket: number;
}

export interface SurveyResponse {
  id: string;
  guestId?: string;
  guestName: string;
  date: string;
  serviceType: ServiceType;
  procedureScore: number; // 1-4 or 1-5
  speedScore: number;
  politenessScore: number;
  facilityScore: number;
  integrityScore: number; // Bebas pungli
  overallRating: number; // 1-5
  comments: string;
}

export interface LoketInfo {
  id: number;
  name: string;
  officerName: string;
  department: string;
  status: 'Buka' | 'Istirahat' | 'Tutup';
  currentTicket?: string;
}

export interface SignageNotice {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'urgent' | 'announcement';
  author: string;
  timestamp: string;
  date: string;
  active: boolean;
}

