import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, X, Loader2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { api } from '../lib/api'

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAgendamentos()
  }, [])

  const loadAgendamentos = async () => {
    try {
      const response = await api.get('/aluno/agendamentos')
      setAgendamentos(response.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async (agendamentoId) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return
    }

    setCancelando(agendamentoId)
    
    try {
      await api.put(`/aluno/agendamentos/${agendamentoId}/cancelar`)
      
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso",
      })
      
      loadAgendamentos()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao cancelar agendamento",
        variant: "destructive",
      })
    } finally {
      setCancelando(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR')
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

  const isDataPassada = (data) => {
    if (!data) return false
    const hoje = new Date()
    const dataAula = new Date(data)
    return dataAula < hoje
  }

  const podeSerCancelado = (agendamento) => {
    return agendamento.status === 'confirmado' && !isDataPassada(agendamento.disponibilidade?.data)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado')
  const agendamentosCancelados = agendamentos.filter(a => a.status === 'cancelado')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie seus agendamentos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold text-green-600">{agendamentosConfirmados.length}</div>
            <div className="text-sm text-muted-foreground">Confirmados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-2xl font-bold text-red-600">{agendamentosCancelados.length}</div>
            <div className="text-sm text-muted-foreground">Cancelados</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Agendamentos</CardTitle>
          <CardDescription>
            {agendamentos.length} agendamento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agendamentos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">
                          {agendamento.disponibilidade?.tipo_aula?.nome || 'Aula'}
                        </h3>
                        {getStatusBadge(agendamento.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Professor: {agendamento.disponibilidade?.professor?.nome || 'N/A'}
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Data: {formatDate(agendamento.disponibilidade?.data)}
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Horário: {formatTime(agendamento.disponibilidade?.hora_inicio)} - {formatTime(agendamento.disponibilidade?.hora_fim)}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          Agendado em: {formatDateTime(agendamento.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {podeSerCancelado(agendamento) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelar(agendamento.id)}
                        disabled={cancelando === agendamento.id}
                      >
                        {cancelando === agendamento.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="mr-1 h-4 w-4" />
                            Cancelar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

