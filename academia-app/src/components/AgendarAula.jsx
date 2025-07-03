import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Clock, User, Users, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { api } from '../lib/api'

export default function AgendarAula() {
  const [tiposAula, setTiposAula] = useState([])
  const [disponibilidades, setDisponibilidades] = useState([])
  const [tipoSelecionado, setTipoSelecionado] = useState('')
  const [loading, setLoading] = useState(true)
  const [agendando, setAgendando] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTiposAula()
  }, [])

  useEffect(() => {
    if (tipoSelecionado) {
      loadDisponibilidades()
    }
  }, [tipoSelecionado])

  const loadTiposAula = async () => {
    try {
      const response = await api.get('/aluno/tipos-aula')
      setTiposAula(response.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar tipos de aula",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDisponibilidades = async () => {
    try {
      const response = await api.get(`/aluno/disponibilidades?tipo_aula_id=${tipoSelecionado}`)
      setDisponibilidades(response.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar disponibilidades",
        variant: "destructive",
      })
    }
  }

  const handleAgendar = async (disponibilidadeId) => {
    setAgendando(true)
    
    try {
      await api.post('/aluno/agendamentos', {
        disponibilidade_id: disponibilidadeId
      })
      
      toast({
        title: "Sucesso",
        description: "Aula agendada com sucesso!",
      })
      
      // Recarregar disponibilidades para atualizar vagas
      loadDisponibilidades()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao agendar aula",
        variant: "destructive",
      })
    } finally {
      setAgendando(false)
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

  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return timeString
  }

  const getVagasDisponiveis = (disponibilidade) => {
    return disponibilidade.vagas_total - disponibilidade.vagas_ocupadas
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agendar Aula</h1>
        <p className="text-muted-foreground">
          Escolha o tipo de aula e horário desejado
        </p>
      </div>

      {/* Seleção do Tipo de Aula */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Aula</CardTitle>
          <CardDescription>
            Selecione o tipo de aula que deseja agendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo de aula" />
            </SelectTrigger>
            <SelectContent>
              {tiposAula.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                  {tipo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Horários Disponíveis */}
      {tipoSelecionado && (
        <Card>
          <CardHeader>
            <CardTitle>Horários Disponíveis</CardTitle>
            <CardDescription>
              Escolha um horário para sua aula
            </CardDescription>
          </CardHeader>
          <CardContent>
            {disponibilidades.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum horário disponível para este tipo de aula.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {disponibilidades.map((disponibilidade) => {
                  const vagasDisponiveis = getVagasDisponiveis(disponibilidade)
                  const temVagas = vagasDisponiveis > 0
                  
                  return (
                    <div 
                      key={disponibilidade.id} 
                      className={`p-4 border rounded-lg ${!temVagas ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium mb-2">
                            {formatDate(disponibilidade.data)}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatTime(disponibilidade.hora_inicio)} - {formatTime(disponibilidade.hora_fim)}
                            </div>
                            
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4" />
                              {disponibilidade.professor?.nome || 'Professor'}
                            </div>
                            
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {vagasDisponiveis} vagas
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {temVagas ? (
                            <Badge variant="default">Disponível</Badge>
                          ) : (
                            <Badge variant="secondary">Lotado</Badge>
                          )}
                          
                          <Button
                            onClick={() => handleAgendar(disponibilidade.id)}
                            disabled={!temVagas || agendando}
                            size="sm"
                          >
                            {agendando ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : temVagas ? (
                              <>
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Agendar
                              </>
                            ) : (
                              'Indisponível'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

