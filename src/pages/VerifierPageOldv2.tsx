import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Hash, Home } from 'lucide-react';
import RequestBuilder from '@/components/verifier/RequestBuilder';
import PinScanner from '@/components/verifier/PinScanner';
import VerificationResultDisplay from '@/components/verifier/VerificationResult';
import { verifyDisclosure } from '@/lib/crypto/verification';
import type { VerificationResult, SelectiveDisclosure } from '@/types';

type ViewMode = 'request' | 'verify' | 'result';

export default function VerifierPage() {
  const [mode, setMode] = useState<ViewMode>('request');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const navigate = useNavigate();

  const handleCodeVerify = async (data: string) => {
    try {
      const disclosure = JSON.parse(data) as SelectiveDisclosure;
      const result = await verifyDisclosure(disclosure);

      setVerificationResult(result);
      setMode('result');
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to verify code. Please try again.');
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setMode('request');
  };

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
              <p className="text-gray-600">Request and verify credentials</p>
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
            Verify PIN Code
          </button>
        </div>

        {/* Content */}
        <div>
          {mode === 'request' && <RequestBuilder />}
          {mode === 'verify' && <PinScanner onScan={handleCodeVerify} />}
          {mode === 'result' && verificationResult && (
            <VerificationResultDisplay result={verificationResult} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
}