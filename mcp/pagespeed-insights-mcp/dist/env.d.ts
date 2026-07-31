import { z } from "zod";
declare const EnvSchema: z.ZodObject<{
    GOOGLE_API_KEY: z.ZodString;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        trace: "trace";
        debug: "debug";
        info: "info";
        warn: "warn";
        fatal: "fatal";
    }>>;
    MAX_CONCURRENCY: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    REQUEST_TIMEOUT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    RETRY_ATTEMPTS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    CACHE_TTL: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
}, z.core.$strip>;
export type Environment = z.infer<typeof EnvSchema>;
export declare function getEnv(): Environment;
export declare function validateEnv(): void;
export {};
