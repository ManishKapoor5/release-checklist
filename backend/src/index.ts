import { serve } from '@hono/node-server';
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs as schema } from "./schema";
import { resolvers } from "./resolvers";

const app = new Hono();

app.use(
  "/graphql",
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-app.vercel.app", // replace with real Vercel URL
    ],
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

const yoga = createYoga({ 
  schema: createSchema({ typeDefs: schema, resolvers }),
  graphqlEndpoint: '/graphql'
});

app.on(["GET", "POST"], "/graphql", (c) => yoga.fetch(c.req.raw, c.env as any));

const port = 4000;
console.log(`🚀 Server is running on http://localhost:${port}/graphql`);

serve({
  fetch: app.fetch,
  port
});
