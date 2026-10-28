import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { SERVICES_CATALOG, PTSP_FAQS } from '../data/mockData';
import { ServiceType } from '../types/ptsp';

interface ServicesCatalogProps {
  onSelectServiceToBook: (serviceTitle: ServiceType) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({ onSelectServiceToBook }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    'Semua',
    'Kurikulum & Administrasi',
    'Kesiswaan',
    'Umum & Humas',
    'Kepala Madrasah & BK'
  ];

  const filteredServices = selectedCategory === 'Semua'
    ? SERVICES_CATALOG
    : SERVICES_CATALOG.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>Standar Operasional Prosedur (SOP)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Katalog Layanan PTSP MAN Kota Blitar
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Seluruh standar pelayanan publik madrasah diselenggarakan secara transparan, akuntabel, bebas pungli (Rp 0,-), dengan estimasi waktu penyelesaian yang terukur.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-500/80 transition group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {service.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                  Loket {service.loket}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition">
                  {service.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <Clock className="w-3.5 h-3.5" />
                    {service.estimatedTime}
                  </span>
                  <span>&bull;</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                    {service.cost}
                  </span>
                </div>
              </div>

              {/* Requirements List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block">Persyaratan Dokumen:</span>
                <ul className="space-y-1.5 text-slate-600">
                  {service.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-tight">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Output & In-charge */}
              <div className="pt-2 text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700">Output: </span>
                  <span>{service.outputDocument}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Pelaksana: </span>
                  <span>{service.officerInCharge}</span>
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => onSelectServiceToBook(service.title)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Daftar Buku Tamu Layanan Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-slate-800">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <h3 className="font-extrabold text-base">Pertanyaan yang Sering Diajukan (FAQ PTSP)</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {PTSP_FAQS.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div key={index} className="py-3">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-emerald-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-emerald-500">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
