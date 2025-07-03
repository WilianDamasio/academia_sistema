
# Diagramas de Fluxo (User Flows)

## Fluxo de Usuário (Aplicativo Android - Aluno)

```mermaid
graph TD
    A[Abrir App] --> B{Usuário Cadastrado?}
    B -- Sim --> C[Tela de Login]
    B -- Não --> D[Contato com Academia]
    C --> E{Login Sucesso?}
    E -- Sim --> F[Tela Principal (Aulas Disponíveis)]
    E -- Não --> C
    F --> G[Selecionar Aula/Treino]
    G --> H[Ver Detalhes da Aula]
    H --> I{Confirmar Agendamento?}
    I -- Sim --> J[Agendamento Confirmado]
    I -- Não --> F
    J --> K[Ver Meus Agendamentos]
    F --> K
```

## Fluxo de Usuário (Website - Gerente da Academia)

```mermaid
graph TD
    A[Acessar Website] --> B[Tela de Login]
    B --> C{Login Sucesso?}
    C -- Sim --> D[Painel de Administração]
    C -- Não --> B
    D --> E[Gerenciar Tipos de Aula/Treino]
    D --> F[Gerenciar Professores]
    D --> G[Gerenciar Usuários]
    D --> H[Gerenciar Agendamentos e Disponibilidade]
    E --> E1[Adicionar Tipo]
    E --> E2[Editar Tipo]
    E --> E3[Remover Tipo]
    F --> F1[Adicionar Professor]
    F --> F2[Editar Professor]
    F --> F3[Remover Professor]
    F --> F4[Associar/Desassociar Professor a Aula]
    G --> G1[Adicionar Usuário]
    G --> G2[Editar Usuário]
    G --> G3[Remover Usuário]
    H --> H1[Adicionar Disponibilidade]
    H --> H2[Remover Disponibilidade]
    H --> H3[Visualizar Agendamentos]
    H --> H4[Cancelar Agendamento de Aluno]
```


