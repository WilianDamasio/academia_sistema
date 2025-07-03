import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'
import AgendarAula from './components/AgendarAula'
import MeusAgendamentos from './components/MeusAgendamentos'
import BottomNavigation from './components/BottomNavigation'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agendar" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AgendarAula />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agendamentos" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeusAgendamentos />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

