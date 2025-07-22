"use client";

import { MyMenuDataItem } from "@/config/routes";
import { CheckCard } from "@ant-design/pro-components";
import { Checkbox } from "antd";
import { FC, memo, useState, useEffect } from "react";

interface PermissionItem extends MyMenuDataItem {
  name?: string;
  url?: string;
  permissionType: number;
  hasSelect: boolean;
  children?: PermissionItem[];
}

interface AuthCheckCardProps {
  data: PermissionItem[];
  onChange?: (allData: PermissionItem[]) => void; // ✅ 返回整个权限结构（包含 hasSelect 状态）
  disabled?: boolean;
}

const Component: FC<AuthCheckCardProps> = ({
  data: originData,
  onChange,
  disabled,
}) => {
  const [data, setData] = useState<PermissionItem[]>([]);

  useEffect(() => {
    setData(originData);
    onChange?.(originData);
  }, [originData]);

  const handleMenuChange = (selectedMenuUrls: string[]) => {
    const newData = data.map((menu) => {
      const isSelected = selectedMenuUrls.includes(menu.url!);
      const updatedMenu: PermissionItem = {
        ...menu,
        hasSelect: isSelected,
        children: menu.children?.map((btn) => ({
          ...btn,
          hasSelect: isSelected ? btn.hasSelect : false, // 取消菜单时取消按钮
        })),
      };
      return updatedMenu;
    });

    setData(newData);
    onChange?.(newData);
  };

  const handleBtnChange = (menuUrl: string, selectedBtns: string[]) => {
    const newData = data.map((menu) => {
      if (menu.url !== menuUrl) return menu;

      const updatedMenu: PermissionItem = {
        ...menu,
        hasSelect: selectedBtns.length > 0 ? true : menu.hasSelect,
        children: menu.children?.map((btn) => ({
          ...btn,
          hasSelect: selectedBtns.includes(btn.url!),
        })),
      };

      return updatedMenu;
    });

    setData(newData);
    onChange?.(newData);
  };

  return (
    <CheckCard.Group
      multiple
      value={data.filter((m) => m.hasSelect).map((m) => m.url!)}
      onChange={(val) => handleMenuChange(val as string[])}
      disabled={disabled}
    >
      <div style={{ columnCount: 2 }}>
        {data.map((menu) => (
          <CheckCard
            key={menu.url}
            title={menu.name}
            value={menu.url}
            avatar="https://gw.alipayobjects.com/zos/bmw-prod/f601048d-61c2-44d0-bf57-ca1afe7fd92e.svg"
          >
            {menu.children && menu.children?.length > 0 && (
              <Checkbox.Group
                value={menu.children
                  .filter((btn) => btn.hasSelect)
                  .map((btn) => btn.url!)}
                onChange={(val) => handleBtnChange(menu.url!, val as string[])}
                disabled={disabled}
              >
                {menu.children.map((btn) => (
                  <Checkbox
                    key={btn.url}
                    value={btn.url}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {btn.name}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          </CheckCard>
        ))}
      </div>
    </CheckCard.Group>
  );
};

const AuthCheckCard = memo(Component);
export default AuthCheckCard;
