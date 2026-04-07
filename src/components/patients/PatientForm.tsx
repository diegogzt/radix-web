import { useState, type FormEvent } from 'react';
import { createPatient, updatePatient } from '@lib/queries';
import type { Patient } from '@lib/api';

interface Props {
  patient?: Patient;
}

export default function PatientForm({ patient }: Props) {
  const isEditing = !!patient;
  const [form, setForm] = useState({
    name: patient?.name ?? '',
    phone: patient?.phone ?? '',
    address: patient?.address ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await updatePatient(patient.id, {
          name: form.name,
          phone: form.phone || null,
          address: form.address || null,
        });
      } else {
        await createPatient({
          name: form.name,
          phone: form.phone || null,
          address: form.address || null,
        });
      }
      window.location.href = '/patients';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar paciente.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-radix-500 focus:outline-none focus:ring-2 focus:ring-radix-200';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nombre completo"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+34 600 000 000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Direccion</label>
            <textarea
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Direccion del domicilio"
              rows={3}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <a
            href="/patients"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-radix-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-radix-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Paciente'}
          </button>
        </div>
      </div>
    </form>
  );
}
