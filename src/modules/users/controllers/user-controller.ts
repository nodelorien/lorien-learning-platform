import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { UserRepository } from '../../auth/domain/user-repository';
import { User } from '../../auth/domain/user';
import { getDb } from '../../../shared/infrastructure/database';

export function createUserController(userRepository: UserRepository): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const users = await userRepository.findAll();
      res.json(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          company: u.company,
          trainingId: u.trainingId,
          role: u.role,
          createdAt: u.createdAt,
        })),
      );
    } catch {
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = p(req.params, 'id');
      const user = await userRepository.findById(id);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.json({
        id: user.id,
        name: user.name,
        company: user.company,
        trainingId: user.trainingId,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch {
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { name, company, password, role, trainingId } = req.body;
      if (!name || !password) {
        res.status(400).json({ error: 'Nombre y contraseña son requeridos' });
        return;
      }
      const existing = await userRepository.findByName(name);
      if (existing) {
        res.status(400).json({ error: 'El nombre de usuario ya existe' });
        return;
      }
      const user: User = {
        id: uuid(),
        name,
        company: company ?? '',
        trainingId,
        role: role ?? 'user',
        password,
        createdAt: new Date().toISOString(),
      };
      await userRepository.save(user);
      res.status(201).json({
        id: user.id,
        name: user.name,
        company: user.company,
        trainingId: user.trainingId,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch {
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  });

  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const id = p(req.params, 'id');
      const existing = await userRepository.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      const { name, company, role, password, trainingId } = req.body;
      const updated: User = {
        ...existing,
        name: name ?? existing.name,
        company: company ?? existing.company,
        role: role ?? existing.role,
        trainingId: trainingId !== undefined ? trainingId : existing.trainingId,
        password: existing.password,
      };

      if (password) {
        const db = getDb();
        const hash = bcrypt.hashSync(password, 10);
        updated.password = hash;
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id);
      }

      await userRepository.update(updated);
      res.json({
        id: updated.id,
        name: updated.name,
        company: updated.company,
        trainingId: updated.trainingId,
        role: updated.role,
        createdAt: updated.createdAt,
      });
    } catch {
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = p(req.params, 'id');
      if (id === 'admin') {
        res.status(400).json({ error: 'No se puede eliminar el usuario admin' });
        return;
      }
      await userRepository.delete(id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  });

  return router;
}

function p(params: Record<string, string | string[]>, key: string): string {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}
