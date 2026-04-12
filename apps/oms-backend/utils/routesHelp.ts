import { MyMenuDataItem } from "@/config/routes";

export function flattenMenu(menuList: MyMenuDataItem[]): MyMenuDataItem[] {
  return menuList.reduce<MyMenuDataItem[]>((acc, item) => {
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;
    const childrenFlat = hasChildren ? flattenMenu(item?.children || []) : [];

    if (hasChildren) {
      if (item.isPage === true) {
        // 有children且isPage为true，保留自己和children
        const { children, icon, ...rest } = item;
        return [...acc, rest, ...childrenFlat];
      } else {
        // 有children但没有isPage，只保留children
        return [...acc, ...childrenFlat];
      }
    } else {
      // 没有children，保留自己
      const { children, icon, ...rest } = item;
      return [...acc, rest];
    }
  }, []);
}

export function transformMenu(menuList: MyMenuDataItem[]) {
  return flattenMenu(menuList)
    .filter((menuItem) => menuItem.path !== "/resourcePermission")
    .map((menuItem) => {
      const { path, btnPermissions, ...restMenu } = menuItem;
      const children =
        btnPermissions && btnPermissions.length > 0
          ? btnPermissions.map((btn) => {
              const { code, ...restBtn } = btn;
              return {
                ...restBtn,
                url: code,
                permissionType: 2,
                hasSelect: false,
              };
            })
          : undefined;
      return {
        ...restMenu,
        url: path,
        permissionType: 1,
        hasSelect: false,
        ...(children ? { children } : {}),
      };
    });
}

export function filterRoutesByPathData(
  routes: MyMenuDataItem[],
  paths: string[]
): MyMenuDataItem[] {
  const filtered: MyMenuDataItem[] = [];

  for (const route of routes) {
    // 检查当前 route 或其子节点是否匹配 paths
    const matchSelf = paths.includes(route?.path || "");

    let matchChildren: MyMenuDataItem[] | undefined;
    if (route.children) {
      matchChildren = filterRoutesByPathData(route.children, paths);
    }

    if (matchSelf || (matchChildren && matchChildren.length > 0)) {
      filtered.push({
        ...route,
        // 只有有匹配的 children 时才保留 children 字段
        ...(matchChildren ? { children: matchChildren } : {}),
      });
    }
  }

  return filtered;
}

export function syncHasSelect(tree, items) {
  return tree.map((node) => {
    // 在 items 里找到同 url 的节点
    const match = items.find((item) => item.url === node.url);
    return {
      ...node,
      hasSelect: match ? match.hasSelect : false,
      children: node.children
        ? syncHasSelect(node.children, match?.children || [])
        : undefined,
    };
  });
}

export function syncHasSelectByMenuList(menuList, dataList) {
  return menuList.map((menu) => {
    // 在 dataList 里找到同 url 的节点
    const match = dataList.find((d) => d.url === menu.url);

    // 处理 children
    let children = undefined;
    if (menu.children) {
      // 如果 dataList 里有对应的 children，则递归同步
      const matchChildren = match?.children || [];
      children = syncHasSelect(menu.children, matchChildren);
    }

    return {
      ...menu,
      hasSelect: !!match,
      children,
    };
  });
}
