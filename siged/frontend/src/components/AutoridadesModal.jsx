import { useState, useCallback } from 'react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { institucionesService } from '../services/instituciones';

export default function AutoridadesModal({
  open, onClose, institucionId, onChange,
}) {
  const [autoridades, setAutoridades] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState(null);
  const [formData, setFormData] = useState({
    usuario: '', fecha_inicio: '', fecha_fin: '', activo: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cargarData = useCallback(async () => {
    if (!institucionId) return;
    setLoading(true);
    try {
      const [autRes, usrRes] = await Promise.all([
        institucionesService.listarAutoridades(institucionId),
        institucionesService.usuariosDisponibles(),
      ]);
      setAutoridades(autRes.data);
      setUsuarios(usrRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [institucionId]);

  const openCreate = () => {
    setEditingAsignacion(null);
    setFormData({
      usuario: '',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      fecha_fin: '',
      activo: true,
    });
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (asignacion) => {
    setEditingAsignacion(asignacion);
    setFormData({
      usuario: asignacion.usuario,
      fecha_inicio: asignacion.fecha_inicio || '',
      fecha_fin: asignacion.fecha_fin || '',
      activo: asignacion.activo,
    });
    setErrors({});
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.usuario) {
      setErrors({ usuario: ['Seleccione un usuario.'] });
      return;
    }
    if (!formData.fecha_inicio) {
      setErrors({ fecha_inicio: ['La fecha de inicio es obligatoria.'] });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        usuario: formData.usuario,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin || null,
        activo: formData.activo,
      };
      if (editingAsignacion) {
        await institucionesService.actualizarAutoridad(
          institucionId, editingAsignacion.id, payload,
        );
      } else {
        await institucionesService.crearAutoridad(institucionId, payload);
      }
      setFormOpen(false);
      await cargarData();
      onChange?.();
    } catch (err) {
      const errData = err.response?.data;
      if (errData) {
        if (typeof errData === 'object') {
          setErrors(errData);
        } else {
          setErrors({ _form: [String(errData)] });
        }
      } else {
        setErrors({ _form: ['Error al guardar la autoridad.'] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await institucionesService.eliminarAutoridad(
        institucionId, confirmDelete.id,
      );
      setConfirmDelete(null);
      await cargarData();
      onChange?.();
    } catch {}
  };

  const handleToggle = async (asignacion) => {
    try {
      await institucionesService.toggleActivoAutoridad(
        institucionId, asignacion.id,
      );
      await cargarData();
      onChange?.();
    } catch {}
  };

  return (
    <Modal
      open={open}
      onClose={() => { setFormOpen(false); setConfirmDelete(null); onClose(); }}
      title="Gestión de autoridades académicas"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        <div className="flex justify-end">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-[14px] hover:brightness-90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Asignar autoridad
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Cargando...</p>
        ) : autoridades.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <span className="material-symbols-outlined text-5xl text-gray-400">groups</span>
            <p className="text-gray-500">No hay autoridades académicas asignadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {autoridades.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    account_circle
                  </span>
                  <div>
                    <p className="font-bold text-gray-900 text-[15px]">
                      {a.usuario_nombre}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      {a.usuario_numero_identificacion} · {a.rol_nombre}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                      <span>
                        <span className="material-symbols-outlined text-[14px] align-middle">event</span>
                        Inicio: {a.fecha_inicio || '—'}
                      </span>
                      <span>
                        Fin: {a.fecha_fin || '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggle(a)}
                    className={`px-3 py-1.5 rounded text-[13px] font-bold transition-colors ${
                      a.activo
                        ? 'bg-success/10 text-success hover:bg-success hover:text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-400 hover:text-white'
                    }`}
                  >
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    className="flex items-center gap-1 bg-success/10 text-success px-3 py-1.5 rounded text-[13px] font-bold hover:bg-success hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(a)}
                    className="flex items-center gap-1 bg-danger/10 text-danger px-3 py-1.5 rounded text-[13px] font-bold hover:bg-danger hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title={editingAsignacion ? 'Editar autoridad académica' : 'Asignar autoridad académica'}
          maxWidth="max-w-lg"
        >
          <form onSubmit={submit} className="space-y-5">
            {errors._form && (
              <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-lg text-sm">
                {errors._form}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                Usuario <span className="text-danger">*</span>
              </label>
              <select
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                disabled={!!editingAsignacion}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800 disabled:bg-gray-100"
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo} ({u.numero_identificacion})
                  </option>
                ))}
              </select>
              {errors.usuario && (
                <p className="text-danger text-[12px]">{errors.usuario}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                  Fecha de inicio <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                />
                {errors.fecha_inicio && (
                  <p className="text-danger text-[12px]">{errors.fecha_inicio}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-800 text-sm uppercase tracking-wider">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-800"
                />
                {errors.fecha_fin && (
                  <p className="text-danger text-[12px]">{errors.fecha_fin}</p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-medium text-gray-800">Asignación activa</span>
            </label>

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
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar asignación"
        message={`¿Está seguro de eliminar la asignación de "${confirmDelete?.usuario_nombre}" como autoridad académica de esta institución?`}
        confirmLabel="Eliminar"
        danger
      />
    </Modal>
  );
}
