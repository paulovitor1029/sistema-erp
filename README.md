# Guia de Instalação e Uso Rápido - Sistema ERP

## Instalação

1. Extraia o arquivo `sistema-estoque-sem-node.zip` para uma pasta de sua escolha
2. Abra um terminal na pasta extraída
3. Execute `npm install` ou `pnpm install` para instalar as dependências
4. Execute `npm run dev` ou `pnpm run dev` para iniciar o servidor de desenvolvimento
5. Acesse o sistema em `http://localhost:5173`

## Primeiro Acesso

- **Login**: Digite qualquer email e senha (na versão inicial, qualquer credencial é aceita)
- **Dica**: Use emails com "admin" ou "gerente" para obter diferentes níveis de permissão
  - Ex: admin@sistema.com = acesso de administrador
  - Ex: gerente@sistema.com = acesso de gerente
  - Ex: usuario@sistema.com = acesso de operador

## Módulos Principais

### Produtos
- Cadastre produtos com código de barras, nome, categoria, preços
- Defina estoque mínimo e controle validade
- Ative/desative produtos conforme necessário

### Estoque
- Registre entradas, saídas, perdas e devoluções
- Visualize histórico de movimentações
- Receba alertas de estoque mínimo

### Funcionários
- Cadastre funcionários com diferentes níveis de acesso
- Controle permissões por função

### Ponto
- Registre entrada e saída de funcionários
- Visualize relatórios de horas trabalhadas

### Clientes
- Mantenha cadastro completo de clientes
- Acompanhe histórico de compras
- Gerencie programa de fidelidade

### PDV/Caixa
- Realize abertura e fechamento de caixa
- Registre vendas com leitura de código de barras
- Aplique promoções automaticamente
- Processe diferentes formas de pagamento

### Fiscal
- Configure integrações com NFC-e e SAT
- Gere documentos fiscais
- Imprima DANFE em impressora térmica

### Promoções
- Crie promoções por produto ou categoria
- Defina datas de início e fim
- Aplique descontos percentuais ou valores fixos

### Relatórios
- Visualize vendas por período, funcionário ou cliente
- Identifique produtos mais vendidos
- Compare desempenho mês a mês
- Exporte para CSV ou PDF

### Configurações
- Configure dados da empresa
- Gerencie formas de pagamento
- Configure backup automático
- Gerencie integrações

## Suporte

Para mais informações, consulte a documentação completa em `docs/DOCUMENTACAO.md`
