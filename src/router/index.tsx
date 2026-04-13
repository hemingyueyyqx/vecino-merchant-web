import { createHashRouter, Navigate } from "react-router-dom";
import App from "@/App";
import Login from "@/pages/Login/Login";
import Register from "@/pages/Register/Register";
import Business from "@/pages/Business";
import Admin from "@/pages/Admin";
import Customer from "@/pages/Customer";
import { RoleGuard } from "./guard";
import { RoleConst } from "@/types/user";
import ResetPassword from "@/pages/ResetPassword";
import Apply from "@/pages/Apply";
import WaitApply from "@/pages/WaitApply";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "reset-password", element: <ResetPassword /> },
      {
        path: "business",
        element: (
          <RoleGuard requiredRole={RoleConst.BUSINESS}>
            <Business />
          </RoleGuard>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleGuard requiredRole={RoleConst.ADMIN}>
            <Admin />
          </RoleGuard>
        ),
      },
      {
        path: "customer",
        element: (
          <RoleGuard requiredRole={RoleConst.CUSTOMER}>
            <Customer />
          </RoleGuard>
        ),
      },
      {
        path: "apply",
        element: (
          <RoleGuard requiredRole={RoleConst.BUSINESS}>
            <Apply />
          </RoleGuard>
        ),
      },
      {
        path: "waitApply",
        element: (
          <RoleGuard requiredRole={RoleConst.BUSINESS}>
            <WaitApply />
          </RoleGuard>
        ),
      },
    ],
  },
]);

export default router;
