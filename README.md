# 🥋 SenseiPro — Sistema de Gestão de Academia de Artes Marciais

**Universidade de Passo Fundo – UPF**  
Emerson Rosado Scalcon · Leandro Trevisan Martins · 2026  
ADS/CCC/ECP — Prof. Jeangrei Veiga / Alexandre Zanatta

---

## Sobre o projeto

O SenseiPro é um sistema web completo para gestão de academias de artes marciais (Jiu-Jitsu, Judô e similares). Substitui o controle manual em planilhas por uma plataforma centralizada com três perfis de acesso:

| Perfil | Acesso |
|---|---|
| **Administrador** | Gerencia tudo: alunos, professores, turmas, mensalidades, graduações, usuários e logs |
| **Professor** | Registra presenças, visualiza suas turmas e registra graduações |
| **Aluno** | Consulta suas turmas, presenças, mensalidades e graduações. Pode confirmar pagamentos |

---

## Tecnologias

### Backend
| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 20.x LTS | Ambiente de execução |
| TypeScript | 5.6 | Linguagem principal |
| Express.js | 4.19 | Framework HTTP / API REST |
| TypeORM | 0.3.x | ORM — mapeamento objeto-relacional |
| PostgreSQL | 16.x | Banco de dados relacional |
| jsonwebtoken | 9.x | Autenticação JWT |
| bcryptjs | 2.4 | Criptografia de senhas |
| express-rate-limit | 8.x | Proteção contra força bruta |

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| Next.js | 16.x | Framework React / roteamento |
| React | 18.x | Biblioteca de UI |
| React-Bootstrap | 2.x | Componentes visuais |
| Axios | 1.7 | Cliente HTTP |
| jsPDF + autotable | 4.x / 5.x | Geração de relatórios PDF |
| TypeScript | 5.x | Tipagem estática |

---

## Pré-requisitos

### Ambos os sistemas operacionais
- **Node.js 20 LTS** — https://nodejs.org
- **PostgreSQL 16** — https://www.postgresql.org/download
- **Git** — https://git-scm.com

### Verificar instalações
```bash
node --version    # deve mostrar v20.x.x
npm --version     # deve mostrar 10.x.x ou superior
psql --version    # deve mostrar 16.x
git --version
```

---

## Instalação e configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/leandrotrevisanmartins/CCC_Emerson_Leandro_SenseiPro.git
cd CCC_Emerson_Leandro_SenseiPro
```

---

### 2. Configurar o banco de dados

#### Linux
```bash
sudo -u postgres psql
```

#### Windows (Prompt de Comando como Administrador)
```cmd
psql -U postgres
```

Dentro do psql (igual nos dois sistemas):
```sql
CREATE DATABASE senseipro;
\q
```

> Se necessário, redefinir a senha do usuário postgres:
> ```sql
> ALTER USER postgres WITH PASSWORD 'postgres';
> ```

---

### 3. Configurar variáveis de ambiente do backend

Crie o arquivo `backend/.env`:

#### Linux
```bash
cat > backend/.env << 'ENVEOF'
DB_NAME=senseipro
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
API_PORT=3001
JWT_SECRET=senseipro_dev_secret_2026
JWT_EXPIRES_IN=8h
ENVEOF
```

#### Windows
Crie manualmente o arquivo `backend\.env` com o conteúdo:
```
DB_NAME=senseipro
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
API_PORT=3001
JWT_SECRET=senseipro_dev_secret_2026
JWT_EXPIRES_IN=8h
```

> ⚠️ O arquivo `.env` não é versionado no Git por segurança. Deve ser criado manualmente em cada instalação.

---

### 4. Instalar dependências e iniciar o backend

```bash
cd backend
npm install
npm run dev
```

Aguarde a mensagem:
```
✅ Banco de dados conectado com sucesso.
🚀 SenseiPro API rodando em http://localhost:3001
```

> O TypeORM cria as tabelas automaticamente na primeira execução (`synchronize: true`).

---

### 5. Instalar dependências e iniciar o frontend

Abra um **novo terminal** (mantenha o backend rodando):

```bash
# A partir da raiz do repositório
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Acesse: **http://localhost:3000**

---

### 6. Criar o primeiro usuário administrador

Com a API rodando, insira o admin diretamente no banco:

#### Linux
```bash
sudo -u postgres psql -d senseipro
```

#### Windows
```cmd
psql -U postgres -d senseipro
```

```sql
INSERT INTO usuario (email, senha, perfil)
VALUES (
  'admin@senseipro.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
);
\q
```

> O hash acima corresponde à senha `password`. Troque após o primeiro acesso em **Menu do usuário → Trocar Senha**.

**Login:**
```
URL:   http://localhost:3000
Email: admin@senseipro.com
Senha: password
```

---

## Regras de exclusão

O sistema aplica regras de integridade referencial para evitar perda de histórico. Entenda o comportamento de cada exclusão:

### Alunos

| Situação | Comportamento |
|---|---|
| Aluno **sem** nenhum vínculo | Excluído permanentemente |
| Aluno **com** presenças, mensalidades ou graduações | A exclusão remove **em cascata** todos os registros vinculados (presenças, pagamentos, mensalidades, graduações e matrículas) antes de excluir o aluno |

> **Recomendação:** use o botão **Inativar** para preservar o histórico do aluno. O aluno inativo não aparece nas listas operacionais, mas seus dados ficam intactos no banco.

---

### Professores

| Situação | Comportamento |
|---|---|
| Professor **sem** turmas vinculadas | Excluído permanentemente |
| Professor **com** turmas vinculadas | Bloqueado — retorna erro 409 com a quantidade de turmas |

> **Como resolver:** reatribua as turmas a outro professor ou exclua as turmas antes de excluir o professor.

---

### Turmas

| Situação | Comportamento |
|---|---|
| Turma **sem** alunos e **sem** presenças | Excluída permanentemente |
| Turma **com** alunos matriculados | Bloqueada — retorna erro 409 sugerindo desmatricular os alunos |
| Turma **com** presenças registradas | Bloqueada — retorna erro 409 sugerindo remover os registros de presença |

> **Como resolver:** desmatricule todos os alunos pela tela de Matrículas e, se houver presenças, remova-as na tela de Presenças antes de excluir a turma.

---

### Mensalidades

| Situação | Comportamento |
|---|---|
| Mensalidade **sem** pagamentos | Excluída permanentemente |
| Mensalidade **com** pagamentos | Os pagamentos são removidos automaticamente antes de excluir a mensalidade |

---

## Estrutura do projeto

```
CCC_Emerson_Leandro_SenseiPro/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio por entidade
│   │   ├── entities/        # Classes TypeORM mapeadas para tabelas
│   │   ├── middleware/      # auth.ts (JWT) · auditoria.ts (logs)
│   │   ├── repositories/    # Acesso ao banco de dados
│   │   └── routes/          # Definição de todos os endpoints
│   ├── .env                 # Variáveis de ambiente (não versionado)
│   └── server.ts            # Ponto de entrada da API
├── frontend/
│   └── src/pages/
│       ├── aluno/           # Área restrita do aluno
│       ├── professor/       # Área restrita do professor
│       ├── components/      # NavBar, FooterBar
│       ├── services/        # Chamadas à API (Axios)
│       ├── utils/           # Geração de PDFs (jsPDF)
│       └── interfaces/      # Tipos TypeScript
└── README.md
```

---

## Endpoints principais da API

Base URL: `http://localhost:3001/api`

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| POST | `/login` | Público | Autenticação |
| GET | `/alunos` | Todos | Listar alunos |
| POST | `/alunos` | Admin | Criar aluno |
| PATCH | `/alunos/:id/inativar` | Admin | Inativar aluno |
| DELETE | `/alunos/:id` | Admin | Excluir aluno em cascata |
| GET | `/turmas` | Todos | Listar turmas |
| POST | `/turmas/:id/matricular` | Admin/Prof | Matricular aluno |
| DELETE | `/turmas/:id/aluno/:id` | Admin/Prof | Desmatricular |
| GET | `/presencas` | Todos | Listar presenças |
| POST | `/presencas` | Admin/Prof | Registrar presença |
| GET | `/mensalidades` | Admin | Listar mensalidades |
| GET | `/mensalidades/inadimplentes` | Admin | Inadimplentes |
| POST | `/pagamentos` | Admin | Registrar pagamento |
| GET | `/me/perfil` | Logado | Perfil do usuário |
| GET | `/me/mensalidades` | Aluno | Minhas mensalidades |
| POST | `/me/pagamentos` | Aluno | Confirmar pagamento |
| PATCH | `/minha-senha` | Todos | Trocar senha |
| GET | `/logs` | Admin | Logs de auditoria |
| POST | `/usuarios` | Admin | Criar usuário de acesso |
| PATCH | `/usuarios/:id/resetar-senha` | Admin | Resetar senha |

---

## Funcionalidades implementadas

- ✅ Login com JWT e três perfis (admin, professor, aluno)
- ✅ Proteção contra força bruta: bloqueio após 5 tentativas por 15 minutos
- ✅ Senhas criptografadas com bcryptjs (salt 10)
- ✅ Troca de senha pelo próprio usuário / reset pelo admin
- ✅ Logs de auditoria persistidos no banco (20 tipos de ação)
- ✅ CRUD completo: alunos, professores, turmas, modalidades
- ✅ Inativação de aluno (sem perda de histórico)
- ✅ Exclusão de aluno com remoção em cascata de todos os vínculos
- ✅ Matrícula e desmatrícula de alunos por turma
- ✅ Registro de presença individual ou de turma completa
- ✅ Controle de mensalidades com abas (todas / pendentes / inadimplentes)
- ✅ Pagamento registrado pelo admin ou confirmado pelo próprio aluno
- ✅ Exclusão de mensalidade com remoção automática dos pagamentos
- ✅ Histórico de graduações e faixas por aluno
- ✅ Dashboards distintos por perfil com menus restritos
- ✅ Criação de usuário com cadastro automático de aluno/professor
- ✅ Relatório PDF de mensalidades pendentes
- ✅ Relatório PDF de frequência por turma (com % por aluno)

---

## Solução de problemas comuns

### API não conecta ao banco
```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```
→ O campo `DB_PASSWORD` no `.env` está vazio. Verifique o arquivo.

### Frontend não instala dependências
```
npm error ERESOLVE could not resolve
```
→ Use `npm install --legacy-peer-deps`

### Porta já em uso
```
Error: listen EADDRINUSE :::3001
```
→ Outra instância da API está rodando. Encerre com:
```bash
# Linux
kill $(lsof -t -i:3001)

# Linux (alternativa)
fuser -k 3001/tcp
```

### Tabelas não criadas
→ Verifique se a API subiu com `✅ Banco de dados conectado`. O TypeORM cria as tabelas automaticamente ao iniciar.

### Login retorna "Credenciais inválidas"
→ Verifique se o usuário admin foi inserido no banco. O hash da senha deve começar com `$2a$10$`.

### Login bloqueado
→ Após 5 tentativas incorretas, o acesso fica bloqueado por 15 minutos. Aguarde ou reinicie a API para limpar o contador em memória.

### Erro ao excluir professor ou turma
→ O registro possui vínculos. Leia a seção **Regras de exclusão** acima para resolver.

---

## Segurança

- Senhas nunca são retornadas pela API
- JWT expira em 8 horas
- Acesso por perfil verificado em cada endpoint via middleware
- Logs de auditoria registram todas as operações críticas com IP e timestamp
- Variáveis sensíveis isoladas no `.env` (não versionado)

---

## Licença

Projeto acadêmico — Universidade de Passo Fundo (UPF) · 2026
