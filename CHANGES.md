# Changes for part 2

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

enum RequestStatus {
  PENDING
  ACCEPTED
  REFUSED
}

type Request {
  id: Int!
  forumId: Int!
  userId: Int!
  status: RequestStatus
}

type Forum {
  id: Int!
  private: Boolean!
  members: [User]
  messages: [Message]
  admin: User
  pendingRequests: [Request] # Only available to the admin
}

type Query {
  joinedForums: [Forum]
  availableForums: [Forum]
  forum(id: Int!): Forum
}

type Mutation {
  joinForum(id: Int!): Forum
  createForum(private: Boolean): Forum
  postMessage(forumId: Int!, text: String!): Message
  askToJoin(forumId: Int!)
  acceptRequest(id: Int!): Request
  refuseRequest(id: Int!): Request
}
```