import type { User } from "@/types/user";

import type { RoleValue } from "@/types/user";

// 获取角色（供 RoleGuard 使用）
  export function getRole(): RoleValue | null {
    return sessionStorage.getItem('role') as RoleValue | null;
  }
  // 获取token（供 RoleGuard 使用）
  export function getToken(): string | null {
    return sessionStorage.getItem('token') as string | null;
}
  // 设置用户信息
  export function setUserSessionStorage(user: User, role: RoleValue) {
  sessionStorage.setItem("role", role);
  sessionStorage.setItem("user", JSON.stringify(user.nickname));
};
// 删除用户信息
export function deleteUserInfo() {
  // 删除指定的三个字段
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  // 可选：清空全部（二选一即可）
  // sessionStorage.clear();
}