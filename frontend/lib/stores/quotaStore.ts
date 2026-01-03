import { create } from 'zustand';

interface QuotaInfo {
  used: number;
  total: number;
  resetTime: string; // UTC ISO 8601
  canGenerate: boolean;
}

interface QuotaState {
  quota: QuotaInfo | null;
  setQuota: (quota: QuotaInfo) => void;
  incrementUsed: () => void;
  resetQuota: () => void;
}

export const useQuotaStore = create<QuotaState>((set) => ({
  quota: null,
  setQuota: (quota) => set({ quota }),
  incrementUsed: () =>
    set((state) => {
      if (!state.quota) return state;
      const newUsed = state.quota.used + 1;
      return {
        quota: {
          ...state.quota,
          used: newUsed,
          canGenerate: newUsed < state.quota.total,
        },
      };
    }),
  resetQuota: () =>
    set((state) => {
      if (!state.quota) return state;
      return {
        quota: {
          ...state.quota,
          used: 0,
          canGenerate: true,
        },
      };
    }),
}));
