import { SubmitEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, sessionExpired, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch {
      setError('Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <p className="text-center text-3xl font-extrabold tracking-tight text-[#4a1596]">
          Banco<span className="text-[#0092ff]">XYZ</span>
        </p>
        <p className="mb-6 mt-1 text-center text-sm font-medium text-[#4f5870]">Banca en línea</p>
        <div className="card border-t-4 border-t-[#00e991]">
          <h1 className="text-2xl">Iniciar sesión</h1>
          {sessionExpired && !error && (
            <p className="alert-info mb-4" role="status">
              Tu sesión expiró. Vuelve a ingresar.
            </p>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="field">
              <span>Correo electrónico</span>
              <input
                className="input"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input
                className="input"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p className="alert-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
