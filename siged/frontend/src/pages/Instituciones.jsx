import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AutoridadesModal from '../components/AutoridadesModal';
import { institucionesService } from '../services/instituciones';
import { PAGE_SIZE } from '../config/app';

export default function Instituciones() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ordering, setOrdering] = useState('');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', codigo: '', ruc: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [modalAutoridades, setModalAutoridades] = useState(null);

  const cargar = useCallback(async (p = 1, s = '', o = '') => {
    setLoading(true);
    try {
      const res = await institucionesService.listar({
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
  }, []);

  useEffect(() => { cargar(1, search, ordering); }, [cargar, search, ordering]);
  useEffect(() => { setPage(1); }, [search, ordering]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ nombre: '', codigo: '', ruc: '' });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (inst) => {
    setEditing(inst);
    setFormData({ nombre: inst.nombre, codigo: inst.codigo, ruc: inst.ruc });
    setFormErrors({});
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!formData.nombre.trim() || !formData.codigo.trim() || !formData.ruc.trim()) {
      setFormErrors({ _form: ['Todos los campos son obligatorios.'] });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await institucionesService.actualizar(editing.id, formData);
      } else {
        await institucionesService.crear(formData);
      }
      setFormOpen(false);
      await cargar(page, search, ordering);
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        setFormErrors(typeof errData === 'object' ? errData : { _form: [String(errData)] });
      } else {
        setFormErrors({ _form: ['Error al guardar la institución.'] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await institucionesService.eliminar(confirmDelete.id);
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
    <th className="px-6 py-6 font-bold text-[15px] uppercase tracking-wider border-r border-white/10">
      <button
        onClick={() => toggleOrdering(field)}
        className="flex items-center gap-2 hover:opacity-90"
        type="button"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-lg opacity-70">
          {orderIcon(field)}
        </span>
      </button>
    </th>
  );

  return (
    <Layout>
      <div className="space-y-8 px-8 py-8">
        <section className="relative bg-heading-block border border-gray-200 rounded-sm p-6 text-gray-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-heading-block-border">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-1 tracking-tight text-gray-900">
              Gestión de instituciones educativas
            </h2>
            <p className="text-gray-600 text-base">
              Administra los datos principales y autoridades académicas de las instituciones
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-primary">school</span>
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
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg font-bold hover:shadow-lg hover:brightness-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nueva institución</span>
          </button>
        </div>

        <div className="mt-4 border border-gray-200 rounded-sm overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <ThSortable field="nombre" label="Nombre de la institución" />
                  <ThSortable field="codigo" label="Código" />
                  <ThSortable field="ruc" label="RUC" />
                  <th className="px-6 py-6 font-bold text-[15px] uppercase tracking-wider">
                    Autoridades académicas
                  </th>
                  <th className="px-6 py-6 font-bold text-[15px] uppercase tracking-wider text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No se encontraron instituciones.
                    </td>
                  </tr>
                ) : (
                  rows.map((inst) => (
                    <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="font-bold text-gray-800 text-[15px]">
                          {inst.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600 font-medium">
                        {inst.codigo}
                      </td>
                      <td className="px-6 py-5 text-gray-600 font-medium">
                        {inst.ruc}
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-wrap gap-2">
                            {inst.autoridades_activas.length === 0 ? (
                              <span className="text-[13px] text-gray-400 italic">
                                Sin autoridades activas
                              </span>
                            ) : (
                              inst.autoridades_activas.map((a) => (
                                <div
                                  key={a.id}
                                  className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 w-48"
                                >
                                  <span className="material-symbols-outlined text-[18px] text-gray-500">
                                    account_circle
                                  </span>
                                  <span className="text-gray-800 font-medium text-[13px] truncate block flex-1">
                                    {a.usuario_nombre}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                          <button
                            onClick={() => setModalAutoridades(inst)}
                            className="flex items-center gap-1 text-primary text-[13px] font-bold hover:underline ml-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">settings</span>
                            <span>Gestionar</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(inst)}
                            className="flex items-center gap-2 bg-success/10 text-success px-4 py-1.5 rounded text-[13px] font-bold hover:bg-success hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(inst)}
                            className="flex items-center gap-2 bg-danger/10 text-danger px-4 py-1.5 rounded text-[13px] font-bold hover:bg-danger hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
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

          <div className="p-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Mostrando{' '}
              <span className="bg-gray-100 px-1 font-bold text-gray-800 rounded">
                {rows.length}
              </span>{' '}
              registros de un total de {count}
            </p>
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => cargar(p, search, ordering).then(() => setPage(p))}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => {
                  const np = page + 1;
                  cargar(np, search, ordering).then(() => setPage(np));
                }}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar institución' : 'Nueva institución educativa'}
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
              placeholder="Nombre de la institución"
            />
            {formErrors.nombre && (
              <p className="text-danger text-[12px]">{formErrors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                Código <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                placeholder="Código AMIE"
              />
              {formErrors.codigo && (
                <p className="text-danger text-[12px]">{formErrors.codigo}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                RUC <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                placeholder="RUC de la institución"
              />
              {formErrors.ruc && (
                <p className="text-danger text-[12px]">{formErrors.ruc}</p>
              )}
            </div>
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
        title="Eliminar institución"
        message={`¿Está seguro de eliminar la institución "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />

      <AutoridadesModal
        open={!!modalAutoridades}
        onClose={() => setModalAutoridades(null)}
        institucionId={modalAutoridades?.id}
        onChange={() => cargar(page, search, ordering)}
      />
    </Layout>
  );
}
