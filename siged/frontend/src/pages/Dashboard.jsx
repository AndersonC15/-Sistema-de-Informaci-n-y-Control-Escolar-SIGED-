import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user, isAdministrador, isAutoridadAcademica } = useAuth();
  const navigate = useNavigate();

  const shortcuts = [];
  if (isAdministrador()) {
    shortcuts.push({
      icon: 'school',
      title: 'Gestión de instituciones',
      desc: 'Administra instituciones educativas y autoridades académicas',
      path: '/instituciones',
    });
  }
  if (isAutoridadAcademica()) {
    shortcuts.push({
      icon: 'group',
      title: 'Mis instituciones',
      desc: 'Acceda a las instituciones educativas que tiene asignadas',
      path: '/mis-instituciones',
    });
  }

  return (
    <Layout>
      <div className="space-y-8 px-8 py-8">
        <section className="relative bg-heading-block border border-gray-200 rounded-sm p-6 text-gray-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-heading-block-border">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-1 tracking-tight text-gray-900">
              ¡Bienvenido/a, {user?.first_name} {user?.last_name}!
            </h2>
            <p className="text-gray-600 text-base">
              Accede a las funcionalidades del SIGED
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-primary">school</span>
          </div>
        </section>

        {shortcuts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortcuts.map((s) => (
              <button
                key={s.path}
                onClick={() => navigate(s.path)}
                className="bg-surface border border-gray-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
                  <div className="mb-4">
                    <span className="material-symbols-outlined text-6xl text-primary">
                      {s.icon}
                    </span>
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900">{s.title}</h3>
                  <p className="text-[13px] text-gray-500 mt-2">{s.desc}</p>
                </div>
                <div className="w-full bg-primary text-white py-3.5 flex items-center justify-center gap-2 font-bold text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  Ingresar
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="w-[280px]">
          <div className="bg-surface border border-gray-200 rounded-sm overflow-hidden flex flex-col shadow-sm">
            <div className="pt-10 pb-8 flex flex-col items-center text-center">
              <div className="mb-4">
                <span
                  className="material-symbols-outlined text-7xl text-gray-900"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">{user?.numero_identificacion}</p>
            </div>
            <div className="w-full bg-primary text-white py-3.5 flex items-center justify-center gap-2 font-bold text-[14px]">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'wght' 600" }}
              >
                check
              </span>
              Activo
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
