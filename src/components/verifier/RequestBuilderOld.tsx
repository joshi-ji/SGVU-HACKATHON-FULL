import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import type { VerificationRequest, RequestedClaim } from '@/types';
import { encodeToQR } from '@/lib/qr/encoder';
import { Sparkles, Building2 } from 'lucide-react';

interface Preset {
  name: string;
  icon: string;
  claims: RequestedClaim[];
  purpose: string;
}

const presets: Preset[] = [
  {
    name: 'Age 18+',
    icon: '🍺',
    claims: [
      { type: 'ageOver18', label: 'Proof of Age 18 or older', required: true },
    ],
    purpose: 'Age verification for entry',
  },
  {
    name: 'Age 21+',
    icon: '🍷',
    claims: [
      { type: 'ageOver21', label: 'Proof of Age 21 or older', required: true },
    ],
    purpose: 'Age verification for alcohol purchase',
  },
  {
    name: 'Hotel Check-in',
    icon: '🏨',
    claims: [
      { type: 'fullName', label: 'Full Name', required: true },
      { type: 'ageOver18', label: 'Proof of Age 18+', required: true },
    ],
    purpose: 'Hotel registration',
  },
  {
    name: 'Student Discount',
    icon: '🎓',
    claims: [
      { type: 'studentStatus', label: 'Student Status Verification', required: true },
    ],
    purpose: 'Student discount eligibility',
  },
];

export default function RequestBuilder() {
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [verifierName, setVerifierName] = useState('');
  const [qrData, setQrData] = useState<string | null>(null);
  const [request, setRequest] = useState<VerificationRequest | null>(null);

  const handleGenerateRequest = () => {
    if (!selectedPreset || !verifierName.trim()) {
      alert('Please select a preset and enter verifier name');
      return;
    }

    const newRequest: VerificationRequest = {
      requestId: uuidv4(),
      verifier: verifierName,
      requesting: selectedPreset.claims,
      purpose: selectedPreset.purpose,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    };

    const encoded = encodeToQR(newRequest, 'request');
    setQrData(encoded);
    setRequest(newRequest);
  };

  const handleReset = () => {
    setQrData(null);
    setRequest(null);
    setSelectedPreset(null);
    setVerifierName('');
  };

  if (qrData && request) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Verification Request</h2>

          <div className="bg-white p-6 rounded-xl border-2 border-primary-500 mb-6">
            <QRCodeSVG value={qrData} size={300} level="H" className="w-full h-auto" />
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              User should scan this QR code with their Digital Wallet
            </p>
            <p className="text-sm text-gray-500">
              Request expires in 5 minutes
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-medium text-blue-900 mb-2">Requesting:</p>
            <ul className="space-y-1">
              {request.requesting.map((claim, idx) => (
                <li key={idx} className="text-sm text-blue-700">
                  • {claim.label}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={handleReset} className="w-full btn-secondary">
            Create New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Create Verification Request</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Verifier Name (Your Business)
          </label>
          <input
            type="text"
            value={verifierName}
            onChange={(e) => setVerifierName(e.target.value)}
            placeholder="e.g., Moonlight Bar, Luxe Hotel"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Select Verification Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPreset(preset)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPreset?.name === preset.name
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-3xl mb-2">{preset.icon}</div>
                <h3 className="font-semibold">{preset.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{preset.purpose}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedPreset && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              This will request:
            </p>
            <ul className="space-y-1">
              {selectedPreset.claims.map((claim, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  • {claim.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleGenerateRequest}
          disabled={!selectedPreset || !verifierName.trim()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate QR Request
        </button>
      </div>
    </div>
  );
}
