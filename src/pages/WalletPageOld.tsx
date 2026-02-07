import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, QrCode, Activity, Plus, Home } from 'lucide-react';
import { useCredentialStore } from '@/stores/credentialStore';
import { useVerificationStore } from '@/stores/verificationStore';
import CredentialCard from '@/components/wallet/CredentialCard';
import RequestModal from '@/components/wallet/RequestModal';
import ActivityLog from '@/components/wallet/ActivityLog';
import type { VerificationRequest } from '@/types';

export default function WalletPage() {
  const { credentials, initializeMockData } = useCredentialStore();
  const { currentRequest, setCurrentRequest } = useVerificationStore();
  const [activeTab, setActiveTab] = useState<'credentials' | 'activity'>('credentials');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeMockData();
    
    // Check for pending requests every second
    const checkForRequests = () => {
      const pendingRequestsData = localStorage.getItem('pending_requests');
      if (pendingRequestsData) {
        try {
          const requests = JSON.parse(pendingRequestsData);
          if (requests.length > 0 && !currentRequest) {
            const request = requests[0];
            setCurrentRequest(request);
            setShowRequestModal(true);
            // Clear the pending request
            localStorage.removeItem('pending_requests');
          }
        } catch (error) {
          console.error('Error parsing pending requests:', error);
        }
      }
    };
    
    // Check immediately and then every second
    checkForRequests();
    const interval = setInterval(checkForRequests, 1000);
    
    return () => clearInterval(interval);
  }, [initializeMockData, currentRequest, setCurrentRequest]);

  const handleScanRequest = () => {
    // Simulate scanning a request (for demo)
    const mockRequest: VerificationRequest = {
      requestId: 'req-demo-123',
      verifier: 'Demo Bar',
      requesting: [
        { type: 'ageOver18', label: 'Proof of Age 18 or older', required: true },
      ],
      purpose: 'Age verification for entry',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    setCurrentRequest(mockRequest);
    setShowRequestModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Navigation Bar */}
      <div className="bg-primary-600 text-white p-4 shadow-lg">
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

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Digital Wallet</h1>
              <p className="text-gray-600">Your secure credential vault</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'credentials'
                ? 'bg-white shadow-md text-primary-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <Wallet className="w-5 h-5 inline mr-2" />
            Credentials
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-white shadow-md text-primary-600'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" />
            Activity
          </button>
        </div>

        {/* Content */}
        {activeTab === 'credentials' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Credentials</h2>
              <button className="btn-secondary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {credentials.length === 0 ? (
              <div className="card text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No credentials yet</p>
                <p className="text-sm text-gray-400">
                  Credentials issued by trusted authorities will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <CredentialCard key={credential.id} credential={credential} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <ActivityLog />
          </div>
        )}

        {/* Floating Action Button */}
        <button
          onClick={handleScanRequest}
          className="fixed bottom-6 right-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          <QrCode className="w-6 h-6" />
        </button>
      </div>

      {/* Request Modal */}
      {showRequestModal && currentRequest && credentials[0] && (
        <RequestModal
          request={currentRequest}
          credential={credentials[0]}
          onClose={() => {
            setShowRequestModal(false);
            setCurrentRequest(null);
          }}
          onApprove={() => {
            // Handle approval
          }}
        />
      )}
    </div>
  );
}
