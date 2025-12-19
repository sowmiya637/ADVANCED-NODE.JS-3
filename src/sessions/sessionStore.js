import session from "express-session";
import { createClient } from "redis"; // if needed for Redis store
import { RedisStore } from "connect-redis"; // use named import
import redisClient from "../services/redisClient.js";

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: "supersecretkey",       // use env variable in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1 hour
});
