import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstitutionLayout from '../components/InstitutionLayout';
import { misInstitucionesService } from '../services/instituciones';

export default function DashboardInstitucion() {
  const { institucionId } = useParams();
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    misInstitucionesService
      .listar()
      .then((res) => {
        const inst = res.data.find((i) => i.id === Number(institucionId));
        setInstitucion(inst || null);
      })
      .catch(() => setInstitucion(null))
      .finally(() => setLoading(false));
  }, [institucionId]);

  if (loading) {
    return (
      <InstitutionLayout institucionId={institucionId} institucionNombre="">
        <p className="text-center text-gray-500 py-10">Cargando...</p>
      </InstitutionLayout>
    );
  }

  if (!institucion) {
    return (
      <InstitutionLayout institucionId={institucionId} institucionNombre="">
        <div className="px-8 py-8">
          <p className="text-center text-gray-500 py-10">
            No tiene acceso a esta institución.
          </p>
        </div>
      </InstitutionLayout>
    );
  }

  return (
    <InstitutionLayout institucionId={institucionId} institucionNombre={institucion.nombre}>
      <div className="space-y-8 px-8 py-8">
        <section className="relative bg-heading-block border border-gray-200 rounded-sm p-6 text-gray-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-heading-block-border">
          <div className="relative z-10">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mb-1">
              Panel de Control
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {institucion.nombre}
            </h2>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-primary">school</span>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() =>
              navigate(`/instituciones/${institucionId}/planes`)
            }
            className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col h-full text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                menu_book
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Planes de estudio</h3>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
              Gestión del currículo académico y seguimiento de objetivos pedagógicos.
            </p>
            <span className="w-full py-3 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-90 transition-all flex items-center justify-center gap-2">
              Administrar
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </span>
          </button>

          <div className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col h-full opacity-70">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mb-6">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                badge
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Funcionarios</h3>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
              Administración del personal docente, administrativo y de servicios.
            </p>
            <span className="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
              Próximamente
            </span>
          </div>

          <div className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 flex flex-col h-full opacity-70">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mb-6">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                group
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Estudiantes</h3>
            <p className="text-gray-500 text-sm mb-8 flex-grow">
              Control de alumnos y sus representantes legales.
            </p>
            <span className="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
              Próximamente
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  calendar_month
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Años Lectivos</h3>
                <p className="text-gray-500 text-sm">
                  Configuración y seguimiento del periodo académico
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Año lectivo actual
              </span>
              <span className="text-3xl font-black text-primary leading-none">
                2025-2026
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { icon: 'account_tree', label: 'Distributivos' },
              { icon: 'schedule', label: 'Carga horaria' },
              { icon: 'how_to_reg', label: 'Matrículas' },
              { icon: 'grade', label: 'Calificaciones' },
              { icon: 'person_check', label: 'Asistencias' },
              { icon: 'laptop_chromebook', label: 'Aula virtual' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all group shadow-sm cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">
                    {item.icon}
                  </span>
                  <span className="font-bold text-gray-500 text-sm">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-lg">
                  arrow_forward
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </InstitutionLayout>
  );
}
