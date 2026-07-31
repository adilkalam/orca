#!/usr/bin/env node
export declare class PageSpeedInsightsServer {
    private server;
    private client;
    private recommendationsEngine;
    private logger;
    constructor();
    private setupTools;
    private handleAnalyzePageSpeed;
    private handlePerformanceSummary;
    private handleCruxSummary;
    private handleComparePages;
    private handleFullReport;
    private handleBatchAnalyze;
    private handleClearCache;
    private handleGetRecommendations;
    private formatAnalysisReport;
    private createPerformanceSummary;
    private formatCruxSummary;
    private createComparison;
    private createFullReport;
    private handleGetVisualAnalysis;
    private handleGetElementAnalysis;
    private handleGetNetworkAnalysis;
    private handleGetJavaScriptAnalysis;
    private handleGetImageOptimizationDetails;
    private handleGetRenderBlockingDetails;
    private handleGetThirdPartyImpact;
    private handleGetFullAudit;
    start(): Promise<void>;
}
export declare function isProcessEntrypoint(moduleUrl: string, argv1?: string): boolean;
