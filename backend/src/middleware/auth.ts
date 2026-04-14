import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id_usuario: number;
  email: string;
  perfil: string;
}

// Estende o Request para carregar os dados do usuário logado
declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
  }
}

class Authentication {
  hasAuthorization(req: Request, res: Response, next: NextFunction) {
    const bearerHeader = req.headers.authorization;
    if (!bearerHeader) {
      return res.status(401).json({ auth: false, message: "Token não fornecido." });
    }

    const token = bearerHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ auth: false, message: "Formato inválido. Use: Bearer <token>" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.usuario = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ auth: false, message: "Token inválido ou expirado." });
    }
  }

  // Verifica se o usuário tem perfil de admin
  isAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.usuario?.perfil !== "admin") {
      return res.status(403).json({ message: "Acesso restrito a administradores." });
    }
    next();
  }

  // Verifica se o usuário tem perfil de admin ou professor
  isAdminOrProfessor(req: Request, res: Response, next: NextFunction) {
    const perfil = req.usuario?.perfil;
    if (perfil !== "admin" && perfil !== "professor") {
      return res.status(403).json({ message: "Acesso restrito a administradores e professores." });
    }
    next();
  }
}

export default new Authentication();
