# Employee Recognition System API Documentation

## Overview
A GraphQL API built with TypeScript for sending employee recognitions (kudos) with `PUBLIC`, `PRIVATE`, or `ANONYMOUS` visibility. Supports real-time notifications via subscriptions, email notifications via Gmail SMTP, analytics, and role-based access control (RBAC) with username/password authentication. Uses in-memory storage.

## Base URL
- **Endpoint**: `http://localhost:4000` (HTTPS in production)
- **WebSocket**: `ws://localhost:4000` (for subscriptions)

## Authentication
- **Headers**:
  - `X-Username`: User’s email (e.g., `mangai@company.com`)
  - `X-Password`: User’s password (e.g., `mangai123`)
- **Users**:
  - Mangai: `mangai@company.com` / `mangai123` (EMPLOYEE, Engineering)
  - Valli: `valli@company.com` / `valli456` (MANAGER, Engineering)
  - Sath: `sath@company.com` / `sath789` (HR, HR)

## Schema
### Types
- **User**:
  ```graphql
  type User {
    id: ID!
    name: String!
    email: String!
    team: String!
    role: Role!
  }
  enum Role { EMPLOYEE, MANAGER, HR, ADMIN }
  ```
- **Recognition**:
  ```graphql
  type Recognition {
    id: ID!
    from: User # Null for ANONYMOUS
    to: User!
    message: String!
    emojis: [String!]!
    visibility: Visibility!
    timestamp: String!
  }
  enum Visibility { PUBLIC, PRIVATE, ANONYMOUS }
  ```
- **AnalyticsSummary**:
  ```graphql
  type AnalyticsSummary {
    totalRecognitions: Int!
    byTeam: [TeamCount!]!
    byKeyword: [KeywordCount!]!
    engagementLevel: Float!
    byDateRange: [Recognition!]!
  }
  type TeamCount { team: String!, count: Int! }
  type KeywordCount { keyword: String!, count: Int! }
  ```

### Queries
- **`recognitions(team: String)`**: All recognitions, optionally filtered by team. `PRIVATE` visible to sender/receiver only.
  ```graphql
  query { recognitions(team: "Engineering") { id message from { name } } }
  ```
- **`userRecognitions(userId: ID!)`**: Recognitions for a user (self, MANAGER, HR, ADMIN).
  ```graphql
  query { userRecognitions(userId: "1") { id message } }
  ```
- **`analytics(team: String, keyword: String, startDate: String, endDate: String)`**: Analytics for MANAGER, HR, ADMIN.
  ```graphql
  query { analytics { totalRecognitions byTeam { team count } } }
  ```
- **`user(id: ID!)`**: User details (password restricted). Self or ADMIN only.
  ```graphql
  query { user(id: "1") { name email } }
  ```
- **`users`**: All users (password restricted). MANAGER, HR, ADMIN only.
  ```graphql
  query { users { id name } }
  ```

### Mutations
- **`sendRecognition(toId: ID!, message: String!, emojis: [String!]!, visibility: Visibility!)`**: Sends a recognition, triggers subscriptions/emails.
  ```graphql
  mutation {
    sendRecognition(toId: "2", message: "Great job!", emojis: ["🌟"], visibility: PUBLIC) {
      id
      message
    }
  }
  ```

### Subscriptions
- **`newRecognition(userId: ID!)`**: Real-time updates for a user’s recognitions.
  ```graphql
  subscription { newRecognition(userId: "2") { id message from { name } } }
  ```
- **`newTeamRecognition(team: String!)`**: Real-time updates for `PUBLIC`/`ANONYMOUS` team recognitions.
  ```graphql
  subscription { newTeamRecognition(team: "Engineering") { id message to { name } } }
  ```

## Email Notifications
- **Recipient**: Sent to `to.email` on `sendRecognition`.
  - Subject: `New Recognition Received`
  - Content: Sender (or “anonymous”), message, emojis, visibility.
- **Team**: Sent to team members (except recipient) for `PUBLIC`/`ANONYMOUS`.
  - Subject: `Team Member Recognized: <name>`
  - Content: Recipient, sender (or “anonymous”), message, emojis.
- **SMTP**: Gmail (`smtp.gmail.com`, port 587, TLS).
- **Credentials**: Stored in `.env`:
  ```
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-specific-password
  ```

## Setup
1. **Prerequisites**: Node.js (16+), TypeScript.
2. **Install**: `npm install`
3. **Configure `.env`**: Set `EMAIL_USER`, `EMAIL_PASS` (Gmail app-specific password).
4. **Run**: `npm start` or `npx ts-node --esm server.ts`
5. **Access**: `http://localhost:4000` (GraphQL Playground)

## Security
- **RBAC**: Restricts access by role (e.g., `analytics` for MANAGER/HR/ADMIN).
- **Passwords**: Restricted in `User` queries. Use `bcrypt` in production.
- **Production**: Use HTTPS, secure `.env` (add to `.gitignore`).

## Testing
1. **Set Headers**:
   ```json
   {
     "X-Username": "mangai@company.com",
     "X-Password": "mangai123"
   }
   ```
2. **Test Mutation**: Run `sendRecognition`, check Gmail inbox.
3. **Test Subscriptions**: Subscribe to `newRecognition` or `newTeamRecognition`.
