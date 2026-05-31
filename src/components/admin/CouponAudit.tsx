// src/components/admin/CouponAudit.tsx
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
  Tag,
  Select,
  Row,
  Col,
} from "antd";
import type { Key } from "react";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { Coupon } from "@/types/product";
import { getCouponList } from "@/services/business";
import { batchAuditCoupon } from "@/services/admin";
import { getAllMerchantsAndShop } from "@/services/business";

// 店铺列表接口返回类型
interface ShopOption {
  shopName?: string;
}

// 优惠券类型枚举
const COUPON_TYPE = {
  0: { text: "满减券", color: "blue" },
  1: { text: "无门槛券", color: "purple" },
};

// 优惠券状态枚举
const COUPON_STATUS = {
  0: { text: "禁用", color: "red" },
  1: { text: "启用", color: "green" },
};

// 审核状态枚举
const AUDIT_STATUS = {
  0: { text: "待审核", color: "orange" },
  1: { text: "审核通过", color: "green" },
  2: { text: "审核拒绝", color: "red" },
};

export default function CouponAudit() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [shopList, setShopList] = useState<ShopOption[]>([]);

  // 弹窗状态
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [auditModal, setAuditModal] = useState<boolean>(false);
  const [batchRejectModal, setBatchRejectModal] = useState<boolean>(false);

  // 审核操作状态
  const [auditType, setAuditType] = useState<"pass" | "reject">("pass");
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [batchRejectReason, setBatchRejectReason] = useState<string>("");

  // 获取优惠券列表
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { couponName, couponStatus, auditStatus, shopName } =
        form.getFieldsValue();
      const params: any = {};
      if (couponName) params.couponName = couponName;
      if (couponStatus !== undefined && couponStatus !== null)
        params.couponStatus = couponStatus;
      if (auditStatus !== undefined && auditStatus !== null)
        params.auditStatus = auditStatus;
      if (shopName) params.shopName = shopName;

      const res = await getCouponList(params);
      setCouponList(res || []);
    } catch (err) {
      console.error("获取优惠券列表失败", err);
      message.error("获取优惠券列表失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 获取店铺列表
  const fetchShopList = useCallback(async () => {
    try {
      const shops = await getAllMerchantsAndShop();
      setShopList(shops || []);
    } catch (err) {
      console.error("获取店铺列表失败", err);
    }
  }, []);

  // 查看详情
  const handleViewDetail = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setDetailModal(true);
  };

  // 打开审核弹窗
  const handleOpenAudit = (coupon: Coupon, type: "pass" | "reject") => {
    setCurrentCoupon(coupon);
    setAuditType(type);
    setRejectReason("");
    setAuditModal(true);
  };

  // 提交审核操作
  const handleSubmitAudit = async () => {
    if (auditType === "reject" && !rejectReason.trim()) {
      message.warning("请填写拒绝原因");
      return;
    }
    setLoading(true);
    try {
      const auditStatus = auditType === "pass" ? 1 : 2;
      await batchAuditCoupon({
        couponIds: [currentCoupon?.couponId!],
        auditStatus,
        auditRemark: auditType === "reject" ? rejectReason : undefined,
      });
      const statusText = auditType === "pass" ? "通过" : "拒绝";
      message.success(
        `优惠券【${currentCoupon?.couponName}】审核${statusText}成功`,
      );
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
      message.warning("请选择需要审核的优惠券");
      return;
    }

    if (type === "reject") {
      setBatchRejectReason("");
      setBatchRejectModal(true);
    } else {
      Modal.confirm({
        title: "批量通过",
        content: `确定要通过选中的 ${selectedRowKeys.length} 个优惠券吗？`,
        onOk: async () => {
          setLoading(true);
          try {
            await batchAuditCoupon({
              couponIds: selectedRowKeys.map((key) => String(key)),
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

  // 确认批量拒绝
  const handleConfirmBatchReject = async () => {
    if (!batchRejectReason.trim()) {
      message.warning("请填写拒绝原因");
      return;
    }
    setLoading(true);
    try {
      await batchAuditCoupon({
        couponIds: selectedRowKeys.map((key) => String(key)),
        auditStatus: 2,
        auditRemark: batchRejectReason,
      });
      message.success("批量拒绝成功");
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

  useEffect(() => {
    fetchShopList();
    fetchList();
  }, [fetchList, fetchShopList]);

  // 表格列定义
  const columns = [
    {
      title: "优惠券名称",
      dataIndex: "couponName",
    },
    {
      title: "店铺名称",
      dataIndex: "shopName",
    },
    {
      title: "优惠券类型",
      dataIndex: "couponType",
      render: (type: 0 | 1) => (
        <Tag color={COUPON_TYPE[type].color}>{COUPON_TYPE[type].text}</Tag>
      ),
    },
    {
      title: "优惠信息",
      render: (_: unknown, record: Coupon) => {
        if (record.couponType === 0) {
          return `满${record.fullAmount}减${record.reduceAmount}`;
        } else {
          return `无门槛减${record.wmkAmount}`;
        }
      },
    },
    {
      title: "发放数量",
      dataIndex: "totalCount",
    },
    {
      title: "优惠券状态",
      dataIndex: "couponStatus",
      render: (status: 0 | 1) => (
        <Tag color={COUPON_STATUS[status].color}>
          {COUPON_STATUS[status].text}
        </Tag>
      ),
    },
    {
      title: "审核状态",
      dataIndex: "auditStatus",
      render: (status: 0 | 1 | 2) => (
        <Tag color={AUDIT_STATUS[status].color}>
          {AUDIT_STATUS[status].text}
        </Tag>
      ),
    },
    {
      title: "有效期",
      render: (_: unknown, record: Coupon) => {
        const start = record.startTime?.split("T")[0] || "-";
        const end = record.endTime?.split("T")[0] || "-";
        return `${start} ~ ${end}`;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      render: (time: string) => time?.split("T")[0] || "-",
    },
    {
      title: "平台操作",
      render: (_: unknown, record: Coupon) => (
        <Space size="small">
          <Button type="link" onClick={() => handleViewDetail(record)}>
            <EyeOutlined />
            查看
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
                审核拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* 搜索筛选栏 */}
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="couponName">
          <Input placeholder="优惠券名称搜索" />
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
        <Form.Item name="couponStatus" label="优惠券状态">
          <Select placeholder="全部" style={{ width: 120 }} allowClear>
            <Select.Option value={0}>禁用</Select.Option>
            <Select.Option value={1}>启用</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="auditStatus" label="审核状态">
          <Select placeholder="全部" style={{ width: 120 }} allowClear>
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>审核通过</Select.Option>
            <Select.Option value={2}>审核拒绝</Select.Option>
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
          批量审核拒绝
        </Button>
      </Space>

      {/* 优惠券审核列表表格 */}
      <Table
        rowKey="couponId"
        loading={loading}
        columns={columns}
        dataSource={couponList}
        pagination={{ pageSize: 10 }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      {/* 详情弹窗 */}
      <Modal
        open={detailModal}
        title="优惠券详情（平台审核）"
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={600}
      >
        {currentCoupon && (
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p>
                  <b>优惠券名称：</b>
                  {currentCoupon.couponName}
                </p>
                <p>
                  <b>店铺名称：</b>
                  {currentCoupon.shopName}
                </p>
                <p>
                  <b>优惠券类型：</b>
                  <Tag color={COUPON_TYPE[currentCoupon.couponType || 0].color}>
                    {COUPON_TYPE[currentCoupon.couponType || 0].text}
                  </Tag>
                </p>
                <p>
                  <b>优惠信息：</b>
                  {currentCoupon.couponType === 0
                    ? `满${currentCoupon.fullAmount}减${currentCoupon.reduceAmount}`
                    : `无门槛减${currentCoupon.wmkAmount}`}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <b>发放数量：</b>
                  {currentCoupon.totalCount}
                </p>
                <p>
                  <b>优惠券状态：</b>
                  <Tag
                    color={COUPON_STATUS[currentCoupon.couponStatus || 0].color}
                  >
                    {COUPON_STATUS[currentCoupon.couponStatus || 0].text}
                  </Tag>
                </p>
                <p>
                  <b>审核状态：</b>
                  <Tag
                    color={AUDIT_STATUS[currentCoupon.auditStatus || 0].color}
                  >
                    {AUDIT_STATUS[currentCoupon.auditStatus || 0].text}
                  </Tag>
                </p>
                {currentCoupon.auditRemark && (
                  <p>
                    <b>审核备注：</b>
                    {currentCoupon.auditRemark}
                  </p>
                )}
              </Col>
            </Row>
            <div style={{ marginTop: 20 }}>
              <p>
                <b>有效期：</b>
                {(currentCoupon.startTime?.split("T")[0] || "-") +
                  " ~ " +
                  (currentCoupon.endTime?.split("T")[0] || "-")}
              </p>
              <p>
                <b>创建时间：</b>
                {currentCoupon.createTime?.split("T")[0] || "-"}
              </p>
            </div>
          </Card>
        )}
      </Modal>

      {/* 审核操作弹窗 */}
      <Modal
        open={auditModal}
        title={`优惠券审核 - ${auditType === "pass" ? "通过" : "拒绝"}`}
        onCancel={() => setAuditModal(false)}
        onOk={handleSubmitAudit}
        confirmLoading={loading}
        width={500}
      >
        {currentCoupon && (
          <div>
            <p>
              <b>优惠券名称：</b>
              {currentCoupon.couponName}
            </p>
            <p>
              <b>店铺名称：</b>
              {currentCoupon.shopName}
            </p>
            <p>
              <b>操作类型：</b>
              {auditType === "pass" ? "审核通过" : "审核拒绝"}
            </p>
            {auditType === "reject" && (
              <Form.Item label="拒绝原因" style={{ marginTop: 16 }}>
                <Input.TextArea
                  rows={4}
                  placeholder="请填写拒绝原因（必填）"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </Form.Item>
            )}
          </div>
        )}
      </Modal>

      {/* 批量拒绝弹窗 */}
      <Modal
        open={batchRejectModal}
        title="批量拒绝"
        onCancel={() => {
          setBatchRejectModal(false);
          setBatchRejectReason("");
        }}
        onOk={handleConfirmBatchReject}
        confirmLoading={loading}
        width={500}
      >
        <div>
          <p>确定要拒绝选中的 {selectedRowKeys.length} 个优惠券吗？</p>
          <Form.Item label="拒绝原因" style={{ marginTop: 16 }}>
            <Input.TextArea
              rows={4}
              placeholder="请填写拒绝原因（必填）"
              value={batchRejectReason}
              onChange={(e) => setBatchRejectReason(e.target.value)}
            />
          </Form.Item>
        </div>
      </Modal>
    </div>
  );
}
