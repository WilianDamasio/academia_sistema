import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Edit, Trash2, Loader2, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { api } from '../../lib/api'

export default function Alunos() {
  const [alunos, setAlunos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAluno, setEditingAluno] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadAlunos()
  }, [])

  const loadAlunos = async () => {
    try {
      const response = await api.get('/admin/alunos')
      setAlunos(response.data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar alunos",
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
      const submitData = { ...formData }
      
      // Remove senha vazia para edição
      if (editingAluno && !submitData.senha) {
        delete submitData.senha
      }

      if (editingAluno) {
        await api.put(`/admin/alunos/${editingAluno.id}`, submitData)
        toast({
          title: "Sucesso",
          description: "Aluno atualizado com sucesso",
        })
      } else {
        await api.post('/admin/alunos', submitData)
        toast({
          title: "Sucesso",
          description: "Aluno criado com sucesso",
        })
      }
      
      setDialogOpen(false)
      setEditingAluno(null)
      setFormData({ nome: '', email: '', telefone: '', senha: '' })
      loadAlunos()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao salvar aluno",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (aluno) => {
    setEditingAluno(aluno)
    setFormData({
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone || '',
      senha: '' // Não preenche a senha por segurança
    })
    setDialogOpen(true)
  }

  const handleDelete = async (aluno) => {
    if (!confirm(`Tem certeza que deseja remover o aluno "${aluno.nome}"?`)) {
      return
    }

    try {
      await api.delete(`/admin/alunos/${aluno.id}`)
      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso",
      })
      loadAlunos()
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao remover aluno",
        variant: "destructive",
      })
    }
  }

  const openCreateDialog = () => {
    setEditingAluno(null)
    setFormData({ nome: '', email: '', telefone: '', senha: '' })
    setDialogOpen(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
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
          <h2 className="text-2xl font-bold tracking-tight">Alunos</h2>
          <p className="text-muted-foreground">
            Gerencie os alunos cadastrados na academia.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
                </DialogTitle>
                <DialogDescription>
                  {editingAluno 
                    ? 'Edite as informações do aluno.' 
                    : 'Cadastre um novo aluno na academia.'
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
                    placeholder="Nome completo do aluno"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">
                    Senha {editingAluno ? '(deixe vazio para manter a atual)' : '*'}
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    placeholder="Senha para acesso ao app"
                    required={!editingAluno}
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
                    editingAluno ? 'Atualizar' : 'Criar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {alunos.length} aluno(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alunos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum aluno cadastrado.</p>
              <Button onClick={openCreateDialog} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Aluno
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell>{aluno.email}</TableCell>
                    <TableCell>{aluno.telefone || '-'}</TableCell>
                    <TableCell>{formatDate(aluno.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={aluno.ativo ? "default" : "secondary"}>
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(aluno)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(aluno)}
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

