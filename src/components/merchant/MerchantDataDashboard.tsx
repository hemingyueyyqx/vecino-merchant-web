import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Space,
  Typography,
  message,
} from "antd";
import { DownloadOutlined, PrinterOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import type { EChartsOption, ECharts } from "echarts";

const { Title } = Typography;
const { Option } = Select;

// 时间维度类型
type TimeType = "day" | "week" | "month";

// 原生ECharts图表组件（无第三方依赖）
const ChartComponent = ({ option }: { option: EChartsOption }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(option);

    // 响应式适配
    const resize = () => chartInstance.current?.resize();
    window.addEventListener("resize", resize);

    // 销毁
    return () => {
      window.removeEventListener("resize", resize);
      chartInstance.current?.dispose();
    };
  }, [option]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

// 主仪表盘组件
const MerchantDataDashboard: React.FC = () => {
  const [timeType, setTimeType] = useState<TimeType>("day");

  // 销售趋势数据
  const saleData = useMemo(() => {
    if (timeType === "day")
      return {
        xAxis: ["1日", "2日", "3日", "4日", "5日", "6日", "7日"],
        series: [1200, 1900, 1500, 2300, 2800, 2100, 3500],
      };
    if (timeType === "week")
      return {
        xAxis: ["第1周", "第2周", "第3周", "第4周"],
        series: [6500, 8200, 7600, 9800],
      };
    return {
      xAxis: ["1月", "2月", "3月", "4月", "5月", "6月"],
      series: [52000, 68000, 75000, 82000, 91000, 105000],
    };
  }, [timeType]);

  // 库存数据
  const stockData = [
    { value: 35, name: "美妆彩妆" },
    { value: 20, name: "护肤用品" },
    { value: 25, name: "日用百货" },
    { value: 15, name: "食品零食" },
    { value: 5, name: "其他品类" },
  ];

  // 订单数据
  const orderSourceData = {
    source: ["线上商城", "线下门店", "营销活动", "第三方平台"],
    count: [1200, 800, 600, 400],
  };

  // 客户数据
  const customerData = [
    { value: 40, name: "18-25岁" },
    { value: 35, name: "26-35岁" },
    { value: 15, name: "36-45岁" },
    { value: 10, name: "45岁以上" },
  ];

  // ==================== ECharts 配置 ====================
  const saleOption: EChartsOption = {
    title: { text: "销售趋势", left: "center", textStyle: { fontSize: 14 } },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: saleData.xAxis },
    yAxis: { type: "value" },
    series: [
      {
        name: "销售额(元)",
        type: "line",
        smooth: true,
        data: saleData.series,
        lineStyle: { color: "#1890ff" },
        areaStyle: { color: "rgba(24,144,255,0.2)" },
      },
    ],
  };

  const stockOption: EChartsOption = {
    title: { text: "库存品类占比", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "70%",
        data: stockData,
        label: { formatter: "{b}: {c}%" },
      },
    ],
  };

  const orderOption: EChartsOption = {
    title: { text: "订单来源分析", left: "center" },
    xAxis: { type: "category", data: orderSourceData.source },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        data: orderSourceData.count,
        itemStyle: { color: "#52c41a" },
      },
    ],
  };

  const customerOption: EChartsOption = {
    title: { text: "客户年龄画像", left: "center" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: customerData,
        label: { formatter: "{b}: {c}%" },
      },
    ],
  };

  // 操作
  const handleExport = () => message.success("数据报表导出成功");
  const handlePrint = () => window.print();

  return (
    <div
      style={{
        padding: "20px 24px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* 头部 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          经营数据可视化仪表盘
        </Title>
        <Space size={16}>
          <Select
            value={timeType}
            onChange={setTimeType}
            style={{ width: 120 }}
          >
            <Option value="day">按日查看</Option>
            <Option value="week">按周查看</Option>
            <Option value="month">按月查看</Option>
          </Select>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            type="primary"
          >
            导出报表
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            打印报表
          </Button>
        </Space>
      </div>

      {/* 图表布局 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card hoverable styles={{ body: { height: 380 } }}>
            <ChartComponent option={saleOption} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card hoverable styles={{ body: { height: 380 } }}>
            <ChartComponent option={stockOption} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card hoverable styles={{ body: { height: 380 } }}>
            <ChartComponent option={orderOption} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card hoverable styles={{ body: { height: 380 } }}>
            <ChartComponent option={customerOption} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MerchantDataDashboard;
