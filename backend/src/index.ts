import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs as schema } from "./schema";
import { resolvers } from "./resolvers";

const yoga = createYoga({
  schema: createSchema({ typeDefs: schema, resolvers }),
  graphqlEndpoint: "/graphql",
  cors: {
    origin: "*",
    allowedHeaders: ["Content-Type"],
    methods: ["POST", "GET", "OPTIONS"],
  },
});

// Local dev
if (process.env.NODE_ENV !== "production") {
  const { createServer } = require("http");
  const server = createServer(yoga);
  server.listen(4000, () => {
    console.log("🚀 Server running on http://localhost:4000/graphql");
  });
}

module.exports = yoga;