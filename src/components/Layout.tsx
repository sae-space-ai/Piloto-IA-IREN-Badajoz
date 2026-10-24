import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout, notifications, removeNotification } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Panel', icon: '📊' },
    { id: 'opportunities', label: 'Oportunidades', icon: '🎯' },
    { id: 'simulator', label: 'Finanzas', icon: '💰' },
    { id: 'audit', label: 'Auditoría', icon: '📋' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-panel/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-extrabold tracking-wider text-lg">
                MONTEMOLIN<span className="text-accent">—AIHUB</span>
              </div>
              <span className="hidden md:inline-block border border-border rounded-full px-3 py-1 text-muted text-xs">
                Piloto operativo
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-accent text-dark-text'
                      : 'text-muted hover:text-ink hover:bg-check-bg'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted">
                  {user?.role === 'admin' ? 'Administrador' : 'Analista'}
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-check-bg border border-border px-3 py-2 rounded-xl text-sm hover:border-accent transition-colors"
              >
                Salir
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-check-bg border border-border p-2 rounded-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-accent text-dark-text'
                      : 'text-muted hover:text-ink hover:bg-check-bg'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`border rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slide-in ${
              notif.type === 'success'
                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                : notif.type === 'error'
                  ? 'bg-red-500/20 border-red-500/50 text-red-200'
                  : notif.type === 'warning'
                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
                    : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
            }`}
          >
            <div className="flex justify-between items-start gap-3">
              <p className="text-sm">{notif.message}</p>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="max-w-[1180px] mx-auto px-4 md:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted">
              MONTEMOLIN-AIHUB · Piloto operativo · Datos almacenados localmente
            </p>
            <div className="flex gap-4 text-xs text-muted">
              <a href="https://www.iren.com/data-centers/badajoz" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                IREN Badajoz
              </a>
              <span>·</span>
              <span>RGPD compliant</span>
              <span>·</span>
              <span>300 MW planificados</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
