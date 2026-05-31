// src/components/merchant/MarketingManagement.tsx
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
  DatePicker,
  Row,
  Col,
} from "antd";
import type { Key } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { Coupon } from "@/types/product";
import {
  getCouponList,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  batchUpdateCouponStatus,
} from "@/services/business";

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

// 优惠券类型枚举
const COUPON_TYPE = {
  0: { text: "满减券", color: "blue" },
  1: { text: "无门槛券", color: "purple" },
};

export default function MarketingManagement() {
  const [form] = Form.useForm();
  const [couponForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // 弹窗状态
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);

  // 当前操作的优惠券
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [couponType, setCouponType] = useState<0 | 1>(0);

  // 获取优惠券列表
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { couponName, couponStatus, auditStatus } = form.getFieldsValue();
      const params: any = {};
      if (couponName) params.couponName = couponName;
      if (couponStatus !== undefined && couponStatus !== null)
        params.couponStatus = couponStatus;
      if (auditStatus !== undefined && auditStatus !== null)
        params.auditStatus = auditStatus;

      const res = await getCouponList(params);
      setCouponList(res || []);
    } catch (err) {
      console.error("获取优惠券列表失败", err);
      message.error("获取优惠券列表失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 查看详情
  const handleViewDetail = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setDetailModal(true);
  };

  // 打开创建弹窗
  const handleOpenCreate = () => {
    couponForm.resetFields();
    setCouponType(0);
    setCreateModal(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setCouponType(coupon.couponType || 0);
    couponForm.setFieldsValue({
      couponName: coupon.couponName,
      couponType: coupon.couponType,
      fullAmount: coupon.fullAmount,
      reduceAmount: coupon.reduceAmount,
      wmkAmount: coupon.wwmkAmount,
      totalCount: coupon.totalCount,
      startTime: coupon.startTime ? new Date(coupon.startTime) : null,
      endTime: coupon.endTime ? new Date(coupon.endTime) : null,
    });
    setEditModal(true);
  };

  // 删除优惠券
  const handleDelete = (coupon: Coupon) => {
    Modal.confirm({
      title: "删除优惠券",
      content: `确定要删除优惠券「${coupon.couponName}」吗？`,
      onOk: async () => {
        try {
          await deleteCoupon(coupon.couponId!);
          message.success("删除成功");
          fetchList();
        } catch (err) {
          message.error("删除失败");
        }
      },
    });
  };

  // 提交创建
  const handleSubmitCreate = async () => {
    try {
      const values = await couponForm.validateFields();
      const couponData: Coupon = {
        couponName: values.couponName,
        couponType: values.couponType,
        fullAmount: values.couponType === 0 ? values.fullAmount : undefined,
        reduceAmount: values.couponType === 0 ? values.reduceAmount : undefined,
        wwmkAmount: values.couponType === 1 ? values.wmkAmount : undefined,
        totalCount: values.totalCount,
        startTime: values.startTime
          ? values.startTime.toISOString()
          : undefined,
        endTime: values.endTime ? values.endTime.toISOString() : undefined,
        couponStatus: 0,
        auditStatus: 0,
      };
      await addCoupon(couponData);
      message.success("创建成功");
      setCreateModal(false);
      fetchList();
    } catch (err) {
      message.error("创建失败");
    }
  };

  // 提交编辑
  const handleSubmitEdit = async () => {
    try {
      const values = await couponForm.validateFields();
      const couponData: Coupon = {
        couponId: currentCoupon?.couponId,
        couponName: values.couponName,
        couponType: values.couponType,
        fullAmount: values.couponType === 0 ? values.fullAmount : undefined,
        reduceAmount: values.couponType === 0 ? values.reduceAmount : undefined,
        wwmkAmount: values.couponType === 1 ? values.wmkAmount : undefined,
        totalCount: values.totalCount,
        startTime: values.startTime
          ? values.startTime.toISOString()
          : undefined,
        endTime: values.endTime ? values.endTime.toISOString() : undefined,
      };
      await updateCoupon(couponData);
      message.success("编辑成功");
      setEditModal(false);
      fetchList();
    } catch (err) {
      message.error("编辑失败");
    }
  };

  // 切换优惠券状态（单个操作也走批量接口）
  const handleToggleStatus = async (coupon: Coupon) => {
    // 检查是否已审核通过
    if (coupon.auditStatus !== 1) {
      message.warning("只有审核通过的优惠券才能启用/禁用");
      return;
    }

    const newStatus = coupon.couponStatus === 1 ? 0 : 1;
    try {
      await batchUpdateCouponStatus({
        couponIds: [coupon.couponId!],
        couponStatus: newStatus,
      });
      message.success(`${newStatus === 1 ? "启用" : "禁用"}成功`);
      fetchList();
    } catch (err) {
      message.error("操作失败");
    }
  };

  // 批量启用/禁用
  const handleBatchToggleStatus = async (status: 0 | 1) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择需要操作的优惠券");
      return;
    }

    // 获取选中的优惠券
    const selectedCoupons = couponList.filter((coupon) =>
      selectedRowKeys.includes(coupon.couponId!),
    );

    // 检查是否所有选中的优惠券都已审核通过
    const notAudited = selectedCoupons.filter(
      (coupon) => coupon.auditStatus !== 1,
    );
    if (notAudited.length > 0) {
      message.warning(`有 ${notAudited.length} 个优惠券未审核通过，无法操作`);
      return;
    }

    // 批量启用时，检查是否所有选中的优惠券都是禁用状态
    if (status === 1) {
      const notDisabled = selectedCoupons.filter(
        (coupon) => coupon.couponStatus !== 0,
      );
      if (notDisabled.length > 0) {
        message.warning(`有 ${notDisabled.length} 个优惠券已经是启用状态`);
        return;
      }
    }

    // 批量禁用时，检查是否所有选中的优惠券都是启用状态
    if (status === 0) {
      const notEnabled = selectedCoupons.filter(
        (coupon) => coupon.couponStatus !== 1,
      );
      if (notEnabled.length > 0) {
        message.warning(`有 ${notEnabled.length} 个优惠券已经是禁用状态`);
        return;
      }
    }

    Modal.confirm({
      title: status === 1 ? "批量启用" : "批量禁用",
      content: `确定要${status === 1 ? "启用" : "禁用"}选中的 ${selectedRowKeys.length} 个优惠券吗？`,
      onOk: async () => {
        try {
          await batchUpdateCouponStatus({
            couponIds: selectedRowKeys.map((key) => String(key)),
            couponStatus: status,
          });
          message.success(`批量${status === 1 ? "启用" : "禁用"}成功`);
          fetchList();
          setSelectedRowKeys([]);
        } catch (err) {
          message.error("操作失败");
        }
      },
    });
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 判断批量操作按钮是否可用
  const selectedCoupons = couponList.filter((coupon) =>
    selectedRowKeys.includes(coupon.couponId!),
  );
  const canBatchEnable =
    selectedRowKeys.length > 0 &&
    selectedCoupons.every(
      (coupon) => coupon.auditStatus === 1 && coupon.couponStatus === 0,
    );
  const canBatchDisable =
    selectedRowKeys.length > 0 &&
    selectedCoupons.every(
      (coupon) => coupon.auditStatus === 1 && coupon.couponStatus === 1,
    );

  // 表格列定义
  const columns = [
    { title: "优惠券名称", dataIndex: "couponName" },
    {
      title: "优惠券类型",
      dataIndex: "couponType",
      render: (type: 0 | 1) => (
        <Tag color={COUPON_TYPE[type].color}>{COUPON_TYPE[type].text}</Tag>
      ),
    },
    {
      title: "优惠信息",
      dataIndex: "couponType",
      render: (type: 0 | 1, record: Coupon) => {
        if (type === 0) {
          return `满${record.fullAmount}减${record.reduceAmount}`;
        } else {
          return `无门槛减${record.wwmkAmount}`;
        }
      },
    },
    { title: "发放数量", dataIndex: "totalCount" },
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
      render: (_, record: Coupon) => {
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
      title: "操作",
      render: (_: unknown, record: Coupon) => (
        <Space size="small">
          <Button type="link" onClick={() => handleViewDetail(record)}>
            <EyeOutlined />
            查看
          </Button>
          {record.auditStatus === 1 && (
            <Button type="link" onClick={() => handleOpenEdit(record)}>
              <EditOutlined />
              编辑
            </Button>
          )}
          {record.auditStatus === 0 && (
            <Button type="link" danger onClick={() => handleDelete(record)}>
              <DeleteOutlined />
              删除
            </Button>
          )}
          {record.auditStatus === 1 && (
            <Button type="link" onClick={() => handleToggleStatus(record)}>
              {record.couponStatus === 1 ? "禁用" : "启用"}
            </Button>
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
        <Form.Item>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            新增优惠券
          </Button>
        </Form.Item>
      </Form>

      {/* 批量操作按钮 */}
      <Space style={{ marginBottom: 15 }}>
        <Button
          type="primary"
          onClick={() => handleBatchToggleStatus(1)}
          disabled={!canBatchEnable}
        >
          批量启用
        </Button>
        <Button
          danger
          onClick={() => handleBatchToggleStatus(0)}
          disabled={!canBatchDisable}
        >
          批量禁用
        </Button>
      </Space>

      {/* 优惠券列表表格 */}
      <Table
        rowKey="couponId"
        loading={loading}
        columns={columns}
        dataSource={couponList}
        pagination={false}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      {/* 详情弹窗 */}
      <Modal
        open={detailModal}
        title="优惠券详情"
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
                  <b>优惠券类型：</b>
                  <Tag color={COUPON_TYPE[currentCoupon.couponType || 0].color}>
                    {COUPON_TYPE[currentCoupon.couponType || 0].text}
                  </Tag>
                </p>
                <p>
                  <b>优惠信息：</b>
                  {currentCoupon.couponType === 0
                    ? `满${currentCoupon.fullAmount}减${currentCoupon.reduceAmount}`
                    : `无门槛减${currentCoupon.wwmkAmount}`}
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

      {/* 创建/编辑弹窗 */}
      <Modal
        open={createModal || editModal}
        title={createModal ? "新增优惠券" : "编辑优惠券"}
        onCancel={() => {
          setCreateModal(false);
          setEditModal(false);
        }}
        onOk={createModal ? handleSubmitCreate : handleSubmitEdit}
        confirmLoading={loading}
        width={500}
      >
        <Form form={couponForm} layout="vertical">
          <Form.Item
            name="couponName"
            label="优惠券名称"
            rules={[{ required: true, message: "请输入优惠券名称" }]}
          >
            <Input placeholder="请输入优惠券名称" />
          </Form.Item>

          <Form.Item
            name="couponType"
            label="优惠券类型"
            rules={[{ required: true, message: "请选择优惠券类型" }]}
          >
            <Select
              placeholder="请选择优惠券类型"
              onChange={(value) => setCouponType(value)}
            >
              <Select.Option value={0}>满减券</Select.Option>
              <Select.Option value={1}>无门槛券</Select.Option>
            </Select>
          </Form.Item>

          {couponType === 0 && (
            <>
              <Form.Item
                name="fullAmount"
                label="满减金额"
                rules={[{ required: true, message: "请输入满减金额" }]}
              >
                <Input type="number" placeholder="满多少元" />
              </Form.Item>
              <Form.Item
                name="reduceAmount"
                label="减免金额"
                rules={[{ required: true, message: "请输入减免金额" }]}
              >
                <Input type="number" placeholder="减多少元" />
              </Form.Item>
            </>
          )}

          {couponType === 1 && (
            <Form.Item
              name="wmkAmount"
              label="无门槛减免金额"
              rules={[{ required: true, message: "请输入无门槛减免金额" }]}
            >
              <Input type="number" placeholder="无门槛减多少元" />
            </Form.Item>
          )}

          <Form.Item
            name="totalCount"
            label="发放数量"
            rules={[{ required: true, message: "请输入发放数量" }]}
          >
            <Input type="number" placeholder="请输入发放数量" />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: "请选择开始时间" }]}
          >
            <DatePicker showTime placeholder="请选择开始时间" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: "请选择结束时间" }]}
          >
            <DatePicker showTime placeholder="请选择结束时间" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
