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
  Select,
} from "antd";
import type { Key } from "react";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ProductSpu, ProductSku } from "@/types/product";
import { getAuditSpuList, getAllMerchantsAndShop } from "@/services/business";
import { batchUpdateAuditSpuStatus } from "@/services/admin";
import { BASE_URL } from "@/services/constant";

// 审核状态枚举
const AUDIT_STATUS = {
  0: { text: "待审核", color: "orange" },
  1: { text: "审核通过", color: "green" },
  2: { text: "审核驳回", color: "red" },
};

// 店铺列表接口返回类型
interface ShopOption {
  shopName?: string;
}

// ===================== 平台SPU审核列表主页面 =====================
export default function SpuAuditList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [spuList, setSpuList] = useState<ProductSpu[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [shopList, setShopList] = useState<ShopOption[]>([]);

  // 弹窗状态
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [auditModal, setAuditModal] = useState<boolean>(false);
  const [batchRejectModal, setBatchRejectModal] = useState<boolean>(false);

  // 审核操作状态
  const [auditType, setAuditType] = useState<"pass" | "reject">("pass");
  const [currentSpu, setCurrentSpu] = useState<ProductSpu | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [batchRejectReason, setBatchRejectReason] = useState<string>("");

  // 获取审核列表（带筛选：商品名+审核状态+店铺名称）
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { spuName = "", auditStatus, shopName } = form.getFieldsValue();

      const params: any = {};
      if (spuName) params.spuName = spuName;
      if (auditStatus !== undefined && auditStatus !== null)
        params.auditStatus = auditStatus;
      if (shopName) params.shopName = shopName;

      const res = await getAuditSpuList(params);
      setSpuList(res || []);
      setTotal(res?.length || 0);
    } catch (err) {
      console.error("获取审核列表失败", err);
      message.error("获取审核列表失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

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

  // 提交审核操作（单个商品审核）
  const handleSubmitAudit = async () => {
    if (auditType === "reject" && !rejectReason.trim()) {
      message.warning("请填写驳回原因");
      return;
    }
    setLoading(true);
    try {
      const auditStatus = auditType === "pass" ? 1 : 2;
      await batchUpdateAuditSpuStatus({
        spuIds: [currentSpu?.spuId!],
        auditStatus,
        auditRemark: auditType === "reject" ? rejectReason : undefined,
      });
      const statusText = auditType === "pass" ? "通过" : "驳回";
      message.success(`商品【${currentSpu?.spuName}】审核${statusText}成功`);
      setAuditModal(false);
      fetchList();
    } catch (err) {
      console.error("审核操作失败", err);
      message.error("审核操作失败");
    } finally {
      setLoading(false);
    }
  };

  // 批量审核
  const handleBatchAudit = (type: "pass" | "reject") => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择需要审核的商品");
      return;
    }

    // 如果是驳回，打开批量驳回弹窗
    if (type === "reject") {
      setBatchRejectReason("");
      setBatchRejectModal(true);
    } else {
      // 批量通过
      Modal.confirm({
        title: "批量通过",
        content: `确定要通过选中的 ${selectedRowKeys.length} 个商品吗？`,
        onOk: async () => {
          setLoading(true);
          try {
            await batchUpdateAuditSpuStatus({
              spuIds: selectedRowKeys.map((key) => String(key)),
              auditStatus: 1,
            });
            message.success("批量通过成功");
            fetchList();
            setSelectedRowKeys([]);
          } catch (err) {
            console.error("批量审核失败", err);
            message.error("批量审核失败");
          } finally {
            setLoading(false);
          }
        },
      });
    }
  };

  // 确认批量驳回
  const handleConfirmBatchReject = async () => {
    if (!batchRejectReason.trim()) {
      message.warning("请填写驳回原因");
      return;
    }
    setLoading(true);
    try {
      await batchUpdateAuditSpuStatus({
        spuIds: selectedRowKeys.map((key) => String(key)),
        auditStatus: 2,
        auditRemark: batchRejectReason,
      });
      message.success("批量驳回成功");
      fetchList();
      setSelectedRowKeys([]);
      setBatchRejectReason("");
      setBatchRejectModal(false);
    } catch (err) {
      console.error("批量审核失败", err);
      message.error("批量审核失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取店铺列表
  useEffect(() => {
    fetchShopList();
    fetchList();
  }, [fetchList]);

  // 获取店铺列表
  const fetchShopList = useCallback(async () => {
    try {
      const shops = await getAllMerchantsAndShop();
      setShopList(shops || []);
    } catch (err) {
      console.error("获取店铺列表失败", err);
    }
  }, []);

  // 表格列定义
  const columns = [
    {
      title: "商品主图",
      dataIndex: "mainImage",
      render: (img: string) =>
        img ? (
          <img
            src={img.startsWith("http") ? img : `${BASE_URL}${img}`}
            width={50}
            alt="商品图"
          />
        ) : (
          "-"
        ),
    },
    { title: "商品名称", dataIndex: "spuName" },
    { title: "店铺名称", dataIndex: "shopName" },
    {
      title: "上下架状态",
      dataIndex: "spuStatus",
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
    {
      title: "创建时间",
      dataIndex: "createTime",
      render: (time: string) => time?.split("T")[0] || "-",
    },
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
        {/* 店铺筛选下拉框 */}
        <Form.Item name="shopName" label="店铺名称">
          <Select placeholder="全部店铺" style={{ width: 160 }} allowClear>
            {shopList.map((shop) => (
              <Select.Option key={shop.shopName} value={shop.shopName}>
                {shop.shopName}
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
        rowKey="spuId"
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
                <img
                  src={
                    currentSpu.mainImage?.startsWith("http")
                      ? currentSpu.mainImage
                      : `/${currentSpu.mainImage}`
                  }
                  width={120}
                  alt="商品图"
                />
              </Col>
              <Col span={16}>
                <p>
                  <b>商品名称：</b>
                  {currentSpu.spuName}
                </p>
                <p>
                  <b>店铺名称：</b>
                  {currentSpu.shopName}
                </p>
                <p>
                  <b>创建时间：</b>
                  {currentSpu.createTime?.split("T")[0] || "-"}
                </p>
                <p>
                  <b>上下架状态：</b>
                  {currentSpu.spuStatus ? "上架" : "下架"}
                </p>
                <p>
                  <b>审核状态：</b>
                  <Tag color={AUDIT_STATUS[currentSpu.auditStatus!].color}>
                    {AUDIT_STATUS[currentSpu.auditStatus!].text}
                  </Tag>
                </p>
                {currentSpu.auditRemark && (
                  <p>
                    <b>审核备注：</b>
                    {currentSpu.auditRemark}
                  </p>
                )}
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
            </p>
            <p>
              <b>操作类型：</b>
              {auditType === "pass" ? "审核通过" : "审核驳回"}
            </p>
            {auditType === "reject" && (
              <Form.Item label="驳回原因" style={{ marginTop: 16 }}>
                <Input.TextArea
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

      {/* 批量驳回弹窗 */}
      <Modal
        open={batchRejectModal}
        title="批量驳回"
        onCancel={() => {
          setBatchRejectModal(false);
          setBatchRejectReason("");
        }}
        onOk={handleConfirmBatchReject}
        confirmLoading={loading}
        width={500}
      >
        <div>
          <p>确定要驳回选中的 {selectedRowKeys.length} 个商品吗？</p>
          <Form.Item label="驳回原因" style={{ marginTop: 16 }}>
            <Input.TextArea
              rows={4}
              placeholder="请填写驳回原因（必填）"
              value={batchRejectReason}
              onChange={(e) => setBatchRejectReason(e.target.value)}
            />
          </Form.Item>
        </div>
      </Modal>
    </div>
  );
}
