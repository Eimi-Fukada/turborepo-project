import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserInfo {
  avatar: string;
  id: string;
  mobile: string;
  realName: string;
  username: string;
}

interface MenuByUserData {
  name: string;
  url: string;
  permissionType: number;
  hasSelect: boolean;
  // 因为是扁平化后的数据，这里一定是按钮权限
  children?: MenuByUserData[];
}

interface UserState {
  userInfo: UserInfo | null;
  token: string | null;
  // 扁平化的菜单权限数组
  menusPermissions: string[] | null;
  // 接口原始值
  menuByUserData: MenuByUserData[] | null;
  setUserInfo: (user: UserInfo) => void;
  setToken: (token: string) => void;
  setMenusPermissions: (menusPermissions: string[]) => void;
  setMenuByUserData: (menuByUserData: MenuByUserData[]) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userInfo: null,
        token: null,
        menusPermissions: null,
        menuByUserData: null,
        setUserInfo: (user: UserInfo) => set({ userInfo: user }),
        setToken: (token: string) => set({ token }),
        setMenusPermissions: (menusPermissions: string[]) =>
          set({ menusPermissions }),
        setMenuByUserData: (menuByUserData: MenuByUserData[]) =>
          set({ menuByUserData }),
        clearUserInfo: () =>
          set({
            userInfo: null,
            token: null,
            menusPermissions: null,
            menuByUserData: null,
          }),
      }),
      {
        name: "user-storage",
        partialize: (state) => ({
          userInfo: state.userInfo,
          token: state.token,
          menusPermissions: state.menusPermissions,
          menuByUserData: state.menuByUserData,
        }),
      }
    )
  )
);
