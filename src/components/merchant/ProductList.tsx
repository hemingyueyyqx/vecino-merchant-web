import { useState, useEffect, useCallback } from "react";
import { Table, Button, Input, Space, message, Modal, Form } from "antd";
import type { Key } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getSpuList,
  batchUpdateSpuStatus,
  deleteSpu,
  getSkuList,
} from "@/services/business";
import type {
  ProductSpu,
  ProductSku,
  MerchantSpuParams,
  PageResult,
} from "@/types/product";

export default function ProductList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [spuList, setSpuList] = useState<ProductSpu[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [skuModal, setSkuModal] = useState<boolean>(false);
  const [skuList, setSkuList] = useState<ProductSku[]>([]);

  // ✅ 修复3：useCallback 缓存函数，解决 useEffect 依赖警告
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: MerchantSpuParams = {
        page,
        size,
        spuName: form.getFieldValue("spuName"),
      };
      // ✅ 修复1/2：接口返回正确的 PageResult 类型，直接解构 data
      const res: PageResult<ProductSpu> = await getSpuList(params);
      setSpuList(res.list);
      setTotal(res.total);
    } catch (err) {
      console.error("获取商品列表失败", err);
    } finally {
      setLoading(false);
    }
  }, [page, size, form]);

  // 查看SKU
  const handleViewSku = async (spuId: string) => {
    try {
      const res = await getSkuList(spuId);
      setSkuList(res);
      setSkuModal(true);
    } catch (err) {
      console.error("获取SKU失败", err);
    }
  };

  // 批量上下架
  const handleBatchStatus = async (status: 0 | 1) => {
    if (selectedRowKeys.length === 0) return message.warning("请选择商品");
    try {
      const spuIds = selectedRowKeys.map((key) => String(key));
      await batchUpdateSpuStatus({ spuIds, status });
      message.success("操作成功");
      fetchList();
    } catch (err) {
      console.error("批量操作失败", err);
    }
  };

  // 删除商品
  const handleDelete = async (id: string) => {
    try {
      await deleteSpu(id);
      message.success("删除成功");
      fetchList();
    } catch (err) {
      console.error("删除失败", err);
    }
  };

  // ✅ 修复3：依赖项完整，无ESLint警告
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const columns = [
    {
      title: "商品主图",
      dataIndex: "mainImage",
      render: (img: string) => <img src={img} width={50} alt="" />,
    },
    { title: "商品名称", dataIndex: "spuName" },
    { title: "归属类目", dataIndex: "categoryName" },
    {
      title: "上下架状态",
      dataIndex: "status",
      render: (s: 0 | 1) => (s ? "上架" : "下架"),
    },
    {
      title: "审核状态",
      dataIndex: "auditStatus",
      render: (s: 0 | 1 | 2) => ({ 0: "待审核", 1: "通过", 2: "驳回" })[s],
    },
    { title: "创建时间", dataIndex: "createTime" },
    {
      title: "操作",
      render: (_: unknown, record: ProductSpu) => (
        <Space>
          <Button type="link" onClick={() => handleViewSku(record.id)}>
            查看SKU
          </Button>
          <Button danger type="text" onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="spuName">
          <Input placeholder="商品名称" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchList}>
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button icon={<PlusOutlined />}>新增商品</Button>
        </Form.Item>
      </Form>

      <Space style={{ marginBottom: 15 }}>
        <Button onClick={() => handleBatchStatus(1)}>批量上架</Button>
        <Button onClick={() => handleBatchStatus(0)}>批量下架</Button>
      </Space>

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

      <Modal
        open={skuModal}
        title="商品规格"
        onCancel={() => setSkuModal(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={skuList}
          rowKey="id"
          columns={[
            { title: "规格", dataIndex: "specAttr" },
            { title: "价格", dataIndex: "price" },
            { title: "库存", dataIndex: "stockNum" },
            { title: "预警库存", dataIndex: "warnStock" },
          ]}
        />
      </Modal>
    </div>
  );
}
