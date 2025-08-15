import { UserLimits } from "@/lib/types";
import { create } from "zustand";

interface UserStore {
  limits: UserLimits | null;
  loading: boolean;
  setLimits: (limits: UserLimits) => void;
  incrementLimits: () => void;
  resetLimits: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  limits: null,
  loading: false,
  setLimits: (limits) => set({ limits }),
  incrementLimits: () =>
    set((state) => {
      if (!state.limits) return { limits: null };
      return {
        limits: {
          ...state.limits,
          dailyCount: state.limits.dailyCount + 1,
          monthlyCount: state.limits.monthlyCount + 1,
          totalCount: state.limits.totalCount + 1,
        },
      };
    }),
  resetLimits: () => set({ limits: null }),
  setLoading: (loading) => set({ loading }),
}));
