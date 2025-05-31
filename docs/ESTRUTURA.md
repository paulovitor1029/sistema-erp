## Estrutura de Arquivos do Sistema ERP

```
sistema-estoque/
├── docs/                      # Documentação do sistema
│   ├── imagens/               # Imagens para documentação
│   └── DOCUMENTACAO.md        # Documentação técnica completa
├── public/                    # Arquivos públicos
├── src/                       # Código-fonte
│   ├── modules/               # Módulos do sistema
│   │   ├── auth/              # Autenticação e segurança
│   │   │   ├── components/    # Componentes de interface
│   │   │   ├── context/       # Contexto de autenticação
│   │   │   ├── hooks/         # Hooks personalizados
│   │   │   ├── services/      # Serviços de API
│   │   │   └── types/         # Definições de tipos
│   │   ├── produtos/          # Módulo de produtos
│   │   ├── estoque/           # Módulo de estoque
│   │   ├── usuarios/          # Módulo de usuários/funcionários
│   │   ├── ponto/             # Módulo de controle de ponto
│   │   ├── clientes/          # Módulo de clientes
│   │   ├── pdv/               # Módulo de PDV/Caixa
│   │   ├── fiscal/            # Módulo de emissão fiscal
│   │   ├── promocoes/         # Módulo de promoções
│   │   ├── relatorios/        # Módulo de relatórios
│   │   ├── configuracoes/     # Módulo de configurações
│   │   └── layout/            # Componentes de layout
│   ├── components/            # Componentes compartilhados
│   ├── hooks/                 # Hooks compartilhados
│   ├── utils/                 # Utilitários e funções auxiliares
│   ├── App.tsx                # Componente principal
│   ├── main.tsx               # Ponto de entrada
│   └── index.css              # Estilos globais
├── .gitignore                 # Arquivos ignorados pelo Git
├── package.json               # Dependências e scripts
├── README.md                  # Guia de instalação e uso rápido
├── tsconfig.json              # Configuração do TypeScript
└── vite.config.ts             # Configuração do Vite
```

## Módulos e Suas Responsabilidades

### Módulo de Autenticação (auth)
- Gerenciamento de login/logout
- Controle de permissões
- Proteção de rotas

### Módulo de Produtos (produtos)
- Cadastro completo de produtos
- Gestão de categorias
- Controle de preços e estoque mínimo

### Módulo de Estoque (estoque)
- Movimentações de entrada/saída
- Histórico de operações
- Alertas de estoque mínimo

### Módulo de Usuários (usuarios)
- Cadastro de funcionários
- Gerenciamento de permissões
- Perfis de acesso

### Módulo de Ponto (ponto)
- Registro de entrada/saída
- Cálculo de horas trabalhadas
- Relatórios de ponto

### Módulo de Clientes (clientes)
- Cadastro de clientes
- Histórico de compras
- Programa de fidelidade

### Módulo de PDV/Caixa (pdv)
- Interface de vendas
- Abertura/fechamento de caixa
- Processamento de pagamentos

### Módulo Fiscal (fiscal)
- Integração com NFC-e e SAT
- Geração de documentos fiscais
- Configurações fiscais

### Módulo de Promoções (promocoes)
- Criação e gestão de promoções
- Regras de aplicação
- Datas de vigência

### Módulo de Relatórios (relatorios)
- Relatórios de vendas
- Análise de desempenho
- Exportação de dados

### Módulo de Configurações (configuracoes)
- Dados da empresa
- Formas de pagamento
- Backup e integrações

### Módulo de Layout (layout)
- Componentes de interface compartilhados
- Estrutura de navegação
- Temas e estilos
