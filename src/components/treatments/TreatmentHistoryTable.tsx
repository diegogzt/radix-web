import { useState } from 'react';
import { formatDate } from '@lib/utils';
import type { TreatmentWithDetails } from '@lib/types';

interface Props {
  treatments: TreatmentWithDetails[];
}

export default function TreatmentHistoryTable({ treatments }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = treatments.filter((t) => {
    const matchSearch =
      (t.Patient?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.Radioisotope?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const statuses = [...new Set(treatments.map((t) => t.status))];

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por paciente o isotopo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-radix-500 focus:outline-none focus:ring-2 focus:ring-radix-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-radix-500 focus:outline-none focus:ring-2 focus:ring-radix-200"
        >
          <option value="">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600">Paciente</th>
                <th className="px-4 py-3 font-medium text-gray-600">Radioisotopo</th>
                <th className="px-4 py-3 font-medium text-gray-600">Radiacion</th>
                <th className="px-4 py-3 font-medium text-gray-600">Inicio</th>
                <th className="px-4 py-3 font-medium text-gray-600">Fin</th>
                <th className="px-4 py-3 font-medium text-gray-600">Dias</th>
                <th className="px-4 py-3 font-medium text-gray-600">Doctor</th>
                <th className="px-4 py-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron tratamientos
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      window.location.href = `/monitoring/${t.id}`;
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {t.Patient?.name ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.Radioisotope?.name ?? '-'} ({t.Radioisotope?.symbol ?? ''})
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.initial_radiation} {t.UnitCatalog?.symbol ?? 'MBq'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(t.start_date)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(t.expected_end_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.isolation_days ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.Facultatiu ? `Dr. ${t.Facultatiu.nom}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          t.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : t.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t.status}
                      </span>
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
