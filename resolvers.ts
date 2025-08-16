import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { sendEmail } from './email.ts'; // Ensure .js extension
import type { Recognition, User } from './types.ts';

const NEW_RECOGNITION = 'NEW_RECOGNITION';
const NEW_TEAM_RECOGNITION = 'NEW_TEAM_RECOGNITION';
const pubsub = new PubSub();

export const resolvers = {
  Mutation: {
    sendRecognition: async (_: any, args: any, context: any) => {
      if (!context.user) throw new GraphQLError('Authentication required');
      const { toId, message, emojis, visibility } = args;
      const from = context.data.users.find((u: User) => u.id === context.user.id);
      const to = context.data.users.find((u: User) => u.id === toId);
      if (!from) throw new GraphQLError('Sender not found');
      if (!to) throw new GraphQLError('Recipient not found');

      const newRec: Recognition = {
        id: `${context.data.recognitions.length + 1}`,
        from: visibility === 'ANONYMOUS' ? null : from,
        to,
        message,
        emojis,
        visibility,
        timestamp: new Date().toISOString(),
      };
      context.data.recognitions.push(newRec);

      // Publish to user and team subscriptions
      context.pubsub.publish(NEW_RECOGNITION, { newRecognition: newRec });
      if (newRec.visibility !== 'PRIVATE') {
        context.pubsub.publish(NEW_TEAM_RECOGNITION, { newTeamRecognition: newRec });
      }

      // Send email to recipient
      try {
        await sendEmail(
          to.email,
          `New Recognition Received`,
          `You received a recognition from ${
            visibility === 'ANONYMOUS' ? 'an anonymous sender' : from.name
          }: "${message}" ${emojis.join(' ')}`,
          `<p>You received a recognition from <strong>${
            visibility === 'ANONYMOUS' ? 'Anonymous' : from.name
          }</strong>:</p><p>"${message}" ${emojis.join(' ')}</p><p>Visibility: ${visibility}</p>`
        );
      } catch (error) {
        console.error('Failed to send recipient email:', error);
      }

      // Send email to team members (except recipient) for PUBLIC/ANONYMOUS
      if (visibility !== 'PRIVATE') {
        const teamMembers = context.data.users.filter(
          (u: User) => u.team === to.team && u.id !== to.id
        );
        for (const member of teamMembers) {
          try {
            await sendEmail(
              member.email,
              `Team Member Recognized: ${to.name}`,
              `A team member (${to.name}) received a recognition from ${
                visibility === 'ANONYMOUS' ? 'an anonymous sender' : from.name
              }: "${message}" ${emojis.join(' ')}`,
              `<p>Team member <strong>${to.name}</strong> received a recognition from <strong>${
                visibility === 'ANONYMOUS' ? 'Anonymous' : from.name
              }</strong>:</p><p>"${message}" ${emojis.join(' ')}</p><p>Visibility: ${visibility}</p>`
            );
          } catch (error) {
            console.error(`Failed to send team email to ${member.email}:`, error);
          }
        }
      }

      return newRec;
    },
  },
  // ... other resolvers (unchanged)
};