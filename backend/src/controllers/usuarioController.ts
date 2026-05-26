import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { appDataSource } from "../data-source";
import UsuarioRepository from "../repositories/usuarioRepository";

const SENHA_PADRAO = "password";

export class UsuarioController {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioRepository.getAll();
      const resultado = usuarios.map(({ senha, ...u }) => u);
      res.status(200).json(resultado);
    } catch {
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
    } catch {
      res.status(500).json({ error: "Erro ao buscar usuário." });
    }
  };

  // Cria usuário com senha padrão "password" — admin informa apenas email e perfil
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, perfil } = req.body;

      if (!email || !perfil) {
        res.status(400).json({ error: "Email e perfil são obrigatórios." });
        return;
      }

      const existente = await this.usuarioRepository.getByEmail(email);
      if (existente) {
        res.status(409).json({ error: "Email já cadastrado." });
        return;
      }

      // Sempre usa a senha padrão na criação pelo admin
      const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);
      const novoUsuario = await this.usuarioRepository.create({
        email,
        senha: senhaHash,
        perfil,
      });

      res.status(201).json({
        message: "Usuário criado com sucesso.",
        usuario: {
          id_usuario: novoUsuario.id_usuario,
          email: novoUsuario.email,
          perfil: novoUsuario.perfil,
        },
        senha_padrao: SENHA_PADRAO,
      });
    } catch {
      res.status(500).json({ error: "Erro ao criar usuário." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { senha, ...dados } = req.body;
      let dadosAtualizados: Record<string, unknown> = { ...dados };

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
    } catch {
      res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  };

  // Reseta a senha do usuário para a senha padrão
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
    } catch {
      res.status(500).json({ error: "Erro ao resetar senha." });
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
    } catch {
      res.status(500).json({ error: "Erro ao deletar usuário." });
    }
  };
}
