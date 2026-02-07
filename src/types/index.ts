// Type definitions for the entire application

export interface Credential {
  id: string;
  type: 'government-id' | 'drivers-license' | 'student-id';
  issuer: string;
  issuedAt: string;
  expiresAt?: string;
  data: CredentialData;
  signature: string;
}

export interface CredentialData {
  fullName: string;
  dateOfBirth: string;
  address: string;
  idNumber: string;
  photo?: string;
  nationality?: string;
  [key: string]: any;
}

export interface VerificationRequest {
  requestId: string;
  verifier: string;
  verifierLogo?: string;
  requesting: RequestedClaim[];
  purpose: string;
  createdAt: string;
  expiresAt: string;
}

export interface RequestedClaim {
  type: 'ageOver18' | 'ageOver21' | 'fullName' | 'address' | 'studentStatus' | 'custom';
  label: string;
  required: boolean;
}

export interface SelectiveDisclosure {
  proofId: string;
  requestId: string;
  claims: DisclosedClaim[];
  issuer: string;
  issuedAt: string;
  disclosedAt: string;
  expiresAt: string;
  signature: string;
}

export interface DisclosedClaim {
  type: string;
  value: any;
  proof?: string; // ZKP proof for age/status claims
}

export interface VerificationResult {
  success: boolean;
  verifiedClaims: DisclosedClaim[];
  issuer: string;
  timestamp: string;
  errors?: string[];
}

export interface ActivityLog {
  id: string;
  type: 'disclosure' | 'scan';
  verifier: string;
  claims: string[];
  timestamp: string;
  status: 'success' | 'failed' | 'rejected';
}

export interface QRPayload {
  type: 'request' | 'response';
  data: VerificationRequest | SelectiveDisclosure;
  version: string;
}
