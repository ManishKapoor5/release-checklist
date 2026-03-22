import { Hono } from "hono";
import { cors } from "hono/cors";
import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs as schema } from "./schema";
import { resolvers } from "./resolvers";

const app = new Hono();

app.use(
  "/graphql",
  cors({
    origin: (origin) => {
      const allowed = [
        "http://localhost:5173",
        process.env.FRONTEND_URL ?? "",
      ];
      return allowed.includes(origin ?? "") ? origin ?? "" : "";
    },
    allowMethods: ["POST", "GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

const yoga = createYoga({
  schema: createSchema({ typeDefs: schema, resolvers }),
  graphqlEndpoint: "/graphql",
});

app.on(["GET", "POST"], "/graphql", (c) =>
  yoga.fetch(c.req.raw, c.env as any)
);

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const { serve } = await import("@hono/node-server");
  const port = 4000;
  serve({ fetch: app.fetch, port });
  console.log(`🚀 Server running on http://localhost:${port}/graphql`);
}

// Vercel serverless export
export default app;