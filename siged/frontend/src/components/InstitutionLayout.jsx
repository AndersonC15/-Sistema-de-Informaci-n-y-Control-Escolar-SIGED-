import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_TITLE, APP_FOOTER } from '../config/app';

export default function InstitutionLayout({ children, institucionId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    {
      id: 'back',
      label: 'Volver al menú principal',
      icon: 'arrow_back',
      path: '/',
    },
    {
      id: 'mi-institucion',
      label: 'Mi institución',
      icon: 'school',
      path: `/instituciones/${institucionId}`,
    },
    {
      id: 'planes',
      label: 'Planes de estudio',
      icon: 'menu_book',
      path: `/instituciones/${institucionId}/planes`,
    },
  ];

  const isActive = (path) => {
    if (path === `/instituciones/${institucionId}`) {
      return location.pathname === path;
    }
    if (path === `/instituciones/${institucionId}/planes`) {
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    }
    return location.pathname === path;
  };

  const go = (path) => {
    setSidebarOpen(false);
    navigate(path);
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
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const base = 'hover:bg-sidebar-hover transition-colors';
              const activeCls = active
                ? `bg-sidebar-active ${base}`
                : base;
              return (
                <button
                  key={item.id}
                  className={`flex items-center gap-4 px-6 py-5 transition-colors w-full text-left ${activeCls}`}
                  onClick={() => go(item.path)}
                >
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[17px] font-bold">{item.label}</span>
                </button>
              );
            })}
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
            {APP_TITLE}
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

      <main className="flex-grow bg-surface">{children}</main>

      <footer className="p-8 text-center text-gray-400 text-xs">{APP_FOOTER}</footer>
    </div>
  );
}
