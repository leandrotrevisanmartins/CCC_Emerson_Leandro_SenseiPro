# SenseiPro

Sistema web para gestão de academias de artes marciais (Jiu-Jitsu, Judô).

**Autores:** Emerson Rosado Scalcon · Leandro Trevisan Martins

---

## Sobre o projeto

O SenseiPro centraliza as operações administrativas e operacionais de uma academia de artes marciais, permitindo o gerenciamento de alunos, professores, turmas, presenças, mensalidades e graduações em uma única plataforma web.

## Funcionalidades

- Autenticação com perfis de acesso (administrador, professor, aluno)
- Cadastro e gerenciamento de alunos e professores
- Controle de turmas, modalidades e matrículas
- Registro de presença por treino
- Controle financeiro de mensalidades e pagamentos
- Histórico de graduações e faixas
- Dashboard com visão geral da academia

## Estrutura do repositório

SenseiPro/
├── backend/          API REST — Node.js, TypeScript, Express, TypeORM
└── frontend/         Aplicação Web — Next.js, React, Bootstrap

## Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js 20, TypeScript 5.6, Express 4.19, TypeORM 0.3.20 |
| Banco de dados | PostgreSQL 16 |
| Autenticação | JWT + bcryptjs |
| Frontend | Next.js 14, React 18, React-Bootstrap |
