import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { assertEnv, env } from "./config/env.js";

async function start() {
  assertEnv();
  await connectDb();
  const app = createApp();
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`LearnEase Pro API running on ${env.port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
