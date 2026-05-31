import { useState } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  List,
  Button,
  // Progress,
  Badge,
} from "antd";
import ReactECharts from "echarts-for-react";
import {
  DollarOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  FileTextOutlined,
  RiseOutlined,
  // WarningOutlined,
  // CheckCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";

const { Text } = Typography;

interface PendingItem {
  id: string;
  title: string;
  type: "order" | "comment" | "refund";
  count: number;
  path?: string;
}

interface HotProduct {
  name: string;
  sales: number;
  amount: number;
}

// interface ServicePerformance {
//   label: string;
//   value: number | string;
//   unit?: string;
//   status?: "success" | "warning" | "error" | "normal";
//   icon?: React.ReactNode;
// }

const MerchantHome = () => {
  const navigate = useNavigate();

  const [todayData] = useState({
    todayOrders: 86,
    todayRevenue: 12890,
    pendingOrders: 12,
    pendingComments: 8,
  });

  const [pendingList] = useState<PendingItem[]>([
    {
      id: "1",
      title: "待确认订单",
      type: "order",
      count: 12,
      path: "/business/order/list",
    },
    {
      id: "2",
      title: "待回复评价",
      type: "comment",
      count: 8,
      path: "/business/aftersale",
    },
    {
      id: "3",
      title: "待处理退款",
      type: "refund",
      count: 3,
      path: "/business/order/list",
    },
  ]);

  const [hotProducts] = useState<HotProduct[]>([
    { name: "FOXUP粉底液30ml", sales: 156, amount: 20124 },
    { name: "橘朵高光修容盘", sales: 128, amount: 7552 },
    { name: "YSL纯口红4g", sales: 98, amount: 37240 },
    { name: "完美日记散粉", sales: 85, amount: 6715 },
    { name: "花西子蜜粉饼", sales: 72, amount: 10728 },
  ]);

  // const [servicePerformance] = useState<ServicePerformance[]>([
  //   {
  //     label: "不接单订单",
  //     value: 15,
  //     unit: "单",
  //     status: "warning",
  //     icon: <WarningOutlined />,
  //   },
  //   {
  //     label: "商家不接单率",
  //     value: 2.5,
  //     unit: "%",
  //     status: "success",
  //     icon: <CheckCircleOutlined />,
  //   },
  //   {
  //     label: "配送延迟订单",
  //     value: 8,
  //     unit: "单",
  //     status: "warning",
  //     icon: <ClockCircleOutlined />,
  //   },
  //   {
  //     label: "配送准时率",
  //     value: 96.8,
  //     unit: "%",
  //     status: "success",
  //     icon: <CheckCircleOutlined />,
  //   },
  //   {
  //     label: "商家差评",
  //     value: 3,
  //     unit: "条",
  //     status: "error",
  //     icon: <CommentOutlined />,
  //   },
  // ]);

  const yesterdayAnalysisOption = {
    title: {
      text: "昨日经营分析",
      left: "center",
      textStyle: { fontSize: 14 },
    },
    tooltip: { trigger: "axis" },
    legend: {
      data: ["订单量", "销售额"],
      bottom: 0,
    },
    xAxis: {
      type: "category",
      data: ["0时", "4时", "8时", "12时", "16时", "20时", "24时"],
    },
    yAxis: [
      { type: "value", name: "订单量", position: "left" },
      { type: "value", name: "销售额(元)", position: "right" },
    ],
    series: [
      {
        name: "订单量",
        type: "bar",
        data: [5, 2, 8, 15, 12, 18, 10],
        itemStyle: { color: "#1890ff" },
      },
      {
        name: "销售额",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: [850, 320, 1200, 2800, 2100, 3500, 1800],
        itemStyle: { color: "#52c41a" },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
  };

  return (
    <div className="merchant-home-container">
      <Row gutter={[16, 16]} className="data-card-group">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="今日订单数"
              value={todayData.todayOrders}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#3f8600" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="今日营收(元)"
              value={todayData.todayRevenue}
              prefix={<DollarOutlined />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card clickable-card"
            onClick={() => navigate("/business/order/list")}
          >
            <Statistic
              title="待处理订单"
              value={todayData.pendingOrders}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: "#fa8c16" } }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击查看 →
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card clickable-card"
            onClick={() => navigate("/business/aftersale")}
          >
            <Statistic
              title="待回复评价"
              value={todayData.pendingComments}
              prefix={<CommentOutlined />}
              styles={{ content: { color: "#722ed1" } }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击查看 →
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-group">
        <Col xs={24} lg={16}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title="昨日经营分析"
              className="content-card equal-height-card"
              extra={
                <Button
                  type="link"
                  icon={<RiseOutlined />}
                  onClick={() => navigate("/business/report")}
                >
                  查看更多数据
                </Button>
              }
            >
              <ReactECharts
                option={yesterdayAnalysisOption}
                style={{ height: 320 }}
              />
            </Card>

            <Card
              title="热销商品TOP5"
              className="content-card equal-height-card"
              extra={
                <Button
                  type="link"
                  onClick={() => navigate("/business/goods/status")}
                >
                  查看全部
                </Button>
              }
            >
              <List
                dataSource={hotProducts}
                renderItem={(item, index) => (
                  <List.Item className="hot-product-item">
                    <Space>
                      <Tag color={index < 3 ? "gold" : "default"}>
                        TOP{index + 1}
                      </Tag>
                      <Text strong>{item.name}</Text>
                    </Space>
                    <Space>
                      <Text type="secondary">销量: {item.sales}</Text>
                      <Text strong style={{ color: "#1890ff" }}>
                        ¥{item.amount}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card title="待处理事项" className="content-card equal-height-card">
              <List
                dataSource={pendingList}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        onClick={() => item.path && navigate(item.path)}
                      >
                        处理
                      </Button>,
                    ]}
                  >
                    <Space>
                      {item.type === "order" && <ClockCircleOutlined />}
                      {item.type === "comment" && <CommentOutlined />}
                      {item.type === "refund" && <DollarOutlined />}
                      <Text strong>{item.title}</Text>
                      <Tag color="orange">{item.count}条</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            {/* <Card
              title="近30天服务表现"
              className="content-card equal-height-card"
            >
              <Space
                orientation="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {servicePerformance.map((item, index) => (
                  <div key={index} className="service-item">
                    <div className="service-header">
                      <Space>
                        {item.icon}
                        <Text>{item.label}</Text>
                      </Space>
                      <Space>
                        <Text strong style={{ fontSize: 18 }}>
                          {item.value}
                        </Text>
                        {item.unit && <Text type="secondary">{item.unit}</Text>}
                      </Space>
                    </div>
                    {item.status === "success" && (
                      <Progress
                        percent={
                          typeof item.value === "number" ? item.value : 0
                        }
                        showInfo={false}
                        strokeColor="#52c41a"
                      />
                    )}
                    {item.status === "warning" && (
                      <Progress
                        percent={
                          typeof item.value === "number" ? item.value * 10 : 0
                        }
                        showInfo={false}
                        strokeColor="#faad14"
                      />
                    )}
                    {item.status === "error" && (
                      <Progress
                        percent={
                          typeof item.value === "number" ? item.value * 20 : 0
                        }
                        showInfo={false}
                        strokeColor="#ff4d4f"
                      />
                    )}
                  </div>
                ))}
              </Space>
            </Card> */}

            <Card
              title="消息中心"
              className="content-card equal-height-card"
              extra={
                <Button
                  type="link"
                  icon={<BellOutlined />}
                  onClick={() => navigate("/business/message")}
                >
                  查看全部
                </Button>
              }
            >
              <List
                dataSource={[
                  {
                    id: "1",
                    content: "您的店铺审核已通过",
                    time: "10分钟前",
                    type: "success",
                  },
                  {
                    id: "2",
                    content: "新订单提醒：ORD20240520001",
                    time: "30分钟前",
                    type: "info",
                  },
                  {
                    id: "3",
                    content: "用户评价待回复",
                    time: "1小时前",
                    type: "warning",
                  },
                  {
                    id: "4",
                    content: "库存预警：FOXUP粉底液库存不足",
                    time: "2小时前",
                    type: "warning",
                  },
                  {
                    id: "5",
                    content: "系统维护通知：今晚23:00-01:00",
                    time: "3小时前",
                    type: "info",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Space
                      orientation="vertical"
                      size={0}
                      style={{ width: "100%" }}
                    >
                      <Space>
                        <Badge
                          dot
                          color={
                            item.type === "success"
                              ? "green"
                              : item.type === "warning"
                                ? "orange"
                                : "blue"
                          }
                        />
                        <Text>{item.content}</Text>
                      </Space>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, marginLeft: 20 }}
                      >
                        {item.time}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default MerchantHome;
