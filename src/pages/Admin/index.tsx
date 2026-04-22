import React, { useState } from "react";
import { Layout, Menu, Avatar, Space, Typography } from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  GiftOutlined,
  BarChartOutlined,
  SafetyOutlined,
  FileDoneOutlined,
  WalletOutlined,
  TruckOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Link, useLocation, Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Admin: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 侧边栏二级菜单 展开/折叠 受控状态
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 侧边栏菜单配置
  const menuItems = [
    {
      key: "/admin/home",
      icon: <DashboardOutlined />,
      label: <Link to="/admin/home">平台概览</Link>,
    },
    {
      key: "merchant",
      icon: <ShopOutlined />,
      label: "商家管理",
      children: [
        {
          key: "/admin/merchant/audit",
          label: <Link to="/admin/merchant/audit">入驻审核</Link>,
        },
        // {
        //   key: "/admin/merchant/info",
        //   label: <Link to="/admin/merchant/info">商家列表</Link>,
        // },
        // {
        //   key: "/admin/merchant/level",
        //   label: <Link to="/admin/merchant/level">商家分级管控</Link>,
        // },
      ],
    },
    {
      key: "category",
      icon: <AppstoreOutlined />,
      label: "商品类目管理",
      children: [
        {
          key: "/admin/category/maintain",
          label: <Link to="/admin/category/maintain">类目体系维护</Link>,
        },
        {
          key: "/admin/category/audit",
          label: <Link to="/admin/category/audit">类目审核</Link>,
        },
      ],
    },
    {
      key: "activity",
      icon: <GiftOutlined />,
      label: "营销活动管理",
      children: [
        {
          key: "/admin/activity/platform",
          label: <Link to="/admin/activity/platform">平台活动策划</Link>,
        },
        {
          key: "/admin/activity/audit",
          label: <Link to="/admin/activity/audit">商家活动审核</Link>,
        },
        {
          key: "/admin/activity/rule",
          label: <Link to="/admin/activity/rule">违规营销监控</Link>,
        },
      ],
    },
    {
      key: "/admin/dashboard",
      icon: <BarChartOutlined />,
      label: <Link to="/admin/dashboard">数据看板</Link>,
    },
    {
      key: "/admin/risk",
      icon: <SafetyOutlined />,
      label: <Link to="/admin/risk">风控反欺诈管理</Link>,
    },
    {
      key: "/admin/workorder",
      icon: <FileDoneOutlined />,
      label: <Link to="/admin/workorder">客服工单管理</Link>,
    },
    {
      key: "/admin/finance",
      icon: <WalletOutlined />,
      label: <Link to="/admin/finance">财务管理</Link>,
    },
    {
      key: "/admin/logistics",
      icon: <TruckOutlined />,
      label: <Link to="/admin/logistics">物流渠道管理</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 顶部栏 */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          padding: "0 24px",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Vecino零售电商商家服务平台-管理后台
        </Title>
        <Space size="large">
          <span>平台管理中心</span>
          <Space>
            <Avatar>李</Avatar>
            <span>管理员李四</span>
            <BellOutlined />
          </Space>
          <span style={{ cursor: "pointer", color: "#1890ff" }}>退出登录</span>
        </Space>
      </Header>

      <Layout>
        {/* 左侧侧边栏（可折叠二级菜单） */}
        <Sider
          width={220}
          theme="light"
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <Menu
            mode="inline"
            selectedKeys={[currentPath]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            items={menuItems}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>

        {/* 右侧主内容区（无面包屑，直接渲染子路由） */}
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
