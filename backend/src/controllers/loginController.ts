import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { appDataSource } from "../data-source";
import UsuarioRepository from "../repositories/usuarioRepository";

// Mapa em memória: email → { tentativas, bloqueadoAte }
const tentativasLogin = new Map<string, { count: number; bloqueadoAte: number }>();

const MAX_TENTATIVAS = 5;
const TEMPO_BLOQUEIO_MS = 15 * 60 * 1000; // 15 minutos

export class LoginController {
  doLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha são obrigatórios." });
      return;
    }

    // Verifica se o email está bloqueado
    const registro = tentativasLogin.get(email);
    if (registro && registro.bloqueadoAte > Date.now()) {
      const minutosRestantes = Math.ceil((registro.bloqueadoAte - Date.now()) / 60000);
      res.status(429).json({
        error: `Muitas tentativas falhas. Tente novamente em ${minutosRestantes} minuto(s).`,
      });
      return;
    }

    try {
      const usuarioRepository = new UsuarioRepository(appDataSource);
      const usuario = await usuarioRepository.getByEmail(email);

      if (!usuario) {
        registrarTentativaFalha(email);
        res.status(401).json({ error: "Credenciais inválidas." });
        return;
      }

      const senhaValida = await bcrypt.compare(password, usuario.senha);
      if (!senhaValida) {
        registrarTentativaFalha(email);
        const restantes = MAX_TENTATIVAS - (tentativasLogin.get(email)?.count || 0);
        res.status(401).json({
          error: `Credenciais inválidas. ${restantes > 0 ? `${restantes} tentativa(s) restante(s) antes do bloqueio.` : "Conta bloqueada por 15 minutos."}`,
        });
        return;
      }

      // Login bem-sucedido — limpa o contador
      tentativasLogin.delete(email);

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          perfil: usuario.perfil,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "8h" }
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

function registrarTentativaFalha(email: string) {
  const atual = tentativasLogin.get(email) || { count: 0, bloqueadoAte: 0 };
  atual.count += 1;
  if (atual.count >= MAX_TENTATIVAS) {
    atual.bloqueadoAte = Date.now() + TEMPO_BLOQUEIO_MS;
    console.warn(`[AUDITORIA] Email ${email} bloqueado por 15min após ${MAX_TENTATIVAS} tentativas falhas.`);
  }
  tentativasLogin.set(email, atual);
}
