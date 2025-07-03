import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '../../lib/api'

export default function TiposAula() {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '' })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTipos()
  }, [])

  const loadTipos = async () => {
    try {
      const response = await api.get('/admin/tipos-aula')
      setTipos(response.data)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingTipo) {
        await api.put(`/admin/tipos-aula/${editingTipo.id}`, formData)
        toast({
          title: "Sucesso",
          description: "Tipo de aula atualizado com sucesso",
        })
      } else {
        await api.post('/admin/tipos-aula', formData)
        toast({
          title: "Sucesso",
          description: "Tipo de aula criado com sucesso",
        })
      }
      
      setDialogOpen(false)
      setEditingTipo(null)
      setFormData({ nome: '', descricao: '' })
      loadTipos()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao salvar tipo de aula",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (tipo) => {
    setEditingTipo(tipo)
    setFormData({ nome: tipo.nome, descricao: tipo.descricao || '' })
    setDialogOpen(true)
  }

  const handleDelete = async (tipo) => {
    if (!confirm(`Tem certeza que deseja remover o tipo de aula "${tipo.nome}"?`)) {
      return
    }

    try {
      await api.delete(`/admin/tipos-aula/${tipo.id}`)
      toast({
        title: "Sucesso",
        description: "Tipo de aula removido com sucesso",
      })
      loadTipos()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao remover tipo de aula",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = () => {
    setEditingTipo(null)
    setFormData({ nome: '', descricao: '' })
    setDialogOpen(true)
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
          <h2 className="text-2xl font-bold tracking-tight">Tipos de Aula</h2>
          <p className="text-muted-foreground">
            Gerencie os tipos de aula e treinos oferecidos pela academia.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingTipo ? 'Editar Tipo de Aula' : 'Novo Tipo de Aula'}
                </DialogTitle>
                <DialogDescription>
                  {editingTipo 
                    ? 'Edite as informações do tipo de aula.' 
                    : 'Adicione um novo tipo de aula ou treino.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Musculação, Yoga, Boxe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do tipo de aula..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingTipo ? 'Atualizar' : 'Criar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Aula</CardTitle>
          <CardDescription>
            {tipos.length} tipo(s) de aula cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tipos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum tipo de aula cadastrado.</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Tipo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell className="font-medium">{tipo.nome}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tipo.descricao || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tipo.ativo ? "default" : "secondary"}>
                        {tipo.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tipo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tipo)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

