# Sistema ERP - Documentação

## Visão Geral

Este Sistema ERP foi desenvolvido para atender às necessidades de lojas e restaurantes de pequeno e médio porte, oferecendo uma solução completa para gestão de estoque, vendas, clientes, funcionários e obrigações fiscais. O sistema possui uma arquitetura modular, permitindo fácil expansão e adaptação às necessidades específicas do negócio.

## Arquitetura do Sistema

O sistema foi desenvolvido utilizando as seguintes tecnologias:

- **Frontend**: React com TypeScript
- **Estilização**: TailwindCSS
- **Gerenciamento de Estado**: React Context API
- **Roteamento**: React Router
- **Armazenamento Local**: LocalStorage (versão inicial)
- **Preparado para Backend**: Estrutura pronta para integração com APIs RESTful

A arquitetura é modular, com cada funcionalidade do sistema organizada em módulos independentes, facilitando a manutenção e expansão.

## Módulos do Sistema

### 1. Autenticação e Segurança

- Login com diferentes níveis de acesso (admin, gerente, operador)
- Proteção de rotas baseada em permissões
- Gerenciamento de sessão

### 2. Cadastro de Produtos

- Cadastro completo com código de barras, nome, categoria, preços, validade
- Controle de estoque mínimo
- Ativação/desativação de produtos
- Upload de imagens

### 3. Estoque

- Controle de entrada e saída (compra, venda, perda, devolução)
- Histórico de movimentações por produto
- Alertas de estoque mínimo
- Relatórios de movimentação

### 4. Funcionários / Usuários

- Cadastro de funcionários com dados pessoais e profissionais
- Definição de permissões por nível (admin, gerente, operador)
- Controle de acesso às funcionalidades do sistema

### 5. Controle de Ponto

- Registro de entrada e saída de funcionários
- Cálculo automático de horas trabalhadas
- Relatórios de ponto por funcionário e período

### 6. Clientes

- Cadastro completo (nome, CPF/CNPJ, telefone, endereço)
- Histórico de compras
- Sistema de fidelidade (cashback, pontuação)
- Segmentação de clientes

### 7. PDV / Caixa

- Abertura/fechamento de caixa com valor inicial/final
- Registro de vendas com leitura de código de barras
- Aplicação automática de promoções
- Suporte a trocas, cancelamentos e múltiplos meios de pagamento
- Interface otimizada para operação rápida

### 8. Emissão Fiscal

- Integração com NFC-e (via Sefaz + Certificado Digital A1)
- Integração com SAT Fiscal (via DLL ou software fiscal)
- Geração de XML, impressão do DANFE em impressora térmica
- Configuração de parâmetros fiscais

### 9. Promoções

- Criação de promoções por produto ou categoria
- Definição de descontos por porcentagem ou valor fixo
- Programação de data de início e fim
- Aplicação automática no PDV

### 10. Relatórios

- Vendas por período, por funcionário, por cliente
- Produtos mais vendidos
- Relatórios de caixa, perdas, trocas
- Comparativo mês a mês
- Exportação para CSV e PDF

### 11. Configurações

- Dados da empresa
- Cadastro de formas de pagamento
- Configuração de impressora fiscal
- Gerenciamento de certificado digital
- Backup automático

## Requisitos do Sistema

### Requisitos de Hardware

- Processador: Intel Core i3 ou equivalente (mínimo)
- Memória RAM: 4GB (mínimo), 8GB (recomendado)
- Armazenamento: 10GB de espaço livre em disco
- Resolução de tela: 1366x768 ou superior

### Requisitos de Software

- Sistema Operacional: Windows 10/11, macOS 10.15+, ou Linux (Ubuntu 20.04+)
- Navegador: Chrome 90+, Firefox 90+, Edge 90+
- Node.js 18+ (para desenvolvimento ou instalação local)

## Instalação e Configuração

### Instalação Local

1. Extraia o arquivo `sistema-estoque-sem-node.zip` para uma pasta de sua escolha
2. Abra um terminal na pasta extraída
3. Execute `npm install` ou `pnpm install` para instalar as dependências
4. Execute `npm run dev` ou `pnpm run dev` para iniciar o servidor de desenvolvimento
5. Acesse o sistema em `http://localhost:5173`

### Configuração Inicial

Após a instalação, é necessário configurar o sistema:

1. Acesse o sistema com as credenciais iniciais:
   - Email: admin@sistema.com
   - Senha: qualquer valor (na versão inicial, qualquer credencial é aceita)
2. Acesse o módulo de Configurações e preencha os dados da empresa
3. Configure as formas de pagamento
4. Configure as integrações fiscais (se aplicável)
5. Configure o backup automático

## Integrações

O sistema está preparado para as seguintes integrações:

### Integrações Fiscais

- **SAT Fiscal**: Via biblioteca ACBr ou equivalente
- **NFC-e**: Via comunicação com SEFAZ utilizando certificado digital
- **Impressoras Térmicas**: Suporte a protocolos ESC/POS para Elgin, Daruma, Bematech

### Outras Integrações

- **Gateways de Pagamento**: Estrutura preparada para integração
- **Balanças**: Suporte a protocolos de comunicação com balanças
- **Sistemas de Backup**: Local ou em nuvem

## Expansão e Personalização

O sistema foi projetado para ser facilmente expandido e personalizado:

### Adição de Novos Módulos

1. Crie uma nova pasta no diretório `src/modules` com a estrutura padrão:
   - components/
   - hooks/
   - services/
   - types/
   - utils/
2. Implemente os componentes e hooks necessários
3. Adicione as rotas no arquivo principal de rotas
4. Atualize o menu lateral para incluir o novo módulo

### Personalização Visual

- O sistema utiliza TailwindCSS, facilitando a personalização visual
- Os componentes principais estão em `src/components`
- As cores e temas podem ser ajustados no arquivo `tailwind.config.js`

## Migração para Nuvem

O sistema está preparado para futura migração para uma arquitetura em nuvem:

### Passos para Migração

1. Implementar um backend com API RESTful (Node.js, Laravel, Django, etc.)
2. Adaptar os hooks de dados para consumir a API em vez de dados locais
3. Implementar autenticação JWT ou similar
4. Configurar banco de dados em nuvem (MySQL, PostgreSQL, MongoDB)
5. Implementar sistema de upload de arquivos para armazenamento em nuvem

## Suporte e Manutenção

### Backup e Recuperação

- O sistema possui funcionalidade de backup automático configurável
- Recomenda-se realizar backups diários dos dados
- Para recuperação, utilize a função de importação no módulo de Configurações

### Solução de Problemas Comuns

- **Erro de conexão com impressora fiscal**: Verifique as configurações de porta e driver
- **Lentidão no sistema**: Verifique a quantidade de dados e considere limpar históricos antigos
- **Problemas de autenticação**: Limpe os dados do navegador e tente novamente

## Roadmap de Desenvolvimento Futuro

- Implementação de backend completo com API RESTful
- Aplicativo móvel para consultas e operações básicas
- Integração com marketplaces e e-commerce
- Módulo de controle financeiro avançado
- Módulo de comandas/mesas para restaurantes
- Dashboards avançados com BI

## Considerações de Segurança

- Mantenha o sistema atualizado com as últimas versões
- Implemente políticas de senhas fortes
- Realize backups regulares
- Controle cuidadosamente as permissões de usuários
- Utilize HTTPS para todas as comunicações quando em produção

---

© 2025 Sistema ERP - Todos os direitos reservados
