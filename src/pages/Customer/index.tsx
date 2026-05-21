import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { TabBar } from "antd-mobile";
import {
  AppOutline,
  UnorderedListOutline,
  UserOutline,
} from "antd-mobile-icons";
import "./index.css";

function Customer() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      key: "/customer",
      title: "首页",
      icon: <AppOutline />,
    },
    {
      key: "/customer/orders",
      title: "订单",
      icon: <UnorderedListOutline />,
    },
    {
      key: "/customer/profile",
      title: "我的",
      icon: <UserOutline />,
    },
  ];

  const handleTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <div className="customer-page">
      <div className="page-body">
        <Outlet />
      </div>
      <TabBar activeKey={location.pathname} onChange={handleTabChange}>
        {tabs.map((item) => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
}

export default Customer;
