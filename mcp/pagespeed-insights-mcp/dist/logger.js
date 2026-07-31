import pino from "pino";
import { getEnv } from "./env.js";
let logger;
function createLogger() {
    const env = getEnv();
    // For MCP servers, we must write logs to stderr to avoid interfering with JSON-RPC on stdout
    const destination = pino.destination({
        dest: 2, // 2 is stderr
        sync: false
    });
    return pino({
        level: env.LOG_LEVEL,
        transport: env.NODE_ENV === "development" ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "yyyy-mm-dd HH:MM:ss",
                ignore: "pid,hostname",
                destination: 2, // Ensure pino-pretty also writes to stderr
            },
        } : undefined,
        formatters: {
            level(label) {
                return { level: label };
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    }, destination);
}
export function getLogger() {
    if (!logger) {
        logger = createLogger();
    }
    return logger;
}
export function createRequestLogger(correlationId, toolName) {
    const baseLogger = getLogger();
    return baseLogger.child({
        correlationId,
        ...(toolName && { toolName }),
    });
}
//# sourceMappingURL=logger.js.map