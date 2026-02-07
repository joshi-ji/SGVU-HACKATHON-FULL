import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Credential, ActivityLog } from '@/types';
import { createMockGovernmentID } from '@/lib/crypto/credential';

interface CredentialStore {
  credentials: Credential[];
  activityLog: ActivityLog[];
  addCredential: (credential: Credential) => void;
  removeCredential: (id: string) => void;
  addActivity: (activity: ActivityLog) => void;
  initializeMockData: () => Promise<void>;
}

export const useCredentialStore = create<CredentialStore>()(
  persist(
    (set, get) => ({
      credentials: [],
      activityLog: [],

      addCredential: (credential) =>
        set((state) => ({
          credentials: [...state.credentials, credential],
        })),

      removeCredential: (id) =>
        set((state) => ({
          credentials: state.credentials.filter((c) => c.id !== id),
        })),

      addActivity: (activity) =>
        set((state) => ({
          activityLog: [activity, ...state.activityLog],
        })),

      initializeMockData: async () => {
        const currentCredentials = get().credentials;
        if (currentCredentials.length === 0) {
          const mockCredential = await createMockGovernmentID();
          set({ credentials: [mockCredential] });
        }
      },
    }),
    {
      name: 'credential-storage',
    }
  )
);
