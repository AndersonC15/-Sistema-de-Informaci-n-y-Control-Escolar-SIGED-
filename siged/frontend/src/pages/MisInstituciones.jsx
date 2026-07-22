import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { misInstitucionesService } from '../services/instituciones';

export default function MisInstituciones() {
  const navigate = useNavigate();
  const [instituciones, setInstituciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    misInstitucionesService
      .listar()
      .then((res) => setInstituciones(res.data))
      .catch(() => setInstituciones([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="space-y-8 px-8 py-8">
        <section className="relative bg-heading-block border border-gray-200 rounded-sm p-6 text-gray-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-heading-block-border">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-1 tracking-tight text-gray-900">
              Mis instituciones
            </h2>
            <p className="text-gray-600 text-base">
              Acceda y gestione sus instituciones educativas asignadas.
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-primary">school</span>
          </div>
        </section>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Cargando...</p>
        ) : instituciones.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <span className="material-symbols-outlined text-6xl text-gray-400">school</span>
            <p className="text-gray-500 text-lg">
              No tiene instituciones educativas asignadas activamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {instituciones.map((inst) => (
              <div
                key={inst.id}
                className="bg-white border border-gray-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow h-full min-h-[300px]"
              >
                <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center flex-grow justify-center">
                  <div className="mb-6">
                    <span className="material-symbols-outlined text-7xl text-gray-800">
                      school
                    </span>
                  </div>
                  <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
                    {inst.nombre}
                  </h3>
                  <p className="text-[13px] text-gray-500 mt-2">Código AMIE: {inst.codigo}</p>
                </div>
                <button
                  onClick={() => navigate(`/instituciones/${inst.id}`)}
                  className="w-full bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:brightness-90 transition-colors mt-auto"
                >
                  Ingresar
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'wght' 700" }}
                  >
                    check
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
