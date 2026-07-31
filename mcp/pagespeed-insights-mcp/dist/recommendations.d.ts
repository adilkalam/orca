import type { PageSpeedInsightsResponse } from "./types.js";
export interface Recommendation {
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    priority: number;
    category: 'performance' | 'ux' | 'seo' | 'accessibility';
    potentialSavings?: string;
    howToFix: string[];
    moreInfo?: string;
}
export interface RecommendationReport {
    url: string;
    strategy: string;
    overallScore: number;
    recommendations: Recommendation[];
    quickWins: Recommendation[];
    summary: {
        totalRecommendations: number;
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
        estimatedImpact: string;
    };
}
export declare class PerformanceRecommendationsEngine {
    private readonly auditMappings;
    generateRecommendations(data: PageSpeedInsightsResponse): RecommendationReport;
    private calculatePriority;
    private generateSummary;
    formatRecommendations(report: RecommendationReport): string;
}
