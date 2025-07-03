import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Calendar, CalendarCheck } from 'lucide-react'
import { api } from '../../lib/api'

export default function Home() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalProfessores: 0,
    totalDisponibilidades: 0,
    totalAgendamentos: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [alunosRes, professoresRes, disponibilidadesRes, agendamentosRes] = await Promise.all([
        api.get('/admin/alunos'),
        api.get('/admin/professores'),
        api.get('/admin/disponibilidades'),
        api.get('/admin/agendamentos')
      ])

      setStats({
        totalAlunos: alunosRes.data.length,
        totalProfessores: professoresRes.data.length,
        totalDisponibilidades: disponibilidadesRes.data.length,
        totalAgendamentos: agendamentosRes.data.filter(a => a.status === 'confirmado').length
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total de Alunos',
      value: stats.totalAlunos,
      description: 'Alunos cadastrados',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total de Professores',
      value: stats.totalProfessores,
      description: 'Professores ativos',
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      title: 'Disponibilidades',
      value: stats.totalDisponibilidades,
      description: 'Horários disponíveis',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Agendamentos',
      value: stats.totalAgendamentos,
      description: 'Agendamentos confirmados',
      icon: CalendarCheck,
      color: 'text-orange-600'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bem-vindo ao Academia Admin</h2>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua academia.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>
              Sistema de gerenciamento da academia funcionando perfeitamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Funcionalidades Disponíveis:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gerenciamento de tipos de aula e treinos</li>
                <li>• Cadastro e controle de professores</li>
                <li>• Gestão de alunos e usuários</li>
                <li>• Criação de disponibilidades de horários</li>
                <li>• Visualização e controle de agendamentos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Links para as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <a href="/tipos-aula" className="block text-sm text-primary hover:underline">
                → Gerenciar Tipos de Aula
              </a>
              <a href="/professores" className="block text-sm text-primary hover:underline">
                → Cadastrar Professores
              </a>
              <a href="/alunos" className="block text-sm text-primary hover:underline">
                → Gerenciar Alunos
              </a>
              <a href="/disponibilidades" className="block text-sm text-primary hover:underline">
                → Criar Disponibilidades
              </a>
              <a href="/agendamentos" className="block text-sm text-primary hover:underline">
                → Ver Agendamentos
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

