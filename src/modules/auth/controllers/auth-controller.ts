import { Router, Request, Response } from 'express';
import { AuthenticateUser } from '../application/authenticate-user';
import { RegisterUser } from '../application/register-user';
import { UserRepository } from '../domain/user-repository';

declare module 'express-session' {
  interface SessionData {
    user: { id: string; name: string; role: string };
  }
}

export function createAuthController(
  userRepository: UserRepository,
): Router {
  const router = Router();
  const authenticate = new AuthenticateUser(userRepository);
  const register = new RegisterUser(userRepository);

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { name, password } = req.body;
      const result = await authenticate.execute(name, password);
      if (!result.success) {
        res.status(401).json({ error: result.error });
        return;
      }
      req.session.user = result.user!;
      res.json(result.user);
    } catch {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { name, company, trainingId, password } = req.body;
      if (!name) {
        res.status(400).json({ error: 'El nombre es requerido' });
        return;
      }
      if (!password || password.length < 4) {
        res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
        return;
      }
      const user = await register.execute({ name, company, trainingId, password });
      req.session.user = { id: user.id, name: user.name, role: user.role };
      res.status(201).json({ id: user.id, name: user.name, company: user.company });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar';
      res.status(400).json({ error: message });
    }
  });

  router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {});
    res.json({ success: true });
  });

  router.get('/me', (req: Request, res: Response) => {
    if (!req.session.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    res.json(req.session.user);
  });

  return router;
}
