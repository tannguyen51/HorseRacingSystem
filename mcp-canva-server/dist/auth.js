import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import axios from 'axios';
const TOKEN_FILE = path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.canva-mcp-token.json');
const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
export class CanvaAuth {
    clientId;
    clientSecret;
    redirectUri;
    tokenData = null;
    constructor() {
        this.clientId = process.env.CANVA_CLIENT_ID || '';
        this.clientSecret = process.env.CANVA_CLIENT_SECRET || '';
        this.redirectUri =
            process.env.CANVA_REDIRECT_URI || 'http://localhost:9876/callback';
    }
    isConfigured() {
        return !!(this.clientId && this.clientSecret);
    }
    getAuthUrl() {
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');
        const state = crypto.randomBytes(16).toString('hex');
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            state,
            scopes: 'design:content:write design:content:read design:meta:read asset:write asset:read folder:read folder:write profile:read',
        });
        return {
            url: `${CANVA_AUTH_URL}?${params.toString()}`,
            codeVerifier,
            state,
        };
    }
    async exchangeCodeForToken(code, codeVerifier) {
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.redirectUri,
            code_verifier: codeVerifier,
        });
        const { data } = await axios.post(CANVA_TOKEN_URL, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        this.tokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + (data.expires_in || 3600) * 1000,
        };
        this.saveToken();
    }
    async getAccessToken() {
        if (!this.tokenData) {
            this.loadToken();
        }
        if (!this.tokenData) {
            throw new Error('Not authenticated. Run OAuth flow first: use the canva_auth_status tool to get the authorization URL.');
        }
        if (Date.now() > this.tokenData.expires_at - 60000) {
            await this.refreshAccessToken();
        }
        return this.tokenData.access_token;
    }
    async refreshAccessToken() {
        if (!this.tokenData?.refresh_token) {
            throw new Error('No refresh token available. Please re-authenticate.');
        }
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: this.tokenData.refresh_token,
        });
        const { data } = await axios.post(CANVA_TOKEN_URL, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        this.tokenData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token || this.tokenData.refresh_token,
            expires_at: Date.now() + (data.expires_in || 3600) * 1000,
        };
        this.saveToken();
    }
    isAuthenticated() {
        if (!this.tokenData) {
            this.loadToken();
        }
        return !!this.tokenData;
    }
    setTokenFromCode(code, codeVerifier) {
        return this.exchangeCodeForToken(code, codeVerifier);
    }
    saveToken() {
        try {
            fs.writeFileSync(TOKEN_FILE, JSON.stringify(this.tokenData), {
                mode: 0o600,
            });
        }
        catch {
            // silent fail - token will be in memory
        }
    }
    loadToken() {
        try {
            if (fs.existsSync(TOKEN_FILE)) {
                const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
                this.tokenData = JSON.parse(raw);
            }
        }
        catch {
            this.tokenData = null;
        }
    }
    createTokenStore() {
        return {
            getAccessToken: () => this.getAccessToken(),
            refreshAccessToken: () => this.refreshAccessToken(),
        };
    }
}
//# sourceMappingURL=auth.js.map