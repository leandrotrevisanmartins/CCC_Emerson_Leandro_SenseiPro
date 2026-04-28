# SenseiPro — API Backend

API REST para gestão de academia de artes marciais (Jiu-Jitsu, Judô).

## Stack

- Node.js 20 + TypeScript 5.6
- Express 4.19
- TypeORM 0.3.20
- PostgreSQL 16
- JWT + bcryptjs

## Configuração

### 1. Pré-requisitos

- Node.js 20+ instalado
- PostgreSQL rodando localmente

### 2. Criar o banco de dados

```sql
CREATE DATABASE senseipro;
```

### 3. Configurar variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
DB_NAME=senseipro
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_HOST=localhost
DB_PORT=5432
API_PORT=3001
JWT_SECRET=troque_por_uma_chave_forte_em_producao
JWT_EXPIRES_IN=8h
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

A API sobe em `http://localhost:3001`

---

## Endpoints principais

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | /api/healthcheck | Status da API | Não |
| POST | /api/login | Login | Não |
| POST | /api/usuarios | Criar usuário | Admin |
| GET | /api/alunos | Listar alunos | Sim |
| POST | /api/alunos | Criar aluno | Sim |
| GET | /api/professores | Listar professores | Sim |
| GET | /api/turmas | Listar turmas | Sim |
| POST | /api/turmas/:id/matricular | Matricular aluno | Admin/Prof |
| POST | /api/presencas | Registrar presença | Admin/Prof |
| GET | /api/presencas/aluno/:id | Presenças por aluno | Sim |
| GET | /api/mensalidades/inadimplentes | Inadimplentes | Admin |
| POST | /api/pagamentos | Registrar pagamento | Admin |
| GET | /api/graduacoes/aluno/:id | Histórico de faixas | Sim |

## Exemplo de login

```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@senseipro.com",
  "password": "senha123"
}
```

Resposta:
```json
{
  "auth": true,
  "token": "eyJ...",
  "usuario": { "id": 1, "email": "admin@senseipro.com", "perfil": "admin" }
}
```

Use o token no header das demais requisições:
```
Authorization: Bearer eyJ...
```

## Estrutura do projeto

```
src/
├── app.ts
├── data-source.ts
├── entities/        — 9 entidades TypeORM
├── repositories/    — 9 repositories com interfaces
├── controllers/     — 10 controllers (todos com try/catch)
├── routes/          — rotas com proteção por perfil
├── middleware/      — auth JWT + errorHandler
└── errors/          — HttpError tipado
```
