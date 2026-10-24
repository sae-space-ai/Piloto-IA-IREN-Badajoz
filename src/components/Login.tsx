import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { authenticate } from '../services/storage';

export default function Login() {
  const { login, addNotification, gdprAccepted, acceptGdpr } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (!gdprAccepted) {
      setError('Debes aceptar la política de privacidad para continuar');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = authenticate(email, password);
      if (user) {
        login(user);
        addNotification('success', `Bienvenido, ${user.name}`);
      } else {
        setError('Credenciales inválidas. Usa admin@montemolin.ai o analista@montemolin.ai con contraseña demo1234');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="font-extrabold tracking-wider text-2xl mb-2">
            MONTEMOLIN<span className="text-accent">—AIHUB</span>
          </div>
          <p className="text-muted text-sm">Piloto IREN Europe · Sistema operativo</p>
        </div>

        <div className="bg-gradient-to-br from-card-from to-card-to border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="admin@montemolin.ai"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-check-bg border border-border rounded-xl text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
                placeholder="demo1234"
                disabled={loading}
              />
            </div>

            <div className="border-l-3 border-warn pl-4 py-3 bg-notice-bg rounded-r-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gdprAccepted}
                  onChange={(e) => {
                    if (e.target.checked) acceptGdpr();
                  }}
                />
                <div className="text-xs text-muted">
                  <strong className="block text-ink mb-1">Consentimiento RGPD</strong>
                  Acepto el tratamiento de mis datos personales conforme a la política de privacidad. Los datos se almacenan localmente en este navegador.
                </div>
              </label>
            </div>

            {error && (
              <div className="border-l-3 border-red-500 pl-4 py-3 bg-red-500/10 rounded-r-xl">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-dark-text px-4 py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted mb-3">Credenciales de demostración:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Administrador:</span>
                <code className="text-accent">admin@montemolin.ai</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Analista:</span>
                <code className="text-accent">analista@montemolin.ai</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Contraseña:</span>
                <code className="text-accent">demo1234</code>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Sistema operativo · Datos almacenados localmente · Sin backend
        </p>
      </div>
    </div>
  );
}
