import { API_BASE_URL } from './app';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  ME: `${API_BASE_URL}/api/auth/me/`,
  INSTITUCIONES: `${API_BASE_URL}/api/instituciones/`,
  INSTITUCION_DETAIL: (id) => `${API_BASE_URL}/api/instituciones/${id}/`,
  AUTORIDADES: (instId) => `${API_BASE_URL}/api/instituciones/${instId}/autoridades/`,
  AUTORIDAD_DETAIL: (instId, asigId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/autoridades/${asigId}/`,
  AUTORIDAD_TOGGLE: (instId, asigId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/autoridades/${asigId}/toggle-activo/`,
  USUARIOS_DISPONIBLES: `${API_BASE_URL}/api/instituciones/usuarios/`,
  MIS_INSTITUCIONES: `${API_BASE_URL}/api/mis-instituciones/`,
  PLANES_ESTUDIO: (instId) => `${API_BASE_URL}/api/instituciones/${instId}/planes/`,
  PLAN_ESTUDIO_DETAIL: (instId, planId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/planes/${planId}/`,
  PLAN_GRADOS: (instId, planId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/planes/${planId}/grados/`,
  PLAN_GRADO_DETAIL: (instId, planId, gradoId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/planes/${planId}/grados/${gradoId}/`,
  GRADO_ASIGNATURAS: (instId, gradoId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/grados/${gradoId}/asignaturas/`,
  GRADO_ASIGNATURA_DETAIL: (instId, gradoId, asigId) =>
    `${API_BASE_URL}/api/instituciones/${instId}/grados/${gradoId}/asignaturas/${asigId}/`,
  NIVELES: `${API_BASE_URL}/api/niveles/`,
  NIVEL_SUBNIVELES: (nivelId) =>
    `${API_BASE_URL}/api/niveles/${nivelId}/subniveles/`,
};
