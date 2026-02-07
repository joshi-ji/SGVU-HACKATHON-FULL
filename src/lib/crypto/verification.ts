import { jwtVerify } from 'jose';
import type { SelectiveDisclosure, VerificationResult } from '@/types';
import { initializeIssuerKeys } from './credential';
import { isDisclosureExpired } from './selective-disclosure';

export async function verifyDisclosure(
  disclosure: SelectiveDisclosure
): Promise<VerificationResult> {
  const errors: string[] = [];

  // Check expiration
  if (isDisclosureExpired(disclosure)) {
    errors.push('Disclosure has expired');
  }

  // Verify signature
  try {
    const keys = await initializeIssuerKeys();
    await jwtVerify(disclosure.signature, keys.publicKey);
  } catch (error) {
    errors.push('Invalid signature');
  }

  // Check timestamp freshness
  const disclosedTime = new Date(disclosure.disclosedAt).getTime();
  const now = Date.now();
  if (now - disclosedTime > 120 * 1000) { // 2 minutes
    errors.push('Disclosure is too old');
  }

  const success = errors.length === 0;

  return {
    success,
    verifiedClaims: disclosure.claims,
    issuer: disclosure.issuer,
    timestamp: disclosure.disclosedAt,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export function isTrustedIssuer(issuer: string): boolean {
  const trustedIssuers = [
    'Government ID Authority',
    'Tech University',
    'Department of Motor Vehicles',
  ];
  
  return trustedIssuers.includes(issuer);
}
