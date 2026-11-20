export interface VerifiedGoogleIdentity {
  sub: string
  email: string
  hostedDomain: string
  emailVerified: true
  name: string | null
  picture: string | null
}

export interface VerifyGoogleIdTokenOptions {
  audience: string
  expectedNonce: string
  requiredHostedDomain?: string
  fetchImpl?: typeof fetch
  nowSeconds?: number
}

export function verifyGoogleIdToken(
  token: string,
  options: VerifyGoogleIdTokenOptions,
): Promise<VerifiedGoogleIdentity>
