import { useState } from "react";
import {
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Space,
  Badge,
  Progress,
  Button,
  List,
} from "antd";
import ReactECharts from "echarts-for-react";
import {
  UserOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";

const { Text } = Typography;

interface PlatformStat {
  name: string;
  total: number;
  growth: number;
  progress: number;
}

const AdminHome = () => {
  const navigate = useNavigate();

  const [platformData] = useState({
    totalMerchant: 286,
    totalUser: 15890,
    totalOrder: 89650,
    pendingAudit: 18,
  });

  const [statList] = useState<PlatformStat[]>([
    { name: "商家入驻率", total: 286, growth: 5.2, progress: 78 },
    { name: "用户活跃度", total: 12580, growth: 8.9, progress: 85 },
    { name: "订单完成率", total: 87650, growth: 3.5, progress: 92 },
  ]);

  const merchantTrendOption = {
    title: {
      text: "商家增长趋势",
      left: "center",
      textStyle: { fontSize: 14 },
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: ["1月", "2月", "3月", "4月", "5月", "6月"],
    },
    yAxis: { type: "value", name: "商家数" },
    series: [
      {
        name: "新增商家",
        type: "bar",
        data: [25, 32, 28, 35, 42, 38],
        itemStyle: { color: "#52c41a" },
      },
      {
        name: "累计商家",
        type: "line",
        smooth: true,
        data: [180, 212, 240, 275, 317, 286],
        itemStyle: { color: "#1890ff" },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  };

  const orderCategoryOption = {
    title: {
      text: "订单类目分布",
      left: "center",
      textStyle: { fontSize: 14 },
    },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { value: 35, name: "生鲜食品" },
          { value: 25, name: "酒水饮料" },
          { value: 20, name: "米面粮油" },
          { value: 15, name: "日用百货" },
          { value: 5, name: "其他" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const userActivityOption = {
    title: {
      text: "用户活跃趋势",
      left: "center",
      textStyle: { fontSize: 14 },
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: { type: "value", name: "活跃用户数" },
    series: [
      {
        name: "日活用户",
        type: "line",
        smooth: true,
        data: [8500, 9200, 8800, 10500, 12890, 15200, 13500],
        itemStyle: { color: "#722ed1" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(114, 46, 209, 0.3)" },
              { offset: 1, color: "rgba(114, 46, 209, 0.05)" },
            ],
          },
        },
      },
    ],
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
  };

  return (
    <div className="admin-home-container">
      <Row gutter={[16, 16]} className="data-card-group">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总商家数"
              value={platformData.totalMerchant}
              prefix={<ShopOutlined />}
              styles={{ content: { color: "#3f8600" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总用户数"
              value={platformData.totalUser}
              prefix={<UserOutlined />}
              styles={{ content: { color: "#1890ff" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总订单数"
              value={platformData.totalOrder}
              prefix={<ShoppingOutlined />}
              styles={{ content: { color: "#fa8c16" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="stat-card clickable-card"
            onClick={() => navigate("/admin/merchant/audit")}
          >
            <Statistic
              title="待审核商家"
              value={platformData.pendingAudit}
              prefix={<ExclamationCircleOutlined />}
              styles={{ content: { color: "#f5222d" } }}
              suffix={<Badge dot color="red" />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击前往审核 →
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="content-group">
        <Col xs={24} lg={16}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title="商家增长趋势"
              className="content-card equal-height-card"
            >
              <ReactECharts
                option={merchantTrendOption}
                style={{ height: 320 }}
              />
            </Card>

            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Card
                  title="订单类目分布"
                  className="content-card equal-height-card"
                >
                  <ReactECharts
                    option={orderCategoryOption}
                    style={{ height: 280 }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  title="用户活跃趋势"
                  className="content-card equal-height-card"
                >
                  <ReactECharts
                    option={userActivityOption}
                    style={{ height: 280 }}
                  />
                </Card>
              </Col>
            </Row>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Card
              title="平台运营数据"
              className="content-card equal-height-card"
            >
              <Space
                orientation="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {statList.map((item) => (
                  <div key={item.name} className="stat-item">
                    <div className="stat-header">
                      <Text strong>{item.name}</Text>
                      <Text type="secondary">
                        总数：{item.total} | 环比+{item.growth}%
                      </Text>
                    </div>
                    <Progress
                      percent={item.progress}
                      status="normal"
                      strokeColor={{
                        "0%": "#1890ff",
                        "100%": "#3f8600",
                      }}
                    />
                  </div>
                ))}
              </Space>
            </Card>

            <Card
              title="消息中心"
              className="content-card equal-height-card"
              extra={
                <Button type="link" icon={<BellOutlined />}>
                  查看全部
                </Button>
              }
            >
              <List
                dataSource={[
                  {
                    id: "1",
                    content: "新商家入驻申请待审核",
                    time: "5分钟前",
                    type: "warning",
                  },
                  {
                    id: "2",
                    content: "SPU类目变更申请待处理",
                    time: "20分钟前",
                    type: "info",
                  },
                  {
                    id: "3",
                    content: "平台活动报名截止提醒",
                    time: "2小时前",
                    type: "success",
                  },
                  {
                    id: "4",
                    content: "系统维护通知",
                    time: "昨天",
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

export default AdminHome;
