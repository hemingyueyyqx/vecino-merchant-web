import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Modal,
  Form,
  InputNumber,
  Card,
  Row,
  Col,
  Tag,
  Select,
} from "antd";
import type { Key } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import type { ProductSpu, ProductSku } from "@/types/product";
import {
  getSpuList,
  batchUpdateSpuStatus,
  // deleteSpu,
  addSpu,
  editSpu,
  updateSpuStatus,
  updateSkuInfo,
} from "@/services/business";

// ===================== 商品列表主页面 =====================
export default function ProductList() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [spuList, setSpuList] = useState<ProductSpu[]>([]);
  // Deleted:const [total, setTotal] = useState<number>(0);
  // Deleted:const [page, setPage] = useState<number>(1);
  // Deleted:const [size, setSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // 弹窗状态
  const [skuModal, setSkuModal] = useState<boolean>(false);
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [createModal, setCreateModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);

  // 当前操作商品
  const [currentSpu, setCurrentSpu] = useState<ProductSpu | null>(null);
  // SKU 编辑相关状态
  const [skuEditModal, setSkuEditModal] = useState<boolean>(false);
  const [currentSku, setCurrentSku] = useState<ProductSku | null>(null);

  // 获取商品列表（真实接口，无分页）
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const searchName = form.getFieldValue("spuName");
      const status = form.getFieldValue("spuStatus");
      const auditStatus = form.getFieldValue("auditStatus");

      const params: any = {};
      if (searchName) params.spuName = searchName;
      if (status !== undefined && status !== null) params.spuStatus = status;
      if (auditStatus !== undefined && auditStatus !== null)
        params.auditStatus = auditStatus;

      const res = await getSpuList(params);
      setSpuList(res || []);
      // Deleted:setTotal(res.data.total || 0);
    } catch (err) {
      console.error("获取商品列表失败", err);
      message.error("获取商品列表失败");
    } finally {
      setLoading(false);
    }
  }, [form]);

  // 查看SKU
  const handleViewSku = (spu: ProductSpu) => {
    setCurrentSpu(spu);
    setSkuModal(true);
  };
  // 编辑 SKU
  const handleEditSku = (sku: ProductSku) => {
    setCurrentSku(sku);
    setSkuEditModal(true);
  };

  // 切换 SKU 状态（启用/禁用）
  const handleToggleSkuStatus = (sku: ProductSku) => {
    const newStatus = sku.status === 1 ? 0 : 1;
    Modal.confirm({
      title: "确认操作",
      content: `确定要${newStatus === 1 ? "启用" : "禁用"}该规格吗？`,
      onOk: async () => {
        try {
          await updateSkuInfo({
            id: sku.id!,
            spuId: sku.spuId,
            specAttr: sku.specAttr,
            price: sku.price,
            stockNum: sku.stockNum,
            warnStock: sku.warnStock,
            status: newStatus,
          });
          message.success(`${newStatus === 1 ? "启用" : "禁用"}成功`);
          fetchList();
          setSkuModal(false);
        } catch (err) {
          message.error("操作失败");
        }
      },
    });
  };

  // 查看详情
  const handleViewDetail = (spu: ProductSpu) => {
    setCurrentSpu(spu);
    setDetailModal(true);
  };

  // 编辑商品
  const handleEdit = (spu: ProductSpu) => {
    setCurrentSpu(spu);
    setEditModal(true);
  };

  // 批量上下架
  const handleBatchStatus = async (status: 0 | 1) => {
    if (selectedRowKeys.length === 0) return message.warning("请选择商品");
    if (status === 1) {
      const selectedSpus = spuList.filter((spu) =>
        selectedRowKeys.includes(spu.spuId!),
      );
      const notAuditedSpus = selectedSpus.filter(
        (spu) => spu.auditStatus !== 1,
      );

      if (notAuditedSpus.length > 0) {
        message.warning(
          `选中的商品中有 ${notAuditedSpus.length} 个未通过审核，无法批量上架`,
        );
        return;
      }
    }

    try {
      await batchUpdateSpuStatus({
        spuIds: selectedRowKeys.map((key) => String(key)),
        status,
      });
      message.success(`批量${status === 1 ? "上架" : "下架"}成功`);
      fetchList();
      setSelectedRowKeys([]);
    } catch (err) {
      message.error("批量操作失败");
    }
  };

  // 单个上下架
  const handleSingleStatus = async (spuId: string, currentStatus: 0 | 1,auditStatus: 0 | 1) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    if (newStatus === 1 && auditStatus !== 1) {
      message.warning("只有审核通过的商品才能上架");
      return;
    }

    try {
      const data = { id: spuId, status: newStatus };
      await editSpu(data);
      message.success(`${newStatus === 1 ? "上架" : "下架"}成功`);
      fetchList();
    } catch (err) {
      message.error("操作失败");
    }
  };

  // 删除商品
  // const handleDelete = async (id: string) => {
  //   Modal.confirm({
  //     title: "确认删除",
  //     content: "删除后无法恢复，是否继续？",
  //     onOk: async () => {
  //       try {
  //         await deleteSpu(id);
  //         message.success("删除成功");
  //         fetchList();
  //       } catch (err) {
  //         message.error("删除失败");
  //       }
  //     },
  //   });
  // };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 表格列
  const columns = [
    {
      title: "商品主图",
      dataIndex: "mainImage",
      render: (img: string) => <img src={img} width={50} alt="商品图" />,
    },
    { title: "商品名称", dataIndex: "spuName" },
    {
      title: "上下架状态",
      dataIndex: "spuStatus",
      render: (s: 0 | 1) => (s ? "✅ 上架" : "❌ 下架"),
    },
    {
      title: "审核状态",
      dataIndex: "auditStatus",
      render: (s: 0 | 1 | 2) =>
        ({ 0: "待审核", 1: "✅ 通过", 2: "❌ 驳回" })[s],
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      render: (time: string) => (time ? time.split("T")[0] : "-"),
    },
    {
      title: "操作",
      render: (_: unknown, record: ProductSpu) => (
        <Space size="small">
          <Button type="link" onClick={() => handleViewSku(record)}>
            查看SKU
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button
            type="link"
            onClick={() => handleSingleStatus(record.spuId!, record.spuStatus!,record.auditStatus!)}
          >
            {record.spuStatus === 1 ? "下架" : "上架"}
          </Button>
          {/* <Button
            danger
            type="text"
            onClick={() => handleDelete(record.spuId!)}
          >
            删除
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* 搜索栏 */}
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="spuName">
          <Input placeholder="商品名称搜索" />
        </Form.Item>
        <Form.Item name="spuStatus">
          <Select placeholder="上下架状态" allowClear style={{ width: 120 }}>
            <Select.Option value={1}>上架</Select.Option>
            <Select.Option value={0}>下架</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="auditStatus">
          <Select placeholder="审核状态" allowClear style={{ width: 120 }}>
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>通过</Select.Option>
            <Select.Option value={2}>驳回</Select.Option>
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
            onClick={() => setCreateModal(true)}
          >
            新增商品
          </Button>
        </Form.Item>
      </Form>

      {/* 批量操作 */}
      <Space style={{ marginBottom: 15 }}>
        <Button onClick={() => handleBatchStatus(1)}>批量上架</Button>
        <Button onClick={() => handleBatchStatus(0)}>批量下架</Button>
      </Space>

      {/* 商品列表表格（无分页） */}
      <Table
        rowKey="spuId"
        loading={loading}
        columns={columns}
        dataSource={spuList}
        // Deleted:pagination={{ current: page, pageSize: size, total }}
        pagination={false}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        // Deleted:onChange={(p) => {
        // Deleted:  setPage(p.current!);
        // Deleted:  setSize(p.pageSize!);
        // Deleted:}}
      />

      {/* 1. SKU弹窗 + 库存预警提示 */}
      <Modal
        open={skuModal}
        title={`${currentSpu?.spuName} - 规格列表`}
        onCancel={() => setSkuModal(false)}
        footer={null}
        width={900}
      >
        <Table
          dataSource={currentSpu?.skuList || []}
          rowKey="id"
          columns={[
            {
              title: "规格属性",
              dataIndex: "specAttr",
              render: (text, record: ProductSku) => (
                <span
                  style={{
                    color:
                      (record.stockNum || 0) < (record.warnStock || 0)
                        ? "#ff4d4f"
                        : "#000",
                  }}
                >
                  {text}
                  {(record.stockNum || 0) < (record.warnStock || 0) && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      ⚠️库存不足
                    </Tag>
                  )}
                </span>
              ),
            },
            { title: "售价(元)", dataIndex: "price" },
            {
              title: "库存",
              dataIndex: "stockNum",
              render: (text, record: ProductSku) => (
                <span
                  style={{
                    color:
                      (record.stockNum || 0) < (record.warnStock || 0)
                        ? "#ff4d4f"
                        : "#000",
                    fontWeight:
                      (record.stockNum || 0) < (record.warnStock || 0)
                        ? "bold"
                        : "normal",
                  }}
                >
                  {text}
                </span>
              ),
            },
            { title: "预警库存", dataIndex: "warnStock" },
            {
              title: "状态",
              dataIndex: "status",
              render: (s: 0 | 1) => (
                <Tag color={s === 1 ? "green" : "red"}>
                  {s === 1 ? "启用" : "禁用"}
                </Tag>
              ),
            },
            {
              title: "操作",
              render: (_, record: ProductSku) => (
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleEditSku(record)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleToggleSkuStatus(record)}
                  >
                    {record.status === 1 ? "禁用" : "启用"}
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Modal>
      {/* SKU 编辑弹窗 */}
      <SkuEditModal
        visible={skuEditModal}
        onClose={() => setSkuEditModal(false)}
        onSuccess={() => {
          setSkuEditModal(false);
          fetchList();
        }}
        skuData={currentSku}
        spuId={currentSpu?.spuId}
        onCloseSkuModal={() => setSkuModal(false)}
      />

      {/* 2. 商品详情弹窗 + SKU库存预警 */}
      <Modal
        open={detailModal}
        title="商品详情"
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
                </p>
                <p>
                  <b>创建时间：</b>
                  {currentSpu.createTime
                    ? currentSpu.createTime.split("T")[0]
                    : "-"}
                </p>
                <p>
                  <b>状态：</b>
                  {currentSpu.spuStatus ? "上架" : "下架"}
                </p>
                <p>
                  <b>审核状态：</b>
                  {
                    { 0: "待审核", 1: "通过", 2: "驳回" }[
                      currentSpu.auditStatus!
                    ]
                  }
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
                dataSource={currentSpu.skuList || []}
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
                            (record.stockNum || 0) < (record.warnStock || 0)
                              ? "#ff4d4f"
                              : "#000",
                        }}
                      >
                        {text}
                        {(record.stockNum || 0) < (record.warnStock || 0) && (
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
                            (record.stockNum || 0) < (record.warnStock || 0)
                              ? "#ff4d4f"
                              : "#000",
                          fontWeight: "bold",
                        }}
                      >
                        {text}
                      </span>
                    ),
                  },
                  { title: "预警库存", dataIndex: "warnStock" },
                ]}
              />
            </div>
          </Card>
        )}
      </Modal>

      {/* 3. 新增商品弹窗 */}
      <CreateGoodsModal
        visible={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={fetchList}
      />

      {/* 4. 编辑商品弹窗 */}
      {currentSpu && (
        <EditGoodsModal
          visible={editModal}
          onClose={() => setEditModal(false)}
          onSuccess={fetchList}
          spuData={currentSpu}
        />
      )}
    </div>
  );
}

// ===================== 新增商品弹窗 =====================
interface CreateGoodsProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const CreateGoodsModal: React.FC<CreateGoodsProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [aiLoading, setAiLoading] = useState(false);
  const [skuList, setSkuList] = useState<ProductSku[]>([
    {
      specAttr: "",
      price: 0,
      stockNum: 0,
      warnStock: 10,
    },
  ]);

  // AI标题优化模拟
  const handleAiOptimize = () => {
    const name = form.getFieldValue("spuName");
    if (!name) return message.warning("请输入商品名称");
    setAiLoading(true);
    setTimeout(() => {
      form.setFieldValue("spuName", `${name} 正品保障 品质优选`);
      setAiLoading(false);
      message.success("AI标题优化成功");
    }, 800);
  };

  // 提交新增
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const spuData: Partial<ProductSpu> = {
        spuName: values.spuName,
        mainImage: values.mainImage,
        detail: values.detail,
        skuList: skuList.map((sku) => ({
          specAttr: sku.specAttr,
          price: sku.price,
          stockNum: sku.stockNum,
          warnStock: sku.warnStock,
        })),
      };

      await addSpu(spuData);
      message.success("商品新增成功");
      onSuccess();
      onClose();
      form.resetFields();
      setSkuList([
        {
          specAttr: "",
          price: 0,
          stockNum: 0,
          warnStock: 10,
        },
      ]);
    } catch (err) {
      message.error("商品新增失败");
    }
  };

  return (
    <Modal
      open={visible}
      title="新增商品（SPU建档）"
      onCancel={onClose}
      onOk={handleSubmit}
      width={900}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="商品主图"
          name="mainImage"
          rules={[{ required: true, message: "请输入商品主图链接" }]}
        >
          <Input placeholder="输入图片链接" />
        </Form.Item>
        <Form.Item
          label="商品名称"
          name="spuName"
          rules={[{ required: true, message: "请输入商品名称" }]}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input placeholder="请输入商品名称" />
            <Button loading={aiLoading} onClick={handleAiOptimize}>
              AI优化标题
            </Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item label="商品详情" name="detail">
          <Input.TextArea rows={3} placeholder="请输入商品详情描述" />
        </Form.Item>
        <Form.Item label="SKU规格管理（批量添加）">
          <Button
            type="dashed"
            onClick={() =>
              setSkuList([
                ...skuList,
                {
                  id: Date.now().toString(),
                  specAttr: "",
                  price: 0,
                  stockNum: 0,
                  warnStock: 10,
                },
              ])
            }
            style={{ marginBottom: 10 }}
          >
            新增SKU行
          </Button>
          <Table
            dataSource={skuList}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: "规格属性",
                render: (_, r) => (
                  <Input
                    value={r.specAttr}
                    onChange={(e) =>
                      setSkuList(
                        skuList.map((i) =>
                          i.id === r.id
                            ? { ...i, specAttr: e.target.value }
                            : i,
                        ),
                      )
                    }
                    placeholder="请输入规格属性"
                  />
                ),
              },
              {
                title: "价格",
                render: (_, r) => (
                  <InputNumber
                    value={r.price}
                    min={0}
                    onChange={(v) =>
                      setSkuList(
                        skuList.map((i) =>
                          i.id === r.id ? { ...i, price: v } : i,
                        ),
                      )
                    }
                  />
                ),
              },
              {
                title: "库存",
                render: (_, r) => (
                  <InputNumber
                    value={r.stockNum}
                    min={0}
                    onChange={(v) =>
                      setSkuList(
                        skuList.map((i) =>
                          i.id === r.id ? { ...i, stockNum: v } : i,
                        ),
                      )
                    }
                  />
                ),
              },
              {
                title: "预警库存",
                render: (_, r) => (
                  <InputNumber
                    value={r.warnStock}
                    min={1}
                    onChange={(v) =>
                      setSkuList(
                        skuList.map((i) =>
                          i.id === r.id ? { ...i, warnStock: v } : i,
                        ),
                      )
                    }
                  />
                ),
              },
              {
                title: "操作",
                render: (_, r) => (
                  <Button
                    danger
                    onClick={() =>
                      setSkuList(skuList.filter((i) => i.id !== r.id))
                    }
                  >
                    删除
                  </Button>
                ),
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ===================== 编辑商品弹窗 =====================
interface EditGoodsProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  spuData: ProductSpu;
}
const EditGoodsModal: React.FC<EditGoodsProps> = ({
  visible,
  onClose,
  onSuccess,
  spuData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && spuData) {
      form.setFieldsValue({
        spuName: spuData.spuName,
        mainImage: spuData.mainImage,
        detail: spuData.detail,
      });
    }
  }, [visible, spuData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        id: spuData.spuId,
        spuName: values.spuName,
        mainImage: values.mainImage,
        detail: values.detail,
        auditStatus: values.auditStatus,
        auditRemark: values.auditRemark,
        status: values.status,
      };

      await editSpu(updateData);
      message.success("编辑成功");
      onSuccess();
      onClose();
    } catch (err) {
      message.error("编辑失败");
    }
  };

  return (
    <Modal
      open={visible}
      title="编辑商品"
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="商品名称"
          name="spuName"
          rules={[{ required: true, message: "请输入商品名称" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="商品主图" name="mainImage">
          <Input placeholder="输入图片链接" />
        </Form.Item>
        <Form.Item label="商品详情" name="detail">
          <Input.TextArea rows={3} placeholder="请输入商品详情描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
// ===================== SKU 编辑弹窗 =====================
interface SkuEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  skuData: ProductSku | null;
  spuId?: string;
  onCloseSkuModal?: () => void;
}

const SkuEditModal: React.FC<SkuEditModalProps> = ({
  visible,
  onClose,
  onSuccess,
  skuData,
  spuId,
  onCloseSkuModal,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && skuData) {
      form.setFieldsValue({
        specAttr: skuData.specAttr,
        price: skuData.price,
        stockNum: skuData.stockNum,
        warnStock: skuData.warnStock,
      });
    }
  }, [visible, skuData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!skuData?.id) {
        message.error("SKU ID 不存在");
        return;
      }

      const updateData = {
        id: skuData.id,
        spuId: spuId,
        specAttr: values.specAttr,
        price: values.price,
        stockNum: values.stockNum,
        warnStock: values.warnStock,
      };

      await updateSkuInfo(updateData);
      message.success("SKU 编辑成功");
      onSuccess();
      if (onCloseSkuModal) {
        onCloseSkuModal();
      }
      onClose();    
    } catch (err) {
      console.error("SKU 编辑失败", err);
      message.error("SKU 编辑失败");
    }
  };

  return (
    <Modal
      open={visible}
      title="编辑 SKU 规格"
      onCancel={onClose}
      onOk={handleSubmit}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="规格属性"
          name="specAttr"
          rules={[{ required: true, message: "请输入规格属性" }]}
        >
          <Input placeholder="例如：色号01粉瓷白" />
        </Form.Item>
        <Form.Item
          label="售价（元）"
          name="price"
          rules={[
            { required: true, message: "请输入价格" },
            { type: "number", min: 0, message: "价格不能小于0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            precision={2}
            placeholder="请输入价格"
          />
        </Form.Item>
        <Form.Item
          label="库存数量"
          name="stockNum"
          rules={[
            { required: true, message: "请输入库存数量" },
            { type: "number", min: 0, message: "库存不能小于0" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="请输入库存数量"
          />
        </Form.Item>
        <Form.Item
          label="预警库存"
          name="warnStock"
          rules={[
            { required: true, message: "请输入预警库存" },
            { type: "number", min: 1, message: "预警库存至少为1" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={1}
            placeholder="当库存低于此值时预警"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
