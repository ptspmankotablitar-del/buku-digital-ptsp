import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  ThumbsUp, 
  Award, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { SurveyResponse, ServiceType, GuestEntry } from '../types/ptsp';
import { SERVICES_CATALOG } from '../data/mockData';

interface SatisfactionSurveyProps {
  surveys: SurveyResponse[];
  onAddSurvey: (survey: SurveyResponse) => void;
  targetGuest?: GuestEntry | null;
}

export const SatisfactionSurvey: React.FC<SatisfactionSurveyProps> = ({
  surveys,
  onAddSurvey,
  targetGuest
}) => {
  const [guestName, setGuestName] = useState(targetGuest?.fullName || '');
  const [serviceType, setServiceType] = useState<ServiceType>(
    targetGuest?.serviceNeeded || 'Legalisir Ijazah / Rapor'
  );
  const [procedureScore, setProcedureScore] = useState<number>(5);
  const [speedScore, setSpeedScore] = useState<number>(5);
  const [politenessScore, setPolitenessScore] = useState<number>(5);
  const [facilityScore, setFacilityScore] = useState<number>(5);
  const [integrityScore, setIntegrityScore] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Compute average overall score
  const totalScoreAvg = (
    surveys.reduce((acc, s) => acc + (s.procedureScore + s.speedScore + s.politenessScore + s.facilityScore + s.integrityScore) / 5, 0) /
    (surveys.length || 1)
  );
  const ikmPercentage = (totalScoreAvg / 5) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Nama pengunjung wajib diisi.');
      return;
    }

    const overall = Math.round(
      (procedureScore + speedScore + politenessScore + facilityScore + integrityScore) / 5
    );

    const newSurvey: SurveyResponse = {
      id: `sv-${Date.now()}`,
      guestId: targetGuest?.id,
      guestName: guestName.trim(),
      date: new Date().toISOString().slice(0, 10),
      serviceType,
      procedureScore,
      speedScore,
      politenessScore,
      facilityScore,
      integrityScore,
      overallRating: overall,
      comments: comments.trim() || 'Pelayanan sangat memuaskan dan bebas biaya.'
    };

    onAddSurvey(newSurvey);
    setSubmitted(true);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const renderRatingButtons = (
    value: number,
    onChange: (val: number) => void,
    labels: string[] = ['Kurang', 'Cukup', 'Baik', 'Sangat Baik', 'Istimewa']
  ) => {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
              value === star
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-4 h-4 ${value >= star ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
            <span className="text-[10px] hidden sm:inline">{labels[star - 1]}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Top Banner & Overall Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-400/30">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Indeks Kepuasan Masyarakat (IKM) Permenpan RB</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Survei Kepuasan Pelayanan PTSP
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Bantu kami menjaga komitmen pelayanan prima dan Zona Integritas. Setiap penilaian Anda menjadi bahan evaluasi berkala bagi Kepala Madrasah dan jajaran PTSP MAN Kota Blitar.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-4 text-xs text-emerald-200">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              100% Anonim & Rahasia
            </span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              Bebas Pungli & Transparan
            </span>
          </div>
        </div>

        {/* Live Score Badge */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            SKOR MUTU PELAYANAN (IKM)
          </span>
          <div className="text-5xl font-black text-emerald-800 font-mono my-2">
            {ikmPercentage.toFixed(1)}%
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Kategori: A (SANGAT BAIK)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Berdasarkan {surveys.length} ulasan responden terverifikasi
          </span>
        </div>
      </div>

      {/* Survey Form */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Terima Kasih Atas Ulasan Anda!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Penilaian dan saran Anda telah tersimpan ke dalam database evaluasi PTSP MAN Kota Blitar. Kami senantiasa berkomitmen memberikan pelayanan terbaik.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
              >
                Kirim Ulasan Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Pengunjung / Responden <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nama Anda..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Layanan yang Diterima <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  >
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 5 Core Evaluation Elements */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Penilaian Kualitas Layanan:
                </span>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">1. Kemudahan & Kejelasan Prosedur Layanan</span>
                    <span className="font-extrabold text-emerald-700">{procedureScore}/5</span>
                  </div>
                  {renderRatingButtons(procedureScore, setProcedureScore)}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">2. Kecepatan Waktu Penyelesaian Berkas</span>
                    <span className="font-extrabold text-emerald-700">{speedScore}/5</span>
                  </div>
                  {renderRatingButtons(speedScore, setSpeedScore)}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">3. Keramahan, Kesopanan, & Responsivitas Petugas</span>
                    <span className="font-extrabold text-emerald-700">{politenessScore}/5</span>
                  </div>
                  {renderRatingButtons(politenessScore, setPolitenessScore)}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">4. Kenyamanan Ruang Tunggu & Sarana Prasarana</span>
                    <span className="font-extrabold text-emerald-700">{facilityScore}/5</span>
                  </div>
                  {renderRatingButtons(facilityScore, setFacilityScore)}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">5. Integritas Petugas & Kebebasan dari Pungli / Gratifikasi (Rp 0,-)</span>
                    <span className="font-extrabold text-emerald-700">{integrityScore}/5</span>
                  </div>
                  {renderRatingButtons(integrityScore, setIntegrityScore)}
                </div>
              </div>

              {/* Comments & Suggestions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kritik, Saran, atau Testimoni untuk PTSP MAN Kota Blitar
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tuliskan pengalaman atau masukan Anda..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Penilaian Kepuasan (IKM)</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Recent Reviews List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-700" />
          <h3 className="font-extrabold text-slate-900 text-base">Ulasan & Aspirasi Pengunjung Terbaru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {surveys.map((sv) => (
            <div key={sv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">{sv.guestName}</span>
                <span className="text-[11px] text-slate-400">{sv.date}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < sv.overallRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`}
                  />
                ))}
                <span className="text-slate-500 ml-1 font-semibold">({sv.serviceType})</span>
              </div>
              <p className="text-slate-600 italic">"{sv.comments}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
