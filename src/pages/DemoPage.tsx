import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Wallet } from 'lucide-react';

export default function DemoPage() {
  const navigate = useNavigate();

  if (activeView === 'wallet') {
    return (
      <div>
        <div className="bg-primary-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="font-semibold">User Wallet View</span>
            </div>
            <button
              onClick={() => setActiveView('intro')}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back to Demo
            </button>
          </div>
        </div>
        <WalletPage />
      </div>
    );
  }

  if (activeView === 'verifier') {
    return (
      <div>
        <div className="bg-purple-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Verifier View</span>
            </div>
            <button
              onClick={() => setActiveView('intro')}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back to Demo
            </button>
          </div>
        </div>
        <VerifierPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Selective Disclosure QR System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A privacy-preserving digital identity verification system. 
            Share only what's needed, keep everything else private.
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div
            onClick={() => navigate('/wallet')}
            className="card hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary-100 rounded-xl text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">User Wallet</h2>
                <p className="text-gray-600">
                  Store your digital credentials and selectively share information
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                View your credentials
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                Approve verification requests
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                Generate dynamic QR codes
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                Track your activity
              </li>
            </ul>
            <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-4 transition-all">
              Try Wallet View
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => navigate('/verifier')}
            className="card hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Verifier Portal</h2>
                <p className="text-gray-600">
                  Request and verify credentials from users
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Create verification requests
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Generate request QR codes
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Scan user responses
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                Verify credentials instantly
              </li>
            </ul>
            <div className="flex items-center gap-2 text-purple-600 font-medium group-hover:gap-4 transition-all">
              Try Verifier View
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary-200">
          <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Verifier Requests</h4>
              <p className="text-sm text-gray-600">
                Business creates a verification request and generates a QR code
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">User Approves</h4>
              <p className="text-sm text-gray-600">
                User scans request, reviews what's being asked, and approves
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Instant Verification</h4>
              <p className="text-sm text-gray-600">
                Verifier scans user's response QR and gets instant verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
