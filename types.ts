export interface User {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
  password: string; // Use hashed passwords in production
}

export interface Recognition {
  id: string;
  from: User;
  to: User;
  message: string;
  emojis: string[];
  visibility: string;
  timestamp: string;
}