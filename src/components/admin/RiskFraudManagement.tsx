import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Select,
  DatePicker,
  Space,
  Button,
  message,
} from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// 假数据：风控统计（已修改总订单数为 89650）
const riskStats = {
  totalOrders: 89650,
  riskOrders: 3245,
  blockedOrders: 1872,
  passRate: 97.48,
};

// 假数据：近7天风控趋势
const trendData = [
  { date: '05-25', risk: 420, pass: 5200, block: 210 },
  { date: '05-26', risk: 380, pass: 4800, block: 190 },
  { date: '05-27', risk: 450, pass: 5500, block: 230 },
  { date: '05-28', risk: 390, pass: 5100, block: 180 },
  { date: '05-29', risk: 510, pass: 6000, block: 260 },
  { date: '05-30', risk: 470, pass: 5800, block: 240 },
  { date: '05-31', risk: 425, pass: 5300, block: 205 },
];

// 假数据：风险类型分布
const riskTypeData = [
  { name: '设备异常', value: 1200 },
  { name: 'IP风险', value: 850 },
  { name: '交易频次异常', value: 620 },
  { name: '虚假地址', value: 380 },
  { name: '其他', value: 195 },
];

// 假数据：风险订单TOP10店铺
const topShopData = [
  { shopId: 'S001', shopName: '优选零食店', riskCount: 215, rate: 8.2 },
  { shopId: 'S002', shopName: '阳光美妆馆', riskCount: 182, rate: 6.7 },
  { shopId: 'S003', shopName: '数码配件城', riskCount: 156, rate: 5.3 },
  { shopId: 'S004', shopName: '运动户外专营店', riskCount: 134, rate: 4.8 },
  { shopId: 'S005', shopName: '母婴用品超市', riskCount: 112, rate: 3.9 },
  { shopId: 'S006', shopName: '潮流服饰馆', riskCount: 98, rate: 3.2 },
  { shopId: 'S007', shopName: '家居日用百货', riskCount: 87, rate: 2.8 },
  { shopId: 'S008', shopName: '宠物用品乐园', riskCount: 76, rate: 2.5 },
  { shopId: 'S009', shopName: '图书音像城', riskCount: 65, rate: 2.1 },
  { shopId: 'S010', shopName: '办公用品采购站', riskCount: 58, rate: 1.8 },
];

// 假数据：风险订单列表
interface RiskOrderItem {
  orderId: string;
  shopName: string;
  riskType: string;
  level: 'high' | 'medium' | 'low';
  status: 'blocked' | 'reviewing' | 'passed';
  time: string;
}

const riskOrderList: RiskOrderItem[] = [
  { orderId: 'O1000001', shopName: '优选零食店', riskType: '设备异常', level: 'high', status: 'blocked', time: '2026-05-31 10:23:15' },
  { orderId: 'O1000002', shopName: '阳光美妆馆', riskType: 'IP风险', level: 'medium', status: 'reviewing', time: '2026-05-31 09:45:32' },
  { orderId: 'O1000003', shopName: '数码配件城', riskType: '交易频次异常', level: 'low', status: 'passed', time: '2026-05-31 08:12:05' },
  { orderId: 'O1000004', shopName: '优选零食店', riskType: '虚假地址', level: 'high', status: 'blocked', time: '2026-05-31 07:30:48' },
  { orderId: 'O1000005', shopName: '运动户外专营店', riskType: 'IP风险', level: 'medium', status: 'reviewing', time: '2026-05-31 06:55:21' },
];

const RiskFraudManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // 模拟加载数据
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('风控数据加载完成');
    }, 500);
  }, []);

  // 风控趋势图配置
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['风险订单', '拦截订单', '正常订单'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(item => item.date),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '风险订单',
        type: 'line',
        stack: 'Total',
        data: trendData.map(item => item.risk),
        itemStyle: { color: '#faad14' },
      },
      {
        name: '拦截订单',
        type: 'line',
        stack: 'Total',
        data: trendData.map(item => item.block),
        itemStyle: { color: '#ff4d4f' },
      },
      {
        name: '正常订单',
        type: 'line',
        stack: 'Total',
        data: trendData.map(item => item.pass),
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  // 风险类型分布饼图配置
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '风险类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: riskTypeData,
      },
    ],
  };

  // TOP店铺柱状图配置
  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', boundaryGap: [0, 0.01] },
    yAxis: {
      type: 'category',
      data: topShopData.map(item => item.shopName).reverse(),
    },
    series: [
      {
        name: '风险订单数',
        type: 'bar',
        data: topShopData.map(item => item.riskCount).reverse(),
        itemStyle: { color: '#1890ff' },
      },
    ],
  };

  // 表格列配置
  const columns: ColumnsType<RiskOrderItem> = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: '店铺名称',
      dataIndex: 'shopName',
      key: 'shopName',
    },
    {
      title: '风险类型',
      dataIndex: 'riskType',
      key: 'riskType',
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const colorMap = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        };
        const textMap = {
          high: '高',
          medium: '中',
          low: '低',
        };
        return <Tag color={colorMap[level]}>{textMap[level]}</Tag>;
      },
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          blocked: 'red',
          reviewing: 'orange',
          passed: 'green',
        };
        const textMap = {
          blocked: '已拦截',
          reviewing: '审核中',
          passed: '已通过',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  return (
    <div >
      {/* 页面标题 */}
      

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle">
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            placeholder={['开始日期', '结束日期']}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'blocked', label: '已拦截' },
              { value: 'reviewing', label: '审核中' },
              { value: 'passed', label: '已通过' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />}>查询</Button>
          <Button>重置</Button>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="总订单数"
              value={riskStats.totalOrders}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="风险订单数"
              value={riskStats.riskOrders}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="拦截订单数"
              value={riskStats.blockedOrders}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="订单通过率"
              value={riskStats.passRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="近7天风控趋势" bordered={false}>
            <ReactECharts option={trendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="风险类型分布" bordered={false}>
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="风险订单TOP10店铺" bordered={false}>
            <ReactECharts option={barOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="风险订单处理明细" bordered={false}>
            <Table
              columns={columns}
              dataSource={riskOrderList}
              rowKey="orderId"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RiskFraudManagement;