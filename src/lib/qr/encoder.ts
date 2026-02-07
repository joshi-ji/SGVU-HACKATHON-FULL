import type { QRPayload, VerificationRequest, SelectiveDisclosure } from '@/types';

export function encodeToQR(data: VerificationRequest | SelectiveDisclosure, type: 'request' | 'response'): string {
  const payload: QRPayload = {
    type,
    data,
    version: '1.0',
  };

  return JSON.stringify(payload);
}

export function decodeFromQR(qrData: string): QRPayload | null {
  try {
    const payload: QRPayload = JSON.parse(qrData);
    
    if (!payload.type || !payload.data || !payload.version) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Failed to decode QR:', error);
    return null;
  }
}

export function isValidQRPayload(payload: QRPayload): boolean {
  if (!payload || !payload.type || !payload.data) {
    return false;
  }

  if (payload.type === 'request') {
    const request = payload.data as VerificationRequest;
    return !!(request.requestId && request.verifier && request.requesting);
  }

  if (payload.type === 'response') {
    const response = payload.data as SelectiveDisclosure;
    return !!(response.proofId && response.claims && response.signature);
  }

  return false;
}
