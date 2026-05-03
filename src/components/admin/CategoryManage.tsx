import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getCategoryTree,
  addCategory,
  editCategory,
  deleteCategory,
} from "@/services/admin";
import type { ProductCategory } from "@/types/product";

export default function CategoryManage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryList, setCategoryList] = useState<ProductCategory[]>([]);
  const [modal, setModal] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProductCategory | null>(null);

  // 加载类目列表
  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategoryTree();
      setCategoryList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("获取类目失败", err);
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 提交表单：自动计算层级（严格两层）
  const handleSubmit = async () => {
    try {
      const data = form.getFieldsValue();
      // 核心规则：有父类目=2级，无父类目=1级
      const level = data.parentId === "0" ? 1 : 2;
      const submitData = { ...data, level };

      if (editData) {
        await editCategory({ ...submitData, id: editData.id });
      } else {
        await addCategory(submitData);
      }
      message.success("操作成功");
      setModal(false);
      fetchTree();
    } catch (err) {
      console.error("提交失败", err);
      message.error("提交失败");
    }
  };

  // 删除类目
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success("删除成功");
      fetchTree();
    } catch (err) {
      console.error("删除失败", err);
      message.error("删除失败");
    }
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // 编辑：回显数据（新增attrStandard回显）
  const handleEdit = (record: ProductCategory) => {
    setEditData(record);
    form.setFieldsValue({
      categoryName: record.categoryName,
      parentId: record.parentId,
      status: record.status,
      attrStandard: record.attrStandard, // 🔥 回显类目属性标准
    });
    setModal(true);
  };

  // 新增：初始化默认值
  const handleAdd = () => {
    setEditData(null);
    form.resetFields();
    // 默认顶级类目
    form.setFieldsValue({ parentId: "0" });
    setModal(true);
  };

  // 🔥 过滤出所有一级类目(level=1) 作为父类目选项
  const parentOptions = [
    { value: "0", label: "无（一级类目）" },
    ...categoryList
      .filter((item) => item.level === 1)
      .map((item) => ({
        value: item.id,
        label: item.categoryName,
      })),
  ];

  // 表格列（移除排序）
  const columns = [
    { title: "类目名称", dataIndex: "categoryName" },
    { title: "层级", dataIndex: "level" },
    { title: "类目属性标准", dataIndex: "attrStandard" },
    {
      title: "状态",
      dataIndex: "status",
      render: (s: 0 | 1) => (s ? "启用" : "禁用"),
    },
    {
      title: "操作",
      render: (_: unknown, record: ProductCategory) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 20 }}
        onClick={handleAdd}
      >
        新增类目
      </Button>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={categoryList}
        pagination={false}
      />

      <Modal
        open={modal}
        title={editData ? "编辑类目" : "新增类目"}
        onCancel={() => setModal(false)}
        onOk={handleSubmit}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {/* 类目名称 */}
          <Form.Item
            name="categoryName"
            label="类目名称"
            rules={[{ required: true, message: "请输入类目名称" }]}
          >
            <Input />
          </Form.Item>

          {/* 🔥 父类目选择：仅展示一级类目 */}
          <Form.Item name="parentId" label="父类目">
            <Select
              options={parentOptions}
              placeholder="请选择父类目"
              allowClear
            />
          </Form.Item>

          {/* 🔥 新增：类目属性标准 */}
          <Form.Item name="attrStandard" label="类目属性标准">
            <Input.TextArea rows={3} placeholder="请输入类目属性标准" />
          </Form.Item>

          {/* 状态 */}
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: "启用", value: 1 },
                { label: "禁用", value: 0 },
              ]}
            />
          </Form.Item>

          {/* 隐藏：自动计算的层级，无需用户操作 */}
          <Form.Item name="level" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
