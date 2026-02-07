import { SignJWT, jwtVerify, importJWK, generateKeyPair, exportJWK } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import type { Credential, CredentialData } from '@/types';

// Simulated issuer key pair (in production, issuer would have this)
let issuerKeyPair: { publicKey: CryptoKey; privateKey: CryptoKey } | null = null;

export async function initializeIssuerKeys() {
  if (!issuerKeyPair) {
    issuerKeyPair = await generateKeyPair('ES256');
  }
  return issuerKeyPair;
}

export async function createCredential(
  type: Credential['type'],
  data: CredentialData,
  issuer: string = 'Government ID Authority'
): Promise<Credential> {
  const keys = await initializeIssuerKeys();
  const now = new Date().toISOString();
  
  const credential: Omit<Credential, 'signature'> = {
    id: uuidv4(),
    type,
    issuer,
    issuedAt: now,
    expiresAt: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 10 years
    data,
  };

  // Sign the credential
  const signature = await signCredential(credential, keys.privateKey);

  return {
    ...credential,
    signature,
  };
}

async function signCredential(credential: Omit<Credential, 'signature'>, privateKey: CryptoKey): Promise<string> {
  const jwt = await new SignJWT({ credential })
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer(credential.issuer)
    .setExpirationTime('10y')
    .sign(privateKey);

  return jwt;
}

export async function verifyCredentialSignature(credential: Credential): Promise<boolean> {
  try {
    const keys = await initializeIssuerKeys();
    const { payload } = await jwtVerify(credential.signature, keys.publicKey, {
      issuer: credential.issuer,
    });

    return true;
  } catch (error) {
    console.error('Credential verification failed:', error);
    return false;
  }
}

// Create a mock government ID credential
export async function createMockGovernmentID(): Promise<Credential> {
  const mockData: CredentialData = {
    fullName: 'John Doe',
    dateOfBirth: '1995-03-15',
    address: '123 Main Street, Springfield, ST 12345',
    idNumber: 'GOV-ID-123456789',
    nationality: 'United States',
    photo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SkQ8L3RleHQ+PC9zdmc+',
  };

  return await createCredential('government-id', mockData);
}

export async function createMockStudentID(): Promise<Credential> {
  const mockData: CredentialData = {
    fullName: 'Jane Smith',
    dateOfBirth: '2002-08-22',
    studentId: 'STU-2023-45678',
    university: 'Tech University',
    program: 'Computer Science',
    enrollmentStatus: 'Active',
    validUntil: '2026-06-30',
  };

  return await createCredential('student-id', mockData, 'Tech University');
}
