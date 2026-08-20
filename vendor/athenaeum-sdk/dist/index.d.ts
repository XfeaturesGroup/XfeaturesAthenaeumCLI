import type { ApiErrorPayload, DocumentContentDTO, DocumentDTO, FactDTO, FactsListResponse, FeedbackRequest, PlanDTO, PolicyDTO, ProductDTO, ProposeDocumentRequest, SearchRequest, SearchResponse } from "@xfeatures/athenaeum-types";
export type { ApiErrorPayload, Classification, DocumentContentDTO, DocumentDTO, FactDTO, FactsListResponse, FeedbackRequest, PlanDTO, PolicyDTO, ProductDTO, ProposeDocumentRequest, SearchRequest, SearchResponse, SearchResultDTO } from "@xfeatures/athenaeum-types";
/**
 * Thrown for every non-2xx response. Carries the same envelope Athenaeum
 * itself returns (`{error: {code, message, request_id}}`) rather than a
 * generic HTTP error, so callers can branch on `code` the same way the
 * Worker's own routes do.
 */
export declare class AthenaeumApiError extends Error {
    readonly code: string;
    readonly requestId: string;
    readonly status: number;
    constructor(payload: ApiErrorPayload, status: number);
}
export interface AthenaeumClientOptions {
    /** e.g. "https://athenaeum.xfeatures.net" -- no trailing slash. */
    baseUrl: string;
    /**
     * A bearer token: an Xfeatures Account access token (client_credentials for
     * a service application, or a human's own login via the Developer Access
     * application -- see docs/AGENT-INTEGRATION.md in xfeatures-athenaeum).
     * Athenaeum's own D1 still decides what this identity can do; the token
     * only proves who is asking.
     */
    token: string;
    /** Injectable for tests; defaults to the platform global. */
    fetch?: typeof fetch;
}
/**
 * REST client for Xfeatures Athenaeum. Deliberately thin: one method per
 * endpoint, no retry/caching logic (Athenaeum itself is the single source of
 * truth on every call -- Section 8/17 in the ecosystem ADR), and every error
 * surfaces as `AthenaeumApiError` rather than being swallowed.
 */
export declare class AthenaeumClient {
    private readonly baseUrl;
    private readonly token;
    private readonly fetchImpl;
    constructor(options: AthenaeumClientOptions);
    private request;
    /** Semantic search. Prefer the deterministic getters below when you know exactly what you need. */
    search(body: SearchRequest): Promise<SearchResponse>;
    getFact(namespace: string, key: string): Promise<FactDTO>;
    listFacts(namespace: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<FactsListResponse>;
    getDocument(idOrSlug: string, options?: {
        includeContent?: boolean;
    }): Promise<DocumentDTO | DocumentContentDTO>;
    getProduct(code: string): Promise<ProductDTO>;
    getPlan(code: string): Promise<PlanDTO>;
    getPolicy(code: string): Promise<PolicyDTO>;
    submitFeedback(body: FeedbackRequest): Promise<void>;
    /**
     * Creates a DRAFT document. Requires `documents.write` (and `admin.documents`
     * at the route gate) -- e.g. the `content-contributor` role. Never
     * publishes: the returned document is invisible to search/getDocument until
     * a human approves it via `submitDocumentForReview` + HQ (human-in-the-loop
     * publish, mirroring the MCP tools of the same name).
     */
    proposeDocument(input: ProposeDocumentRequest): Promise<DocumentDTO>;
    /** Hands a draft to a human reviewer. Never publishes it -- see proposeDocument. */
    submitDocumentForReview(documentId: string): Promise<{
        documentId: string;
        workflowInstanceId: string;
    }>;
}
//# sourceMappingURL=index.d.ts.map