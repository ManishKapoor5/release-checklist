export const typeDefs = `
  scalar JSON
  scalar DateTime

  type Release {
    id: ID!
    name: String!
    targetDate: DateTime!
    status: String!
    additionalInfo: String
    steps: JSON!
  }

  type Query {
    releases: [Release!]!
    release(id: ID!): Release
  }

  type Mutation {
    createRelease(name: String!, targetDate: DateTime!, additionalInfo: String): Release!
    updateRelease(id: ID!, name: String, targetDate: DateTime, steps: JSON, additionalInfo: String): Release!
    deleteRelease(id: ID!): ID!
  }
`;
