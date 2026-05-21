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
import PagePlaceholder from "@/components/PagePlaceholder";
import MerchantAuditList from "@/components/merchant/MerchantAuditList"
import ProductList from "@/components/merchant/ProductList";
import SelectList from "@/components/ShopCategorySelect";
import CategoryAudit from "@/components/admin/SpuAuditList";
import CategoryManage from "@/components/admin/CategoryManage";
import OrderList from "@/components/merchant/OrderList";
import MarketingManagement from "@/components/merchant/MarketingManagement";
import MerchantDataDashboard from "@/components/merchant/MerchantDataDashboard";
import PlatformDataDashboard from "@/components/admin/PlatformDataDashboard";
import ReviewManagement from "@/components/merchant/ReviewManagement";
import MerchantHome from "@/components/merchant/MerchantHome";
import AdminHome from "@/components/admin/AdminHome";
import ShopListPage from "@/components/customer/ShopListPage";
import ShopDetailPageWrapper from "@/components/customer/ShopDetailPageWrapper";
import OrderListPage from "@/components/customer/OrderList";
import ProfilePage from "@/components/customer/Profile";

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
        // 👇 新增：商家侧边栏所有子路由
        children: [
          { index: true, element: <Navigate to="/business/home" replace /> },
          {
            path: "home",
            element: <MerchantHome />,
          },
          // {
          //   path: "goods/spu",
          //   element: <PagePlaceholder title="商品管理 - SPU管理" />,
          // },
          // {
          //   path: "goods/sku",
          //   element: <PagePlaceholder title="商品管理 - SKU管理" />,
          // },
          {
            path: "goods/status",
            element: <ProductList />,
          },
          {
            path: "goods/stock",
            element: <PagePlaceholder title="商品管理 - 库存预警" />,
          },
          {
            path: "order/list",
            element: <OrderList />,
          },
          {
            path: "order/exception",
            element: <PagePlaceholder title="订单管理 - 异常订单处理" />,
          },
          {
            path: "order/export",
            element: <PagePlaceholder title="订单管理 - 订单导出" />,
          },
          {
            path: "order/logistics",
            element: <PagePlaceholder title="订单管理 - 物流追踪" />,
          },
          { path: "marketing", element: <MarketingManagement /> },
          { path: "customer", element: <PagePlaceholder title="客户管理" /> },
          {
            path: "aftersale",
            element: <ReviewManagement />,
          },
          { path: "report", element: <MerchantDataDashboard /> },
          { path: "fund", element: <PagePlaceholder title="资金账户管理" /> },
          { path: "shop", element: <PagePlaceholder title="店铺管理" /> },
          { path: "message", element: <PagePlaceholder title="消息中心" /> },
        ],
      },
      {
        path: "admin",
        element: (
          <RoleGuard requiredRole={RoleConst.ADMIN}>
            <Admin />
          </RoleGuard>
        ),
        // 👇 新增：管理员侧边栏所有子路由
        children: [
          { index: true, element: <Navigate to="/admin/home" replace /> },
          {
            path: "home",
            element: <AdminHome />,
          },
          {
            path: "merchant/audit",
            element: <MerchantAuditList />,
          },
          {
            path: "merchant/info",
            element: <PagePlaceholder title="商家管理 - 商家信息管理" />,
          },
          {
            path: "merchant/level",
            element: <PagePlaceholder title="商家管理 - 商家分级管控" />,
          },
          {
            path: "merchant/shop_type",
            element: <SelectList />,
          },
          {
            path: "category/maintain",
            element: <CategoryManage />,
          },
          {
            path: "category/audit",
            element: <CategoryAudit />,
          },
          {
            path: "activity/platform",
            element: <PagePlaceholder title="营销活动管理 - 平台活动策划" />,
          },
          {
            path: "activity/audit",
            element: <PagePlaceholder title="营销活动管理 - 商家活动审核" />,
          },
          {
            path: "activity/rule",
            element: <PagePlaceholder title="营销活动管理 - 违规营销监控" />,
          },
          { path: "dashboard", element: <PlatformDataDashboard /> },
          { path: "risk", element: <PagePlaceholder title="风控反欺诈管理" /> },
          {
            path: "workorder",
            element: <PagePlaceholder title="客服工单管理" />,
          },
          { path: "finance", element: <PagePlaceholder title="财务管理" /> },
          {
            path: "logistics",
            element: <PagePlaceholder title="物流渠道管理" />,
          },
        ],
      },
      {
        path: "customer",
        element: (
          <RoleGuard requiredRole={RoleConst.CUSTOMER}>
            <Customer />
          </RoleGuard>
        ),
        children: [
          // index: true 表示这是父路由的默认子路由，不需要额外的 path
          { index: true, element: <ShopListPage /> },
          {
            path: "shop/:shopId",
            element: <ShopDetailPageWrapper />,
          },
          {
            path: "orders",
            element: <OrderListPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
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
