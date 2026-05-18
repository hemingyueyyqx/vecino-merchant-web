import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Tag,
  Select,// 修复缺失导入
} from "antd";
import type { Key } from "react";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ProductSpu, ProductSku } from "@/types/product";

// 模拟店铺列表（用于顶部筛选下拉框）
const SHOP_LIST = [
  { label: "美妆优选旗舰店", value: "美妆优选旗舰店" },
  { label: "大牌彩妆专卖店", value: "大牌彩妆专卖店" },
  { label: "护肤美妆个体店", value: "护肤美妆个体店" },
];

// 审核状态枚举
const AUDIT_STATUS = {
  0: { text: "待审核", color: "orange" },
  1: { text: "审核通过", color: "green" },
  2: { text: "审核驳回", color: "red" },
};

// 复用商家端商品死数据 + 新增 店铺名称、商家名称
const MOCK_SPU_LIST: ProductSpu[] = [
  {
    id: "spu_001",
    spuName: "FOXUP粉底液30ml",
    mainImage: "https://picsum.photos/50/50?random=1",
    status: 1,
    auditStatus: 0,
    shopName: "美妆优选旗舰店", // 新增
    merchantName: "张三商家", // 新增
    createTime: "2026-04-01",
    skuList: [
      {
        id: "sku_001",
        specAttr: "色号01粉瓷白",
        price: 129,
        stockNum: 88,
        warnStock: 10,
      },
      {
        id: "sku_002",
        specAttr: "色号02象牙白",
        price: 129,
        stockNum: 66,
        warnStock: 10,
      },
      {
        id: "sku_003",
        specAttr: "色号03自然色",
        price: 129,
        stockNum: 5,
        warnStock: 10,
      },
      {
        id: "sku_004",
        specAttr: "色号04小麦色",
        price: 129,
        stockNum: 30,
        warnStock: 10,
      },
    ],
  },
  {
    id: "spu_002",
    spuName: "橘朵高光修容盘10g",
    mainImage: "https://picsum.photos/50/50?random=2",
    status: 1,
    auditStatus: 0,
    shopName: "美妆优选旗舰店",
    merchantName: "张三商家",
    createTime: "2026-04-02",
    skuList: [
      {
        id: "sku_005",
        specAttr: "01高光盘",
        price: 59,
        stockNum: 99,
        warnStock: 15,
      },
      {
        id: "sku_006",
        specAttr: "02修容盘",
        price: 59,
        stockNum: 80,
        warnStock: 15,
      },
    ],
  },
  {
    id: "spu_003",
    spuName: "YSL纯口红4g",
    mainImage: "https://picsum.photos/50/50?random=3",
    status: 1,
    auditStatus: 1,
    shopName: "大牌彩妆专卖店",
    merchantName: "李四商家",
    createTime: "2026-04-03",
    skuList: [
      {
        id: "sku_007",
        specAttr: "1966暖棕红",
        price: 380,
        stockNum: 40,
        warnStock: 8,
      },
    ],
  },
  {
    id: "spu_004",
    spuName: "完美日记散粉8g",
    mainImage: "https://picsum.photos/50/50?random=4",
    status: 1,
    auditStatus: 2,
    shopName: "大牌彩妆专卖店",
    merchantName: "李四商家",
    createTime: "2026-04-04",
    skuList: [
      {
        id: "sku_009",
        specAttr: "透明色",
        price: 79,
        stockNum: 120,
        warnStock: 20,
      },
    ],
  },
  {
    id: "spu_005",
    spuName: "花西子蜜粉饼7g",
    mainImage: "https://picsum.photos/50/50?random=5",
    status: 1,
    auditStatus: 0,
    shopName: "护肤美妆个体店",
    merchantName: "王五商家",
    createTime: "2026-04-05",
    skuList: [
      {
        id: "sku_010",
        specAttr: "自然色",
        price: 149,
        stockNum: 60,
        warnStock: 10,
      },
    ],
  },
  {
    id: "spu_006",
    spuName: "珂拉琪唇釉3.5g",
    mainImage: "https://picsum.photos/50/50?random=6",
    status: 1,
    auditStatus: 1,
    shopName: "护肤美妆个体店",
    merchantName: "王五商家",
    createTime: "2026-04-06",
    skuList: [
      {
        id: "sku_011",
        specAttr: "B705焦糖奶茶",
        price: 69,
        stockNum: 150,
        warnStock: 30,
      },
    ],
  },
  {
    id: "spu_007",
    spuName: "UNNY眉笔0.1g",
    mainImage: "https://picsum.photos/50/50?random=7",
    status: 1,
    auditStatus: 0,
    shopName: "美妆优选旗舰店",
    merchantName: "张三商家",
    createTime: "2026-04-07",
    skuList: [
      {
        id: "sku_012",
        specAttr: "深棕色",
        price: 29,
        stockNum: 200,
        warnStock: 40,
      },
    ],
  },
  {
    id: "spu_008",
    spuName: "3CE眼影盘9g",
    mainImage: "https://picsum.photos/50/50?random=8",
    status: 1,
    auditStatus: 1,
    shopName: "大牌彩妆专卖店",
    merchantName: "李四商家",
    createTime: "2026-04-08",
    skuList: [
      {
        id: "sku_013",
        specAttr: "九宫格燕麦盘",
        price: 239,
        stockNum: 45,
        warnStock: 10,
      },
    ],
  },
  {
    id: "spu_009",
    spuName: "馥蕾诗唇膏4.3g",
    mainImage: "https://picsum.photos/50/50?random=9",
    status: 1,
    auditStatus: 2,
    shopName: "护肤美妆个体店",
    merchantName: "王五商家",
    createTime: "2026-04-09",
    skuList: [
      {
        id: "sku_014",
        specAttr: "经典无色",
        price: 220,
        stockNum: 33,
        warnStock: 5,
      },
    ],
  },
  {
    id: "spu_010",
    spuName: "魅可生姜高光9g",
    mainImage: "https://picsum.photos/50/50?random=10",
    status: 1,
    auditStatus: 0,
    shopName: "美妆优选旗舰店",
    merchantName: "张三商家",
    createTime: "2026-04-10",
    skuList: [
      {
        id: "sku_015",
        specAttr: "经典色",
        price: 360,
        stockNum: 28,
        warnStock: 8,
      },
    ],
  },
];

// ===================== 平台SPU审核列表主页面 =====================
export default function SpuAuditList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [spuList, setSpuList] = useState<ProductSpu[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // 弹窗状态
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [auditModal, setAuditModal] = useState<boolean>(false);

  // 审核操作状态
  const [auditType, setAuditType] = useState<"pass" | "reject">("pass");
  const [currentSpu, setCurrentSpu] = useState<ProductSpu | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  // 获取审核列表（带筛选：商品名+审核状态+店铺名称）
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { spuName = "", auditStatus, shopName } = form.getFieldsValue();
      let filterList = MOCK_SPU_LIST.filter((item) =>
        item.spuName?.includes(spuName),
      );
      // 审核状态筛选
      if (auditStatus !== undefined) {
        filterList = filterList.filter(
          (item) => item.auditStatus === auditStatus,
        );
      }
      // 新增：店铺名称筛选
      if (shopName) {
        filterList = filterList.filter((item) => item.shopName === shopName);
      }
      setTotal(filterList.length);
      const start = (page - 1) * size;
      const end = start + size;
      setSpuList(filterList.slice(start, end));
    } catch (err) {
      console.error("获取审核列表失败", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, form]);

  // 查看商品详情（只读）
  const handleViewDetail = (spu: ProductSpu) => {
    setCurrentSpu(spu);
    setDetailModal(true);
  };

  // 打开审核弹窗
  const handleOpenAudit = (spu: ProductSpu, type: "pass" | "reject") => {
    setCurrentSpu(spu);
    setAuditType(type);
    setRejectReason("");
    setAuditModal(true);
  };

  // 提交审核操作
  const handleSubmitAudit = () => {
    if (auditType === "reject" && !rejectReason.trim()) {
      message.warning("请填写驳回原因");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const statusText = auditType === "pass" ? "通过" : "驳回";
      message.success(`商品【${currentSpu?.spuName}】审核${statusText}成功`);
      setAuditModal(false);
      fetchList();
      setLoading(false);
    }, 800);
  };

  // 批量审核
  const handleBatchAudit = (type: "pass" | "reject") => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择需要审核的商品");
      return;
    }
    Modal.confirm({
      title: type === "pass" ? "批量通过" : "批量驳回",
      content: `确定要${type === "pass" ? "通过" : "驳回"}选中的 ${selectedRowKeys.length} 个商品吗？`,
      onOk: () => {
        message.success(`批量${type === "pass" ? "通过" : "驳回"}成功`);
        fetchList();
        setSelectedRowKeys([]);
      },
    });
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 表格列定义 + 新增店铺/商家列
  const columns = [
    {
      title: "商品主图",
      dataIndex: "mainImage",
      render: (img: string) => <img src={img} width={50} alt="商品图" />,
    },
    { title: "商品名称", dataIndex: "spuName" },
    { title: "店铺名称", dataIndex: "shopName" }, // 新增
    { title: "商家名称", dataIndex: "merchantName" }, // 新增
    {
      title: "上下架状态",
      dataIndex: "status",
      render: (s: 0 | 1) => (s ? "✅ 上架" : "❌ 下架"),
    },
    {
      title: "审核状态",
      dataIndex: "auditStatus",
      render: (status: keyof typeof AUDIT_STATUS) => (
        <Tag color={AUDIT_STATUS[status].color}>
          {AUDIT_STATUS[status].text}
        </Tag>
      ),
    },
    { title: "创建时间", dataIndex: "createTime" },
    {
      title: "平台操作",
      render: (_: unknown, record: ProductSpu) => (
        <Space size="small">
          <Button type="link" onClick={() => handleViewDetail(record)}>
            查看详情
          </Button>
          {record.auditStatus === 0 && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleOpenAudit(record, "pass")}
              >
                审核通过
              </Button>
              <Button
                danger
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleOpenAudit(record, "reject")}
              >
                审核驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* 搜索筛选栏 + 新增店铺筛选 */}
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="spuName">
          <Input placeholder="商品名称搜索" />
        </Form.Item>
        {/* 新增：店铺筛选下拉框 */}
        <Form.Item name="shopName" label="店铺名称">
          <Select placeholder="全部店铺" style={{ width: 160 }} allowClear>
            {SHOP_LIST.map((shop) => (
              <Select.Option key={shop.value} value={shop.value}>
                {shop.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="auditStatus" label="审核状态">
          <Select placeholder="全部" style={{ width: 120 }} allowClear>
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>审核通过</Select.Option>
            <Select.Option value={2}>审核驳回</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchList}>
            查询
          </Button>
        </Form.Item>
      </Form>

      {/* 批量审核操作 */}
      <Space style={{ marginBottom: 15 }}>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => handleBatchAudit("pass")}
        >
          批量审核通过
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={() => handleBatchAudit("reject")}
        >
          批量审核驳回
        </Button>
      </Space>

      {/* SPU审核列表表格 */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={spuList}
        pagination={{ current: page, pageSize: size, total }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        onChange={(p) => {
          setPage(p.current!);
          setSize(p.pageSize!);
        }}
      />

      {/* 商品详情弹窗（新增店铺/商家信息） */}
      <Modal
        open={detailModal}
        title="商品详情（平台审核）"
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={800}
      >
        {currentSpu && (
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <img src={currentSpu.mainImage} width={120} alt="商品图" />
              </Col>
              <Col span={16}>
                <p>
                  <b>商品名称：</b>
                  {currentSpu.spuName}
                </p>
                <p>
                  <b>店铺名称：</b>
                  {currentSpu.shopName}
                </p>{" "}
                {/* 新增 */}
                <p>
                  <b>商家名称：</b>
                  {currentSpu.merchantName}
                </p>{" "}
                {/* 新增 */}
                <p>
                  <b>创建时间：</b>
                  {currentSpu.createTime}
                </p>
                <p>
                  <b>上下架状态：</b>
                  {currentSpu.status ? "上架" : "下架"}
                </p>
                <p>
                  <b>审核状态：</b>
                  <Tag color={AUDIT_STATUS[currentSpu.auditStatus].color}>
                    {AUDIT_STATUS[currentSpu.auditStatus].text}
                  </Tag>
                </p>
              </Col>
            </Row>
            <div style={{ marginTop: 20 }}>
              <h4>规格SKU列表</h4>
              <Table
                dataSource={currentSpu.skuList}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: "规格",
                    dataIndex: "specAttr",
                    render: (text, record: ProductSku) => (
                      <span
                        style={{
                          color:
                            record.stockNum < record.warnStock
                              ? "#ff4d4f"
                              : "#000",
                        }}
                      >
                        {text}
                        {record.stockNum < record.warnStock && (
                          <Tag color="red" style={{ marginLeft: 8 }}>
                            ⚠️库存不足
                          </Tag>
                        )}
                      </span>
                    ),
                  },
                  { title: "价格", dataIndex: "price" },
                  {
                    title: "库存",
                    dataIndex: "stockNum",
                    render: (text, record: ProductSku) => (
                      <span
                        style={{
                          color:
                            record.stockNum < record.warnStock
                              ? "#ff4d4f"
                              : "#000",
                          fontWeight: "bold",
                        }}
                      >
                        {text}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </Card>
        )}
      </Modal>

      {/* 审核操作弹窗 */}
      <Modal
        open={auditModal}
        title={`商品审核 - ${auditType === "pass" ? "通过" : "驳回"}`}
        onCancel={() => setAuditModal(false)}
        onOk={handleSubmitAudit}
        confirmLoading={loading}
        width={500}
      >
        {currentSpu && (
          <div>
            <p>
              <b>商品名称：</b>
              {currentSpu.spuName}
            </p>
            <p>
              <b>店铺名称：</b>
              {currentSpu.shopName}
            </p>{" "}
            {/* 新增 */}
            <p>
              <b>操作类型：</b>
              {auditType === "pass" ? "审核通过" : "审核驳回"}
            </p>
            {auditType === "reject" && (
              <Form.Item label="驳回原因" style={{ marginTop: 16 }}>
                <TextArea
                  rows={4}
                  placeholder="请填写驳回原因（必填）"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </Form.Item>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
