/**
 * Helper to persist access and refresh tokens in browser cookies and localStorage.
 */
export function setAuthTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === "undefined") return;

    // Save the access token to standard "token" cookie
    document.cookie = `token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

    // Save the refresh token to cookie
    if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
    }
}
