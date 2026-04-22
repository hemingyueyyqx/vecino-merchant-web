import React, { useState } from "react";
import { Layout, Menu, Avatar, Space, Typography } from "antd";
import {
  HomeOutlined,
  ProductOutlined,
  ShoppingOutlined,
  GiftOutlined,
  UserOutlined,
  CommentOutlined,
  BarChartOutlined,
  WalletOutlined,
  ShopOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Link, useLocation, Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Business: React.FC = () => {
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
      key: "/business/home",
      icon: <HomeOutlined />,
      label: <Link to="/business/home">首页</Link>,
    },
    {
      key: "goods",
      icon: <ProductOutlined />,
      label: "商品管理",
      children: [
        // {
        //   key: "/business/goods/spu",
        //   label: <Link to="/business/goods/spu">SPU管理</Link>,
        // },
        // {
        //   key: "/business/goods/sku",
        //   label: <Link to="/business/goods/sku">SKU管理</Link>,
        // },
        {
          key: "/business/goods/status",
          label: <Link to="/business/goods/status">商品列表</Link>,
        },
        // {
        //   key: "/business/goods/stock",
        //   label: <Link to="/business/goods/stock">库存预警</Link>,
        // },
      ],
    },
    {
      key: "order",
      icon: <ShoppingOutlined />,
      label: "订单管理",
      children: [
        {
          key: "/business/order/list",
          label: <Link to="/business/order/list">订单列表</Link>,
        },
        {
          key: "/business/order/exception",
          label: <Link to="/business/order/exception">异常订单处理</Link>,
        },
        {
          key: "/business/order/export",
          label: <Link to="/business/order/export">订单导出</Link>,
        },
        {
          key: "/business/order/logistics",
          label: <Link to="/business/order/logistics">物流追踪</Link>,
        },
      ],
    },
    {
      key: "/business/marketing",
      icon: <GiftOutlined />,
      label: <Link to="/business/marketing">营销管理</Link>,
    },
    {
      key: "/business/customer",
      icon: <UserOutlined />,
      label: <Link to="/business/customer">客户管理</Link>,
    },
    {
      key: "/business/aftersale",
      icon: <CommentOutlined />,
      label: <Link to="/business/aftersale">售后&评价管理</Link>,
    },
    {
      key: "/business/report",
      icon: <BarChartOutlined />,
      label: <Link to="/business/report">数据报表</Link>,
    },
    {
      key: "/business/fund",
      icon: <WalletOutlined />,
      label: <Link to="/business/fund">资金账户管理</Link>,
    },
    {
      key: "/business/shop",
      icon: <ShopOutlined />,
      label: <Link to="/business/shop">店铺管理</Link>,
    },
    {
      key: "/business/message",
      icon: <BellOutlined />,
      label: <Link to="/business/message">消息中心</Link>,
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
          Vecino零售电商商家服务平台
        </Title>
        <Space size="large">
          <span>XX生鲜便利店</span>
          <Space>
            <Avatar>张</Avatar>
            <span>商家张三</span>
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

export default Business;
