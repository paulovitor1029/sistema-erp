# Estrutura de Módulos do Sistema ERP

Esta pasta contém todos os módulos do Sistema ERP, organizados de forma modular para facilitar a manutenção e expansão.

## Módulos Implementados

1. **auth** - Autenticação e controle de acesso
2. **produtos** - Cadastro e gerenciamento de produtos
3. **estoque** - Controle de entrada e saída de produtos
4. **usuarios** - Gerenciamento de funcionários e usuários
5. **ponto** - Controle de ponto de funcionários
6. **clientes** - Cadastro e gerenciamento de clientes
7. **pdv** - Ponto de Venda e operações de caixa
8. **fiscal** - Emissão fiscal e integrações obrigatórias
9. **promocoes** - Gerenciamento de promoções e descontos
10. **relatorios** - Relatórios e análises
11. **configuracoes** - Configurações do sistema

## Estrutura Padrão de Módulo

Cada módulo segue uma estrutura padrão:

```
/modulo
  /components - Componentes específicos do módulo
  /hooks - Hooks personalizados do módulo
  /services - Serviços e lógica de negócio
  /types - Definições de tipos TypeScript
  /utils - Funções utilitárias específicas do módulo
  index.ts - Exportações públicas do módulo
```

## Integração entre Módulos

Os módulos se comunicam através de interfaces bem definidas, permitindo a expansão e modificação sem afetar outros módulos.
