export interface OAuthState {
  state: string
  nonce: string
  createdAt: number
}

export const ICAM_OAUTH_STATE_COOKIE: string
export const ICAM_OAUTH_STATE_TTL_SECONDS: number

export function createOAuthState(): OAuthState
export function sealOAuthState(payload: OAuthState, secret: string): string
export function openOAuthState(value: string | undefined, secret: string, now?: number): OAuthState | null
export function createGoogleNonceHash(nonce: string): string
