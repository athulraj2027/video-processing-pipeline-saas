import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function validateEnv() {
    const isServer = typeof window === "undefined";

    const data = {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NODE_ENV: process.env.NODE_ENV,
    };

    // On the client, server-only variables (like private keys) will be undefined,
    // so we only validate NEXT_PUBLIC_ prefixed variables.
    const schema = isServer
        ? envSchema
        : envSchema.pick({ NEXT_PUBLIC_API_URL: true }).extend({
              NODE_ENV: z.string().optional(),
          });

    const result = schema.safeParse(data);

    if (!result.success) {
        console.error("❌ Invalid environment variables:");
        console.error(JSON.stringify(result.error.format(), null, 2));
        throw new Error("Invalid environment configuration");
    }

    return result.data as z.infer<typeof envSchema>;
}

export const env = validateEnv();
