import type { PageSpeedInsightsResponse, ElementNode, NetworkRequest, JavaScriptExecutionItem, MainThreadWorkItem, ImageOptimizationItem, ThirdPartySummaryItem, UnusedResourceItem, FilmstripFrame, ScreenshotData } from "./types.js";
/**
 * Utility class for parsing PageSpeed Insights API responses
 * Safely extracts nested data with fallbacks
 */
export declare class ResponseParser {
    /**
     * Extract visual analysis data (screenshots, filmstrip)
     */
    static extractVisualData(response: PageSpeedInsightsResponse): {
        finalScreenshot: ScreenshotData | null;
        filmstrip: FilmstripFrame[];
        fullPageScreenshot: {
            screenshot: ScreenshotData;
            nodes: Record<string, any>;
        } | null;
    };
    /**
     * Extract element-level performance data
     */
    static extractElementData(response: PageSpeedInsightsResponse): {
        lcpElement: ElementNode | null;
        clsElements: Array<{
            node: ElementNode;
            score: number;
        }>;
        lazyLoadedLcp: ElementNode | null;
    };
    /**
     * Extract network waterfall and resource data
     */
    static extractNetworkData(response: PageSpeedInsightsResponse): {
        requests: NetworkRequest[];
        resourceSummary: Array<{
            resourceType: string;
            count: number;
            size: number;
        }>;
        totalByteWeight: number;
        requestCount: number;
        rtt: number | null;
        serverLatency: number | null;
    };
    /**
     * Extract JavaScript execution analysis
     */
    static extractJavaScriptData(response: PageSpeedInsightsResponse): {
        bootupTime: JavaScriptExecutionItem[];
        mainThreadWork: MainThreadWorkItem[];
        unusedJavaScript: UnusedResourceItem[];
        duplicatedJavaScript: Array<{
            source: string;
            totalBytes: number;
            wastedBytes: number;
        }>;
        legacyJavaScript: Array<{
            url: string;
            wastedBytes: number;
            signals: string[];
        }>;
    };
    /**
     * Extract image optimization opportunities
     */
    static extractImageOptimizationData(response: PageSpeedInsightsResponse): {
        responsiveImages: ImageOptimizationItem[];
        offscreenImages: ImageOptimizationItem[];
        unoptimizedImages: ImageOptimizationItem[];
        modernFormats: ImageOptimizationItem[];
    };
    /**
     * Extract render-blocking resources
     */
    static extractRenderBlockingData(response: PageSpeedInsightsResponse): {
        resources: Array<{
            url: string;
            totalBytes: number;
            wastedMs: number;
        }>;
        totalWastedMs: number;
        criticalChains: any;
    };
    /**
     * Extract third-party impact data
     */
    static extractThirdPartyData(response: PageSpeedInsightsResponse): {
        summary: ThirdPartySummaryItem[];
        totalBlockingTime: number;
        totalTransferSize: number;
        facades: Array<{
            product: string;
            transferSize: number;
            blockingTime: number;
        }>;
    };
    /**
     * Extract other category scores and key audits
     */
    static extractOtherCategories(response: PageSpeedInsightsResponse): {
        accessibility: {
            score: number | null;
            keyAudits: Array<{
                id: string;
                title: string;
                score: number | null;
                description?: string;
            }>;
        };
        seo: {
            score: number | null;
            keyAudits: Array<{
                id: string;
                title: string;
                score: number | null;
                description?: string;
            }>;
        };
        bestPractices: {
            score: number | null;
            keyAudits: Array<{
                id: string;
                title: string;
                score: number | null;
                description?: string;
            }>;
        };
        pwa: {
            score: number | null;
            keyAudits: Array<{
                id: string;
                title: string;
                score: number | null;
                description?: string;
            }>;
        };
    };
    /**
     * Helper to normalize node data
     */
    private static normalizeNode;
    /**
     * Extract all detailed metrics
     */
    static extractDetailedMetrics(response: PageSpeedInsightsResponse): {
        firstContentfulPaint: any;
        largestContentfulPaint: any;
        cumulativeLayoutShift: any;
        totalBlockingTime: any;
        maxPotentialFID: any;
        speedIndex: any;
        timeToInteractive: any;
        firstMeaningfulPaint: any;
        observedFirstContentfulPaint: any;
        observedLargestContentfulPaint: any;
        observedSpeedIndex: any;
        observedDomContentLoaded: any;
        observedLoad: any;
        observedNavigationStart: any;
        observedTimeOrigin: any;
        observedTraceEnd: any;
    };
}
