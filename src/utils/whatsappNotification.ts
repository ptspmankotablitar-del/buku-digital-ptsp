import { GuestEntry } from '../types/ptsp';
import { MADRASAH_PROFILE } from '../data/mockData';

export interface WhatsAppNotificationLog {
  id: string;
  guestId: string;
  guestName: string;
  phone: string;
  ticketNumber: string;
  loketName: string;
  timestamp: string;
  date: string;
  status: 'Terkirim' | 'Gagal' | 'Disiapkan';
  messagePreview: string;
}

/**
 * Standardize phone numbers to international format (e.g. 0812... -> 62812...)
 */
export function formatToWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Compose official PTSP MAN Kota Blitar WhatsApp notification message
 */
export function buildQueueCallWAMessage(
  guest: GuestEntry,
  loketName: string,
  officerName?: string
): string {
  const ticketUrl = `${window.location.origin}${window.location.pathname}?ticket=${encodeURIComponent(guest.ticketNumber)}`;

  return (
    `*PANGGILAN ANTREAN PTSP MAN KOTA BLITAR*\n` +
    `_Kementerian Agama Republik Indonesia_\n\n` +
    `Assalamu'alaikum Wr. Wb. / Salam Sejahtera,\n` +
    `Yth. Bapak/Ibu *${guest.fullName}*,\n\n` +
    `Nomor antrean Anda: *${guest.ticketNumber}*\n` +
    `Saat ini telah dipanggil untuk menuju ke:\n` +
    `🏢 *${loketName}*\n` +
    (officerName ? `👤 Petugas: *${officerName}*\n` : '') +
    `📄 Layanan: *${guest.serviceNeeded}*\n\n` +
    `Silakan segera menuju ke loket pelayanan dengan menyiapkan dokumen persyaratan asli.\n\n` +
    `📱 Pantau tiket & berkas digital Anda melalui tautan:\n` +
    `${ticketUrl}\n\n` +
    `_Seluruh layanan PTSP MAN Kota Blitar 100% BEBAS BIAYA (Gratis) & Menolak Gratifikasi._\n` +
    `Terima kasih atas kerja samanya.\n\n` +
    `*PTSP MAN KOTA BLITAR*\n` +
    `Jl. Jati No. 71, Sukorejo, Kota Blitar\n` +
    `Hotline: ${MADRASAH_PROFILE.phone}`
  );
}

/**
 * Generate click-to-chat WhatsApp link
 */
export function getWhatsAppSendUrl(phone: string, message: string): string {
  const formattedPhone = formatToWhatsAppNumber(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Dispatch or open WhatsApp web/app
 */
export function dispatchWhatsAppNotification(
  guest: GuestEntry,
  loketName: string,
  officerName?: string,
  openInNewTab: boolean = true
): { url: string; log: WhatsAppNotificationLog } {
  const message = buildQueueCallWAMessage(guest, loketName, officerName);
  const formattedPhone = formatToWhatsAppNumber(guest.phone);
  const waUrl = getWhatsAppSendUrl(guest.phone, message);

  if (openInNewTab && typeof window !== 'undefined') {
    // Open WhatsApp Web or app
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  const now = new Date();
  const log: WhatsAppNotificationLog = {
    id: `walog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    guestId: guest.id,
    guestName: guest.fullName,
    phone: formattedPhone,
    ticketNumber: guest.ticketNumber,
    loketName,
    timestamp: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    date: now.toISOString().slice(0, 10),
    status: 'Terkirim',
    messagePreview: message
  };

  // Save to localStorage log
  try {
    const existing = localStorage.getItem('ptsp_wa_logs');
    const logs: WhatsAppNotificationLog[] = existing ? JSON.parse(existing) : [];
    logs.unshift(log);
    // keep max 50 logs
    localStorage.setItem('ptsp_wa_logs', JSON.stringify(logs.slice(0, 50)));
  } catch {
    // Ignore storage issues
  }

  return { url: waUrl, log };
}

export function getSavedWhatsAppLogs(): WhatsAppNotificationLog[] {
  try {
    const existing = localStorage.getItem('ptsp_wa_logs');
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}
