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
    origin: "*",
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

module.exports = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  const request = new Request(url.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
    ...(hasBody && {
      body: require("stream").Readable.toWeb(req),
      duplex: "half",
    }),
  } as RequestInit);

  const response = await app.fetch(request);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.setHeader("Access-Control-Allow-Origin", "*");
  const body = await response.text();
  res.end(body);
};