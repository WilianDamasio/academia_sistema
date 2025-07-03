# Sistema de Agendamento de Academia - Completo

## Visão Geral

Sistema completo de agendamento de aulas e treinos para academia, desenvolvido com base na documentação fornecida. O sistema inclui:

- **Backend API**: Desenvolvido em Flask com SQLite
- **Website Administrativo**: Interface React para gerenciamento da academia
- **Aplicativo dos Alunos**: Interface React otimizada para mobile

## URLs de Acesso

### 🔗 Links Públicos Deployados

- **Backend API**: https://w5hni7cond93.manus.space
- **Website Administrativo**: https://njkspiiw.manus.space
- **Aplicativo dos Alunos**: https://kgjvapvp.manus.space

## Credenciais de Acesso

### Administrador (Website)
- **Email**: admin@academia.com
- **Senha**: admin123

### Aluno (Aplicativo)
- **Email**: lucas@email.com
- **Senha**: 123456

## Funcionalidades Implementadas

### Backend API (Flask)

#### Autenticação
- Login para administradores (`/api/auth/login/admin`)
- Login para alunos (`/api/auth/login/aluno`)
- Logout (`/api/auth/logout`)
- Verificação de usuário logado (`/api/auth/me`)

#### Rotas Administrativas
- **Tipos de Aula**: CRUD completo
  - `GET /api/admin/tipos-aula` - Listar tipos
  - `POST /api/admin/tipos-aula` - Criar tipo
  - `PUT /api/admin/tipos-aula/{id}` - Atualizar tipo
  - `DELETE /api/admin/tipos-aula/{id}` - Deletar tipo

- **Professores**: CRUD completo
  - `GET /api/admin/professores` - Listar professores
  - `POST /api/admin/professores` - Criar professor
  - `PUT /api/admin/professores/{id}` - Atualizar professor
  - `DELETE /api/admin/professores/{id}` - Deletar professor

- **Alunos**: CRUD completo
  - `GET /api/admin/alunos` - Listar alunos
  - `POST /api/admin/alunos` - Criar aluno
  - `PUT /api/admin/alunos/{id}` - Atualizar aluno
  - `DELETE /api/admin/alunos/{id}` - Deletar aluno

- **Disponibilidades**: CRUD completo
  - `GET /api/admin/disponibilidades` - Listar disponibilidades
  - `POST /api/admin/disponibilidades` - Criar disponibilidade
  - `PUT /api/admin/disponibilidades/{id}` - Atualizar disponibilidade
  - `DELETE /api/admin/disponibilidades/{id}` - Deletar disponibilidade

- **Agendamentos**: Visualização e gerenciamento
  - `GET /api/admin/agendamentos` - Listar todos os agendamentos
  - `PUT /api/admin/agendamentos/{id}/cancelar` - Cancelar agendamento

#### Rotas dos Alunos
- `GET /api/aluno/tipos-aula` - Listar tipos de aula disponíveis
- `GET /api/aluno/disponibilidades` - Listar horários disponíveis
- `POST /api/aluno/agendamentos` - Criar novo agendamento
- `GET /api/aluno/agendamentos` - Listar agendamentos do aluno
- `PUT /api/aluno/agendamentos/{id}/cancelar` - Cancelar agendamento

### Website Administrativo (React)

#### Funcionalidades
- **Dashboard**: Visão geral com estatísticas
- **Gestão de Tipos de Aula**: Criar, editar e remover tipos
- **Gestão de Professores**: Cadastro completo de professores
- **Gestão de Alunos**: Cadastro e gerenciamento de alunos
- **Gestão de Disponibilidades**: Criar horários para aulas
- **Visualização de Agendamentos**: Acompanhar todos os agendamentos

#### Características Técnicas
- Interface responsiva com Tailwind CSS
- Componentes UI com shadcn/ui
- Navegação com React Router
- Autenticação com contexto React
- Comunicação com API via Axios

### Aplicativo dos Alunos (React)

#### Funcionalidades
- **Login**: Autenticação de alunos
- **Página Inicial**: Visão geral dos próximos agendamentos
- **Agendar Aula**: Selecionar tipo de aula e horário
- **Meus Agendamentos**: Visualizar e cancelar agendamentos
- **Navegação Inferior**: Interface otimizada para mobile

#### Características Técnicas
- Design mobile-first
- Navegação por abas na parte inferior
- Interface intuitiva e responsiva
- Integração completa com a API

## Banco de Dados

### Estrutura das Tabelas

#### Admin
- id, nome, email, senha_hash, ativo, created_at

#### Aluno
- id, nome, email, senha_hash, telefone, ativo, created_at

#### Professor
- id, nome, email, telefone, especialidade, ativo, created_at

#### TipoAula
- id, nome, descricao, ativo, created_at

#### Disponibilidade
- id, professor_id, tipo_aula_id, data, hora_inicio, hora_fim, vagas_total, vagas_ocupadas, ativo, created_at

#### Agendamento
- id, aluno_id, disponibilidade_id, status, created_at

### Dados de Teste Incluídos

#### Tipos de Aula
- Musculação
- Yoga
- Boxe
- Pilates
- Zumba
- Crossfit

#### Professores
- João Silva (Musculação e Crossfit)
- Maria Santos (Yoga e Pilates)
- Carlos Oliveira (Boxe)
- Ana Costa (Zumba e Dança)

#### Alunos
- Lucas Ferreira
- Fernanda Lima
- Roberto Souza
- Juliana Rocha

#### Disponibilidades
- Horários variados para os próximos 7 dias
- Diferentes tipos de aula e professores
- Vagas limitadas por horário

## Arquitetura do Sistema

### Backend (Flask)
```
academia_backend/
├── src/
│   ├── models/
│   │   └── academia.py          # Modelos SQLAlchemy
│   ├── routes/
│   │   ├── auth.py              # Rotas de autenticação
│   │   ├── admin.py             # Rotas administrativas
│   │   └── aluno.py             # Rotas dos alunos
│   ├── main.py                  # Aplicação principal
│   └── seed_data.py             # Script de dados iniciais
├── requirements.txt             # Dependências Python
└── academia.db                  # Banco SQLite
```

### Frontend (React)
```
academia-admin/ e academia-app/
├── src/
│   ├── components/
│   │   ├── ui/                  # Componentes shadcn/ui
│   │   ├── pages/               # Páginas da aplicação
│   │   └── *.jsx                # Componentes principais
│   ├── contexts/
│   │   └── AuthContext.jsx      # Contexto de autenticação
│   ├── hooks/
│   │   └── use-toast.js         # Hook para notificações
│   ├── lib/
│   │   └── api.js               # Configuração da API
│   └── App.jsx                  # Componente principal
├── package.json                 # Dependências Node.js
└── dist/                        # Build de produção
```

## Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **SQLAlchemy**: ORM para banco de dados
- **SQLite**: Banco de dados
- **Flask-CORS**: Suporte a CORS
- **Werkzeug**: Utilitários web (hash de senhas)

### Frontend
- **React**: Biblioteca JavaScript
- **Vite**: Build tool e dev server
- **React Router**: Roteamento
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Framework CSS
- **shadcn/ui**: Componentes UI
- **Lucide React**: Ícones

## Fluxo de Uso

### Para Administradores
1. Acesso ao website administrativo
2. Login com credenciais de admin
3. Gestão de tipos de aula, professores e alunos
4. Criação de disponibilidades (horários)
5. Acompanhamento de agendamentos

### Para Alunos
1. Acesso ao aplicativo
2. Login com credenciais de aluno
3. Visualização de tipos de aula disponíveis
4. Seleção de horário e agendamento
5. Gerenciamento dos próprios agendamentos

## Segurança

- Senhas criptografadas com Werkzeug
- Autenticação baseada em sessões
- Validação de dados de entrada
- Controle de acesso por tipo de usuário
- CORS configurado para permitir integração frontend-backend

## Deploy

O sistema está completamente deployado e funcional nos links fornecidos acima. Todas as funcionalidades foram testadas e estão operacionais.

## Próximos Passos Sugeridos

1. **Notificações**: Sistema de notificações por email/SMS
2. **Pagamentos**: Integração com gateway de pagamento
3. **Relatórios**: Dashboard com relatórios detalhados
4. **App Mobile Nativo**: Versão nativa para Android/iOS
5. **Integração com Calendário**: Sincronização com Google Calendar
6. **Sistema de Avaliações**: Feedback dos alunos sobre aulas
7. **Planos de Assinatura**: Diferentes tipos de planos
8. **Check-in QR Code**: Sistema de presença por QR Code

---

**Desenvolvido seguindo as melhores práticas de desenvolvimento web e mobile, com foco na experiência do usuário e facilidade de uso.**

