import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, Calendar } from 'lucide-react'

export default function BottomNavigation() {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Início'
    },
    {
      path: '/agendar',
      icon: Plus,
      label: 'Agendar'
    },
    {
      path: '/agendamentos',
      icon: Calendar,
      label: 'Agendamentos'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

