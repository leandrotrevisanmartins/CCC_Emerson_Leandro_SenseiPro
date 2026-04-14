import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { appDataSource } from "../data-source";
import UsuarioRepository from "../repositories/usuarioRepository";

export class UsuarioController {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository(appDataSource);
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarios = await this.usuarioRepository.getAll();
      // Remove senha da resposta
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
      const { email, senha, perfil } = req.body;
      if (!email || !senha) {
        res.status(400).json({ error: "Email e senha são obrigatórios." });
        return;
      }

      const existente = await this.usuarioRepository.getByEmail(email);
      if (existente) {
        res.status(409).json({ error: "Email já cadastrado." });
        return;
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      await this.usuarioRepository.create({ email, senha: senhaHash, perfil });
      res.status(201).json({ message: "Usuário criado com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar usuário." });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { senha, ...dados } = req.body;
      let dadosAtualizados = { ...dados };

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
