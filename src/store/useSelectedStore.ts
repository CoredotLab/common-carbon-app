import { create } from "zustand";

interface SelectedState {
  country: string | null;
  technology: string | null;
  setCountry: (country: string) => void;
  setTechnology: (tech: string) => void;
}

const useSelectedStore = create<SelectedState>((set) => ({
  country: null,
  technology: null,
  setCountry: (country) => set({ country }),
  setTechnology: (technology) => set({ technology }),
}));

export default useSelectedStore;
