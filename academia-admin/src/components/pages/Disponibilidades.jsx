import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Plus, Trash2, Loader2, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '../../lib/api'

export default function Disponibilidades() {
  const [disponibilidades, setDisponibilidades] = useState([])
  const [tiposAula, setTiposAula] = useState([])
  const [professores, setProfessores] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    data: '',
    hora_inicio: '',
    hora_fim: '',
    vagas_total: '',
    tipo_aula_id: '',
    professor_id: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dispRes, tiposRes, profRes] = await Promise.all([
        api.get('/admin/disponibilidades'),
        api.get('/admin/tipos-aula'),
        api.get('/admin/professores')
      ])
      
      setDisponibilidades(dispRes.data)
      setTiposAula(tiposRes.data)
      setProfessores(profRes.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post('/admin/disponibilidades', {
        ...formData,
        vagas_total: parseInt(formData.vagas_total)
      })
      
      toast({
        title: "Sucesso",
        description: "Disponibilidade criada com sucesso",
      })
      
      setDialogOpen(false)
      setFormData({
        data: '',
        hora_inicio: '',
        hora_fim: '',
        vagas_total: '',
        tipo_aula_id: '',
        professor_id: ''
      })
      loadData()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao criar disponibilidade",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (disponibilidade) => {
    if (!confirm(`Tem certeza que deseja remover esta disponibilidade?`)) {
      return
    }

    try {
      await api.delete(`/admin/disponibilidades/${disponibilidade.id}`)
      toast({
        title: "Sucesso",
        description: "Disponibilidade removida com sucesso",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao remover disponibilidade",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = () => {
    setFormData({
      data: '',
      hora_inicio: '',
      hora_fim: '',
      vagas_total: '',
      tipo_aula_id: '',
      professor_id: ''
    })
    setDialogOpen(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return timeString
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Disponibilidades</h2>
          <p className="text-muted-foreground">
            Gerencie os horários disponíveis para agendamento de aulas.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Disponibilidade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Disponibilidade</DialogTitle>
                <DialogDescription>
                  Crie um novo horário disponível para agendamento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hora_inicio">Hora Início *</Label>
                    <Input
                      id="hora_inicio"
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_fim">Hora Fim *</Label>
                    <Input
                      id="hora_fim"
                      type="time"
                      value={formData.hora_fim}
                      onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_aula_id">Tipo de Aula *</Label>
                  <Select
                    value={formData.tipo_aula_id}
                    onValueChange={(value) => setFormData({ ...formData, tipo_aula_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAula.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professor_id">Professor *</Label>
                  <Select
                    value={formData.professor_id}
                    onValueChange={(value) => setFormData({ ...formData, professor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id.toString()}>
                          {professor.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vagas_total">Vagas Totais *</Label>
                  <Input
                    id="vagas_total"
                    type="number"
                    min="1"
                    value={formData.vagas_total}
                    onChange={(e) => setFormData({ ...formData, vagas_total: e.target.value })}
                    placeholder="Ex: 10"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Disponibilidades</CardTitle>
          <CardDescription>
            {disponibilidades.length} disponibilidade(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disponibilidades.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma disponibilidade cadastrada.</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Disponibilidade
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Tipo de Aula</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Vagas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disponibilidades.map((disponibilidade) => (
                  <TableRow key={disponibilidade.id}>
                    <TableCell>{formatDate(disponibilidade.data)}</TableCell>
                    <TableCell>
                      {formatTime(disponibilidade.hora_inicio)} - {formatTime(disponibilidade.hora_fim)}
                    </TableCell>
                    <TableCell>{disponibilidade.tipo_aula?.nome || '-'}</TableCell>
                    <TableCell>{disponibilidade.professor?.nome || '-'}</TableCell>
                    <TableCell>
                      {disponibilidade.vagas_ocupadas}/{disponibilidade.vagas_total}
                    </TableCell>
                    <TableCell>
                      <Badge variant={disponibilidade.ativo ? "default" : "secondary"}>
                        {disponibilidade.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(disponibilidade)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

