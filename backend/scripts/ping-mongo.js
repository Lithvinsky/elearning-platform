import mongoose from "mongoose";
import { assertEnv, env } from "../src/config/env.js";

async function main() {
  assertEnv();
  await mongoose.connect(env.mongoUri);
  const ping = await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Ping:", ping.ok === 1 ? "OK" : ping);
  console.log("Host:", mongoose.connection.host);
  console.log("Database:", mongoose.connection.name);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
