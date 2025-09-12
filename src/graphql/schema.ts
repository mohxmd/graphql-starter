import { createSchema } from "graphql-yoga";
import { taskResolvers } from "./modules/task/task.resolvers";
import { taskTypeDefs } from "./modules/task/task.types";

const baseTypeDefs = /* GraphQL */ `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const schema = createSchema({
  typeDefs: [baseTypeDefs, taskTypeDefs],
  resolvers: [taskResolvers],
});
