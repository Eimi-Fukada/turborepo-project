import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/database";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证必填字段
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 查询用户
    const [users] = (await pool.execute(
      "SELECT id, username, password, email, created_at FROM users WHERE username = ?",
      [username]
    )) as [any[], any];

    // 如果用户不存在，创建新用户
    if (users.length === 0) {
      // 插入新用户，使用 LAST_INSERT_ID() 获取自动生成的ID
      const [insertResult] = (await pool.execute(
        "INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, NOW())",
        [username, password, `${username}@example.com`]
      )) as [any, any];

      // 获取自动生成的用户ID
      const newUserId = insertResult.insertId;

      // 生成用户权限和菜单数据
      const userMenus = ["/", "/dashboard", "/system", "/system/users"];
      const buttonPermissions = [
        "system:user:add",
        "system:user:edit",
        "system:user:delete",
        "system:user:view",
        "system:role:add",
        "system:role:edit",
      ];

      // 构建用户数据
      const userData = {
        id: newUserId.toString(),
        username: username,
        email: `${username}@example.com`,
        roles: ["admin"],
        permissions: buttonPermissions,
        menus: userMenus,
        created_at: new Date().toISOString(),
      };

      // 生成简单的token
      const token = `token-${newUserId}-${Date.now()}`;

      return NextResponse.json({
        success: true,
        message: "注册并登录成功",
        data: {
          user: userData,
          token: token,
          isNewUser: true,
        },
      });
    }

    // 用户已存在，校验密码
    const user = users[0];

    // 验证密码（实际项目中应该使用 bcrypt 等加密方式）
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "密码错误" },
        { status: 401 }
      );
    }

    // 生成用户权限和菜单数据
    const userMenus = ["/", "/dashboard", "/system", "/system/users"];
    const buttonPermissions = [
      "system:user:add",
      "system:user:edit",
      "system:user:delete",
      "system:user:view",
      "system:role:add",
      "system:role:edit",
    ];

    // 构建用户数据
    const userData = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      roles: ["admin"],
      permissions: buttonPermissions,
      menus: userMenus,
      created_at: user.created_at,
    };

    // 生成简单的token（实际项目中应该使用 JWT 等安全方式）
    const token = `token-${user.id}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: "登录成功",
      data: {
        user: userData,
        token: token,
        isNewUser: false,
      },
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { success: false, message: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
