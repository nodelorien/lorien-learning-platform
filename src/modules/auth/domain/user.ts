export interface User {
  id: string;
  name: string;
  company: string;
  trainingId?: string;
  role: 'admin' | 'user';
  password: string;
  createdAt: string;
}
