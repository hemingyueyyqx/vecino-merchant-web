// src/components/merchant/MassageCenter.tsx
import { useState } from "react";
import { Table, Button, Tag, Space, Card, Empty } from "antd";
import {
  BellOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckOutlined,
} from "@ant-design/icons";

// 消息类型枚举
const MESSAGE_TYPE = {
  order: { text: "订单消息", icon: ShoppingCartOutlined, color: "blue" },
  audit: { text: "审核消息", icon: FileTextOutlined, color: "orange" },
  system: { text: "系统消息", icon: BellOutlined, color: "purple" },
  coupon: { text: "优惠券消息", icon: CheckCircleOutlined, color: "green" },
};

// 消息状态枚举
const MESSAGE_STATUS = {
  unread: { text: "未读", color: "red" },
  read: { text: "已读", color: "gray" },
};

// 假消息数据
const mockMessages = [
  {
    id: "1",
    type: "order",
    title: "订单已支付",
    content: "您的订单【ORD20240115001】已成功支付，等待发货",
    time: "2024-01-15 14:30:25",
    status: "unread",
    relatedId: "ORD20240115001",
  },
  {
    id: "2",
    type: "audit",
    title: "商品审核通过",
    content: "您提交的商品【Apple iPhone 15 Pro】已审核通过，可以上架销售",
    time: "2024-01-15 10:20:15",
    status: "unread",
    relatedId: "SPU001",
  },
  {
    id: "3",
    type: "coupon",
    title: "优惠券审核通过",
    content: "您提交的优惠券【满100减20】已审核通过，可以启用",
    time: "2024-01-14 16:45:30",
    status: "read",
    relatedId: "COUPON001",
  },
  {
    id: "4",
    type: "order",
    title: "订单已发货",
    content: "您的订单【ORD20240114002】已发货，快递单号：SF1234567890",
    time: "2024-01-14 11:30:00",
    status: "read",
    relatedId: "ORD20240114002",
  },
  {
    id: "5",
    type: "system",
    title: "系统维护通知",
    content:
      "平台将于2024年1月16日00:00-02:00进行系统维护，期间可能影响部分功能",
    time: "2024-01-13 20:00:00",
    status: "read",
    relatedId: "",
  },
  {
    id: "6",
    type: "audit",
    title: "商品审核拒绝",
    content:
      "您提交的商品【Fake Product】审核未通过，原因：商品信息不符合平台规定",
    time: "2024-01-13 15:20:30",
    status: "read",
    relatedId: "SPU002",
  },
  {
    id: "7",
    type: "coupon",
    title: "优惠券审核拒绝",
    content:
      "您提交的优惠券【满50减50】审核未通过，原因：优惠力度过大，不符合平台规则",
    time: "2024-01-12 09:15:00",
    status: "read",
    relatedId: "COUPON002",
  },
  {
    id: "8",
    type: "order",
    title: "订单取消",
    content: "您的订单【ORD20240112001】已被用户取消",
    time: "2024-01-12 08:30:45",
    status: "read",
    relatedId: "ORD20240112001",
  },
];

export default function MassageCenter() {
  const [messages, setMessages] = useState(mockMessages);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 标记单个消息为已读
  const handleMarkAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: "read" } : msg)),
    );
  };

  // 批量标记为已读
  const handleBatchMarkAsRead = () => {
    if (selectedKeys.length === 0) {
      return;
    }
    setMessages((prev) =>
      prev.map((msg) =>
        selectedKeys.includes(msg.id) ? { ...msg, status: "read" } : msg,
      ),
    );
    setSelectedKeys([]);
  };

  // 标记全部为已读
  const handleMarkAllAsRead = () => {
    setMessages((prev) => prev.map((msg) => ({ ...msg, status: "read" })));
  };

  // 过滤消息
  const filteredMessages =
    activeTab === "all"
      ? messages
      : messages.filter((msg) => msg.type === activeTab);

  // 未读数量
  const unreadCount = messages.filter((msg) => msg.status === "unread").length;

  // 表格列定义
  const columns = [
    {
      title: "",
      dataIndex: "status",
      width: 60,
      render: (status: string) => {
        if (status === "unread") {
          return <Tag color="red">●</Tag>;
        }
        return <Tag color="gray">○</Tag>;
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 100,
      render: (type: string) => {
        const TypeIcon = MESSAGE_TYPE[type as keyof typeof MESSAGE_TYPE].icon;
        return (
          <Tag color={MESSAGE_TYPE[type as keyof typeof MESSAGE_TYPE].color}>
            <TypeIcon style={{ marginRight: 4 }} />
            {MESSAGE_TYPE[type as keyof typeof MESSAGE_TYPE].text}
          </Tag>
        );
      },
    },
    {
      title: "消息标题",
      dataIndex: "title",
      render: (title: string) => <strong>{title}</strong>,
    },
    {
      title: "消息内容",
      dataIndex: "content",
      ellipsis: true,
    },
    {
      title: "时间",
      dataIndex: "time",
      width: 160,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (status: string) => (
        <Tag
          color={MESSAGE_STATUS[status as keyof typeof MESSAGE_STATUS].color}
        >
          {MESSAGE_STATUS[status as keyof typeof MESSAGE_STATUS].text}
        </Tag>
      ),
    },
    {
      title: "操作",
      width: 100,
      render: (_: unknown, record: (typeof mockMessages)[0]) => (
        <Space>
          {record.status === "unread" && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleMarkAsRead(record.id)}
            >
              标记已读
            </Button>
          )}
          <Button type="link" icon={<EyeOutlined />}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  // 标签页配置
  const tabs = [
    { key: "all", label: "全部消息", count: messages.length },
    {
      key: "order",
      label: "订单消息",
      count: messages.filter((m) => m.type === "order").length,
    },
    {
      key: "audit",
      label: "审核消息",
      count: messages.filter((m) => m.type === "audit").length,
    },
    {
      key: "coupon",
      label: "优惠券消息",
      count: messages.filter((m) => m.type === "coupon").length,
    },
    {
      key: "system",
      label: "系统消息",
      count: messages.filter((m) => m.type === "system").length,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* 顶部统计卡片 */}
      <div style={{ marginBottom: 20 }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 40 }}>
              <div className="stat-item">
                <div className="stat-value">{messages.length}</div>
                <div className="stat-label">全部消息</div>
              </div>
              <div className="stat-item">
                <div className="stat-value highlight">{unreadCount}</div>
                <div className="stat-label">未读消息</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {messages.filter((m) => m.type === "order").length}
                </div>
                <div className="stat-label">订单消息</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {messages.filter((m) => m.type === "audit").length}
                </div>
                <div className="stat-label">审核消息</div>
              </div>
            </div>
            <Button type="primary" onClick={handleMarkAllAsRead}>
              全部标记为已读
            </Button>
          </div>
        </Card>
      </div>

      {/* 标签页切换 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              type={activeTab === tab.key ? "primary" : "default"}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </Space>
      </div>

      {/* 批量操作 */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="primary"
          onClick={handleBatchMarkAsRead}
          disabled={selectedKeys.length === 0}
        >
          批量标记已读 ({selectedKeys.length})
        </Button>
      </div>

      {/* 消息列表 */}
      {filteredMessages.length > 0 ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredMessages}
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: setSelectedKeys,
          }}
        />
      ) : (
        <Card>
          <Empty description="暂无消息" />
        </Card>
      )}

      {/* 样式 */}
      <style>{`
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1890ff;
        }
        .stat-value.highlight {
          color: #f5222d;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
