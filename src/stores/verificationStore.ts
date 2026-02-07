import { create } from 'zustand';
import type { VerificationRequest, SelectiveDisclosure } from '@/types';

interface VerificationStore {
  currentRequest: VerificationRequest | null;
  currentDisclosure: SelectiveDisclosure | null;
  setCurrentRequest: (request: VerificationRequest | null) => void;
  setCurrentDisclosure: (disclosure: SelectiveDisclosure | null) => void;
  clearCurrent: () => void;
}

export const useVerificationStore = create<VerificationStore>((set) => ({
  currentRequest: null,
  currentDisclosure: null,

  setCurrentRequest: (request) => set({ currentRequest: request }),
  
  setCurrentDisclosure: (disclosure) => set({ currentDisclosure: disclosure }),

  clearCurrent: () => set({ currentRequest: null, currentDisclosure: null }),
}));
