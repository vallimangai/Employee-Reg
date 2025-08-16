import type { User, Recognition } from './types.ts'; // Use type-only import



export const mockUsers : User[] = [
  {
    id: '1',
    name: 'Mangai',
    email: 'mangai@company.com',
    team: 'Engineering',
    role: 'EMPLOYEE',
    password: 'mangai123', // Plaintext for demo; use hashed passwords in production
  },
  {
    id: '2',
    name: 'Valli',
    email: 'valli@company.com',
    team: 'Engineering',
    role: 'MANAGER',
    password: 'valli456',
  },
  {
    id: '3',
    name: 'Sath',
    email: 'sath@company.com',
    team: 'HR',
    role: 'HR',
    password: 'sath789',
  },
];

export const mockRecognitions:Recognition[] = [
  {
    id: '1',
    from: mockUsers[0]!, // Mangai
    to: mockUsers[1]!, // Valli
    message: 'Great job on the project!',
    emojis: ['👍'],
    visibility: 'PUBLIC',
    timestamp: '2025-08-01T10:00:00Z',
  },
];