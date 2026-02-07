import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DemoPage from './pages/DemoPage';
import WalletPage from './pages/WalletPage';
import VerifierPage from './pages/VerifierPage';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DemoPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/verifier" element={<VerifierPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
