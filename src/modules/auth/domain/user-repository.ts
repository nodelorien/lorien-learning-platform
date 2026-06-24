import { Repository } from '../../../shared/domain/repository';
import { User } from './user';

export interface UserRepository extends Repository<User> {
  findByName(name: string): Promise<User | null>;
  update(user: User): Promise<User>;
}
