import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Award, Users } from 'lucide-react';
import { GuestEntry } from '../types/ptsp';

interface AdminAnalyticsChartsProps {
  guests: GuestEntry[];
}

const PIE_COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#10b981', // Green
  '#64748b'  // Slate
];

export const AdminAnalyticsCharts: React.FC<AdminAnalyticsChartsProps> = ({ guests }) => {
  // 1. Process daily guest volume
  const dailyData = useMemo(() => {
    const countsByDate: Record<string, { total: number; selesai: number; menunggu: number; proses: number }> = {};

    guests.forEach((g) => {
      const dateKey = g.date || 'Lainnya';
      if (!countsByDate[dateKey]) {
        countsByDate[dateKey] = { total: 0, selesai: 0, menunggu: 0, proses: 0 };
      }
      countsByDate[dateKey].total += 1;
      if (g.status === 'Selesai') countsByDate[dateKey].selesai += 1;
      else if (g.status === 'Menunggu') countsByDate[dateKey].menunggu += 1;
      else countsByDate[dateKey].proses += 1;
    });

    // Sort chronologically
    return Object.keys(countsByDate)
      .sort()
      .map((dateStr) => {
        // Format date string for display (e.g. 2026-10-28 -> 28 Okt)
        let formattedLabel = dateStr;
        try {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            formattedLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          }
        } catch {
          // fallback
        }

        return {
          date: formattedLabel,
          fullDate: dateStr,
          Total: countsByDate[dateStr].total,
          Selesai: countsByDate[dateStr].selesai,
          'Sedang Proses': countsByDate[dateStr].proses,
          Menunggu: countsByDate[dateStr].menunggu
        };
      });
  }, [guests]);

  // 2. Process service popularity
  const serviceData = useMemo(() => {
    const countsByService: Record<string, number> = {};

    guests.forEach((g) => {
      const svc = g.serviceNeeded || 'Lainnya';
      countsByService[svc] = (countsByService[svc] || 0) + 1;
    });

    const total = guests.length || 1;

    return Object.entries(countsByService)
      .map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }, [guests]);

  const topService = serviceData[0];

  return (
    <div className="space-y-4 print:hidden">
      {/* Mini Insight Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block tracking-wider">
              Layanan Terpopuler
            </span>
            <span className="text-xs font-black text-slate-900 truncate block">
              {topService ? topService.name : '-'}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {topService ? `${topService.value} Permohonan (${topService.percentage}%)` : '0 Permohonan'}
            </span>
          </div>
        </div>

        <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-sky-800 uppercase block tracking-wider">
              Hari Teraktif
            </span>
            <span className="text-xs font-black text-slate-900 block">
              {dailyData.length > 0 ? dailyData[dailyData.length - 1].date : '-'}
            </span>
            <span className="text-[10px] text-sky-700 font-semibold">
              {dailyData.length > 0 ? `${dailyData[dailyData.length - 1].Total} Kunjungan Tamu` : '0'}
            </span>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-900 uppercase block tracking-wider">
              Rata-rata Harian
            </span>
            <span className="text-xs font-black text-slate-900 block">
              {(guests.length / (dailyData.length || 1)).toFixed(1)} Pengunjung / Hari
            </span>
            <span className="text-[10px] text-amber-800 font-semibold">
              Terdistribusi di 3 Loket PTSP
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. Bar Chart: Volume Kunjungan Harian */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Volume Kunjungan Tamu Harian
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Jumlah kunjungan per tanggal berdasarkan data registrasi buku tamu
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Bar Chart
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="Selesai" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Sedang Proses" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Menunggu" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. Pie Chart: Popularitas Layanan PTSP */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Distribusi Layanan PTSP
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Proporsi jenis layanan yang paling banyak diajukan
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                Pie Chart
              </span>
            </div>

            <div className="h-56 sm:h-60 w-full mt-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${value} Permohonan (${item.payload.percentage}%)`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-800 font-mono">{guests.length}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Total</span>
              </div>
            </div>

            {/* Custom Legend with Percentages */}
            <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1 divide-y divide-slate-100">
              {serviceData.slice(0, 5).map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0 font-mono text-[11px]">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
