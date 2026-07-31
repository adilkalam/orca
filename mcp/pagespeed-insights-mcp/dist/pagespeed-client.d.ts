import type { AnalyzePageSpeedInput, CruxSummaryInput, PageSpeedInsightsResponse } from "./types.js";
export declare class PageSpeedClient {
    private readonly apiKey;
    private readonly timeout;
    private readonly retryAttempts;
    private readonly limiter;
    private readonly cacheTTL;
    constructor();
    private redact;
    private makeRequest;
    analyzePageSpeed(input: AnalyzePageSpeedInput, correlationId: string): Promise<PageSpeedInsightsResponse>;
    getCruxData(input: CruxSummaryInput, correlationId: string): Promise<any>;
}
