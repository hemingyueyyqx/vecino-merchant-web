import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Card,
  Drawer,
  Space,
  message,
} from "antd";
import { SearchOutlined, BulbOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import * as echarts from "echarts";

const { RangePicker } = DatePicker;
const { Option } = Select;

// ===================== 静态模拟数据（全量补充） =====================
// 客户列表
const customerList = [
  {
    customerId: "10001",
    username: "张三",
    phone: "13800138000",
    lastOrderTime: "2026-05-28 14:22:10",
    totalConsume: 689.5,
    orderCount: 5,
  },
  {
    customerId: "10002",
    username: "李四",
    phone: "13900139000",
    lastOrderTime: "2026-05-29 09:15:33",
    totalConsume: 1250.0,
    orderCount: 8,
  },
  {
    customerId: "10003",
    username: "王五",
    phone: "13700137000",
    lastOrderTime: "2026-05-25 16:40:22",
    totalConsume: 329.9,
    orderCount: 2,
  },
  {
    customerId: "10004",
    username: "赵六",
    phone: "13600136000",
    lastOrderTime: "2026-05-30 10:05:18",
    totalConsume: 899.0,
    orderCount: 6,
  },
];

// 订单明细映射（不同客户对应不同订单）
const orderMap: any = {
  "10001": [
    {
      orderId: "ORD001",
      orderNo: "202605281001",
      createTime: "2026-05-28 14:22:10",
      orderAmount: 299.5,
      orderStatus: "已完成",
      goodsList: [
        { goodsName: "夏季短袖T恤", price: 99, num: 2, subtotal: 198 },
        { goodsName: "纯棉袜子", price: 19.5, num: 1, subtotal: 19.5 },
      ],
    },
    {
      orderId: "ORD002",
      orderNo: "202605201102",
      createTime: "2026-05-20 11:10:00",
      orderAmount: 390,
      orderStatus: "已完成",
      goodsList: [
        { goodsName: "休闲牛仔裤", price: 390, num: 1, subtotal: 390 },
      ],
    },
  ],
  "10002": [
    {
      orderId: "ORD003",
      orderNo: "202605290901",
      createTime: "2026-05-29 09:15:33",
      orderAmount: 680,
      orderStatus: "已完成",
      goodsList: [{ goodsName: "运动跑鞋", price: 680, num: 1, subtotal: 680 }],
    },
  ],
  "10003": [
    {
      orderId: "ORD004",
      orderNo: "202605251601",
      createTime: "2026-05-25 16:40:22",
      orderAmount: 329.9,
      orderStatus: "已完成",
      goodsList: [
        { goodsName: "遮阳防晒帽", price: 329.9, num: 1, subtotal: 329.9 },
      ],
    },
  ],
  "10004": [
    {
      orderId: "ORD005",
      orderNo: "202605301001",
      createTime: "2026-05-30 10:05:18",
      orderAmount: 450,
      orderStatus: "已完成",
      goodsList: [{ goodsName: "冰丝短袖", price: 150, num: 3, subtotal: 450 }],
    },
  ],
};

// 图表数据
const lineChartData = [
  { date: "05-24", orderNum: 12, userNum: 8 },
  { date: "05-25", orderNum: 18, userNum: 11 },
  { date: "05-26", orderNum: 10, userNum: 7 },
  { date: "05-27", orderNum: 22, userNum: 15 },
  { date: "05-28", orderNum: 25, userNum: 18 },
  { date: "05-29", orderNum: 20, userNum: 14 },
  { date: "05-30", orderNum: 28, userNum: 20 },
];

const pieChartData = [
  { type: "夏季短袖T恤", value: 35 },
  { type: "休闲短裤", value: 22 },
  { type: "运动跑鞋", value: 28 },
  { type: "遮阳帽子", value: 15 },
];

// AI 分析数据
const aiResultData = [
  {
    type: "success",
    content:
      "店铺近7天客户活跃度整体偏高，新增下单用户持续增长，经营状态良好。",
  },
  {
    type: "warning",
    content: "部分客户超过5天未复购，建议针对性推送小额优惠券唤醒沉睡客户。",
  },
  {
    type: "info",
    content: "爆款商品为运动跑鞋与短袖T恤，可适当加大库存与首页曝光。",
  },
  {
    type: "error",
    content:
      "每日10:00-11:00、19:00-21:00为下单高峰，建议此时间段上新或做限时活动。",
  },
];

const CustomerManage: React.FC = () => {
  // ✅ 默认选中第一个客户（加载就显示订单明细）
  const [selectedCustomer, setSelectedCustomer] = useState<string>("10001");
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);

  // 表格列配置
  const customerColumns = [
    { title: "用户名", dataIndex: "username", key: "username" },
    { title: "手机号", dataIndex: "phone", key: "phone" },
    { title: "最近下单时间", dataIndex: "lastOrderTime", key: "lastOrderTime" },
    { title: "累计消费(元)", dataIndex: "totalConsume", key: "totalConsume" },
    { title: "下单次数", dataIndex: "orderCount", key: "orderCount" },
  ];

  const orderColumns = [
    { title: "订单编号", dataIndex: "orderNo", key: "orderNo" },
    { title: "下单时间", dataIndex: "createTime", key: "createTime" },
    { title: "订单金额(元)", dataIndex: "orderAmount", key: "orderAmount" },
    { title: "订单状态", dataIndex: "orderStatus", key: "orderStatus" },
  ];

  const goodsColumns = [
    { title: "商品名称", dataIndex: "goodsName", key: "goodsName" },
    { title: "单价(元)", dataIndex: "price", key: "price" },
    { title: "购买数量", dataIndex: "num", key: "num" },
    { title: "小计(元)", dataIndex: "subtotal", key: "subtotal" },
  ];

  // 切换客户
  const handleRowClick = (record: any) => {
    setSelectedCustomer(record.customerId);
    message.info(`已选中客户：${record.username}`);
  };

  // ===================== 原生 ECharts 渲染 =====================
  // 替换 useEffect 里的 ECharts 初始化代码
  useEffect(() => {
    // 折线图优化
    const lineChart = echarts.init(lineRef.current!);
    lineChart.setOption({
      tooltip: { trigger: "axis" },
      legend: { data: ["订单数", "客户数"], top: 0 },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: lineChartData.map((i) => i.date),
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "订单数",
          type: "line",
          data: lineChartData.map((i) => i.orderNum),
          smooth: true,
          itemStyle: { color: "#1677ff" },
        },
        {
          name: "客户数",
          type: "line",
          data: lineChartData.map((i) => i.userNum),
          smooth: true,
          itemStyle: { color: "#36cbcb" },
        },
      ],
    });

    // 饼图优化（关键修复标签显示问题）
    const pieChart = echarts.init(pieRef.current!);
    pieChart.setOption({
      tooltip: { trigger: "item" },
      legend: {
        orient: "vertical",
        left: "left",
        top: "center",
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: true,
            formatter: "{b}: {c}", // 让商品名称和数值一起显示
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          data: pieChartData.map((item) => ({
            name: item.type, // 商品名称
            value: item.value, // 销量数值
          })),
        },
      ],
    });

    return () => {
      lineChart.dispose();
      pieChart.dispose();
    };
  }, []);

  // 当前选中的订单数据
  const currentOrderList = orderMap[selectedCustomer] || [];

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      {/* 筛选栏 */}
      <Card style={{ marginBottom: 20 }}>
        <Space size="middle" wrap>
          <Input
            placeholder="搜索用户名/手机号"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
          />
          <Select placeholder="客户状态" style={{ width: 150 }} allowClear>
            <Option value="active">活跃客户</Option>
            <Option value="sleep">沉睡客户</Option>
          </Select>
          <RangePicker
            defaultValue={[dayjs().subtract(7, "day"), dayjs()]}
            format="YYYY-MM-DD"
          />
          <Button type="primary">刷新数据</Button>
          <Button
            icon={<BulbOutlined />}
            onClick={() => setAiDrawerOpen(true)}
            type="default"
          >
            AI智能运营分析
          </Button>
        </Space>
      </Card>

      {/* 客户列表 + 订单明细 */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card title="本店客户列表" styles={{ body: { padding: "16px" } }}>
            <Table
              rowKey="customerId"
              dataSource={customerList}
              columns={customerColumns}
              pagination={{ pageSize: 4 }}
              onRow={(record) => ({ onClick: () => handleRowClick(record) })}
              rowSelection={{
                type: "radio",
                selectedRowKeys: [selectedCustomer],
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="客户订单 & 商品明细"
            styles={{ body: { padding: "16px" } }}
          >
            <div style={{ marginBottom: 12, fontWeight: 500 }}>订单列表</div>
            <Table
              size="small"
              rowKey="orderId"
              dataSource={currentOrderList}
              columns={orderColumns}
              pagination={false}
            />

            <div style={{ marginBottom: 12, marginTop: 20, fontWeight: 500 }}>
              商品明细
            </div>
            <Table
              size="small"
              rowKey="goodsName"
              dataSource={currentOrderList[0]?.goodsList || []}
              columns={goodsColumns}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* ECharts 图表 */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card title="近7日订单&客户趋势">
            <div ref={lineRef} style={{ width: "100%", height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="商品销量占比">
            <div ref={pieRef} style={{ width: "100%", height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* AI 分析抽屉 */}
      <Drawer
        title="AI 客户运营分析报告"
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        width={500}
      >
        {aiResultData.map((item, idx) => {
          let bg = "#f0f2f5";
          if (item.type === "success") bg = "#f6ffed";
          if (item.type === "warning") bg = "#fffbe6";
          if (item.type === "error") bg = "#fff1f0";
          return (
            <div
              key={idx}
              style={{
                background: bg,
                padding: 12,
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              {item.content}
            </div>
          );
        })}
      </Drawer>
    </div>
  );
};;

export default CustomerManage;
