import { differenceInYears, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import type { Credential, RequestedClaim, SelectiveDisclosure, DisclosedClaim } from '@/types';
import { initializeIssuerKeys } from './credential';
import { SignJWT } from 'jose';

export async function createSelectiveDisclosure(
  credential: Credential,
  requestId: string,
  requestedClaims: RequestedClaim[]
): Promise<SelectiveDisclosure> {
  const disclosedClaims: DisclosedClaim[] = [];
  const now = new Date().toISOString();

  for (const claim of requestedClaims) {
    const disclosedClaim = await processClaimRequest(claim, credential);
    if (disclosedClaim) {
      disclosedClaims.push(disclosedClaim);
    }
  }

  const keys = await initializeIssuerKeys();
  
  const disclosure: Omit<SelectiveDisclosure, 'signature'> = {
    proofId: uuidv4(),
    requestId,
    claims: disclosedClaims,
    issuer: credential.issuer,
    issuedAt: credential.issuedAt,
    disclosedAt: now,
    expiresAt: new Date(Date.now() + 60 * 1000).toISOString(), // Expires in 60 seconds
  };

  // Sign the disclosure
  const signature = await signDisclosure(disclosure, keys.privateKey);

  return {
    ...disclosure,
    signature,
  };
}

async function processClaimRequest(
  claim: RequestedClaim,
  credential: Credential
): Promise<DisclosedClaim | null> {
  switch (claim.type) {
    case 'ageOver18':
      return createAgeProof(credential, 18);
    
    case 'ageOver21':
      return createAgeProof(credential, 21);
    
    case 'fullName':
      return {
        type: 'fullName',
        value: credential.data.fullName,
      };
    
    case 'address':
      return {
        type: 'address',
        value: credential.data.address,
      };
    
    case 'studentStatus':
      return {
        type: 'studentStatus',
        value: credential.type === 'student-id' ? 'Active' : 'Not a student',
        proof: credential.type === 'student-id' ? 'verified' : undefined,
      };
    
    default:
      return null;
  }
}

function createAgeProof(credential: Credential, minimumAge: number): DisclosedClaim {
  const dob = parseISO(credential.data.dateOfBirth);
  const age = differenceInYears(new Date(), dob);
  const meetsRequirement = age >= minimumAge;

  // Create a zero-knowledge style proof (simplified)
  // In production, use proper ZKP libraries like snarkjs
  const proof = createSimpleZKP(credential.data.dateOfBirth, minimumAge, meetsRequirement);

  return {
    type: `ageOver${minimumAge}`,
    value: meetsRequirement,
    proof,
  };
}

function createSimpleZKP(dob: string, minimumAge: number, result: boolean): string {
  // Simplified ZKP - hash the DOB with a salt to prove knowledge without revealing it
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const commitment = CryptoJS.SHA256(dob + salt + minimumAge).toString();
  
  return JSON.stringify({
    commitment,
    result,
    algorithm: 'SHA256-commitment',
  });
}

async function signDisclosure(
  disclosure: Omit<SelectiveDisclosure, 'signature'>,
  privateKey: CryptoKey
): Promise<string> {
  const jwt = await new SignJWT({ disclosure })
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setExpirationTime('1m') // 1 minute
    .sign(privateKey);

  return jwt;
}

export function isDisclosureExpired(disclosure: SelectiveDisclosure): boolean {
  return new Date(disclosure.expiresAt) < new Date();
}

export function hashFieldForPrivacy(value: string): string {
  return CryptoJS.SHA256(value).toString();
}
