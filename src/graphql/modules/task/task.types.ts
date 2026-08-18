export const taskTypeDefs = /* GraphQL */ `
  type Task {
    id: ID!
    name: String!
    done: Boolean!
    createdAt: String!
    updatedAt: String!
    deletedAt: String
  }

  input CreateTaskInput {
    name: String!
  }

  input UpdateTaskInput {
    id: ID!
    name: String
    done: Boolean
  }

  extend type Query {
    tasks(limit: Int, offset: Int): [Task!]!
    task(id: ID!): Task
  }

  extend type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    toggleTaskComplete(id: ID!): Task!
  }
`;
