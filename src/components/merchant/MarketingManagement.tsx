import React, { useState, useRef, useEffect } from "react";
import {
  Layout,
  Tabs,
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Table,

  message,
  Statistic,
  Row,
  Col,
  Space,
  Tag,

  Modal,

  Typography,
  Divider,
  Alert,
} from "antd";
import {

  ExportOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import type { TableProps } from "antd/es/table";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// ==================== 类型定义 ====================
// 优惠券类型
type CouponType = "FULL_REDUCTION" | "DISCOUNT" | "NO_THRESHOLD";
// 营销模块类型
type MarketingModule = "coupon" | "discount" | "hot";
// 商品类型
interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
}
// 优惠券配置
interface CouponConfig {
  name: string;
  type: CouponType;
  fullAmount?: number;
  reduceAmount?: number;
  discount?: number;
  totalCount: number;
  validTime: [dayjs.Dayjs, dayjs.Dayjs];
  applyScope: "ALL" | "PART";
  productIds: string[];
}
// 数据统计
interface CouponStats {
  receiveCount: number;
  useCount: number;
  salesAmount: number;
}

// ==================== 模拟数据 ====================
const mockProducts: ProductItem[] = [
  { id: "1", name: "FOXUP粉底液30ml", price: 129, category: "彩妆" },
  { id: "2", name: "橘朵高光修容盘10g", price: 59, category: "彩妆" },
  { id: "3", name: "YSL纯口红4g", price: 380, category: "彩妆" },
  { id: "4", name: "完美日记散粉8g", price: 79, category: "彩妆" },
  { id: "5", name: "花西子蜜粉饼7g", price: 149, category: "彩妆" },
];

// ==================== 主组件 ====================
const MarketingManagement: React.FC = () => {
  const [form] = Form.useForm<CouponConfig>();
  const qrRef = useRef<HTMLDivElement>(null);
  const [activeModule, setActiveModule] = useState<MarketingModule>("coupon");
  const [couponType, setCouponType] = useState<CouponType>("FULL_REDUCTION");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState("");
  const [stats, setStats] = useState<CouponStats>({
    receiveCount: 128,
    useCount: 45,
    salesAmount: 6850,
  });
  const [loading, setLoading] = useState(false);
  const [auditModal, setAuditModal] = useState(false);
  const [errorTip, setErrorTip] = useState("");

  // 生成二维码
  useEffect(() => {
    if (shareUrl && qrRef.current) {
      QRCode.toCanvas(qrRef.current, shareUrl, { width: 120, margin: 1 });
    }
  }, [shareUrl]);

  // 动态校验优惠券规则
  const validateCouponRule = () => {
    const values = form.getFieldsValue();
    setErrorTip("");

    if (values.type === "FULL_REDUCTION") {
      if (!values.fullAmount || !values.reduceAmount) {
        setErrorTip("满减券必须填写满减金额和优惠金额");
        return false;
      }
      if (values.reduceAmount >= values.fullAmount) {
        setErrorTip("违规设置：优惠金额不能大于等于满减门槛");
        return false;
      }
    }

    if (
      values.type === "DISCOUNT" &&
      (!values.discount || values.discount <= 0 || values.discount >= 10)
    ) {
      setErrorTip("折扣券必须填写1-10之间的折扣值");
      return false;
    }

    if (values.applyScope === "PART" && selectedProducts.length === 0) {
      setErrorTip("请选择适用的商品");
      return false;
    }

    return true;
  };

  // 生成分享链接
  const generateShareLink = () => {
    if (!validateCouponRule()) return;
    const link = `https://your-shop.com/coupon/${Date.now()}`;
    setShareUrl(link);
    message.success("分享链接与二维码生成成功");
  };

  // 提交审核
  const submitAudit = () => {
    if (!validateCouponRule()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuditModal(false);
      message.success("营销活动已提交平台审核，等待管理员校验");
    }, 1500);
  };

  // 刷新数据
  const refreshStats = () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        receiveCount: Math.floor(Math.random() * 200),
        useCount: Math.floor(Math.random() * 100),
        salesAmount: Math.floor(Math.random() * 10000),
      });
      setLoading(false);
      message.success("数据刷新成功");
    }, 1000);
  };

  // 导出Excel
  const exportExcel = () => {
    const data = [
      ["指标", "数值"],
      ["领取量", stats.receiveCount],
      ["核销量", stats.useCount],
      ["带动销售额", `¥${stats.salesAmount}`],
      ["生成时间", dayjs().format("YYYY-MM-DD HH:mm:ss")],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "优惠券数据");
    XLSX.writeFile(wb, "优惠券统计数据.xlsx");
    message.success("数据导出成功");
  };

  // 商品表格列
  const productColumns: TableProps<ProductItem>["columns"] = [
    { title: "商品名称", dataIndex: "name", key: "name" },
    { title: "商品分类", dataIndex: "category", key: "category" },
    { title: "售价(元)", dataIndex: "price", key: "price" },
  ];

  // 商品选择变化
  const onProductSelect = (keys: string[]) => {
    setSelectedProducts(keys);
    form.setFieldValue("productIds", keys);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* 侧边栏 */}
      {/* <Sider
        width={200}
        theme="light"
        style={{ boxShadow: "1px 0 2px rgba(0,0,0,0.05)" }}
      >
        <div style={{ padding: 16, textAlign: "center" }}>
          <Title level={5}>营销管理中心</Title>
        </div>
        <Tabs
          activeKey={activeModule}
          onChange={(v) => setActiveModule(v as MarketingModule)}
          type="card"
          vertical
        >
          <TabPane tab="优惠券管理" key="coupon" />
          <TabPane tab="限时折扣" key="discount" />
          <TabPane tab="热销推荐" key="hot" />
        </Tabs>
      </Sider> */}

      {/* 主内容区 */}
      <Layout>
        <Content style={{ padding: 24 }}>
          {/* <Title level={4}>营销活动配置</Title> */}
          {/* <Divider /> */}

          <Row gutter={24}>
            {/* 左侧：优惠券配置区域 */}
            <Col xs={24} lg={16}>
              <Card title="优惠券核心配置" type="inner">
                {errorTip && (
                  <Alert
                    message={errorTip}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    type: "FULL_REDUCTION",
                    applyScope: "ALL",
                    totalCount: 100,
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="优惠券名称"
                        name="name"
                        rules={[{ required: true, message: "请输入名称" }]}
                      >
                        <Input placeholder="例如：满200减50优惠券" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="优惠券类型"
                        name="type"
                        rules={[{ required: true }]}
                      >
                        <Select onChange={(v) => setCouponType(v)}>
                          <Option value="FULL_REDUCTION">满减券</Option>
                          <Option value="DISCOUNT">折扣券</Option>
                          <Option value="NO_THRESHOLD">无门槛券</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* 动态配置项 */}
                  {couponType === "FULL_REDUCTION" && (
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="满减门槛(元)"
                          name="fullAmount"
                          rules={[{ required: true }]}
                        >
                          <Input type="number" placeholder="满多少可用" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="优惠金额(元)"
                          name="reduceAmount"
                          rules={[{ required: true }]}
                        >
                          <Input type="number" placeholder="减多少钱" />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  {couponType === "DISCOUNT" && (
                    <Form.Item
                      label="折扣比例"
                      name="discount"
                      rules={[{ required: true }]}
                    >
                      <Input type="number" placeholder="例如：8.5折填写8.5" />
                      <Text type="secondary">填写1-10之间数字，8.5折=8.5</Text>
                    </Form.Item>
                  )}

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="发放总数量"
                        name="totalCount"
                        rules={[{ required: true }]}
                      >
                        <Input type="number" placeholder="最多发放多少张" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="核销有效期"
                        name="validTime"
                        rules={[{ required: true }]}
                      >
                        <RangePicker showTime style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="适用商品范围"
                    name="applyScope"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="ALL">全部商品</Option>
                      <Option value="PART">指定商品</Option>
                    </Select>
                  </Form.Item>

                  {/* 批量选择商品 */}
                  {form.getFieldValue("applyScope") === "PART" && (
                    <Form.Item label="选择参与商品">
                      <Table
                        rowSelection={{
                          selectedRowKeys: selectedProducts,
                          onChange: onProductSelect,
                        }}
                        columns={productColumns}
                        dataSource={mockProducts}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </Form.Item>
                  )}

                  {/* 操作按钮 */}
                  <Form.Item>
                    <Space wrap>
                      <Button type="primary" onClick={generateShareLink}>
                        生成分享链接/二维码
                      </Button>
                      <Button
                        onClick={() => setAuditModal(true)}
                        icon={<CheckCircleOutlined />}
                      >
                        提交平台审核
                      </Button>
                      <Button danger onClick={() => form.resetFields()}>
                        重置配置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>

                {/* 分享区域 */}
                {shareUrl && (
                  <Card title="分享引流" type="inner" style={{ marginTop: 16 }}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div>
                        分享链接：<Text copyable>{shareUrl}</Text>
                      </div>
                      <div ref={qrRef} style={{ marginTop: 8 }} />
                      <Text type="secondary">
                        扫码或复制链接分享至社交平台引流
                      </Text>
                    </Space>
                  </Card>
                )}
              </Card>
            </Col>

            {/* 右侧：数据统计看板 */}
            <Col xs={24} lg={8}>
              <Card
                title="优惠券数据统计"
                extra={
                  <Space>
                    <Button
                      icon={<ExportOutlined />}
                      loading={loading}
                      onClick={refreshStats}
                      size="small"
                    />
                    <Button
                      icon={<ExportOutlined />}
                      onClick={exportExcel}
                      size="small"
                    >
                      导出
                    </Button>
                  </Space>
                }
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Statistic
                    title="累计领取量"
                    value={stats.receiveCount}
                    suffix="张"
                  />
                  <Statistic
                    title="累计核销量"
                    value={stats.useCount}
                    suffix="张"
                  />
                  <Statistic
                    title="带动销售额"
                    value={stats.salesAmount}
                    prefix="¥"
                  />
                </Space>
                <Divider />
                <div style={{ textAlign: "center" }}>
                  <Tag color="blue">实时更新</Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    数据每5分钟自动同步
                  </Text>
                </div>
              </Card>

              <Card title="平台规则提示" style={{ marginTop: 16 }}>
                <Alert
                  message="审核规范"
                  description="1. 优惠金额不得虚高 2. 有效期不得超过1年 3. 适用商品必须真实在售 4. 违规活动将自动驳回"
                  type="info"
                  showIcon
                />
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* 提交审核弹窗 */}
      <Modal
        title="提交平台审核"
        open={auditModal}
        onCancel={() => setAuditModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setAuditModal(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={submitAudit}
          >
            确认提交
          </Button>,
        ]}
      >
        <p>确认将当前优惠券活动提交平台审核吗？</p>
        <Text type="secondary">管理员将在1-3个工作日内完成合规性校验</Text>
      </Modal>
    </Layout>
  );
};

export default MarketingManagement;
