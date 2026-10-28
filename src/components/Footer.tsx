import React from 'react';
import { Building, MapPin, Phone, Mail, Globe, ShieldCheck, Heart } from 'lucide-react';
import { MADRASAH_PROFILE } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-black text-sm tracking-tight">
                  PTSP {MADRASAH_PROFILE.name}
                </h4>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {MADRASAH_PROFILE.agency}
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Aplikasi Buku Tamu Digital dan Layanan Mandiri Pelayanan Terpadu Satu Pintu (PTSP) Madrasah Aliyah Negeri Kota Blitar. Berorientasi pada kepuasan masyarakat, pelayanan cepat, ramah, dan 100% bebas biaya (Rp 0,-).
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Zona Integritas Menuju WBK / WBBM</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">
              Kontak & Lokasi
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{MADRASAH_PROFILE.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Telp: {MADRASAH_PROFILE.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{MADRASAH_PROFILE.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{MADRASAH_PROFILE.website}</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-2.5">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider">
              Jam Pelayanan PTSP
            </h5>
            <div className="space-y-1.5 text-slate-300 text-xs">
              <div>
                <span className="block text-slate-400 text-[11px]">Senin s.d. Kamis:</span>
                <span className="font-semibold text-white">07.30 - 15.30 WIB</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[11px]">Jumat:</span>
                <span className="font-semibold text-white">07.30 - 15.00 WIB</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Istirahat Dzuhur: 12.00 - 13.00 WIB
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>
            &copy; {new Date().getFullYear()} PTSP MAN Kota Blitar &bull; Kementerian Agama Republik Indonesia.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Mewujudkan Madrasah Mandiri Berprestasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
