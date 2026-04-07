import { useState } from 'react';
import { deletePatient } from '@lib/queries';
import { formatDate } from '@lib/utils';
import type { Patient } from '@lib/api';

interface Props {
  patients: Patient[];
}

export default function PatientTable({ patients: initialPatients }: Props) {
  const [patients, setPatients] = useState(initialPatients);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search)) ||
      (p.address && p.address.toLowerCase().includes(search.toLowerCase())),
  );

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // keep list unchanged on error
    }
    setDeleting(null);
    setConfirmId(null);
  }

  return (
    <div>
      {/* Search + Add button */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-radix-500 focus:outline-none focus:ring-2 focus:ring-radix-200"
        />
        <a
          href="/patients/new"
          className="shrink-0 rounded-lg bg-radix-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-radix-700"
        >
          + Anadir Paciente
        </a>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 font-medium text-gray-600">Telefono</th>
                <th className="px-4 py-3 font-medium text-gray-600">Direccion</th>
                <th className="px-4 py-3 font-medium text-gray-600">Registrado</th>
                <th className="px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron pacientes
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{patient.name}</td>
                    <td className="px-4 py-3 text-gray-600">{patient.phone ?? '-'}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-gray-600">
                      {patient.address ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {patient.created_at ? formatDate(patient.created_at) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/patients/${patient.id}`}
                          className="rounded-md px-2 py-1 text-xs font-medium text-radix-600 transition-colors hover:bg-radix-50"
                        >
                          Editar
                        </a>
                        {confirmId === patient.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(patient.id)}
                              disabled={deleting === patient.id}
                              className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                            >
                              {deleting === patient.id ? '...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(patient.id)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
