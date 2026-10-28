import { GuestEntry, ServiceDetail, SurveyResponse, LoketInfo, SignageNotice } from '../types/ptsp';

export const MADRASAH_PROFILE = {
  name: 'MAN KOTA BLITAR',
  fullName: 'Madrasah Aliyah Negeri Kota Blitar',
  agency: 'Kementerian Agama Republik Indonesia',
  ptspMotto: 'Cepat, Tepat, Akuntabel, Ramah, dan Tanpa Biaya (Zona Integritas WBK/WBBM)',
  address: 'Jl. Jati No. 71, Sukorejo, Kec. Sukorejo, Kota Blitar, Jawa Timur 66121',
  phone: '(0342) 801120',
  whatsapp: '0812-3456-7890',
  email: 'ptspmankotablitar@gmail.com',
  website: 'mankotablitar.sch.id',
  openingHours: 'Senin - Kamis: 07.30 - 15.30 WIB | Jumat: 07.30 - 15.00 WIB',
  headmaster: 'H. Ansori, M.Pd.I',
  ptspCoordinator: 'Dra. Hj. Siti Nurhasanah, M.Pd'
};

export const SERVICES_CATALOG: ServiceDetail[] = [
  {
    id: 'srv-1',
    title: 'Legalisir Ijazah / Rapor',
    category: 'Kurikulum & Administrasi',
    estimatedTime: '15 - 30 Menit',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Membawa dokumen asli Ijazah/Rapor',
      'Fotokopi dokumen yang akan dilegalisir (maksimal 10 lembar)',
      'Menunjukkan identitas alumni/pemohon'
    ],
    outputDocument: 'Dokumen Legalisir bertanda tangan resmi & cap stempel basah',
    officerInCharge: 'Staf Tata Usaha Bidang Kurikulum',
    loket: 2
  },
  {
    id: 'srv-2',
    title: 'Surat Keterangan Siswa Aktif',
    category: 'Kesiswaan',
    estimatedTime: '20 Menit',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Mengisi formulir permohonan',
      'Menyertakan NISN dan kelas aktif saat ini',
      'Fotokopi Kartu Pelajar atau Kartu Keluarga pemohon',
      'Keterangan tujuan (Tunjangan Gaji Orang Tua / Beasiswa / Lomba)'
    ],
    outputDocument: 'Surat Keterangan Resmi Kepala Madrasah',
    officerInCharge: 'Staf Kesiswaan & TU',
    loket: 1
  },
  {
    id: 'srv-3',
    title: 'Surat Mutasi / Pindah Madrasah',
    category: 'Kesiswaan',
    estimatedTime: '1 - 2 Hari Kerja',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Surat permohonan pindah bermaterai dari orang tua/wali',
      'Surat rekomendasi kesiapan menerima dari madrasah/sekolah tujuan',
      'Buku Laporan Hasil Belajar (Rapor) asli & fotokopi',
      'Bebas pinjaman perpustakaan & administrasi madrasah'
    ],
    outputDocument: 'Surat Keterangan Pindah Madrasah & Validasi EMIS Kemenag',
    officerInCharge: 'Waka Kesiswaan & Operator EMIS',
    loket: 1
  },
  {
    id: 'srv-4',
    title: 'Pengambilan Ijazah / Dokumen',
    category: 'Kurikulum & Administrasi',
    estimatedTime: '15 - 20 Menit',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Menunjukkan Kartu Tanda Peserta Ujian / Identitas Asli',
      'Surat Keterangan Bebas Tanggungan Perpustakaan & Komite',
      'Jika diwakilkan: membawa Surat Kuasa bermaterai Rp 10.000 dan fotokopi KTP kedua pihak'
    ],
    outputDocument: 'Ijazah / Dokumen Asli bertanda terima',
    officerInCharge: 'Petugas Arsip Tata Usaha',
    loket: 2
  },
  {
    id: 'srv-5',
    title: 'Pengantaran Surat Dinas / Ekspedisi',
    category: 'Umum & Humas',
    estimatedTime: '10 Menit',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Surat pengantar kedinasan / nomor surat resmi',
      'Buku ekspedisi atau lembar tanda terima kurir/instansi'
    ],
    outputDocument: 'Lembar Disposisi / Tanda Terima Surat Masuk Berstempel',
    officerInCharge: 'Resepsionis PTSP & Arsiparis',
    loket: 3
  },
  {
    id: 'srv-6',
    title: 'Konsultasi / Audiensi Kamad',
    category: 'Kepala Madrasah & BK',
    estimatedTime: 'Sesuai Jadwal (30-45 Menit)',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Konfirmasi jadwal audiensi melalui PTSP',
      'Menjelaskan maksud dan instansi pengundang/pemohon',
      'Membawa proposal atau materi diskusi bila diperlukan'
    ],
    outputDocument: 'Notulensi / Kesepakatan Tindak Lanjut',
    officerInCharge: 'Sekretaris Kepala Madrasah',
    loket: 3
  },
  {
    id: 'srv-7',
    title: 'Konsultasi BK (Bimbingan Konseling)',
    category: 'Kepala Madrasah & BK',
    estimatedTime: '30 - 60 Menit',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Wali murid atau siswa dengan janji temu atau rujukan madrasah',
      'Identitas siswa yang bersangkutan'
    ],
    outputDocument: 'Lembar Catatan Konseling & Rekomendasi Solutif',
    officerInCharge: 'Guru BK Madrasah',
    loket: 1
  },
  {
    id: 'srv-8',
    title: 'Informasi PPDB / Madrasah',
    category: 'Umum & Humas',
    estimatedTime: '15 Menit',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Calon peserta didik baru atau orang tua',
      'Kartu Keluarga dan Nomor Kontak Aktif'
    ],
    outputDocument: 'Brosur, Akses Jalur PPDB Online, dan Konsultasi Pemilihan Program',
    officerInCharge: 'Panitia PPDB & Tim Humas',
    loket: 3
  },
  {
    id: 'srv-9',
    title: 'Pengajuan Rekomendasi / Beasiswa (PIP)',
    category: 'Kesiswaan',
    estimatedTime: '1 Hari Kerja',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Fotokopi KIP / PKH / KKS atau Surat Keterangan Tidak Mampu (SKTM)',
      'Fotokopi Kartu Keluarga dan KTP Orang Tua',
      'Surat permohonan dari wali murid'
    ],
    outputDocument: 'Surat Rekomendasi Madrasah untuk Pencairan PIP / Lembaga Mitra',
    officerInCharge: 'Pengelola Beasiswa Kesiswaan',
    loket: 1
  },
  {
    id: 'srv-10',
    title: 'Layanan Pengaduan Masyarakat',
    category: 'Umum & Humas',
    estimatedTime: '15 Menit (Registrasi)',
    cost: 'Rp 0,- (GRATIS)',
    requirements: [
      'Identitas pelapor (dijamin kerahasiaannya)',
      'Uraian kronologi kejadian atau saran masukan konstruktif',
      'Bukti pendukung bila ada'
    ],
    outputDocument: 'Nomor Tiket Pengaduan (SP4N Lapor / Internal WBS)',
    officerInCharge: 'Tim Pengendali Gratifikasi & Pengaduan',
    loket: 3
  }
];

export const INITIAL_LOKETS: LoketInfo[] = [
  {
    id: 1,
    name: 'Loket 1 - Pelayanan Kesiswaan & BK',
    officerName: 'Nurul Hidayati, S.Pd',
    department: 'Kesiswaan, PIP, & Bimbingan Konseling',
    status: 'Buka',
    currentTicket: 'A-012'
  },
  {
    id: 2,
    name: 'Loket 2 - Administrasi & Legalisir',
    officerName: 'Ahmad Fauzi, S.Kom',
    department: 'Tata Usaha, Legalisir, & Ijazah',
    status: 'Buka',
    currentTicket: 'B-008'
  },
  {
    id: 3,
    name: 'Loket 3 - Humas, Kedinasan & Kamad',
    officerName: 'Mohammad Rofiul, S.Sos',
    department: 'Resepsionis, Surat Masuk, & PPDB',
    status: 'Buka',
    currentTicket: 'C-005'
  }
];

export const INITIAL_GUESTS: GuestEntry[] = [
  {
    id: 'gst-101',
    ticketNumber: 'A-012',
    timestamp: '08:15 WIB',
    date: '2026-10-28',
    fullName: 'Bambang Supriyanto',
    identifierNumber: '3572011504780002',
    category: 'Wali Murid / Orang Tua',
    institutionOrAddress: 'Jl. Melati No. 14, Kepanjenkidul, Kota Blitar',
    phone: '081233445566',
    email: 'bambang.sp@gmail.com',
    serviceNeeded: 'Surat Keterangan Siswa Aktif',
    purposeDetail: 'Pengurusan tunjangan pensiun anak di BKN dan beasiswa kuliah',
    targetOfficerOrDepartment: 'Bagian Kesiswaan (Bu Nurul)',
    status: 'Sedang Dilayani',
    loketId: 1,
    notes: 'Berkas KK & NISN sudah lengkap diverifikasi'
  },
  {
    id: 'gst-102',
    ticketNumber: 'B-008',
    timestamp: '08:30 WIB',
    date: '2026-10-28',
    fullName: 'Anisa Rahmawati, S.Pd',
    identifierNumber: '2019-MAN-0492',
    category: 'Alumni',
    institutionOrAddress: 'Alumni Angkatan 2021 / Universitas Negeri Malang',
    phone: '085799881122',
    email: 'anisa.rahma21@gmail.com',
    serviceNeeded: 'Legalisir Ijazah / Rapor',
    purposeDetail: 'Legalisir 5 lembar ijazah untuk pendaftaran seleksi PPG Prajabatan',
    targetOfficerOrDepartment: 'Tata Usaha (Pak Fauzi)',
    status: 'Sedang Dilayani',
    loketId: 2,
    notes: 'Ijazah asli telah dicocokkan, proses stempel dan ttd Kamad'
  },
  {
    id: 'gst-103',
    ticketNumber: 'C-005',
    timestamp: '08:45 WIB',
    date: '2026-10-28',
    fullName: 'Drs. H. Mulyadi, M.Pd',
    identifierNumber: '197405121998031004',
    category: 'Kedinasan / Kemenag / Pemda',
    institutionOrAddress: 'Kantor Kementerian Agama Kota Blitar',
    phone: '081322119900',
    serviceNeeded: 'Pengantaran Surat Dinas / Ekspedisi',
    purposeDetail: 'Penyampaian Surat Edaran Pelaksanaan Asesmen Madrasah 2026',
    targetOfficerOrDepartment: 'Kepala Madrasah & Waka Kurikulum',
    status: 'Sedang Dilayani',
    loketId: 3,
    notes: 'Disposisi langsung ke meja Kepala Madrasah'
  },
  {
    id: 'gst-104',
    ticketNumber: 'A-013',
    timestamp: '09:05 WIB',
    date: '2026-10-28',
    fullName: 'Dewi Kartikasari',
    identifierNumber: '3572036509820005',
    category: 'Wali Murid / Orang Tua',
    institutionOrAddress: 'Perumahan Pakunden Asri Blok C-12, Kota Blitar',
    phone: '082145678910',
    serviceNeeded: 'Konsultasi BK (Bimbingan Konseling)',
    purposeDetail: 'Konsultasi kelanjutan studi peminatan SNBP / PTN anak',
    targetOfficerOrDepartment: 'Koordinator Guru BK Madrasah',
    status: 'Menunggu',
    notes: 'Menunggu antrean panggilan'
  },
  {
    id: 'gst-105',
    ticketNumber: 'B-009',
    timestamp: '09:15 WIB',
    date: '2026-10-28',
    fullName: 'Rizky Pratama',
    identifierNumber: '3572021105020003',
    category: 'Alumni',
    institutionOrAddress: 'Sanan, Sukorejo, Kota Blitar',
    phone: '087811223344',
    serviceNeeded: 'Pengambilan Ijazah / Dokumen',
    purposeDetail: 'Pengambilan SKL dan Sertifikat Tahfidz Juz 30',
    targetOfficerOrDepartment: 'Arsiparis Tata Usaha',
    status: 'Menunggu',
    notes: 'Bukti bebas pustaka sudah dibawa'
  },
  {
    id: 'gst-106',
    ticketNumber: 'A-011',
    timestamp: '07:45 WIB',
    date: '2026-10-28',
    fullName: 'Suryono Hadi',
    identifierNumber: '3572010807750001',
    category: 'Wali Murid / Orang Tua',
    institutionOrAddress: 'Tanjungsari, Sukorejo, Kota Blitar',
    phone: '081299887766',
    serviceNeeded: 'Pengajuan Rekomendasi / Beasiswa (PIP)',
    purposeDetail: 'Penyerahan fotokopi KIP untuk aktivasi rekening SimPel BNI',
    targetOfficerOrDepartment: 'Bagian Kesiswaan',
    status: 'Selesai',
    loketId: 1,
    notes: 'Dokumen lengkap, rekomendasi telah diserahkan',
    rating: 5
  }
];

export const INITIAL_SURVEYS: SurveyResponse[] = [
  {
    id: 'sv-1',
    guestId: 'gst-106',
    guestName: 'Suryono Hadi',
    date: '2026-10-28',
    serviceType: 'Pengajuan Rekomendasi / Beasiswa (PIP)',
    procedureScore: 5,
    speedScore: 5,
    politenessScore: 5,
    facilityScore: 5,
    integrityScore: 5,
    overallRating: 5,
    comments: 'Pelayanan sangat ramah, cepat, dan tidak dipungut biaya sepeser pun. Ruang tunggu PTSP sejuk dan nyaman!'
  },
  {
    id: 'sv-2',
    guestName: 'Kurnia Mega Utami',
    date: '2026-10-27',
    serviceType: 'Legalisir Ijazah / Rapor',
    procedureScore: 5,
    speedScore: 4,
    politenessScore: 5,
    facilityScore: 5,
    integrityScore: 5,
    overallRating: 5,
    comments: 'Petugas PTSP sangat cekatan melayani legalisir 10 lembar dalam waktu kurang dari 20 menit.'
  },
  {
    id: 'sv-3',
    guestName: 'H. Sudarmanto',
    date: '2026-10-27',
    serviceType: 'Surat Keterangan Siswa Aktif',
    procedureScore: 5,
    speedScore: 5,
    politenessScore: 5,
    facilityScore: 5,
    integrityScore: 5,
    overallRating: 5,
    comments: 'Sistem buku tamu online ini sangat mempermudah. Tidak perlu antre berdesakan lagi.'
  }
];

export const PTSP_FAQS = [
  {
    q: 'Apakah semua pelayanan di PTSP MAN Kota Blitar dikenakan biaya?',
    a: 'TIDAK. Seluruh pelayanan publik di PTSP MAN Kota Blitar 100% GRATIS (Rp 0,-). Kami berkomitmen mewujudkan Zona Integritas Wilayah Bebas dari Korupsi (WBK).'
  },
  {
    q: 'Berapa lama proses legalisir ijazah?',
    a: 'Jika berkas persyaratan lengkap dan Kepala Madrasah ada di tempat, proses legalisir dapat selesai dalam waktu 15 - 30 menit.'
  },
  {
    q: 'Apakah pengambilan dokumen atau ijazah bisa diwakilkan?',
    a: 'Bisa, dengan syarat membawa Surat Kuasa bermaterai Rp 10.000,- yang ditandatangani pemilik dokumen, disertai fotokopi KTP pemberi dan penerima kuasa.'
  },
  {
    q: 'Bagaimana cara memantau status berkas permohonan saya?',
    a: 'Anda dapat menggunakan fitur "Cek Status Berkas" pada menu aplikasi ini dengan memasukkan Nomor Tiket atau Nomor WhatsApp yang didaftarkan saat mengisi buku tamu.'
  }
];

export const DEFAULT_SIGNAGE_MARQUEE = 
  'Selamat Datang di Pelayanan Terpadu Satu Pintu (PTSP) MAN Kota Blitar • Seluruh pelayanan 100% GRATIS & Bebas Pungutan Liar • Tolak Gratifikasi • Siapkan dokumen asli saat nomor antrean Anda dipanggil • Berikan ulasan IKM untuk kemajuan pelayanan madrasah kita.';

export const INITIAL_SIGNAGE_NOTICES: SignageNotice[] = [
  {
    id: 'sn-1',
    title: 'Pemberitahuan Berkas Asli Legalisir Ijazah',
    content: 'Bagi alumni/pemohon legalisir ijazah atau rapor, mohon menunjukkan dokumen asli kepada petugas loket untuk proses validasi stempel basah.',
    level: 'urgent',
    author: 'Koordinator PTSP',
    timestamp: '08:00 WIB',
    date: '2026-10-28',
    active: true
  },
  {
    id: 'sn-2',
    title: 'Aktivasi Beasiswa PIP Kemenag Tahap II',
    content: 'Wali murid penerima Program Indonesia Pintar (PIP) dapat langsung menyerahkan fotokopi KIP & Kartu Keluarga ke Loket 1 Pelayanan Kesiswaan.',
    level: 'announcement',
    author: 'Waka Kesiswaan',
    timestamp: '08:30 WIB',
    date: '2026-10-28',
    active: true
  },
  {
    id: 'sn-3',
    title: 'Komitmen Zona Integritas (WBK/WBBM)',
    content: 'Petugas PTSP MAN Kota Blitar tidak menerima imbalan atau gratifikasi dalam bentuk apa pun. Laporkan indikasi pungli melalui saluran pengaduan kami.',
    level: 'info',
    author: 'Tim Pengendali Gratifikasi',
    timestamp: '07:30 WIB',
    date: '2026-10-28',
    active: true
  }
];

