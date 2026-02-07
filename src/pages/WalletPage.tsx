import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Home, User, Calendar, Shield, CheckCircle, Copy } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function WalletPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any | null>(null);
  const navigate = useNavigate();

  // Mock user credentials
  const userCredentials = {
    fullName: "John Doe",
    age: 30,
    dateOfBirth: "March 15, 1995",
    isOver18: true,
    isOver21: true,
    studentStatus: false
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      logger.warn('wallet', 'Invalid verification code entered', {
        codeLength: verificationCode.length,
        hasCode: !!verificationCode.trim()
      });
      alert('Please enter a valid 6-digit verification code');
      return;
    }

    logger.info('wallet', 'User attempting to verify business code', {
      businessCode: verificationCode
    });

    // Check if verification request exists
    const requestData = localStorage.getItem(`verification_request_${verificationCode}`);
    if (!requestData) {
      logger.error('wallet', 'Business code not found or expired', {
        businessCode: verificationCode,
        storageKey: `verification_request_${verificationCode}`
      });
      alert('Invalid or expired verification code');
      return;
    }

    try {
      const request = JSON.parse(requestData);
      
      logger.debug('wallet', 'Business request data retrieved', {
        requestId: request.requestId,
        verifier: request.verifier,
        purpose: request.purpose,
        expiresAt: new Date(request.expiresAt).toISOString()
      }, request.requestId);
      
      // Check if expired
      if (Date.now() > request.expiresAt) {
        logger.warn('wallet', 'Business code has expired', {
          businessCode: verificationCode,
          expiredAt: new Date(request.expiresAt).toISOString(),
          requestId: request.requestId
        }, request.requestId);
        alert('Verification code has expired');
        localStorage.removeItem(`verification_request_${verificationCode}`);
        return;
      }

      setRequestDetails(request);
      
      logger.info('wallet', 'Business request details loaded successfully', {
        requestId: request.requestId,
        verifier: request.verifier,
        requestedClaims: request.requesting?.map((c: any) => c.type) || []
      }, request.requestId);
      
    } catch (error) {
      logger.error('wallet', 'Failed to parse business request data', {
        businessCode: verificationCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error processing verification:', error);
      alert('Error processing verification code');
    }
  };

  const handleApproveRequest = () => {
    if (!requestDetails) {
      logger.error('wallet', 'Approve request called without request details');
      return;
    }

    const requestedTypes = (requestDetails.requesting || []).map((claim: any) => claim.type);
    const userData: Record<string, any> = {};

    logger.info('wallet', 'User approving verification request', {
      requestId: requestDetails.requestId,
      verifier: requestDetails.verifier,
      requestedTypes: requestedTypes
    }, requestDetails.requestId);

    if (requestedTypes.includes('fullName')) {
      userData.fullName = userCredentials.fullName;
    }
    if (requestedTypes.includes('ageOver18')) {
      userData.ageOver18 = userCredentials.isOver18;
    }
    if (requestedTypes.includes('ageOver21')) {
      userData.ageOver21 = userCredentials.isOver21;
    }
    if (requestedTypes.includes('studentStatus')) {
      userData.studentStatus = userCredentials.studentStatus;
    }

    logger.debug('wallet', 'User data prepared for verification', {
      requestId: requestDetails.requestId,
      dataTypes: Object.keys(userData),
      userData: userData
    }, requestDetails.requestId);

    // Generate user's verification PIN for sharing
    const userPin = Math.random().toString().substr(2, 6);

    // Store the verification data for verifier to check
    const verificationData = {
      pin: userPin,
      verificationCode: verificationCode,
      userData,
      timestamp: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
      request: requestDetails,
    };

    localStorage.setItem(`verification_data_${userPin}`, JSON.stringify(verificationData));

    logger.info('wallet', 'User verification PIN generated', {
      userPin: userPin,
      businessCode: verificationCode,
      requestId: requestDetails.requestId,
      expiresAt: new Date(verificationData.expiresAt).toISOString(),
      sharedDataTypes: Object.keys(userData)
    }, requestDetails.requestId);

    setGeneratedPin(userPin);
  };

  const handleCopyPin = async () => {
    if (generatedPin) {
      await navigator.clipboard.writeText(generatedPin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setVerificationCode('');
    setGeneratedPin(null);
    setCopied(false);
    setRequestDetails(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Navigation Bar */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            <span className="font-bold text-lg">User Wallet Portal</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Digital Wallet</h1>
              <p className="text-gray-600">Your secure credential vault</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Credentials */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              My Credentials
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Government ID</span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Active</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{userCredentials.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Born {userCredentials.dateOfBirth} • Age {userCredentials.age}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {!generatedPin ? (
              <>
                <h2 className="text-xl font-bold mb-4">Enter Verification Code</h2>
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit code provided by the business requesting verification
                </p>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                  
                  {!requestDetails && (
                    <button
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Check Request Details
                    </button>
                  )}

                  {requestDetails && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Request Details</h3>
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Verifier:</span> {requestDetails.verifier}
                        </p>
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Purpose:</span> {requestDetails.purpose}
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-2">Information requested:</p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {(requestDetails.requesting || []).map((claim: any, idx: number) => (
                            <li key={idx}>• {claim.label}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={handleApproveRequest}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Approve & Generate PIN
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Approved!</h2>
                  <p className="text-gray-600">Share this PIN with the verifier</p>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-center mb-6">
                  <p className="text-white text-sm font-medium mb-2">Your Verification PIN</p>
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

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-4">PIN is valid for 5 minutes</p>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Enter New Code
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}