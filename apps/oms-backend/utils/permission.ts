import { useUserStore } from "@/stores/useUserStore";
import { usePathname } from "next/navigation";

/**
 * 检查按钮权限
 * @param code 按钮权限码，如 "system:user:add"
 */
export const hasBtnPermission = (code: string): boolean => {
  const pathname = usePathname();
  const menuByUserData = useUserStore((state) => state.menuByUserData) || [];
  const currentPathChildren =
    menuByUserData.find((item) => item.url === pathname)?.children || [];
  const btnPermissionList = currentPathChildren.map((i) => i.url);

  return btnPermissionList.includes(code);
};
