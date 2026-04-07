import { useState, type FormEvent } from 'react';
import { createTreatment } from '@lib/queries';
import type { Patient, Radioisotope, UnitCatalog, DispositiuRellotge, Facultatiu } from '@lib/types';

interface Props {
  patients: Patient[];
  radioisotopes: Radioisotope[];
  units: UnitCatalog[];
  watches: DispositiuRellotge[];
  doctors: Facultatiu[];
}

export default function TreatmentForm({ patients, radioisotopes, units, watches, doctors }: Props) {
  const [form, setForm] = useState({
    patient_id: '',
    radioisotope_id: '',
    unit_id: '',
    initial_radiation: '',
    isolation_days: '',
    rellotge_id: '',
    facultatiu_id: '',
    start_date: new Date().toISOString().slice(0, 16),
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expectedEndDate = form.start_date && form.isolation_days
    ? new Date(
        new Date(form.start_date).getTime() + Number(form.isolation_days) * 24 * 60 * 60 * 1000,
      ).toISOString().slice(0, 10)
    : '';

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.patient_id || !form.radioisotope_id || !form.unit_id ||
        !form.initial_radiation || !form.isolation_days || !form.rellotge_id ||
        !form.facultatiu_id) {
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      const endDate = new Date(
        new Date(form.start_date).getTime() + Number(form.isolation_days) * 24 * 60 * 60 * 1000,
      ).toISOString();

      await createTreatment({
        patient_id: Number(form.patient_id),
        radioisotope_id: Number(form.radioisotope_id),
        unit_id: Number(form.unit_id),
        initial_radiation: Number(form.initial_radiation),
        isolation_days: Number(form.isolation_days),
        rellotge_id: Number(form.rellotge_id),
        facultatiu_id: Number(form.facultatiu_id),
        start_date: new Date(form.start_date).toISOString(),
        expected_end_date: endDate,
      });

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tratamiento.');
    } finally {
      setLoading(false);
    }
  }

  const selectClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-radix-500 focus:outline-none focus:ring-2 focus:ring-radix-200';
  const inputClass = selectClass;
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Datos del Tratamiento</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Paciente *</label>
            <select value={form.patient_id} onChange={(e) => handleChange('patient_id', e.target.value)} className={selectClass} required>
              <option value="">Seleccionar paciente</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Facultativo *</label>
            <select value={form.facultatiu_id} onChange={(e) => handleChange('facultatiu_id', e.target.value)} className={selectClass} required>
              <option value="">Seleccionar doctor</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.nom} - {d.especialitat}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Radioisotopo *</label>
            <select value={form.radioisotope_id} onChange={(e) => handleChange('radioisotope_id', e.target.value)} className={selectClass} required>
              <option value="">Seleccionar isotopo</option>
              {radioisotopes.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.symbol})</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Unidad de Medida *</label>
            <select value={form.unit_id} onChange={(e) => handleChange('unit_id', e.target.value)} className={selectClass} required>
              <option value="">Seleccionar unidad</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Radiacion Inicial *</label>
            <input type="number" step="0.01" min="0" value={form.initial_radiation} onChange={(e) => handleChange('initial_radiation', e.target.value)} placeholder="Ej: 3700" className={inputClass} required />
          </div>

          <div>
            <label className={labelClass}>Dias de Aislamiento *</label>
            <input type="number" min="1" max="365" value={form.isolation_days} onChange={(e) => handleChange('isolation_days', e.target.value)} placeholder="Ej: 7" className={inputClass} required />
          </div>

          <div>
            <label className={labelClass}>Reloj (Dispositivo) *</label>
            <select value={form.rellotge_id} onChange={(e) => handleChange('rellotge_id', e.target.value)} className={selectClass} required>
              <option value="">Seleccionar reloj disponible</option>
              {watches.map((w) => <option key={w.id} value={w.id}>{w.model} - {w.mac_address} ({w.nivell_bateria}%)</option>)}
            </select>
            {watches.length === 0 && <p className="mt-1 text-xs text-alert-amber">No hay relojes disponibles</p>}
          </div>

          <div>
            <label className={labelClass}>Fecha de Inicio</label>
            <input type="datetime-local" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} className={inputClass} />
          </div>
        </div>

        {expectedEndDate && (
          <div className="mt-5 rounded-lg bg-radix-50 p-4">
            <p className="text-sm text-radix-700">
              <span className="font-medium">Fecha estimada de fin:</span>{' '}
              {new Date(expectedEndDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <a href="/dashboard" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancelar</a>
          <button type="submit" disabled={loading} className="rounded-lg bg-radix-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-radix-700 disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear Tratamiento'}
          </button>
        </div>
      </div>
    </form>
  );
}
