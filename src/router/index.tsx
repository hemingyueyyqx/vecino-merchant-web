import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '@/App'
import Login from '@/pages/Login/Login'
import Register from '@/pages/Register/Register'
import Business from '@/pages/Business'
import Admin from '@/pages/Admin'
import Customer from '@/pages/Customer'
import { RoleGuard } from './guard' // 引入守卫组件
import { RoleConst } from '@/types/user' // 引入角色常量
import ResetPassword from '@/pages/ResetPassword'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />
  },
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <Navigate to="/login" replace /> },
      {
        path: 'business',
        element: (
          <RoleGuard requiredRole={RoleConst.BUSINESS}>
            <Business />
          </RoleGuard>
        )
      },
      {
        path: 'admin',
        element: (
          <RoleGuard requiredRole={RoleConst.ADMIN}>
            <Admin />
          </RoleGuard>
        )
      },
      {
        path: 'customer',
        element: (
          <RoleGuard requiredRole={RoleConst.CUSTOMER}>
            <Customer />
          </RoleGuard>
        )
      }
    ]
  }
])

export default router
