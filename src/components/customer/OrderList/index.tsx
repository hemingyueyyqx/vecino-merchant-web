import { useState, useEffect } from "react";
import {
  NavBar,
  List,
  Card,
  Tag,
  Empty,
  PullToRefresh,
  Toast,
} from "antd-mobile";
import {
  ClockCircleOutline,
  CheckCircleOutline,
  CloseCircleOutline,
} from "antd-mobile-icons";

interface Order {
  orderId: string;
  orderNo: string;
  shopName: string;
  totalAmount: number;
  status: number; // 0-待支付 1-已支付 2-配送中 3-已完成 4-已取消
  createTime: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: "待支付",
    1: "已支付",
    2: "配送中",
    3: "已完成",
    4: "已取消",
  };
  return statusMap[status] || "未知状态";
};

const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: "warning",
    1: "primary",
    2: "success",
    3: "default",
    4: "danger",
  };
  return colorMap[status] || "default";
};

const getStatusIcon = (status: number) => {
  switch (status) {
    case 0:
      return <ClockCircleOutline />;
    case 1:
    case 2:
    case 3:
      return <CheckCircleOutline />;
    case 4:
      return <CloseCircleOutline />;
    default:
      return null;
  }
};

function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const mockOrders: Order[] = [
        {
          orderId: "1",
          orderNo: "ORD20250520001",
          shopName: "鲜果优选店",
          totalAmount: 89.9,
          status: 2,
          createTime: "2025-05-20 10:30:00",
          items: [
            { productName: "红富士苹果", quantity: 2, price: 29.9 },
            { productName: "香蕉", quantity: 1, price: 30.0 },
          ],
        },
        {
          orderId: "2",
          orderNo: "ORD20250519002",
          shopName: "便民超市",
          totalAmount: 156.5,
          status: 3,
          createTime: "2025-05-19 15:20:00",
          items: [
            { productName: "大米", quantity: 1, price: 89.0 },
            { productName: "食用油", quantity: 1, price: 67.5 },
          ],
        },
        {
          orderId: "3",
          orderNo: "ORD20250518003",
          shopName: "生鲜直通车",
          totalAmount: 45.8,
          status: 0,
          createTime: "2025-05-18 09:15:00",
          items: [{ productName: "西红柿", quantity: 3, price: 15.6 }],
        },
      ];

      setOrders(mockOrders);
    } catch (err) {
      console.error("获取订单列表失败", err);
      Toast.show({ content: "加载订单失败", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    await fetchOrders();
    Toast.show({ content: "刷新成功" });
  };

  return (
    <div className="order-list-page">
      <NavBar back={null}>我的订单</NavBar>

      <PullToRefresh onRefresh={onRefresh}>
        <div className="order-list-container">
          {loading ? (
            <div className="loading-tip">加载中...</div>
          ) : orders.length === 0 ? (
            <Empty description="暂无订单" />
          ) : (
            orders.map((order) => (
              <Card key={order.orderId} className="order-card">
                <div className="order-header">
                  <div className="order-shop">{order.shopName}</div>
                  <Tag color={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Tag>
                </div>

                <List className="order-items">
                  {order.items.map((item, index) => (
                    <List.Item key={index}>
                      <div className="order-item-content">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-info">
                          x{item.quantity} ¥
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </List.Item>
                  ))}
                </List>

                <div className="order-footer">
                  <div className="order-time">下单时间：{order.createTime}</div>
                  <div className="order-total">
                    合计：
                    <span className="total-price">
                      ¥{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}

export default OrderListPage;
