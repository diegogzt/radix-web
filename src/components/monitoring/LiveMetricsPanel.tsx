import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getHealthMetrics } from '@lib/queries';
import { calculateCurrentRadiation, bpmColor } from '@lib/utils';
import type { HealthMetrics, TreatmentWithDetails } from '@lib/types';

interface Props {
  treatmentId: number;
  initialMetrics: HealthMetrics[];
  treatment: TreatmentWithDetails;
}

export default function LiveMetricsPanel({ treatmentId, initialMetrics, treatment }: Props) {
  const [metrics, setMetrics] = useState<HealthMetrics[]>(initialMetrics);

  const latest = metrics[0] ?? null;
  const halfLife = treatment.Radioisotope?.half_life ?? 0;
  const initialRad = treatment.initial_radiation ?? 0;

  const theoreticalRad = halfLife > 0
    ? calculateCurrentRadiation(initialRad, halfLife, treatment.start_date)
    : 0;

  // Poll for new metrics every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fresh = await getHealthMetrics(treatmentId, 200);
        setMetrics(fresh);
      } catch {
        // silently ignore polling errors
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [treatmentId]);

  // Prepare chart data (ascending order for charts)
  const chartData = [...metrics]
    .reverse()
    .map((m) => ({
      time: new Date(m.recorded_at).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      bpm: m.bpm,
      radiation: m.current_radiation,
      steps: m.steps,
    }));

  // Generate theoretical decay curve
  const decayCurve = Array.from({ length: 24 }, (_, i) => {
    const hoursAgo = 24 - i;
    const time = new Date(Date.now() - hoursAgo * 3600000);
    return {
      time: time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      theoretical: halfLife > 0
        ? calculateCurrentRadiation(initialRad, halfLife, treatment.start_date)
        : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Current values cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Frecuencia Cardiaca"
          value={latest?.bpm ?? '-'}
          unit="BPM"
          colorClass={latest?.bpm ? bpmColor(latest.bpm) : 'text-gray-400'}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
        />
        <MetricCard
          label="Pasos"
          value={latest?.steps ?? '-'}
          unit="pasos"
          colorClass="text-info"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          }
        />
        <MetricCard
          label="Distancia"
          value={latest?.distance?.toFixed(2) ?? '-'}
          unit="km"
          colorClass="text-radix-600"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <MetricCard
          label="Radiacion Actual"
          value={latest?.current_radiation?.toFixed(2) ?? theoreticalRad.toFixed(2)}
          unit={treatment.UnitCatalog?.symbol ?? 'MBq'}
          colorClass="text-alert-amber"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
      </div>

      {/* BPM Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Frecuencia Cardiaca (BPM)</h3>
        {chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            Esperando datos en tiempo real...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis domain={[40, 140]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="5 5" label="100 bpm" />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="5 5" label="60 bpm" />
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Radiation Decay Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Decaimiento Radiactivo (Actual vs Teorico)
        </h3>
        {chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-gray-400">
            Esperando datos en tiempo real...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="radiation"
                stroke="#7c3aed"
                fill="#ede9fe"
                strokeWidth={2}
                name="Actual"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  colorClass,
  icon,
}: {
  label: string;
  value: string | number;
  unit: string;
  colorClass: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`${colorClass} opacity-70`}>{icon}</div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
