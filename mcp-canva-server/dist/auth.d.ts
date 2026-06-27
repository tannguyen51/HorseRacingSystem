export interface TokenStore {
    getAccessToken(): Promise<string>;
    refreshAccessToken?(): Promise<void>;
}
export declare class CanvaAuth {
    private clientId;
    private clientSecret;
    private redirectUri;
    private tokenData;
    constructor();
    isConfigured(): boolean;
    getAuthUrl(): {
        url: string;
        codeVerifier: string;
        state: string;
    };
    exchangeCodeForToken(code: string, codeVerifier: string): Promise<void>;
    getAccessToken(): Promise<string>;
    refreshAccessToken(): Promise<void>;
    isAuthenticated(): boolean;
    setTokenFromCode(code: string, codeVerifier: string): Promise<void>;
    private saveToken;
    private loadToken;
    createTokenStore(): TokenStore;
}
//# sourceMappingURL=auth.d.ts.map