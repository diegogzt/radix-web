import { useState, type FormEvent } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || 'Error al iniciar sesion');
        return;
      }

      window.location.href = '/dashboard';
    } catch {
      setError('Error de conexion. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass shadow-elevated relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
      {/* Decorative top accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-radix-400 via-radix-500 to-radix-600"></div>

      {/* Mobile Branding (only visible on small screens where side panel is hidden) */}
      <div className="mb-8 text-center lg:hidden">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-radix-100/50 p-2 shadow-sm ring-1 ring-radix-200">
          <svg className="h-6 w-6 text-radix-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">RADIX</h2>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Bienvenido de nuevo</h2>
        <p className="mt-2 text-sm text-gray-500">Por favor ingresa tus credenciales de acceso</p>
      </div>

      {error && (
        <div className="animate-fade-in mb-6 flex items-start gap-3 rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-700 backdrop-blur-sm">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5 text-left">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              className="input pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">¿No tienes cuenta? </span>
          <a href="/register" className="font-semibold text-radix-600 hover:text-radix-500 hover:underline">
            Regístrate aquí
          </a>
        </div>
      </form>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>&copy; 2026 RADIX &mdash; Radiofarmacia Segura</p>
      </div>
    </div>
  );
}
