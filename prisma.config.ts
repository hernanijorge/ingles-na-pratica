import path from "node:path";
import fs from "node:fs";
import { defineConfig } from "prisma/config";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
