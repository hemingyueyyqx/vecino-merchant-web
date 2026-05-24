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
  Statistic,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as echarts from "echarts";
import type { EChartsOption, ECharts } from "echarts";

const { Title } = Typography;
const { Option } = Select;

// 时间维度类型
type TimeType = "day" | "week" | "month";

// 核心指标类型
type CoreMetrics = {
  gmv: string;
  orderCount: number;
  merchantCount: number;
  activeMerchantCount: number;
  deliveryRate: string;
};

// 🔥 修复：重写ECharts组件，彻底解决重复初始化、配置错误问题
const Chart = ({ option }: { option: EChartsOption }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    const dom = chartRef.current;
    if (!dom) return;

    // 避免重复初始化
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(dom);
    }

    // 安全设置配置项
    chartInstance.current.setOption(option, true);

    // 响应式
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);

    // 销毁
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [option]);

  // 组件卸载时销毁实例
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
};

// 主组件
const PlatformDataDashboard: React.FC = () => {
  const [timeType, setTimeType] = useState<TimeType>("day");
  const [metrics, setMetrics] = useState<CoreMetrics>({
    gmv: "1286.36",
    orderCount: 25869,
    merchantCount: 586,
    activeMerchantCount: 423,
    deliveryRate: "98.2%",
  });

  // 手动刷新数据
  const refreshData = () => {
    setMetrics({
      gmv: (parseFloat(metrics.gmv) + (Math.random() * 10).toFixed(2)).toFixed(
        2,
      ),
      orderCount: metrics.orderCount + Math.floor(Math.random() * 50),
      merchantCount: metrics.merchantCount + Math.floor(Math.random() * 2),
      activeMerchantCount:
        metrics.activeMerchantCount + Math.floor(Math.random() * 3),
      deliveryRate: `${(97 + Math.random() * 2).toFixed(1)}%`,
    });
    message.success("数据刷新成功");
  };

  // 🔥 修复：统一图表数据，补全所有轴配置，解决yAxis报错
  const trendData = useMemo(() => {
    const xData =
      timeType === "day"
        ? ["1日", "2日", "3日", "4日", "5日", "6日", "7日"]
        : timeType === "week"
          ? ["第1周", "第2周", "第3周", "第4周"]
          : ["1-6月"];
    return {
      x: xData,
      sale: [120, 200, 150, 280, 320, 250, 400],
      order: [20, 35, 15, 45, 30, 55, 40],
      merchant: [5, 8, 12, 18, 25, 30, 38],
    };
  }, [timeType]);

  // 数据拆解
  const categoryData = [
    { value: 35, name: "生鲜食品" },
    { value: 25, name: "酒水饮料" },
    { value: 20, name: "米面粮油" },
  ];
  const areaData = { x: ["华东", "华北", "华南", "西南"], y: [45, 30, 25, 20] };
  const levelData = [
    { value: 20, name: "头部商家" },
    { value: 50, name: "优质商家" },
    { value: 30, name: "普通商家" },
  ];

  // ==================== 🔥 修复：所有图表补全标准配置，无语法错误 ====================
  const saleOption: EChartsOption = {
    title: { text: "平台销售趋势" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: trendData.x },
    yAxis: { type: "value" }, // 必写，修复报错
    series: [
      {
        type: "line",
        smooth: true,
        data: trendData.sale,
        itemStyle: { color: "#1890ff" },
      },
    ],
  };

  const orderOption: EChartsOption = {
    title: { text: "订单增速趋势" },
    xAxis: { type: "category", data: trendData.x },
    yAxis: { type: "value" }, // 必写，修复报错
    series: [
      { type: "bar", data: trendData.order, itemStyle: { color: "#52c41a" } },
    ],
  };

  const merchantOption: EChartsOption = {
    title: { text: "商家增长曲线" },
    xAxis: { type: "category", data: trendData.x },
    yAxis: { type: "value" }, // 必写，修复报错
    series: [
      {
        type: "line",
        smooth: true,
        data: trendData.merchant,
        itemStyle: { color: "#faad14" },
      },
    ],
  };

  const categoryOption: EChartsOption = {
    title: { text: "品类运营占比" },
    series: [{ type: "pie", radius: "70%", data: categoryData }],
  };

  const areaOption: EChartsOption = {
    title: { text: "区域订单分布" },
    xAxis: { type: "category", data: areaData.x },
    yAxis: { type: "value" }, // 必写，修复报错
    series: [
      { type: "bar", data: areaData.y, itemStyle: { color: "#722ed1" } },
    ],
  };

  const levelOption: EChartsOption = {
    title: { text: "商家等级分布" },
    series: [{ type: "pie", radius: ["40%", "70%"], data: levelData }],
  };

  // 导出报表
  const exportReport = () => message.success("运营报表导出成功");

  return (
    <div
      style={{
        padding: "20px 24px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* 页面头部 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Title level={4}>全平台运营数据看板</Title>
        <Space size={16}>
          <Select
            value={timeType}
            onChange={setTimeType}
            style={{ width: 120 }}
          >
            <Option value="day">按日</Option>
            <Option value="week">按周</Option>
            <Option value="month">按月</Option>
          </Select>
          <Button onClick={refreshData}>刷新数据</Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={exportReport}
            type="primary"
          >
            导出报表
          </Button>
        </Space>
      </div>
      {/* 顶部核心指标 */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        {[
          { title: "GMV(万元)", value: metrics.gmv, prefix: "¥" },
          { title: "总订单量", value: metrics.orderCount },
          { title: "入驻商家数", value: metrics.merchantCount },
          { title: "活跃商家数", value: metrics.activeMerchantCount },
          { title: "配送准时率", value: metrics.deliveryRate },
        ].map((item, index) => (
          <Card key={index} style={{ flex: 1 }}>
            <Statistic
              title={item.title}
              value={item.value}
              prefix={item.prefix}
            />
          </Card>
        ))}
      </div>
      {/* 趋势图表 */}
      <Title level={5} style={{ marginBottom: 16 }}>
        趋势数据分析
      </Title>
      <Row gutter={[24, 24]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={8}>
          <Card styles={{ body: { height: 360 } }}>
            <Chart option={saleOption} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card styles={{ body: { height: 360 } }}>
            <Chart option={orderOption} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card styles={{ body: { height: 360 } }}>
            <Chart option={merchantOption} />
          </Card>
        </Col>
      </Row>
      {/* 数据拆解 */}
      <Title level={5} style={{ marginBottom: 16 }}>
        多维数据拆解
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card styles={{ body: { height: 360 } }}>
            <Chart option={categoryOption} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card styles={{ body: { height: 360 } }}>
            <Chart option={areaOption} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card styles={{ body: { height: 360 } }}>
            <Chart option={levelOption} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlatformDataDashboard;
