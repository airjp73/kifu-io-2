import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    OGS_CLIENT_ID: z.string(),
    OGS_CLIENT_SECRET: z.string(),
    OGS_PASSWORD: z.string(),
    OGS_USERNAME: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
