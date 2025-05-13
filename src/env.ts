import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Chỉ cần 2 biến này cho Prisma theo schema.prisma
    POSTGRES_PRISMA_URL: z.string().min(1),
    POSTGRES_URL_NON_POOLING: z.string().min(1),
    // Biến xác thực và API
    JWT_SECRET: z.string().min(32),
    GEMINI_API_KEY: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {},
});
