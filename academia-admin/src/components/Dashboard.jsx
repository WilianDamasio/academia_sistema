import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import TiposAula from './pages/TiposAula'
import Professores from './pages/Professores'
import Alunos from './pages/Alunos'
import Agendamentos from './pages/Agendamentos'
import Disponibilidades from './pages/Disponibilidades'
import Home from './pages/Home'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/':
        return 'Dashboard'
      case '/tipos-aula':
        return 'Tipos de Aula'
      case '/professores':
        return 'Professores'
      case '/alunos':
        return 'Alunos'
      case '/disponibilidades':
        return 'Disponibilidades'
      case '/agendamentos':
        return 'Agendamentos'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getPageTitle()} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tipos-aula" element={<TiposAula />} />
            <Route path="/professores" element={<Professores />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/disponibilidades" element={<Disponibilidades />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

