import { create } from "zustand";

interface PremiumModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Vô hiệu hóa modal premium
const usePremiumModal = create<PremiumModalState>((set) => ({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setOpen: (_open: boolean) => set({ open: false }),
}));

export default usePremiumModal;
