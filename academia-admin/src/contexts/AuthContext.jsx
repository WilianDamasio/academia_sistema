import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/lib/api'; // Certifique-se de que o caminho está correto

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o Provedor do Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Adiciona estado de loading

  // 3. EFEITO DE INICIALIZAÇÃO: A MÁGICA ACONTECE AQUI
  useEffect(() => {
    const initializeAuth = async () => {
      // Pega o token do localStorage
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          // Se existir um token, tenta buscar os dados do utilizador
          const response = await api.get('/auth/me'); // A rota protegida
          setUser(response.data); // Define o utilizador no estado
        } catch (error) {
          // Se o token for inválido ou expirado, limpa tudo
          console.error("Falha na autenticação com token guardado:", error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      // Marca o loading como falso após a verificação
      setLoading(false);
    };

    initializeAuth();
  }, []); // O array vazio [] garante que isto só corre uma vez, quando o componente monta

  // Função de Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        // Guarda o token e define o utilizador
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Falha no login:", error);
      return false;
    }
  };

  // Função de Logout
  const logout = () => {
    // Limpa o estado e o localStorage
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // 4. Fornece os valores para os componentes filhos
  const value = {
    user,
    isAuthenticated: !!user, // Um booleano para verificar facilmente se está autenticado
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Cria um Hook customizado para usar o contexto facilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};