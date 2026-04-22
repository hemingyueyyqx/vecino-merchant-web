import { Table, Button, Tag, Space, Card, Select, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  EditOutlined,
  BlockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";

// 正确引入 Title
const { Title } = Typography;

// 商品 SPU 类型（完全贴合你的后端）
export interface GoodsItem {
  spuId: string; // 不展示
  shopId: string; // 不展示
  spuName: string;
  categoryName: string;
  price: number;
  stock: number;
  status: number; // 0下架 1上架
  createTime: string;
}

// 写死商品数据
const mockData: GoodsItem[] = [
  {
    spuId: "SPU001",
    shopId: "SHOP001",
    spuName: "纯牛奶 250ml",
    categoryName: "食品饮料",
    price: 3.5,
    stock: 120,
    status: 1,
    createTime: "2025-01-01 10:00:00",
  },
  {
    spuId: "SPU002",
    shopId: "SHOP001",
    spuName: "网红全麦面包",
    categoryName: "零食糕点",
    price: 12.8,
    stock: 56,
    status: 1,
    createTime: "2025-01-02 11:00:00",
  },
  {
    spuId: "SPU003",
    shopId: "SHOP001",
    spuName: "新鲜草莓礼盒",
    categoryName: "生鲜水果",
    price: 39.9,
    stock: 20,
    status: 0,
    createTime: "2025-01-03 09:30:00",
  },
  {
    spuId: "SPU004",
    shopId: "SHOP001",
    spuName: "矿泉水 550ml",
    categoryName: "食品饮料",
    price: 1.5,
    stock: 300,
    status: 1,
    createTime: "2025-01-04 14:20:00",
  },
];

const GoodsList = () => {
  const [goodsList] = useState<GoodsItem[]>(mockData);

  // 表格列
  const columns: ColumnsType<GoodsItem> = [
    {
      title: "商品名称",
      dataIndex: "spuName",
      key: "spuName",
      width: 220,
    },
    {
      title: "商品类目",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 140,
    },
    {
      title: "售价",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (p) => `¥${p.toFixed(2)}`,
    },
    {
      title: "库存",
      dataIndex: "stock",
      key: "stock",
      width: 100,
    },
    {
      title: "上架状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s) =>
        s === 1 ? (
          <Tag color="green">已上架</Tag>
        ) : (
          <Tag color="default">已下架</Tag>
        ),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 180,
    },
    {
      title: "操作",
      key: "action",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} size="small">
            查看
          </Button>
          <Button type="text" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          {record.status === 1 ? (
            <Button
              type="text"
              icon={<BlockOutlined />}
              size="small"
              style={{ color: "#faad14" }}
            >
              下架
            </Button>
          ) : (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              size="small"
              style={{ color: "#00b96b" }}
            >
              上架
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Title level={5}>商品管理列表</Title>
        <Button type="primary">+ 新增商品</Button>
      </div>

      {/* 筛选栏 */}
      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <Select
          placeholder="商品类目"
          style={{ width: 160 }}
          options={[
            { label: "食品饮料", value: "食品饮料" },
            { label: "生鲜水果", value: "生鲜水果" },
            { label: "零食糕点", value: "零食糕点" },
          ]}
        />
        <Select
          placeholder="上架状态"
          style={{ width: 140 }}
          options={[
            { label: "已上架", value: 1 },
            { label: "已下架", value: 0 },
          ]}
        />
      </div>

      <Table
        rowKey="spuId"
        columns={columns}
        dataSource={goodsList}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />
    </Card>
  );
};

export default GoodsList;
