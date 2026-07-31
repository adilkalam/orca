import pino from "pino";
export declare function getLogger(): pino.Logger;
export declare function createRequestLogger(correlationId: string, toolName?: string): pino.Logger<never, boolean>;
