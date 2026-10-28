import { GuestEntry } from '../types/ptsp';

/**
 * Exports visitor registry to standard CSV format with UTF-8 BOM
 * for Microsoft Excel, Google Sheets, and LibreOffice compatibility.
 */
export function exportGuestsToCSV(guests: GuestEntry[], customFilename?: string): number {
  if (!guests || guests.length === 0) {
    alert('Tidak ada data buku tamu untuk diekspor ke CSV.');
    return 0;
  }

  const headers = [
    'No',
    'No. Tiket',
    'Tanggal Kunjungan',
    'Waktu Masuk',
    'Nama Lengkap',
    'Identitas (NIK/NIP/NISN)',
    'Kategori Pengunjung',
    'Instansi / Alamat Domisili',
    'No. WhatsApp / Telepon',
    'Alamat Email',
    'Layanan PTSP',
    'Detail Keperluan',
    'Loket Pelayanan',
    'Pejabat / Bagian Tujuan',
    'Status Pelayanan',
    'Catatan Petugas'
  ];

  const rows = guests.map((g, index) => [
    `"${index + 1}"`,
    `"${g.ticketNumber}"`,
    `"${g.date}"`,
    `"${g.timestamp}"`,
    `"${(g.fullName || '').replace(/"/g, '""')}"`,
    `"${(g.identifierNumber || '-').replace(/"/g, '""')}"`,
    `"${(g.category || '').replace(/"/g, '""')}"`,
    `"${(g.institutionOrAddress || '').replace(/"/g, '""')}"`,
    `"${(g.phone || '').replace(/"/g, '""')}"`,
    `"${(g.email || '-').replace(/"/g, '""')}"`,
    `"${(g.serviceNeeded || '').replace(/"/g, '""')}"`,
    `"${(g.purposeDetail || '').replace(/"/g, '""')}"`,
    `"Loket ${g.loketId || 1}"`,
    `"${(g.targetOfficerOrDepartment || '').replace(/"/g, '""')}"`,
    `"${g.status}"`,
    `"${(g.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);

  const filename = customFilename || `Buku_Tamu_PTSP_MAN_Kota_Blitar_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', filename);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return guests.length;
}

/**
 * Lightweight QR Code SVG generator representation
 */
export function generateQRMatrixSvg(data: string, size = 140): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  
  const gridSize = 21;
  const cellSize = size / gridSize;
  let rects = '';

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isCornerTL = r < 7 && c < 7;
      const isCornerTR = r < 7 && c >= gridSize - 7;
      const isCornerBL = r >= gridSize - 7 && c < 7;

      let isBlack = false;

      if (isCornerTL || isCornerTR || isCornerBL) {
        const localR = isCornerBL ? r - (gridSize - 7) : r;
        const localC = isCornerTR ? c - (gridSize - 7) : c;
        if (localR === 0 || localR === 6 || localC === 0 || localC === 6) {
          isBlack = true;
        } else if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) {
          isBlack = true;
        }
      } else {
        const val = Math.sin(hash + r * 17 + c * 31) * 10000;
        isBlack = (val - Math.floor(val)) > 0.52;
      }

      if (isBlack) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${rects}</svg>`;
}
