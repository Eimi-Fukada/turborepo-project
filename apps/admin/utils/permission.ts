import { useUserStore } from "@/stores/useUserStore";

/**
 * 检查按钮权限
 * @param code 按钮权限码，如 "system:user:add"
 */
export const hasPermission = (code: string): boolean => {
  const permissions = useUserStore.getState().userInfo?.permissions || [];
  if (!code) return true;
  return permissions.includes(code);
};

/**
 * 检查是否拥有某个角色
 * @param role 角色标识
 */
export const hasRole = (role: string): boolean => {
  const roles = useUserStore.getState().userInfo?.roles || [];
  if (!role) return true;
  return roles.includes(role);
};

/**
 * 检查是否有菜单访问权限
 * @param path 路由路径
 */
export const hasMenuPermission = (path: string): boolean => {
  const menus = useUserStore.getState().userInfo?.menus || [];
  if (!path) return true;
  return menus.some((menu) => path === menu || path.startsWith(`${menu}/`));
};
