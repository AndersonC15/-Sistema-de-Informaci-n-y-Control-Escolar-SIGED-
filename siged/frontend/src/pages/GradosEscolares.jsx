import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InstitutionLayout from '../components/InstitutionLayout';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  gradosEscolaresService,
  asignaturasService,
  nivelesService,
  planesEstudioService,
} from '../services/planificacion';
import { misInstitucionesService } from '../services/instituciones';
import { PAGE_SIZE_GRADOS, SUBJECT_ICONS } from '../config/app';

const PAGE_SIZE = PAGE_SIZE_GRADOS;

export default function GradosEscolares() {
  const { institucionId, planId } = useParams();
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState(null);
  const [plan, setPlan] = useState(null);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ordering, setOrdering] = useState('');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [niveles, setNiveles] = useState([]);
  const [subniveles, setSubniveles] = useState([]);
  const [formData, setFormData] = useState({
    nivel: '', subnivel: '', nombre: '', orden: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loadingAsig, setLoadingAsig] = useState(false);

  const [asigFormOpen, setAsigFormOpen] = useState(false);
  const [editingAsig, setEditingAsig] = useState(null);
  const [asigFormData, setAsigFormData] = useState({ nombre: '', periodos_minimos_semana: 1 });
  const [asigFormErrors, setAsigFormErrors] = useState({});
  const [savingAsig, setSavingAsig] = useState(false);
  const [confirmDeleteAsig, setConfirmDeleteAsig] = useState(null);

  useEffect(() => {
    misInstitucionesService
      .listar()
      .then((res) => {
        const inst = res.data.find((i) => i.id === Number(institucionId));
        setInstitucion(inst || null);
      })
      .catch(() => setInstitucion(null));
    planesEstudioService
      .obtener(institucionId, planId)
      .then((res) => setPlan(res.data))
      .catch(() => setPlan(null));
    nivelesService
      .listar()
      .then((res) => setNiveles(res.data))
      .catch(() => setNiveles([]));
  }, [institucionId, planId]);

  const cargar = useCallback(async (p = 1, s = '', o = '') => {
    setLoading(true);
    try {
      const res = await gradosEscolaresService.listar(institucionId, planId, {
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
  }, [institucionId, planId]);

  useEffect(() => { cargar(1, search, ordering); }, [cargar, search, ordering]);
  useEffect(() => { setPage(1); }, [search, ordering]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const cargarAsignaturas = useCallback(async (grado) => {
    if (!grado) return;
    setLoadingAsig(true);
    try {
      const res = await asignaturasService.listar(institucionId, grado.id);
      setAsignaturas(res.data);
    } catch {
      setAsignaturas([]);
    } finally {
      setLoadingAsig(false);
    }
  }, [institucionId]);

  const verAsignaturas = (grado) => {
    setGradoSeleccionado(grado);
    cargarAsignaturas(grado);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const cargarSubniveles = async (nivelId) => {
    if (!nivelId) {
      setSubniveles([]);
      return;
    }
    try {
      const res = await nivelesService.subniveles(nivelId);
      setSubniveles(res.data);
    } catch {
      setSubniveles([]);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ nivel: '', subnivel: '', nombre: '', orden: 1 });
    setFormErrors({});
    setSubniveles([]);
    setFormOpen(true);
  };

  const openEdit = (grado) => {
    setEditing(grado);
    setFormData({
      nivel: String(grado.nivel),
      subnivel: grado.subnivel ? String(grado.subnivel) : '',
      nombre: grado.nombre,
      orden: grado.orden,
    });
    setFormErrors({});
    cargarSubniveles(grado.nivel);
    setFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!formData.nombre.trim()) {
      setFormErrors({ nombre: ['El nombre es obligatorio.'] });
      return;
    }
    if (!formData.nivel) {
      setFormErrors({ nivel: ['El nivel educativo es obligatorio.'] });
      return;
    }
    if (!formData.orden || formData.orden < 1) {
      setFormErrors({ orden: ['El orden debe ser un entero positivo.'] });
      return;
    }
    setSaving(true);
    const payload = {
      nivel: Number(formData.nivel),
      subnivel: formData.subnivel ? Number(formData.subnivel) : null,
      nombre: formData.nombre,
      orden: Number(formData.orden),
    };
    try {
      if (editing) {
        await gradosEscolaresService.actualizar(
          institucionId, planId, editing.id, payload,
        );
      } else {
        await gradosEscolaresService.crear(institucionId, planId, payload);
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
        setFormErrors({ _form: ['Error al guardar el grado escolar.'] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await gradosEscolaresService.eliminar(institucionId, planId, confirmDelete.id);
      setConfirmDelete(null);
      if (gradoSeleccionado?.id === confirmDelete.id) {
        setGradoSeleccionado(null);
        setAsignaturas([]);
      }
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
    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider border-b border-white/10">
      <button
        onClick={() => toggleOrdering(field)}
        className="flex items-center gap-2 hover:opacity-90"
        type="button"
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-base">{orderIcon(field)}</span>
      </button>
    </th>
  );

  const openCreateAsig = () => {
    setEditingAsig(null);
    setAsigFormData({ nombre: '', periodos_minimos_semana: 1 });
    setAsigFormErrors({});
    setAsigFormOpen(true);
  };

  const openEditAsig = (asig) => {
    setEditingAsig(asig);
    setAsigFormData({
      nombre: asig.nombre,
      periodos_minimos_semana: asig.periodos_minimos_semana,
    });
    setAsigFormErrors({});
    setAsigFormOpen(true);
  };

  const submitAsigForm = async (e) => {
    e.preventDefault();
    setAsigFormErrors({});
    if (!asigFormData.nombre.trim()) {
      setAsigFormErrors({ nombre: ['El nombre es obligatorio.'] });
      return;
    }
    if (!asigFormData.periodos_minimos_semana || asigFormData.periodos_minimos_semana < 1) {
      setAsigFormErrors({
        periodos_minimos_semana: ['Los períodos deben ser mayor a 0.'],
      });
      return;
    }
    setSavingAsig(true);
    const payload = {
      nombre: asigFormData.nombre,
      periodos_minimos_semana: Number(asigFormData.periodos_minimos_semana),
    };
    try {
      if (editingAsig) {
        await asignaturasService.actualizar(
          institucionId, gradoSeleccionado.id, editingAsig.id, payload,
        );
      } else {
        await asignaturasService.crear(
          institucionId, gradoSeleccionado.id, payload,
        );
      }
      setAsigFormOpen(false);
      await cargarAsignaturas(gradoSeleccionado);
      await cargar(page, search, ordering);
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'object' && !Array.isArray(errData)) {
          const flat = {};
          Object.entries(errData).forEach(([k, v]) => {
            flat[k] = Array.isArray(v) ? v.join(' ') : String(v);
          });
          setAsigFormErrors(flat);
        } else {
          setAsigFormErrors({ _form: String(errData) });
        }
      } else {
        setAsigFormErrors({ _form: ['Error al guardar la asignatura.'] });
      }
    } finally {
      setSavingAsig(false);
    }
  };

  const handleDeleteAsig = async () => {
    if (!confirmDeleteAsig) return;
    try {
      await asignaturasService.eliminar(
        institucionId, gradoSeleccionado.id, confirmDeleteAsig.id,
      );
      setConfirmDeleteAsig(null);
      await cargarAsignaturas(gradoSeleccionado);
      await cargar(page, search, ordering);
    } catch {}
  };

  const iconForSubject = (idx) => SUBJECT_ICONS[idx % SUBJECT_ICONS.length];

  return (
    <InstitutionLayout institucionId={institucionId} institucionNombre={institucion?.nombre}>
      <div className="space-y-8 px-8 py-8">
        <section className="relative bg-heading-block border border-gray-200 rounded-sm p-6 text-gray-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-heading-block-border">
          <div className="absolute top-4 right-6 z-20">
            <button
              onClick={() => navigate(`/instituciones/${institucionId}/planes`)}
              className="inline-flex items-center gap-1.5 transition-colors group text-gray-500 hover:text-gray-700"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Volver a Gestión de Planes de estudio
              </span>
            </button>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {institucion?.nombre || ''}
              </span>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Plan: {plan?.nombre || ''}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Gestión de Grados Académicos
            </h2>
            <p className="text-gray-600 text-base">
              Administre los niveles educativos y sus respectivas asignaturas.
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-primary">school</span>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <form onSubmit={submitSearch} className="relative w-full md:max-w-2xl">
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-sm"
          >
            <span className="material-symbols-outlined font-bold">add</span>
            Nuevo Grado
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white text-[11px] font-bold uppercase tracking-wider">
                  <ThSortable field="nombre" label="Nombre" />
                  <ThSortable field="orden" label="Orden" />
                  <ThSortable field="nivel" label="Nivel" />
                  <ThSortable field="subnivel" label="Subnivel" />
                  <th className="py-4 px-6 border-b border-white/10 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No se encontraron grados escolares.
                    </td>
                  </tr>
                ) : (
                  rows.map((grado) => (
                    <tr key={grado.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 font-semibold text-gray-800">
                        {grado.nombre}{' '}
                        <span className="ml-1 text-xs text-gray-400">
                          ({grado.carga_actual_semanal}/{grado.carga_minima_semanal} pp)
                        </span>
                        {grado.alerta_carga && (
                          <span className="ml-2 text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/30 font-bold">
                            Carga insuficiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-bold border border-gray-200">
                          {grado.orden}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {grado.nivel_nombre}
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {grado.subnivel_nombre || '-'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => openEdit(grado)}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-success/10 text-success border border-success/20 rounded-lg transition-colors hover:bg-success hover:text-white"
                          >
                            <span className="material-symbols-outlined text-base font-bold">edit</span>
                            <span className="font-bold text-xs">Editar</span>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(grado)}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-danger/10 text-danger border border-danger/20 rounded-lg transition-colors hover:bg-danger hover:text-white"
                          >
                            <span className="material-symbols-outlined text-base font-bold">delete</span>
                            <span className="font-bold text-xs">Eliminar</span>
                          </button>
                          <button
                            onClick={() => verAsignaturas(grado)}
                            className="text-primary font-bold hover:underline px-2 transition-all"
                          >
                            Ver Asignaturas
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <div className="text-sm text-gray-500 font-medium">
              Mostrando <span className="text-gray-900 font-bold">{rows.length}</span> registros de
              un total de <span className="text-gray-900 font-bold">{count}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { cargar(page - 1, search, ordering).then(() => setPage(page - 1)); }}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-white hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => { cargar(p, search, ordering).then(() => setPage(p)); }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                      p === page
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 text-gray-400 hover:bg-white hover:text-primary transition-all'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => { const np = page + 1; cargar(np, search, ordering).then(() => setPage(np)); }}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-white hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {gradoSeleccionado && (
          <section className="p-8 border border-gray-200 rounded-2xl w-full bg-gray-50 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1.5 bg-primary rounded-full" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Asignaturas Vinculadas
                  </h3>
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-primary">{gradoSeleccionado.nombre}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={openCreateAsig}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all text-sm border border-primary/20"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Nueva Asignatura
              </button>
            </div>

            {gradoSeleccionado.alerta_carga && (
              <div className="mb-6 flex items-center gap-3 bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-lg">
                <span className="material-symbols-outlined text-xl">warning</span>
                <p className="text-sm font-medium">
                  La suma de la carga pedagógica de las asignaturas ({gradoSeleccionado.carga_actual_semanal} pp) es menor que la carga pedagógica mínima semanal definida ({gradoSeleccionado.carga_minima_semanal} pp).
                </p>
              </div>
            )}

            {loadingAsig ? (
              <p className="text-center text-gray-500 py-6">Cargando...</p>
            ) : asignaturas.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="material-symbols-outlined text-5xl text-gray-400">menu_book</span>
                <p className="text-gray-500">No hay asignaturas vinculadas a este grado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {asignaturas.map((asig, idx) => (
                  <div
                    key={asig.id}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">
                          {iconForSubject(idx)}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">{asig.nombre}</h4>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                        Períodos mínimos semanales
                      </span>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-extrabold text-gray-900">
                            {asig.periodos_minimos_semana}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200 uppercase">
                            PP
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEditAsig(asig)}
                            title="Editar"
                            className="p-2 bg-success/10 text-success rounded-lg transition-colors hover:bg-success hover:text-white border border-success/20"
                          >
                            <span className="material-symbols-outlined text-lg font-bold">edit</span>
                          </button>
                          <button
                            onClick={() => setConfirmDeleteAsig(asig)}
                            title="Eliminar"
                            className="p-2 bg-danger/10 text-danger rounded-lg transition-colors hover:bg-danger hover:text-white border border-danger/20"
                          >
                            <span className="material-symbols-outlined text-lg font-bold">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar grado escolar' : 'Nuevo grado escolar'}
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
              placeholder="Nombre del grado escolar"
            />
            {formErrors.nombre && (
              <p className="text-danger text-[12px]">{formErrors.nombre}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                Orden <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.orden}
                onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
              />
              {formErrors.orden && (
                <p className="text-danger text-[12px]">{formErrors.orden}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                Nivel educativo <span className="text-danger">*</span>
              </label>
              <select
                value={formData.nivel}
                onChange={(e) => {
                  setFormData({ ...formData, nivel: e.target.value, subnivel: '' });
                  cargarSubniveles(e.target.value);
                }}
                disabled={!!editing}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 disabled:bg-gray-100"
              >
                <option value="">Seleccione un nivel</option>
                {niveles.map((n) => (
                  <option key={n.id} value={n.id}>{n.nombre}</option>
                ))}
              </select>
              {formErrors.nivel && (
                <p className="text-danger text-[12px]">{formErrors.nivel}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
              Subnivel educativo
            </label>
            <select
              value={formData.subnivel}
              onChange={(e) => setFormData({ ...formData, subnivel: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
            >
              <option value="">Sin subnivel</option>
              {subniveles.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <p className="text-[12px] text-gray-500">
              {subniveles.length === 0
                ? 'No hay subniveles disponibles para el nivel seleccionado.'
                : 'Seleccione el subnivel si aplica al nivel educativo.'}
            </p>
            {formErrors.subnivel && (
              <p className="text-danger text-[12px]">{formErrors.subnivel}</p>
            )}
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

      <Modal
        open={asigFormOpen}
        onClose={() => setAsigFormOpen(false)}
        title={editingAsig ? 'Editar asignatura' : 'Nueva asignatura'}
        maxWidth="max-w-md"
      >
        <form onSubmit={submitAsigForm} className="space-y-5">
          {asigFormErrors._form && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-sm">
              {asigFormErrors._form}
            </div>
          )}
          {asigFormErrors.error && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-sm">
              {asigFormErrors.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={asigFormData.nombre}
              onChange={(e) => setAsigFormData({ ...asigFormData, nombre: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
              placeholder="Nombre de la asignatura"
            />
            {asigFormErrors.nombre && (
              <p className="text-danger text-[12px]">{asigFormErrors.nombre}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
              Períodos pedagógicos mínimos semanales <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={asigFormData.periodos_minimos_semana}
              onChange={(e) => setAsigFormData({ ...asigFormData, periodos_minimos_semana: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
            />
            {asigFormErrors.periodos_minimos_semana && (
              <p className="text-danger text-[12px]">
                {asigFormErrors.periodos_minimos_semana}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAsigFormOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingAsig}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:brightness-90 transition-all disabled:opacity-50"
            >
              {savingAsig ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar grado escolar"
        message={`¿Está seguro de eliminar el grado "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />

      <ConfirmDialog
        open={!!confirmDeleteAsig}
        onClose={() => setConfirmDeleteAsig(null)}
        onConfirm={handleDeleteAsig}
        title="Eliminar asignatura"
        message={`¿Está seguro de eliminar la asignatura "${confirmDeleteAsig?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </InstitutionLayout>
  );
}
