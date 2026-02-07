import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Home, CheckCircle, Hash, User, Calendar } from 'lucide-react';
import RequestBuilder from '@/components/verifier/RequestBuilder';
import { logger } from '@/lib/logger';

export default function VerifierPage() {
  const [mode, setMode] = useState<'request' | 'verify'>('request');
  const [userPin, setUserPin] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleVerifyUserPin = () => {
    if (!userPin.trim() || userPin.length !== 6) {
      logger.warn('verifier', 'Invalid user PIN entered', {
        pinLength: userPin.length,
        hasPin: !!userPin.trim()
      });
      alert('Please enter a valid 6-digit PIN from the user');
      return;
    }

    logger.info('verifier', 'Attempting to verify user PIN', {
      userPin: userPin
    });

    // Check verification data from localStorage
    const verificationData = localStorage.getItem(`verification_data_${userPin}`);
    if (!verificationData) {
      logger.error('verifier', 'User PIN not found or verification expired', {
        userPin: userPin,
        storageKey: `verification_data_${userPin}`
      });
      alert('Invalid PIN or verification has expired');
      return;
    }

    try {
      const data = JSON.parse(verificationData);
      
      logger.debug('verifier', 'User verification data retrieved', {
        userPin: userPin,
        requestId: data.request?.requestId,
        businessCode: data.verificationCode,
        expiresAt: new Date(data.expiresAt).toISOString(),
        dataTypes: Object.keys(data.userData || {})
      }, data.request?.requestId);
      
      // Check if expired
      if (Date.now() > data.expiresAt) {
        logger.warn('verifier', 'User verification has expired', {
          userPin: userPin,
          expiredAt: new Date(data.expiresAt).toISOString(),
          requestId: data.request?.requestId
        }, data.request?.requestId);
        alert('Verification has expired');
        localStorage.removeItem(`verification_data_${userPin}`);
        return;
      }

      setVerificationResult(data);
      
      logger.info('verifier', 'User verification completed successfully', {
        userPin: userPin,
        requestId: data.request?.requestId,
        verifiedDataTypes: Object.keys(data.userData || {}),
        verifier: data.request?.verifier
      }, data.request?.requestId);
      
      // Clean up
      localStorage.removeItem(`verification_data_${userPin}`);
      localStorage.removeItem(`verification_request_${data.verificationCode}`);
      
      logger.debug('verifier', 'Verification data cleaned up', {
        removedKeys: [
          `verification_data_${userPin}`,
          `verification_request_${data.verificationCode}`
        ],
        requestId: data.request?.requestId
      }, data.request?.requestId);
      
    } catch (error) {
      logger.error('verifier', 'Failed to process user verification', {
        userPin: userPin,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Error verifying PIN:', error);
      alert('Error processing verification');
    }
  };

  const handleReset = () => {
    setUserPin('');
    setVerificationResult(null);
  };

  const requestedTypes = verificationResult?.request?.requesting
    ? verificationResult.request.requesting.map((claim: any) => claim.type)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation Bar */}
      <div className="bg-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg">Business Verifier Portal</span>
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
            <div className="p-3 bg-purple-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Verifier Portal</h1>
              <p className="text-gray-600">Request and verify customer credentials</p>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('request')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'request'
                ? 'bg-white shadow-md text-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Create Request
          </button>
          <button
            onClick={() => setMode('verify')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'verify'
                ? 'bg-white shadow-md text-purple-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <Hash className="w-5 h-5 inline mr-2" />
            Verify User PIN
          </button>
        </div>

        {/* Simple Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">How it works:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Create a verification request and get a business PIN</li>
                <li>2. Give your business PIN to the customer</li>
                <li>3. Customer enters your PIN in their wallet and gets their own verification PIN</li>
                <li>4. Customer gives you their verification PIN</li>
                <li>5. Enter the customer's PIN in "Verify User PIN" tab to see results</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {mode === 'request' && <RequestBuilder />}
          {mode === 'verify' && !verificationResult && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Customer PIN</h2>
                
                <p className="text-gray-600 mb-4">
                  Enter the 6-digit PIN that the customer shared with you after verifying your business code
                </p>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={userPin}
                    onChange={(e) => setUserPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter customer's PIN"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={6}
                  />
                  
                  <button
                    onClick={handleVerifyUserPin}
                    disabled={userPin.length !== 6}
                    className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Verify Customer PIN
                  </button>
                </div>
              </div>
            </div>
          )}
          {verificationResult && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
                  <p className="text-gray-600">Customer credentials verified successfully</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="mb-3 text-sm text-green-900">
                    <p><span className="font-medium">Verifier:</span> {verificationResult.request?.verifier}</p>
                    <p><span className="font-medium">Purpose:</span> {verificationResult.request?.purpose}</p>
                  </div>
                  <h3 className="font-medium text-green-900 mb-3">Verified Information:</h3>
                  <div className="space-y-2">
                    {requestedTypes.includes('fullName') && verificationResult.userData.fullName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Name: {verificationResult.userData.fullName}</span>
                      </div>
                    )}
                    {requestedTypes.includes('ageOver18') && verificationResult.userData.ageOver18 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Age 18+: ✅ Verified</span>
                      </div>
                    )}
                    {requestedTypes.includes('ageOver21') && verificationResult.userData.ageOver21 && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Age 21+: ✅ Verified</span>
                      </div>
                    )}
                    {requestedTypes.includes('studentStatus') && verificationResult.userData.studentStatus && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Student Status: ✅ Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-4">
                    Verified at {new Date().toLocaleString()}
                  </p>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Verify Another Customer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}