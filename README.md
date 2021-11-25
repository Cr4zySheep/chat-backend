# Chat backend

## How to run ?

This project uses node v16.13.0. In order to run it, run the following commands:

```bash
npm install
npm start
```

The API will be accessible at `http://localhost:4000/graphql`.

## Part 1

### Specs


We assume here that the user/client is already authenticated and has an ID (no need to have a signup/login API).

* A user can see the list of forums he has joined.

* A user can create a new forum (and join it automatically).

* A user can see the list of available forum and can join any.

* He can also join a forum if he knows the forum id.

* Once inside a forum, he can:

  - See the list of previous messages, ordered by most recent. To be displayed in our client, a message should at least have a text, a sending time and name/picture of the sender
  -  See the name and picture of the members of the forum
  - Post a message in the forum

### GraphQL schema

```graphql
scalar Date

type User {
  id: Int!
  fullName: String!
  picture: String
}

type Message {
  id: Int!
  text: String!
  createdAt: Date
  author: User!
}

type Forum {
  id: Int!
  # The following fields are only accessible to members of the forum. They will be null otherwise.
  members: [User]
  messages: [Message]
}

type Query {
  joinedForums: [Forum]
  availableForums: [Forum]
  forum(id: Int!): Forum
}

type Mutation {
  joinForum(id: Int!): Forum
  createForum: Forum
  postMessage(forumId: Int!, text: String!): Message
}
```

## Part 2

See [CHANGES.md](/CHANGES.md).