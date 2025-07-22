import { create } from "zustand";

type MethodMap = Record<string, () => void>;

interface MethodStore {
  componentMethods: MethodMap;
  registerMethod: (key: string, method: () => void) => void;
  triggerMethod: (key: string) => void;
}

export const useMethodStore = create<MethodStore>((set, get) => ({
  componentMethods: {},
  registerMethod: (key, method) => {
    set((state) => ({
      componentMethods: { ...state.componentMethods, [key]: method },
    }));
  },
  triggerMethod: (key) => {
    const method = get().componentMethods[key];
    if (typeof method === "function") {
      method();
    }
  },
}));
