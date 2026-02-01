# NFCelta - Hono API

Projeto configurado com Hono, Drizzle ORM e o padrão Controller-Service-Repository.

## 📋 Estrutura do Projeto

```
src/
├── controllers/     # Controllers - Lidam com requisições HTTP
├── services/        # Services - Contêm a lógica de negócio
├── repositories/    # Repositories - Lidam com o acesso aos dados
├── routes/          # Rotas da aplicação
├── db/              # Configuração do banco de dados (Drizzle)
├── types/           # Interfaces e tipos TypeScript
└── index.ts         # Arquivo principal
```

## 🚀 Instalação

```bash
# Instalar dependências
bun install
```

## 💾 Banco de Dados

### Com Docker (Recomendado)

Tudo foi simplificado! Basta rodar:

```bash
# Iniciar PostgreSQL + Aplicação
docker-compose up -d

# Aguardar os serviços ficarem prontos
docker-compose logs -f app

# Parar os serviços
docker-compose down
```

A aplicação estará disponível em `http://localhost:3000`

### Sem Docker

Você precisará ter PostgreSQL instalado e rodando localmente. Configure a variável `DATABASE_URL` no `.env`:

```
DATABASE_URL=postgresql://seu_user:sua_senha@localhost:5432/nfcelta
```

Depois execute:

```bash
bun install
bun run db:generate
bun run db:migrate
bun run dev
```

## 🏃 Executar Projeto

```bash
# Desenvolvimento (hot reload)
bun run dev

# Build para produção
bun run build
```

## 📚 API Endpoints

### Receipts
- `GET /receipts` - Listar todos os recibos
- `GET /receipts/:id` - Obter recibo por ID
- `POST /receipts` - Criar novo recibo
  ```json
  {
    "storeName": "Supermercado ABC",
    "totalAmount": "150.50",
    "description": "Compras do mês",
    "metadata": {
      "paymentMethod": "credit_card",
      "installments": 3,
      "items": ["item1", "item2"]
    },
    "htmlContent": "<div><h1>Recibo</h1><p>Detalhes aqui</p></div>"
  }
  ```
- `PUT /receipts/:id` - Atualizar recibo
- `DELETE /receipts/:id` - Deletar recibo

## 🏗️ Padrão CSR

### Controller (`UserController`)
Responsável por:
- Receber requisições HTTP
- Validar parâmetros
- Chamar o service
- Retornar respostas

### Service (`UserService`)
Responsável por:
- Lógica de negócio
- Validações de negócio
- Coordenar operações

### Repository (`UserRepository`)
Responsável por:
- Acesso aos dados
- Operações CRUD do banco de dados
- Abstrair a camada de dados

## 🔧 Adicionando Novas Entidades

1. **Criar schema em** `src/db/schema.ts`
2. **Criar repository em** `src/repositories/EntityRepository.ts`
3. **Criar service em** `src/services/EntityService.ts`
4. **Criar controller em** `src/controllers/EntityController.ts`
5. **Criar rotas em** `src/routes/entity.ts`
6. **Integrar em** `src/index.ts`
