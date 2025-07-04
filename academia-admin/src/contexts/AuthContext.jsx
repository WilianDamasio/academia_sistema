import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')

      if (response.data.user && response.data.user_type === 'admin') {
        setUser(response.data.user)
      }
    } catch (error) {
      console.log('Não autenticado')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login/admin', { email, password })
     if (response.data.token && response.data.user) {
        // ARMAZENA O TOKEN NO LOCALSTORAGE
        localStorage.setItem('authToken', response.data.token);
        
        setUser(response.data.user);

        //checkAuth()

        return { success: true };
      } else {
        throw new Error('Resposta de login inválida do servidor');
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      }
    }
  }

  const logout = async () => {

     localStorage.removeItem('authToken');

    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.log('Erro ao fazer logout')
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

