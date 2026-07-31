import { z } from "zod";
export declare const UrlSchema: z.ZodString;
export declare const StrategySchema: z.ZodDefault<z.ZodEnum<{
    mobile: "mobile";
    desktop: "desktop";
}>>;
export declare const CategorySchema: z.ZodEnum<{
    performance: "performance";
    accessibility: "accessibility";
    "best-practices": "best-practices";
    seo: "seo";
    pwa: "pwa";
}>;
export declare const LocaleSchema: z.ZodDefault<z.ZodString>;
export declare const AnalyzePageSpeedSchema: z.ZodObject<{
    url: z.ZodString;
    strategy: z.ZodDefault<z.ZodEnum<{
        mobile: "mobile";
        desktop: "desktop";
    }>>;
    category: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        performance: "performance";
        accessibility: "accessibility";
        "best-practices": "best-practices";
        seo: "seo";
        pwa: "pwa";
    }>>>>;
    locale: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const PerformanceSummarySchema: z.ZodObject<{
    url: z.ZodString;
    strategy: z.ZodDefault<z.ZodEnum<{
        mobile: "mobile";
        desktop: "desktop";
    }>>;
}, z.core.$strip>;
export declare const CruxSummarySchema: z.ZodObject<{
    url: z.ZodString;
    formFactor: z.ZodOptional<z.ZodEnum<{
        PHONE: "PHONE";
        DESKTOP: "DESKTOP";
        TABLET: "TABLET";
    }>>;
}, z.core.$strip>;
export declare const CompareUrlsSchema: z.ZodObject<{
    urlA: z.ZodString;
    urlB: z.ZodString;
    strategy: z.ZodDefault<z.ZodEnum<{
        mobile: "mobile";
        desktop: "desktop";
    }>>;
    categories: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        performance: "performance";
        accessibility: "accessibility";
        "best-practices": "best-practices";
        seo: "seo";
        pwa: "pwa";
    }>>>>;
}, z.core.$strip>;
export declare const BatchAnalyzeSchema: z.ZodObject<{
    urls: z.ZodArray<z.ZodString>;
    strategy: z.ZodDefault<z.ZodEnum<{
        mobile: "mobile";
        desktop: "desktop";
    }>>;
    category: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        performance: "performance";
        accessibility: "accessibility";
        "best-practices": "best-practices";
        seo: "seo";
        pwa: "pwa";
    }>>>>;
    locale: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export type AnalyzePageSpeedInput = z.infer<typeof AnalyzePageSpeedSchema>;
export type PerformanceSummaryInput = z.infer<typeof PerformanceSummarySchema>;
export type CruxSummaryInput = z.infer<typeof CruxSummarySchema>;
export type CompareUrlsInput = z.infer<typeof CompareUrlsSchema>;
export type BatchAnalyzeInput = z.infer<typeof BatchAnalyzeSchema>;
