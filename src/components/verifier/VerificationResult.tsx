import React from 'react';
import type { VerificationResult } from '@/types';
import { CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';

interface VerificationResultProps {
  result: VerificationResult;
  onReset: () => void;
}

export default function VerificationResultDisplay({ result, onReset }: VerificationResultProps) {
  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        {result.success ? (
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2">
          {result.success ? 'Verification Successful' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600">
          {result.success
            ? 'The provided credentials have been verified'
            : 'Unable to verify the provided credentials'}
        </p>
      </div>

      {result.success && (
        <div className="space-y-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-700" />
              <h3 className="font-semibold text-green-900">Verified Claims</h3>
            </div>
            <div className="space-y-3">
              {result.verifiedClaims.map((claim, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">
                      {claim.type === 'ageOver18'
                        ? 'Age 18+'
                        : claim.type === 'ageOver21'
                        ? 'Age 21+'
                        : claim.type === 'fullName'
                        ? 'Full Name'
                        : claim.type === 'studentStatus'
                        ? 'Student Status'
                        : claim.type}
                    </p>
                    <p className="text-sm text-green-700">
                      {typeof claim.value === 'boolean'
                        ? claim.value
                          ? '✓ Verified'
                          : '✗ Not verified'
                        : claim.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Issued By</p>
                <p className="font-medium text-gray-900">{result.issuer}</p>
              </div>
              <div>
                <p className="text-gray-600">Verified At</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(result.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!result.success && result.errors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-700" />
            <h3 className="font-semibold text-red-900">Errors</h3>
          </div>
          <ul className="space-y-2">
            {result.errors.map((error, idx) => (
              <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={onReset} className="w-full btn-primary">
        Scan Another QR
      </button>
    </div>
  );
}
