import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
  roles?: string[];
  permissions?: string[]; // 按钮权限码列表
  menus?: string[]; // 菜单路由权限列表
}

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  setUserInfo: (user: UserInfo) => void;
  setToken: (token: string) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userInfo: null,
        token: null,
        setUserInfo: (user: UserInfo) => set({ userInfo: user }),
        setToken: (token: string) => set({ token }),
        clearUserInfo: () => set({ userInfo: null, token: null }),
      }),
      {
        name: "user-storage",
        partialize: (state) => ({
          userInfo: state.userInfo,
          token: state.token,
        }),
      }
    )
  )
);
