# Selective Disclosure QR System

A privacy-preserving digital identity verification system that allows users to prove specific facts about themselves without revealing unnecessary personal information.

## 🚀 Features

- **Digital Wallet**: Store and manage digital credentials securely
- **Selective Disclosure**: Share only the information that's requested
- **Dynamic QR Codes**: Generate time-limited verification codes
- **Cryptographic Proofs**: Uses SD-JWT style tokens and zero-knowledge proofs
- **Privacy First**: No unnecessary data is ever shared or stored

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Cryptography**: Jose (JWT), Crypto-JS
- **QR Codes**: qrcode.react, html5-qrcode

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Usage

### User Wallet
1. Open the wallet view
2. View your stored credentials
3. Scan verification requests from businesses
4. Approve what information to share
5. Generate dynamic QR codes

### Verifier Portal
1. Create a verification request
2. Choose what information you need (Age 18+, Student Status, etc.)
3. Generate a request QR code
4. User scans and approves
5. Scan user's response QR
6. Get instant verification

## 🔐 How It Works

1. **Credential Issuance**: Trusted authorities (government, universities) issue cryptographically signed credentials
2. **Request Creation**: Verifiers create requests specifying what they need to know
3. **Selective Disclosure**: Users approve requests and generate proofs that reveal only requested information
4. **Verification**: Verifiers scan and validate proofs using cryptographic signatures

## 📱 Demo Mode

The app includes a demo mode that simulates both the user wallet and verifier portal in one interface. Perfect for testing and demonstrations!

## 🔒 Privacy & Security

- Credentials are stored locally in the browser
- Dynamic QR codes expire after 60 seconds
- Zero-knowledge proofs for age verification
- Cryptographic signatures ensure authenticity
- Complete audit trail of all verifications

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - feel free to use this for your projects!

## 🤝 Contributing

Contributions are welcome! This is a proof-of-concept demonstrating selective disclosure principles.

## ⚠️ Note

This is a demonstration project. For production use, you would need:
- Real issuer infrastructure
- Proper key management (HSMs, secure enclaves)
- Production-grade ZKP libraries (snarkjs, circom)
- Backend services for credential issuance and revocation
- Mobile apps with native biometric authentication
