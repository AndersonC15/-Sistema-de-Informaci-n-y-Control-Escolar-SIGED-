import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen font-['Manrope'] bg-surface overflow-x-hidden">
      <div className={`fixed inset-0 z-[100] ${sidebarOpen ? '' : 'hidden'}`}>
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[280px] bg-sidebar text-white shadow-2xl transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 flex justify-between items-start">
            <span
              className="material-symbols-outlined text-6xl text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
            <button
              className="hover:bg-white/10 rounded-full p-1 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined text-4xl font-light">cancel</span>
            </button>
          </div>
          <nav className="mt-4">
            <a
              className="flex items-center gap-4 px-6 py-5 bg-sidebar-active hover:bg-sidebar-hover transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-3xl">home</span>
              <span className="text-[17px] font-bold">Menú principal</span>
            </a>
          </nav>
        </aside>
      </div>

      <header className="h-16 bg-header-top border-b border-gray-200 flex justify-between items-center px-4 sticky top-0 z-50">
        <div className="flex-1 flex items-center">
          <button
            className="w-10 h-10 bg-black text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-medium text-gray-900">
            Sistema de Información y Control Escolar (SIGED)
          </span>
          <span className="material-symbols-outlined text-gray-800 text-2xl">school</span>
        </div>
        <div className="flex-1 flex flex-col items-end justify-center leading-tight">
          <p className="text-[13px] font-bold text-gray-900">
            {user?.first_name} {user?.last_name}
          </p>
          <a
            className="text-[13px] font-medium text-primary hover:underline cursor-pointer"
            onClick={handleLogout}
            href="#"
          >
            Cerrar sesión
          </a>
        </div>
      </header>

      <main className="flex-grow bg-surface">
        {children}
      </main>

      <footer className="p-8 text-center text-gray-400 text-xs">@ 2026 SIGED</footer>
    </div>
  );
}
