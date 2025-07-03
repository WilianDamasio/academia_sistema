import axios from 'axios';

// Configuração base da API
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- PASSO 1: INTERCEPTOR DE PEDIDO (REQUEST) ---
// Adiciona o token de autenticação a cada pedido antes de ser enviado.
api.interceptors.request.use(
  (config) => {
    // Tenta obter o token do localStorage.
    const token = localStorage.getItem('authToken');
    
    // Se o token existir, anexa-o ao cabeçalho de autorização.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Em caso de erro ao configurar o pedido, rejeita-o.
    return Promise.reject(error);
  }
);

// --- PASSO 2: INTERCEPTOR DE RESPOSTA (RESPONSE) ---
// Trata as respostas globalmente (o seu código já fazia isto).
api.interceptors.response.use(
  (response) => response, // Se a resposta for bem-sucedida (2xx), apenas a retorna.
  (error) => {
    // Se a resposta for um erro 401 (Não Autorizado)...
    if (error.response?.status === 401) {
      // Limpa qualquer token antigo que possa ser inválido.
      localStorage.removeItem('authToken');
      
      // Redireciona o utilizador para a página de login.
      // Evita redirecionar se já estiver na página de login para não criar um loop.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Rejeita a promessa para que o erro possa ser tratado localmente se necessário.
    return Promise.reject(error);
  }
);