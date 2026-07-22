import api from './api';
import { ENDPOINTS } from '../config/endpoints';

export const planesEstudioService = {
  listar: (instId, { page = 1, page_size = 5, search = '', ordering = '' } = {}) =>
    api.get(ENDPOINTS.PLANES_ESTUDIO(instId), {
      params: { page, page_size, search, ordering },
    }),

  crear: (instId, data) => api.post(ENDPOINTS.PLANES_ESTUDIO(instId), data),

  obtener: (instId, planId) =>
    api.get(ENDPOINTS.PLAN_ESTUDIO_DETAIL(instId, planId)),

  actualizar: (instId, planId, data) =>
    api.patch(ENDPOINTS.PLAN_ESTUDIO_DETAIL(instId, planId), data),

  eliminar: (instId, planId) =>
    api.delete(ENDPOINTS.PLAN_ESTUDIO_DETAIL(instId, planId)),
};

export const gradosEscolaresService = {
  listar: (instId, planId, { page = 1, page_size = 5, search = '', ordering = '' } = {}) =>
    api.get(ENDPOINTS.PLAN_GRADOS(instId, planId), {
      params: { page, page_size, search, ordering },
    }),

  crear: (instId, planId, data) =>
    api.post(ENDPOINTS.PLAN_GRADOS(instId, planId), data),

  actualizar: (instId, planId, gradoId, data) =>
    api.patch(ENDPOINTS.PLAN_GRADO_DETAIL(instId, planId, gradoId), data),

  eliminar: (instId, planId, gradoId) =>
    api.delete(ENDPOINTS.PLAN_GRADO_DETAIL(instId, planId, gradoId)),
};

export const asignaturasService = {
  listar: (instId, gradoId) =>
    api.get(ENDPOINTS.GRADO_ASIGNATURAS(instId, gradoId)),

  crear: (instId, gradoId, data) =>
    api.post(ENDPOINTS.GRADO_ASIGNATURAS(instId, gradoId), data),

  actualizar: (instId, gradoId, asigId, data) =>
    api.patch(ENDPOINTS.GRADO_ASIGNATURA_DETAIL(instId, gradoId, asigId), data),

  eliminar: (instId, gradoId, asigId) =>
    api.delete(ENDPOINTS.GRADO_ASIGNATURA_DETAIL(instId, gradoId, asigId)),
};

export const nivelesService = {
  listar: () => api.get(ENDPOINTS.NIVELES),

  subniveles: (nivelId) => api.get(ENDPOINTS.NIVEL_SUBNIVELES(nivelId)),
};
