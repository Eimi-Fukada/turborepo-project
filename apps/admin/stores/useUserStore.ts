import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  menus?: string[]; // 添加菜单权限字段
}

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  // 状态更新方法
  setUserInfo: (user: UserInfo) => void;
  setToken: (token: string) => void;
  clearUserInfo: () => void;
  // 用户权限相关方法
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasMenuPermission: (path: string) => boolean; // 添加菜单权限检查方法
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        userInfo: null,
        token: null,

        setUserInfo: (user: UserInfo) => set({ userInfo: user }),

        setToken: (token: string) => set({ token }),

        clearUserInfo: () => set({ userInfo: null, token: null }),

        hasPermission: (permission: string) => {
          const { userInfo } = get();
          if (!userInfo?.permissions) return false;
          return userInfo.permissions.includes(permission);
        },

        hasRole: (role: string) => {
          const { userInfo } = get();
          if (!userInfo?.roles) return false;
          return userInfo.roles.includes(role);
        },

        hasMenuPermission: (path: string) => {
          const { userInfo } = get();
          if (!userInfo?.menus) return false;
          return userInfo.menus.some(
            (menu) => path === menu || path.startsWith(`${menu}/`)
          );
        },
      }),
      {
        name: "user-storage", // localStorage 中的key
        partialize: (state) => ({
          userInfo: state.userInfo,
          token: state.token,
        }), // 只持久化这两个字段
      }
    )
  )
);
