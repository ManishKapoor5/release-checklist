import { Hono } from "hono";
import { cors } from "hono/cors";
import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs as schema } from "./schema";
import { resolvers } from "./resolvers";
import type { IncomingMessage, ServerResponse } from "http";

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

// Vercel serverless handler
module.exports = async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: req.method !== "GET" && req.method !== "HEAD"
      ? require("stream").Readable.toWeb(req)
      : undefined,
  });

  const response = await app.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = await response.text();
  res.end(body);
};