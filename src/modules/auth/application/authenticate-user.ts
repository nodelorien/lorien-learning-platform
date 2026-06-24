import bcrypt from 'bcryptjs';
import { UserRepository } from '../domain/user-repository';

export interface AuthResult {
  success: boolean;
  user?: { id: string; name: string; role: string };
  error?: string;
}

export class AuthenticateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(name: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByName(name);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    return { success: true, user: { id: user.id, name: user.name, role: user.role } };
  }
}
