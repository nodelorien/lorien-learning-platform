import { v4 as uuid } from 'uuid';
import { UserRepository } from '../domain/user-repository';
import { User } from '../domain/user';

export interface RegisterUserInput {
  name: string;
  company?: string;
  trainingId?: string;
  password: string;
}

export class RegisterUser {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.userRepository.findByName(input.name);
    if (existing) {
      throw new Error('El nombre de usuario ya existe');
    }
    const user: User = {
      id: uuid(),
      name: input.name,
      company: input.company ?? '',
      trainingId: input.trainingId,
      role: 'user',
      password: input.password,
      createdAt: new Date().toISOString(),
    };
    return this.userRepository.save(user);
  }
}
