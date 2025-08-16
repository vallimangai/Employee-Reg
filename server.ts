import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'node:fs';
import { resolvers } from './resolvers.ts';
import { mockUsers, mockRecognitions } from './data.ts';
import { PubSub } from 'graphql-subscriptions';

// In-memory pubsub for subscriptions (real-time)
const pubsub = new PubSub();

// Context interface for RBAC
interface Context {
  user: { id: string; role: string } | null; // Allow null for unauthenticated
  pubsub: PubSub;
  data: { users: any[]; recognitions: any[] };
}

// Schema
const typeDefs = readFileSync('./schema.graphql', 'utf-8');

// Server setup
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
});

// Start server
const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      let user: { id: string; role: string } | null = null;
      const username = req.headers['x-username'];
      const password = req.headers['x-password'];
      if (typeof username === 'string' && typeof password === 'string') {
        try {
          // Validate username and password against mockUsers
          const foundUser = mockUsers.find(
            (u) => u.email === username && u.password === password
          );
          if (foundUser) {
            user = { id: foundUser.id, role: foundUser.role };
          } else {
            console.warn('Invalid credentials');
          }
        } catch (error) {
          console.warn('Authentication error:', error);
        }
      } else {
        console.warn('Missing username or password headers');
      }
      return {
        user, // Will be null if credentials are missing or invalid
        pubsub,
        data: { users: mockUsers, recognitions: mockRecognitions },
      };
    },
    listen: { port: 4000 },
  });
  console.log(`🚀 Server ready at ${url}`);
};

startServer();

// Security: In production, use HTTPS, hash passwords, add CSRF protection, and rate limiting.
// Performance: Use DataLoader for batching, indexes on data for analytics.
// Batch Fallback: If subscriptions fail, batch notifications every 10 minutes via cron job.