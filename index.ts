import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import * as express from 'express';
import * as http from 'http';
import { GraphQLScalarType, Kind } from 'graphql';
import { readFileSync } from 'fs';

import { User, Forum, Context, Message } from './types';
import loadFixtures from './data';

const { users, forums, messages } = loadFixtures();

const typeDefs = readFileSync('./schema.graphql').toString('utf-8');

// Custom scalar to manipulate JS Date
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  serialize: (value: Date) => value.toISOString(),
  parseValue: (value: number) => new Date(value),
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

// Functions to ease the manipulation of data
function getUserById(id: number): User | undefined {
  return users.find(user => user.id === id);
}

function getForumById(id: number): Forum {
  const forum = forums.find(item => item.id === id);

  if (!forum) {
    throw new UserInputError(`Forum with id ${id} doesn't exist.`);
  }

  return forum;
}

/**
 * Retrieve the next available id from an array of objects.
 */
function getNextAvailableId(arr: Array<{ id: number }>): number {
  return arr.reduce((value, item) => Math.max(value, item.id + 1), 0);
}

// Let's define the queries resolvers
const joinedForums = (parent, args, context: Context) =>
  forums.filter(forum => forum.members.includes(context.user.id));

const availableForums = (parent, args, context: Context) =>
  forums.filter(forum => !forum.members.includes(context.user.id));

const getForumQuery = (parent, { id }: { id: number }) => getForumById(id);

// Let's define the mutations resolvers
const joinForum = (parent, { id }: { id: number }, context: Context) => {
  const forum = getForumById(id);

  if (forum.members.includes(context.user.id)) {
    throw new UserInputError(
      `User with id ${context.user.id} has alread joined the forum with id ${forum.id}.`
    );
  }

  forum.members.push(context.user.id);
  return forum;
};

const createForum = (parent, args, context) => {
  const newForum = {
    id: getNextAvailableId(forums),
    members: [context.user.id],
  };
  forums.push(newForum);
  return newForum;
};

const postMessage = (
  parent,
  args: { forumId: number; text: string },
  context: Context
): Message => {
  const forum = getForumById(args.forumId);
  if (!forum.members.includes(context.user.id)) {
    throw new UserInputError(
      `User with id ${context.user.id} isn't a member of forum with id ${forum.id}.`
    );
  }

  const newMessage: Message = {
    id: getNextAvailableId(messages),
    text: args.text,
    forumId: args.forumId,
    authorId: context.user.id,
    createdAt: new Date(),
  };
  messages.push(newMessage);
  return newMessage;
};

// Let's define Forum resolvers
const getForumMembers = (parent, args, context: Context): User[] | null => {
  return parent.members.includes(context.user.id)
    ? parent.members.map(userId => getUserById(userId))
    : null;
};

const getForumMessages = (parent, args, context: Context) => {
  return parent.members.includes(context.user.id)
    ? messages
        .filter(message => message.forumId === parent.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    : null;
};

// Let's define Message resolvers
const getMessageAuthor = parent => {
  return getUserById(parent.authorId);
};

const resolvers = {
  Date: dateScalar,

  Query: {
    joinedForums,
    availableForums,
    forum: getForumQuery,
  },

  Mutation: {
    joinForum,
    createForum,
    postMessage,
  },

  Forum: {
    members: getForumMembers,
    messages: getForumMessages,
  },

  Message: {
    author: getMessageAuthor,
  },
};

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
      // Authenticate the user
      const user = users[0]; // Assuming the user is authenticated.

      if (!user) throw new AuthenticationError('You must be logged in.');

      return { user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>(resolve => {
    httpServer.listen({ port: 4000 }, resolve);
  });
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer();
