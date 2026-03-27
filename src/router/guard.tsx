// src/router/guard.tsx
import { Navigate } from 'react-router-dom'
import { getRole } from '@/services/utils'
import { RoleConst } from '@/types/user'
import type { RoleValue } from '@/types/user'

// 路由守卫组件
export const RoleGuard = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode; 
  requiredRole: RoleValue 
}) => {
  const currentRole = getRole()
  
  // 未登录跳登录页
  if (!currentRole) {
    return <Navigate to="/login" replace />
  }
  
  // 角色不匹配跳对应首页
  if (currentRole !== requiredRole) {
    switch (currentRole) {
      case RoleConst.BUSINESS:
        return <Navigate to="/business" replace />
      case RoleConst.ADMIN:
        return <Navigate to="/admin" replace />
      case RoleConst.CUSTOMER:
        return <Navigate to="/customer" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }
  
  return <>{children}</>
}