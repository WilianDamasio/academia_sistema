import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '../../lib/api'

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAgendamentos()
  }, [])

  const loadAgendamentos = async () => {
    try {
      const response = await api.get('/admin/agendamentos')
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

  const handleCancelAgendamento = async (agendamento) => {
    if (!confirm(`Tem certeza que deseja cancelar o agendamento de "${agendamento.aluno?.nome}"?`)) {
      return
    }

    try {
      await api.put(`/admin/agendamentos/${agendamento.id}/cancelar`)
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
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
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
        <h2 className="text-2xl font-bold tracking-tight">Agendamentos</h2>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os agendamentos da academia.
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agendamentos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CalendarCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{agendamentosConfirmados.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{agendamentosCancelados.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agendamentos</CardTitle>
          <CardDescription>
            {agendamentos.length} agendamento(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agendamentos.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Tipo de Aula</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agendado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id}>
                    <TableCell className="font-medium">
                      {agendamento.aluno?.nome || '-'}
                    </TableCell>
                    <TableCell>
                      {agendamento.disponibilidade?.tipo_aula?.nome || '-'}
                    </TableCell>
                    <TableCell>
                      {agendamento.disponibilidade?.professor?.nome || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(agendamento.disponibilidade?.data)}
                    </TableCell>
                    <TableCell>
                      {formatTime(agendamento.disponibilidade?.hora_inicio)} - {formatTime(agendamento.disponibilidade?.hora_fim)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agendamento.status)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(agendamento.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {agendamento.status === 'confirmado' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAgendamento(agendamento)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

