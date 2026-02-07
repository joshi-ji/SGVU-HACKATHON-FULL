import React, { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, X, Hash } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
}

type ScanMode = 'qr' | 'code';

export default function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('qr');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Handle scan errors silently
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Failed to start camera:', error);
      alert('Failed to access camera. Please check permissions or use manual input.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      if (scanMode === 'code') {
        // For code mode, retrieve the stored disclosure
        const stored = localStorage.getItem(`verification_${manualInput.trim()}`);
        if (stored) {
          onScan(stored);
          setManualInput('');
          setShowManual(false);
        } else {
          alert('Invalid or expired verification code. Please try again.');
        }
      } else {
        // For QR mode, pass the data directly
        onScan(manualInput.trim());
        setManualInput('');
        setShowManual(false);
      }
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Verify Credentials</h2>

      {/* Mode Selection */}
      {!isScanning && !showManual && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Choose verification method:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScanMode('qr')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                scanMode === 'qr'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">📱</div>
              <p className="font-medium">QR Code</p>
              <p className="text-xs text-gray-500 mt-1">Scan QR code</p>
            </button>
            
            <button
              onClick={() => setScanMode('code')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                scanMode === 'code'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-3xl mb-2">🔢</div>
              <p className="font-medium">PIN Code</p>
              <p className="text-xs text-gray-500 mt-1">Enter 6-digit code</p>
            </button>
          </div>
        </div>
      )}

      {!isScanning && !showManual && (
        <div className="space-y-4">
          {scanMode === 'qr' && (
            <button onClick={startScanning} className="w-full btn-primary flex items-center justify-center gap-2">
              <Camera className="w-5 h-5" />
              Start Camera Scan
            </button>
          )}

          <button
            onClick={() => setShowManual(true)}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {scanMode === 'qr' ? <Upload className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
            {scanMode === 'qr' ? 'Manual QR Input' : 'Enter PIN Code'}
          </button>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>Instructions:</strong> {scanMode === 'qr' 
                ? 'Ask the user to show their QR code, then scan it using your device camera or paste the data manually.'
                : 'Ask the user for their 6-digit verification code and enter it below.'}
            </p>
          </div>
        </div>
      )}

      {isScanning && (
        <div>
          <div id="qr-reader" className="rounded-lg overflow-hidden mb-4"></div>
          <button onClick={stopScanning} className="w-full btn-secondary flex items-center justify-center gap-2">
            <X className="w-5 h-5" />
            Stop Scanning
          </button>
        </div>
      )}

      {showManual && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste QR Code Data
            </label>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste the QR code data here..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowManual(false);
                setManualInput('');
              }}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleManualSubmit} className="flex-1 btn-primary">
              Verify
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
