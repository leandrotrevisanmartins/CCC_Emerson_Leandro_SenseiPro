SenseiPro
Sistema web para gestão de academias de artes marciais (Jiu-Jitsu, Judô).

Desenvolvido como projeto acadêmico na Universidade de Passo Fundo — UPF, na disciplina de Engenharia de Requisitos.

Autores: Emerson Rosado Scalcon · Leandro Trevisan Martins

Sobre o projeto
O SenseiPro centraliza as operações administrativas e operacionais de uma academia de artes marciais, permitindo o gerenciamento de alunos, professores, turmas, presenças, mensalidades e graduações em uma única plataforma web.

Funcionalidades
Autenticação com perfis de acesso (administrador, professor, aluno)
Cadastro e gerenciamento de alunos e professores
Controle de turmas, modalidades e matrículas
Registro de presença por treino
Controle financeiro de mensalidades e pagamentos
Histórico de graduações e faixas
Dashboard com visão geral da academia
Estrutura do repositório
SenseiPro/
├── backend/          API REST — Node.js, TypeScript, Express, TypeORM
└── frontend/         Aplicação Web — Next.js, React, Bootstrap
Tecnologias
Camada	Tecnologias
Backend	Node.js 20, TypeScript 5.6, Express 4.19, TypeORM 0.3.20
Banco de dados	PostgreSQL 16
Autenticação	JWT + bcryptjs
Frontend	Next.js 14, React 18, React-Bootstrap
Como rodar localmente
Pré-requisitos
Node.js 20+
PostgreSQL 16+
Git
Backend
cd backend/senseipro
npm install
cp .env.example .env   # configure as variáveis de ambiente
npm run dev
A API sobe em http://localhost:3001 Documentação dos endpoints: backend/senseipro/README.md

Frontend
cd frontend
npm install
npm run dev
A aplicação sobe em http://localhost:3000

Cronograma
Período	Entrega
11 abr - 17 abr	Estrutura base do backend
18 abr - 24 abr	Módulo de login e autenticação
25 abr - 1 mai	Módulo de alunos
02 mai - 08 mai	Módulo de professores
09 mai - 15 mai	Módulo de turmas e modalidades
16 mai - 22 mai	Módulo de presença
23 mai - 29 mai	Módulo financeiro
30 mai - 05 jun	Módulo de graduações e dashboard
06 jun - 12 jun	Testes e validação
13 jun - 19 jun	Ajustes finais e apresentação
