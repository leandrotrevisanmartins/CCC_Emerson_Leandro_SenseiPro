import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { appDataSource } from "../data-source";
import UsuarioRepository from "../repositories/usuarioRepository";
import AlunoRepository from "../repositories/alunoRepository";
import ProfessorRepository from "../repositories/professorRepository";

const SENHA_PADRAO = "password";

export class UsuarioController {
  private usuarioRepository: UsuarioRepository;
  private alunoRepository: AlunoRepository;
  private professorRepository: ProfessorRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository(appDataSource);
    this.alunoRepository = new AlunoRepository(appDataSource);
    this.professorRepository = new ProfessorRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioRepository.getAll();
      const resultado = usuarios.map(({ senha, ...u }) => u);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuários." });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = await this.usuarioRepository.getById(
        parseInt(req.params.id)
      );
      if (!usuario) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }
      const { senha, ...resultado } = usuario;
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário." });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, perfil, nome, telefone, especialidade } = req.body;

      if (!email || !perfil) {
        res.status(400).json({ error: "Email e perfil são obrigatórios." });
        return;
      }

      if (!nome) {
        res.status(400).json({ error: "O campo nome é obrigatório." });
        return;
      }

      const existente = await this.usuarioRepository.getByEmail(email);
      if (existente) {
        res.status(409).json({ error: "Email já cadastrado." });
        return;
      }

      const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);
      const novoUsuario = await this.usuarioRepository.create({
        email,
        senha: senhaHash,
        perfil,
      });

      let registroCriado: { tipo: string; id: number; nome: string } | null = null;

      if (perfil === "aluno") {
        const novoAluno = await this.alunoRepository.create({
          nome,
          email,
          telefone: telefone || undefined,
          usuario: novoUsuario,
        });
        registroCriado = {
          tipo: "aluno",
          id: novoAluno.id_aluno!,
          nome: novoAluno.nome,
        };
      } else if (perfil === "professor") {
        const novoProfessor = await this.professorRepository.create({
          nome,
          email,
          telefone: telefone || undefined,
          especialidade: especialidade || undefined,
          usuario: novoUsuario,
        });
        registroCriado = {
          tipo: "professor",
          id: novoProfessor.id_professor!,
          nome: novoProfessor.nome,
        };
      }

      res.status(201).json({
        message: "Usuário criado com sucesso.",
        usuario: {
          id_usuario: novoUsuario.id_usuario,
          email: novoUsuario.email,
          perfil: novoUsuario.perfil,
        },
        registro: registroCriado,
        senha_padrao: SENHA_PADRAO,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar usuário." });
    }
  };

  // Troca a senha do próprio usuário logado
  trocarSenha = async (req: Request, res: Response): Promise<void> => {
    try {
      const id_usuario = req.usuario!.id_usuario;
      const { senha_atual, nova_senha } = req.body;

      if (!senha_atual || !nova_senha) {
        res.status(400).json({ error: "Senha atual e nova senha são obrigatórias." });
        return;
      }

      if (nova_senha.length < 6) {
        res.status(400).json({ error: "A nova senha deve ter pelo menos 6 caracteres." });
        return;
      }

      const usuario = await this.usuarioRepository.getById(id_usuario);
      if (!usuario) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }

      const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
      if (!senhaValida) {
        res.status(401).json({ error: "Senha atual incorreta." });
        return;
      }

      const novaSenhaHash = await bcrypt.hash(nova_senha, 10);
      await this.usuarioRepository.update(id_usuario, { senha: novaSenhaHash });

      res.status(200).json({ message: "Senha alterada com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao trocar senha." });
    }
  };

  // Reseta senha de outro usuário para o padrão (apenas admin)
  resetarSenha = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const usuario = await this.usuarioRepository.getById(id);
      if (!usuario) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }
      const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);
      await this.usuarioRepository.update(id, { senha: senhaHash });
      res.status(200).json({
        message: "Senha resetada com sucesso.",
        senha_padrao: SENHA_PADRAO,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao resetar senha." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { senha, ...dados } = req.body;
      const dadosAtualizados: Record<string, unknown> = { ...dados };

      if (senha) {
        dadosAtualizados.senha = await bcrypt.hash(senha, 10);
      }

      const atualizado = await this.usuarioRepository.update(
        parseInt(req.params.id),
        dadosAtualizados
      );
      if (!atualizado) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }
      const { senha: s, ...resultado } = atualizado;
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const sucesso = await this.usuarioRepository.delete(
        parseInt(req.params.id)
      );
      if (!sucesso) {
        res.status(404).json({ error: "Usuário não encontrado." });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar usuário." });
    }
  };
}
