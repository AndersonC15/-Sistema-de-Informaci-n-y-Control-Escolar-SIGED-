import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstitutionLayout from '../components/InstitutionLayout';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { planesEstudioService } from '../services/planificacion';
import { misInstitucionesService } from '../services/instituciones';
import { PAGE_SIZE_PLANES } from '../config/app';

const PAGE_SIZE = PAGE_SIZE_PLANES;

export default function PlanesEstudio() {
  const { institucionId } = useParams();
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState(null);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ordering, setOrdering] = useState('');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', estado: 'NO_VIGENTE' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    misInstitucionesService
      .listar()
      .then((res) => {
        const inst = res.data.find((i) => i.id === Number(institucionId));
        setInstitucion(inst || null);
      })
      .catch(() => setInstitucion(null));
  }, [institucionId]);

  const cargar = useCallback(async (p = 1, s = '', o = '') => {
    setLoading(true);
    try {
      const res = await planesEstudioService.listar(institucionId, {
        page: p, page_size: PAGE_SIZE, search: s, ordering: o,
      });
      setRows(res.data.results);
      setCount(res.data.count);
    } catch {
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [institucionId]);

  useEffect(() => { cargar(1, search, ordering); }, [cargar, search, ordering]);
  useEffect(() => { setPage(1); }, [search, ordering]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ nombre: '', estado: 'NO_VIGENTE' });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setFormData({ nombre: plan.nombre, estado: plan.estado });
    setFormErrors({});
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!formData.nombre.trim()) {
      setFormErrors({ nombre: ['El nombre es obligatorio.'] });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await planesEstudioService.actualizar(institucionId, editing.id, formData);
      } else {
        await planesEstudioService.crear(institucionId, formData);
      }
      setFormOpen(false);
      await cargar(page, search, ordering);
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'object' && !Array.isArray(errData)) {
          const flat = {};
          Object.entries(errData).forEach(([k, v]) => {
            flat[k] = Array.isArray(v) ? v.join(' ') : String(v);
          });
          setFormErrors(flat);
        } else {
          setFormErrors({ _form: String(errData) });
        }
      } else {
        setFormErrors({ _form: ['Error al guardar el plan.'] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await planesEstudioService.eliminar(institucionId, confirmDelete.id);
      setConfirmDelete(null);
      const newPage = rows.length === 1 && page > 1 ? page - 1 : page;
      await cargar(newPage, search, ordering);
    } catch {}
  };

  const toggleOrdering = (field) => {
    if (ordering === field) setOrdering(`-${field}`);
    else if (ordering === `-${field}`) setOrdering('');
    else setOrdering(field);
  };

  const orderIcon = (field) => {
    if (ordering === field) return 'arrow_upward';
    if (ordering === `-${field}`) return 'arrow_downward';
    return 'unfold_more';
  };

  const ThSortable = ({ field, label }) => (
    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-white">
      <button
        onClick={() => toggleOrdering(field)}
        className="flex items-center gap-2 hover:opacity-90"
        type="button"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-sm opacity-70">
          {orderIcon(field)}
        </span>
      </button>
    </th>
  );

  return (
    <InstitutionLayout institucionId={institucionId} institucionNombre={institucion?.nombre}>
      <div className="space-y-8 px-8 py-8">
        <section className="relative bg-heading-block border border-gray-200 rounded-sm p-8 text-gray-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-heading-block-border">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">school</span>
              {institucion?.nombre || ''}
            </p>
            <h2 className="text-3xl font-bold mb-1 tracking-tight text-gray-900">
              Gestión de Planes de Estudio
            </h2>
            <p className="text-gray-600 text-base">
              Administre los planes de estudio de la institución
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
            <span className="material-symbols-outlined text-[120px] text-primary">school</span>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2">
          <form onSubmit={submitSearch} className="relative w-full md:max-w-xl">
            <input
              className="w-full pl-6 pr-14 py-3.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 placeholder:text-gray-400 transition-all"
              placeholder="Buscar por nombre..."
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 hover:brightness-95 transition"
            >
              <span className="material-symbols-outlined text-xl font-bold">search</span>
            </button>
          </form>

          <button
            onClick={openCreate}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nuevo Plan</span>
          </button>
        </div>

        <div className="bg-white border border-gray-200 overflow-hidden shadow-sm rounded-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <ThSortable field="nombre" label="Nombre del Plan" />
                  <ThSortable field="estado" label="Estado" />
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-white text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-10 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-10 text-center text-gray-500">
                      No se encontraron planes de estudio.
                    </td>
                  </tr>
                ) : (
                  rows.map((plan) => (
                    <tr key={plan.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary rounded-sm">
                            <span className="material-symbols-outlined">auto_stories</span>
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{plan.nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {plan.estado === 'VIGENTE' ? (
                          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-fit">
                            <span
                              className="material-symbols-outlined text-lg mr-1.5"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              location_on
                            </span>
                            Vigente
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit block">
                            No vigente
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() =>
                              navigate(`/instituciones/${institucionId}/planes/${plan.id}/grados`)
                            }
                            className="bg-primary/10 text-primary px-5 py-2 rounded-xl text-[11px] font-bold hover:bg-primary hover:text-white transition-all"
                          >
                            Grados escolares
                          </button>
                          <button
                            onClick={() => openEdit(plan)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-success/10 text-success hover:bg-success hover:text-white rounded-xl text-[11px] font-bold transition-all border border-success/10"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(plan)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-xl text-[11px] font-bold transition-all border border-danger/10"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <div className="text-[13px] text-gray-500 font-medium">
              Mostrando <span className="font-bold text-gray-800">{rows.length}</span>{' '}
              registros de un total de <span className="font-bold text-gray-800">{count}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { cargar(page - 1, search, ordering).then(() => setPage(page - 1)); }}
                disabled={page <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => { cargar(p, search, ordering).then(() => setPage(p)); }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-[13px] font-bold ${
                      p === page
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => { const np = page + 1; cargar(np, search, ordering).then(() => setPage(np)); }}
                disabled={page >= totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar plan de estudio' : 'Nuevo plan de estudio'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={submitForm} className="space-y-5">
          {formErrors._form && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-sm">
              {formErrors._form}
            </div>
          )}
          {formErrors.error && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-sm">
              {formErrors.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
              placeholder="Nombre del plan de estudio"
            />
            {formErrors.nombre && (
              <p className="text-danger text-[12px]">{formErrors.nombre}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
              Estado <span className="text-danger">*</span>
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
            >
              <option value="NO_VIGENTE">No vigente</option>
              <option value="VIGENTE">Vigente</option>
            </select>
            <p className="text-[12px] text-gray-500">
              Solo puede existir un plan vigente por institución. Al marcar como vigente, los demás pasarán automáticamente a no vigente.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:brightness-90 transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar plan de estudio"
        message={`¿Está seguro de eliminar el plan "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </InstitutionLayout>
  );
}
