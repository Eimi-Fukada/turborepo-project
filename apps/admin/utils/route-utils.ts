import { whiteList } from "@/middleware";
import { MenuDataItem } from "@ant-design/pro-components";

export const filterRoutesByPermissions = (
  routes: MenuDataItem[],
  permissions: string[]
): MenuDataItem[] => {
  return routes.filter((route) => {
    // 如果是白名单路由，直接通过
    if (route.path && whiteList.includes(route.path)) {
      return true;
    }

    // 检查当前路由是否有权限
    const hasPermission = permissions.some(
      (permission) =>
        route.path &&
        (permission === route.path ||
          (permission.startsWith(route.path + "/") && route.path !== "/"))
    );

    if (!hasPermission) {
      return false;
    }

    // 如果有子路由，递归过滤
    if (route.children) {
      const filteredChildren = filterRoutesByPermissions(
        route.children,
        permissions
      );
      // 如果子路由都被过滤掉了，并且父路由不是根路由，那么父路由也不显示
      if (filteredChildren.length === 0 && route.path && route.path !== "/") {
        return false;
      }
      route.children = filteredChildren;
    }

    return true;
  });
};
