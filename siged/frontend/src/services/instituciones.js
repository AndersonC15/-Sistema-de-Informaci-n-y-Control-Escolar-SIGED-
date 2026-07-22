import api from './api';
import { ENDPOINTS } from '../config/endpoints';

export const institucionesService = {
  listar: ({ page = 1, page_size = 6, search = '', ordering = '' } = {}) =>
    api.get(ENDPOINTS.INSTITUCIONES, {
      params: { page, page_size, search, ordering },
    }),

  crear: (data) => api.post(ENDPOINTS.INSTITUCIONES, data),

  obtener: (id) => api.get(ENDPOINTS.INSTITUCION_DETAIL(id)),

  actualizar: (id, data) =>
    api.patch(ENDPOINTS.INSTITUCION_DETAIL(id), data),

  eliminar: (id) => api.delete(ENDPOINTS.INSTITUCION_DETAIL(id)),

  listarAutoridades: (instId) => api.get(ENDPOINTS.AUTORIDADES(instId)),

  crearAutoridad: (instId, data) =>
    api.post(ENDPOINTS.AUTORIDADES(instId), data),

  actualizarAutoridad: (instId, asigId, data) =>
    api.patch(ENDPOINTS.AUTORIDAD_DETAIL(instId, asigId), data),

  eliminarAutoridad: (instId, asigId) =>
    api.delete(ENDPOINTS.AUTORIDAD_DETAIL(instId, asigId)),

  toggleActivoAutoridad: (instId, asigId) =>
    api.post(ENDPOINTS.AUTORIDAD_TOGGLE(instId, asigId)),

  usuariosDisponibles: () => api.get(ENDPOINTS.USUARIOS_DISPONIBLES),
};

export const misInstitucionesService = {
  listar: () => api.get(ENDPOINTS.MIS_INSTITUCIONES),
};
