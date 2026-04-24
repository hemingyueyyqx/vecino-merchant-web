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
import GoodsList from "@/components/merchant/GoodsList";
import SelectList from "@/components/ShopCategorySelect"

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
            element: <PagePlaceholder title="商家首页 - 数据概览" />,
          },
          {
            path: "goods/spu",
            element: <PagePlaceholder title="商品管理 - SPU管理" />,
          },
          {
            path: "goods/sku",
            element: <PagePlaceholder title="商品管理 - SKU管理" />,
          },
          {
            path: "goods/status",
            element: <GoodsList />,
          },
          {
            path: "goods/stock",
            element: <PagePlaceholder title="商品管理 - 库存预警" />,
          },
          {
            path: "order/list",
            element: <PagePlaceholder title="订单管理 - 订单列表" />,
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
          { path: "marketing", element: <PagePlaceholder title="营销管理" /> },
          { path: "customer", element: <PagePlaceholder title="客户管理" /> },
          {
            path: "aftersale",
            element: <PagePlaceholder title="售后&评价管理" />,
          },
          { path: "report", element: <PagePlaceholder title="数据报表" /> },
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
            element: <PagePlaceholder title="平台概览 - 数据总览" />,
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
            element: <PagePlaceholder title="商品类目管理 - 类目体系维护" />,
          },
          {
            path: "category/audit",
            element: <PagePlaceholder title="商品类目管理 - 类目审核" />,
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
          { path: "dashboard", element: <PagePlaceholder title="数据看板" /> },
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
