import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Plus, CalendarCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

export default function HomePage() {
  const { user, logout } = useAuth()
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAgendamentos()
  }, [])

  const loadAgendamentos = async () => {
    try {
      const response = await api.get('/aluno/agendamentos')
      // Pegar apenas os próximos 3 agendamentos
      setAgendamentos(response.data.slice(0, 3))
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return timeString
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <Badge variant="default">Confirmado</Badge>
      case 'cancelado':
        return <Badge variant="secondary">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user?.nome}!</h1>
          <p className="text-muted-foreground">Bem-vindo de volta à academia</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Sair
        </Button>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/agendar">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Plus className="h-8 w-8 text-primary mb-2" />
              <span className="font-medium">Agendar Aula</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/agendamentos">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <CalendarCheck className="h-8 w-8 text-primary mb-2" />
              <span className="font-medium">Meus Agendamentos</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
          <CardDescription>
            Suas próximas aulas agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
              <Link to="/agendar">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Primeira Aula
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {agendamento.disponibilidade?.tipo_aula?.nome || 'Aula'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <User className="mr-1 h-3 w-3" />
                      {agendamento.disponibilidade?.professor?.nome || 'Professor'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(agendamento.disponibilidade?.data)}
                      <Clock className="ml-2 mr-1 h-3 w-3" />
                      {formatTime(agendamento.disponibilidade?.hora_inicio)} - {formatTime(agendamento.disponibilidade?.hora_fim)}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(agendamento.status)}
                  </div>
                </div>
              ))}
              
              {agendamentos.length > 0 && (
                <div className="text-center pt-4">
                  <Link to="/agendamentos">
                    <Button variant="outline">Ver Todos</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

