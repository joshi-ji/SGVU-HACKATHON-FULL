import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { VerificationRequest, RequestedClaim } from '@/types';
import { Building2, User, Calendar, GraduationCap, Copy, CheckCircle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ClaimOption {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const availableClaims: ClaimOption[] = [
  {
    type: 'fullName',
    label: 'Full Name',
    description: 'Legal name verification',
    icon: User,
  },
  {
    type: 'ageOver18',
    label: 'Age 18+',
    description: 'Proof of being 18 or older',
    icon: Calendar,
  },
  {
    type: 'ageOver21',
    label: 'Age 21+',
    description: 'Proof of being 21 or older',
    icon: Calendar,
  },
  {
    type: 'studentStatus',
    label: 'Student Status',
    description: 'Current student verification',
    icon: GraduationCap,
  },
];

export default function RequestBuilder() {
  const [verifierName, setVerifierName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedClaims, setSelectedClaims] = useState<RequestedClaim[]>([]);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown effect
  useEffect(() => {
    if (generatedPin) {
      setTimeLeft(60);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [generatedPin]);

  const handleClaimToggle = (claim: ClaimOption) => {
    setSelectedClaims(prev => {
      const exists = prev.find(c => c.type === claim.type);
      if (exists) {
        return prev.filter(c => c.type !== claim.type);
      } else {
        return [...prev, {
          type: claim.type,
          label: claim.label,
          required: true
        }];
      }
    });
  };

  const handleSendRequest = () => {
    if (!verifierName.trim() || !purpose.trim() || selectedClaims.length === 0) {
      logger.warn('verifier', 'Request creation failed - missing required fields', {
        verifierName: !!verifierName.trim(),
        purpose: !!purpose.trim(),
        claimsCount: selectedClaims.length
      });
      alert('Please fill in all fields and select at least one claim');
      return;
    }

    const request: VerificationRequest = {
      requestId: uuidv4(),
      verifier: verifierName,
      requesting: selectedClaims,
      purpose: purpose,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    // Generate PIN and store request
    const pin = Math.random().toString().substr(2, 6);
    
    logger.info('verifier', 'Verification request created', {
      requestId: request.requestId,
      verifier: verifierName,
      purpose: purpose,
      requestedClaims: selectedClaims.map(c => c.type),
      businessPin: pin
    }, request.requestId);
    
    // Store the request with PIN for verification
    const requestData = {
      ...request,
      pin,
      timestamp: Date.now(),
      expiresAt: Date.now() + 60000 // 60 seconds
    };

    localStorage.setItem(`verification_request_${pin}`, JSON.stringify(requestData));
    
    logger.debug('verifier', 'Request stored in localStorage', {
      storageKey: `verification_request_${pin}`,
      expiresAt: new Date(requestData.expiresAt).toISOString()
    }, request.requestId);

    // Simulate sending request to wallet (in real app would be via API)
    localStorage.setItem('pending_requests', JSON.stringify([request]));

    setGeneratedPin(pin);
    
    logger.info('verifier', 'Business PIN generated and ready for sharing', {
      pin: pin,
      requestId: request.requestId
    }, request.requestId);
  };

  const handleCopyPin = async () => {
    if (generatedPin) {
      await navigator.clipboard.writeText(generatedPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setVerifierName('');
    setPurpose('');
    setSelectedClaims([]);
    setGeneratedPin(null);
    setCopied(false);
    setTimeLeft(60);
  };

  if (generatedPin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-gray-600">Share this PIN with the user for verification</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-center mb-6">
            <p className="text-white text-sm font-medium mb-2">Verification PIN</p>
            <div className="text-4xl font-bold text-white tracking-wider mb-4">
              {generatedPin}
            </div>
            <button
              onClick={handleCopyPin}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 mx-auto"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy PIN'}
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Requested Information:</h3>
            <ul className="space-y-1">
              {selectedClaims.map((claim, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {claim.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">PIN expires in {timeLeft} seconds</p>
            <button onClick={handleReset} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Create New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Verification Request</h2>

        {/* Verifier Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Verifier Name (Your Business)
          </label>
          <input
            type="text"
            value={verifierName}
            onChange={(e) => setVerifierName(e.target.value)}
            placeholder="Coffee Shop Downtown"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Purpose */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Verification
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Age verification for alcohol purchase"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Select Claims */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Information to Request
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableClaims.map((claim) => {
              const isSelected = selectedClaims.some(c => c.type === claim.type);
              const Icon = claim.icon;
              
              return (
                <button
                  key={claim.type}
                  onClick={() => handleClaimToggle(claim)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isSelected ? 'text-purple-600' : 'text-gray-700'}`}>
                      {claim.label}
                    </span>
                    {isSelected && <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />}
                  </div>
                  <p className="text-sm text-gray-500">{claim.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Claims Summary */}
        {selectedClaims.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-2">This will request:</p>
            <ul className="space-y-1">
              {selectedClaims.map((claim, idx) => (
                <li key={idx} className="text-sm text-blue-700">
                  • {claim.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Send Request Button */}
        <button
          onClick={handleSendRequest}
          disabled={!verifierName.trim() || !purpose.trim() || selectedClaims.length === 0}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send Request
        </button>
      </div>
    </div>
  );
}