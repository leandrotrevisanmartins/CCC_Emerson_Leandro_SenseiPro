import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appDataSource } from "../data-source";
import UsuarioRepository from "../repositories/usuarioRepository";

export class LoginController {
  doLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios." });
      return;
    }

    try {
      const usuarioRepository = new UsuarioRepository(appDataSource);
      const usuario = await usuarioRepository.getByEmail(email);

      if (!usuario) {
        res.status(401).json({ error: "Credenciais inválidas." });
        return;
      }

      const senhaValida = await bcrypt.compare(password, usuario.senha);
      if (!senhaValida) {
        res.status(401).json({ error: "Credenciais inválidas." });
        return;
      }

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          perfil: usuario.perfil,
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
      );

      res.status(200).json({
        auth: true,
        token,
        usuario: {
          id: usuario.id_usuario,
          email: usuario.email,
          perfil: usuario.perfil,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  };
}
