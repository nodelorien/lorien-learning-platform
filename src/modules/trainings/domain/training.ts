export interface Training {
  id: string;
  title: string;
  description: string;
  expirationDate?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingInput {
  title: string;
  description?: string;
  expirationDate?: string;
}
