import React, { useState } from 'react';
import { Hash } from 'lucide-react';

interface PinScannerProps {
  onScan: (data: string) => void;
}

export default function PinScanner({ onScan }: PinScannerProps) {
  const [pinInput, setPinInput] = useState('');

  const handleSubmit = () => {
    if (pinInput.trim().length === 6) {
      // For PIN mode, retrieve the stored disclosure
      const stored = localStorage.getItem(`verification_${pinInput.trim()}`);
      if (stored) {
        onScan(stored);
        setPinInput('');
      } else {
        alert('Invalid or expired verification code. Please ask the user to generate a new one.');
        setPinInput('');
      }
    } else {
      alert('Please enter a valid 6-digit code.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pinInput.length === 6) {
      handleSubmit();
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Enter Verification Code</h2>

      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Hash className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">6-Digit PIN Verification</h3>
        <p className="text-gray-600">Ask the user for their verification code</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter the 6-digit code provided by the user
          </label>
          <input
            type="text"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-4 text-3xl font-bold text-center tracking-widest border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"
            autoFocus
          />
          <p className="text-xs text-gray-500 text-center mt-2">
            {pinInput.length}/6 digits
          </p>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={pinInput.length !== 6}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify Code
        </button>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg mt-6">
        <p className="text-sm text-purple-900">
          <strong>Instructions:</strong> The user will generate a 6-digit code on their device. 
          Ask them to share this code with you, then enter it above to verify their credentials.
        </p>
      </div>
    </div>
  );
}