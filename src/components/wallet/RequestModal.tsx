import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Clock, CheckCircle, Copy } from 'lucide-react';
import type { VerificationRequest, Credential, SelectiveDisclosure } from '@/types';
import { createSelectiveDisclosure } from '@/lib/crypto/selective-disclosure';
import { encodeToQR } from '@/lib/qr/encoder';
import { useCredentialStore } from '@/stores/credentialStore';
import { v4 as uuidv4 } from 'uuid';

interface RequestModalProps {
  request: VerificationRequest;
  credential: Credential;
  onClose: () => void;
  onApprove: (disclosure: SelectiveDisclosure) => void;
}

type VerificationMethod = 'code';

export default function RequestModal({ request, credential, onClose, onApprove }: RequestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedMethod] = useState<VerificationMethod>('code');
  const [copied, setCopied] = useState(false);
  const addActivity = useCredentialStore((state) => state.addActivity);

  const generateVerificationCode = (): string => {
    // Generate a 6-digit PIN
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCopyCode = () => {
    if (verificationCode) {
      navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);

    try {
      // Create selective disclosure
      const disclosure = await createSelectiveDisclosure(
        credential,
        request.requestId,
        request.requesting
      );

      if (selectedMethod === 'code') {
        // Generate verification code
        const code = generateVerificationCode();
        setVerificationCode(code);
        
        // Store disclosure with code for later verification
        localStorage.setItem(`verification_${code}`, JSON.stringify(disclosure));
        
        // Auto-delete after expiry
        setTimeout(() => {
          localStorage.removeItem(`verification_${code}`);
        }, 60000);
      }

      // Start countdown
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Log activity
      addActivity({
        id: uuidv4(),
        type: 'disclosure',
        verifier: request.verifier,
        claims: request.requesting.map((c) => c.label),
        timestamp: new Date().toISOString(),
        status: 'success',
      });

      onApprove(disclosure);
    } catch (error) {
      console.error('Failed to create disclosure:', error);
      alert('Failed to create disclosure. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    addActivity({
      id: uuidv4(),
      type: 'disclosure',
      verifier: request.verifier,
      claims: request.requesting.map((c) => c.label),
      timestamp: new Date().toISOString(),
      status: 'rejected',
    });
    onClose();
  };

  if (qrData || verificationCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Verification Code Generated
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {verificationCode && (
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-8 rounded-xl mb-4 text-center">
              <p className="text-white text-sm font-medium mb-3">Your Verification Code</p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-4xl font-bold text-gray-900 tracking-widest">
                  {verificationCode}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-full py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          )}

          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-orange-600 font-medium">
              <Clock className="w-5 h-5" />
              Expires in {timeLeft}s
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {qrData ? `Show this QR code to ${request.verifier}` : `Provide this code to ${request.verifier}`}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Shared Information:</p>
            <ul>
              {request.requesting.map((claim, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {claim.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Verification Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-600">
                {request.verifier.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{request.verifier}</h3>
              <p className="text-sm text-gray-500">{request.purpose}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">
              🔔 This verifier is requesting:
            </p>
            <ul className="space-y-2">
              {request.requesting.map((claim, idx) => (
                <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{claim.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification Method Selection */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Verification method:</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🔢</div>
              <p className="font-medium text-primary-900">6-Digit PIN Code</p>
              <p className="text-xs text-primary-600">Simple and secure</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Privacy Notice:</strong> Only the requested information will be shared. 
              Your full credential details remain private.
            </p>
            <p className="text-xs text-gray-600">
              <strong>Using credential:</strong> {credential.data.fullName} ({credential.data.idNumber})
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="flex-1 btn-secondary"
          >
            Decline
          </button>
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1 btn-primary"
          >
            {isProcessing ? 'Processing...' : selectedMethod === 'qr' ? 'Generate QR' : 'Generate Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
