import React, { useState, useEffect } from "react";
import {
  Table,
  Row,
  Col,
  Select,
  Input,
  Button,
  Tag,
  Modal,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { updateOrderStatus } from "@/services/business";
import { getOrderList } from "@/services/customer";
import type { Order } from "@/types/order";

const orderStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: "已取消", color: "red" },
  1: { label: "待接单", color: "orange" },
  2: { label: "备货中", color: "blue" },
  3: { label: "配送中", color: "purple" },
  4: { label: "交易完成待评价", color: "green" },
  5: { label: "交易完成已评价", color: "blue" },
};

// 日期格式化函数：保留完整时间，将T替换为空格
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "--";
  // 将 ISO 格式中的 T 替换为空格
  return dateStr.replace("T", " ");
};

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<number | "">("");
  const [orderNoKeyword, setOrderNoKeyword] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    order: null as Order | null,
    action: "" as string,
    nextStatus: 0,
  });

  const fetchOrders = async (): Promise<Order[]> => {
    try {
      const data = await getOrderList();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("获取订单列表失败", err);
      message.error("加载订单失败");
      return [];
    }
  };

  useEffect(() => {
    const initOrders = async () => {
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);
    };
    initOrders();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
    message.success("刷新成功");
  };

  const handleShowConfirm = (
    order: Order,
    action: string,
    nextStatus: number,
  ) => {
    setConfirmModal({
      visible: true,
      order,
      action,
      nextStatus,
    });
  };

  const handleConfirm = async () => {
    const { order, action, nextStatus } = confirmModal;
    if (!order?.orderId) return;

    try {
      await updateOrderStatus(order.orderId, nextStatus);
      message.success(`${action}成功！`);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error(`${action}失败`, err);
      message.error(`${action}失败`);
    } finally {
      setConfirmModal({
        visible: false,
        order: null,
        action: "",
        nextStatus: 0,
      });
    }
  };

  const canAccept = (status?: number) => status === 1;
  const canShip = (status?: number) => status === 2;
  const canComplete = (status?: number) => status === 3;

  const columns: ColumnsType<Order> = [
    {
      title: "订单编号",
      dataIndex: "orderNo",
      key: "orderNo",
      width: 160,
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "商品信息",
      dataIndex: "mainImage",
      key: "mainImage",
      width: 280,
      render: (_: any, record: Order) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={record.mainImage || "https://picsum.photos/60/60"}
            alt={record.spuName}
            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
          />
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              {record.spuName || "--"}
            </div>
            <div style={{ color: "#666", fontSize: 12 }}>
              规格：{record.specAttr || "默认规格"}
            </div>
            <div style={{ color: "#666", fontSize: 12 }}>
              数量：{record.quantity || 1}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "收货地址",
      dataIndex: "address",
      key: "address",
      width: 260,
      render: (address) => (
        <span style={{ color: "#666" }}>{address || "暂无地址"}</span>
      ),
    },
    {
      title: "订单金额",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      align: "right",
      render: (amount) => (
        <span style={{ color: "#ff4d4f", fontWeight: "bold", fontSize: 16 }}>
          ¥{(amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: "订单状态",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 120,
      render: (status) => (
        <Tag color={orderStatusMap[status || 0]?.color}>
          {orderStatusMap[status || 0]?.label || "未知状态"}
        </Tag>
      ),
    },
    {
      title: "下单时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
      render: (time) => (
        <span style={{ color: "#666", fontSize: 12 }}>
          {formatDateTime(time)}
        </span>
      ),
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      key: "updateTime",
      width: 180,
      render: (time) => (
        <span style={{ color: "#666", fontSize: 12 }}>
          {formatDateTime(time)}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: any, record: Order) => (
        <Space size="small">
          {canAccept(record.orderStatus) && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleShowConfirm(record, "接单", 2)}
            >
              接单
            </Button>
          )}
          {canShip(record.orderStatus) && (
            <Button
              type="primary"
              icon={<TruckOutlined />}
              onClick={() => handleShowConfirm(record, "发货", 3)}
            >
              发货
            </Button>
          )}
          {canComplete(record.orderStatus) && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleShowConfirm(record, "完成", 4)}
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "" && order.orderStatus !== statusFilter) return false;
    if (orderNoKeyword && !order.orderNo?.includes(orderNoKeyword))
      return false;
    return true;
  });

  return (
    <div style={{ padding: 20, background: "#f5f5f5", minHeight: "100vh" }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 20 }}>
        <Col xs={24} sm={6} md={4}>
          <Select
            placeholder="订单状态筛选"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: "100%" }}
            options={[
              { label: "全部", value: "" },
              { label: "待接单", value: 1 },
              { label: "备货中", value: 2 },
              { label: "配送中", value: 3 },
              { label: "交易完成待评价", value: 4 },
              { label: "交易完成已评价", value: 5 },
              { label: "已取消", value: 0 },
            ]}
          />
        </Col>
        <Col xs={24} sm={10} md={6}>
          <Input
            placeholder="输入订单编号搜索"
            value={orderNoKeyword}
            onChange={(e) => setOrderNoKeyword(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={8} md={2}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            block
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey={(record) => record.orderId || record.orderNo || ""}
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
        bordered
      />

      <Modal
        title="确认操作"
        open={confirmModal.visible}
        onOk={handleConfirm}
        onCancel={() =>
          setConfirmModal({
            visible: false,
            order: null,
            action: "",
            nextStatus: 0,
          })
        }
      >
        {confirmModal.order && (
          <div>
            <p>
              确认要对订单 <strong>{confirmModal.order.orderNo}</strong>{" "}
              进行以下操作吗？
            </p>
            <p style={{ marginTop: 16, color: "#ff4d4f" }}>
              操作：<strong>{confirmModal.action}</strong>
            </p>
            <p style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
              当前状态：
              {orderStatusMap[confirmModal.order.orderStatus || 0]?.label}
              {" -> "}
              目标状态：{orderStatusMap[confirmModal.nextStatus]?.label}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;
