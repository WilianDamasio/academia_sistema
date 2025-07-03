import axios from 'axios'

// Configuração base da API
export const api = axios.create({
  baseURL: 'https://w5hni7cond93.manus.space/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não autenticado
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

