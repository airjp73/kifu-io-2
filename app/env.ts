import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    AI_MOVE_SECRET: z.string(),
    GH_API_TOKEN: z.string(),
    SERVER_LOCATION: z.string(),
    REPO_NAME: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
