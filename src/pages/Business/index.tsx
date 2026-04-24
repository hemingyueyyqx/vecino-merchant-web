import React, { useState, useEffect } from "react";
import { Layout, Menu, Space, Typography, message, Spin } from "antd";
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
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { findShop } from "@/services/auth";
import { deleteUserInfo } from "@/services/utils";
import type { ShopInfo } from "@/types/user";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Business: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // 侧边栏展开状态
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // 店铺信息（接口获取）
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ===================== 核心修改 =====================
  // 1. 直接从 sessionStorage 读取 商家昵称（你存储的是纯昵称）
  const getUserNickname = (): string => {
    try {
      const userStr = sessionStorage.getItem("user");
      // 你存的是 JSON.stringify(user.nickname)，所以直接解析
      return userStr ? JSON.parse(userStr) : "商家用户";
    } catch  {
      return "商家用户";
    }
  };

  // 商家昵称（从 session 读取）
  const nickname = getUserNickname();
  // ====================================================

  // 页面加载：获取店铺信息（仅店铺名，昵称不从接口拿）
  useEffect(() => {
    const getShopData = async () => {
      try {
        setLoading(true);
        const res = await findShop();
        if (res?.shopInfo) {
          setShopInfo(res.shopInfo);
        }
      } catch{
        message.error("获取店铺信息失败");
      } finally {
        setLoading(false);
      }
    };
    getShopData();
  }, []);

  // 侧边栏展开/折叠
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 退出登录
  const handleLogout = () => {
    deleteUserInfo();
    message.success("退出登录成功");
    navigate("/login");
  };

  // 菜单配置
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
        {
          key: "/business/goods/status",
          label: <Link to="/business/goods/status">商品列表</Link>,
        },
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

        <Spin spinning={loading} size="small">
          <Space size="large">
            {/* 店铺名称（接口获取） */}
            <span>{shopInfo?.shopName || "未设置店铺"}</span>
            <Space>
              {/* 头像：session昵称首字 */}
              {/* <Avatar>{avatarText}</Avatar> */}
              {/* 昵称：直接从session读取 */}
              <span>商家{nickname}</span>
              <BellOutlined />
            </Space>
            {/* 退出登录 */}
            <span
              style={{ cursor: "pointer", color: "#1890ff" }}
              onClick={handleLogout}
            >
              退出登录
            </span>
          </Space>
        </Spin>
      </Header>

      <Layout>
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
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Business;
