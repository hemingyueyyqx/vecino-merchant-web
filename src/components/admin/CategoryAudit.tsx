import { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getAuditList, auditPass, auditReject } from "@/services/admin";
import type { ProductCategoryAudit, AdminAuditParams } from "@/types/product";

// 🔥 删除弃用的 Option 解构
export default function CategoryAudit() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ProductCategoryAudit[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [auditModal, setAuditModal] = useState<boolean>(false);
  const [currentAudit, setCurrentAudit] = useState<ProductCategoryAudit | null>(
    null,
  );

  // ✅ 修复：用 useCallback 缓存函数，解决依赖警告
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminAuditParams = {
        page,
        size: 10,
        ...form.getFieldsValue(),
      };
      const res = await getAuditList(params);
      setList(res.list);
      setTotal(res.total);
    } catch (err) {
      console.error("获取审核列表失败", err);
    } finally {
      setLoading(false);
    }
  }, [page, form]); // 依赖项：page + form

  // 审核操作
  const handleAudit = async (status: 1 | 2) => {
    if (!currentAudit) return;
    try {
      const params = {
        auditId: currentAudit.id,
        auditRemark: form.getFieldValue("auditRemark") || "",
      };
      if (status === 1)
        await auditPass({
          ...params,
          spuId: currentAudit.spuId,
          newCategoryId: currentAudit.newCategoryId,
        });
      else await auditReject(params);
      message.success("审核完成");
      setAuditModal(false);
      fetchList();
    } catch (err) {
      console.error("审核失败", err);
    }
  };

  // ✅ 修复：依赖项改为 fetchList，无 ESLint 警告
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const columns = [
    { title: "商品名称", dataIndex: "spuName" },
    { title: "原类目", dataIndex: "oldCategoryName" },
    { title: "申请类目", dataIndex: "newCategoryName" },
    { title: "申请时间", dataIndex: "createTime" },
    {
      title: "审核状态",
      dataIndex: "auditStatus",
      render: (s: 0 | 1 | 2) => ({ 0: "待审核", 1: "通过", 2: "驳回" })[s],
    },
    {
      title: "操作",
      render: (_: unknown, record: ProductCategoryAudit) =>
        record.auditStatus === 0 && (
          <Button
            type="primary"
            onClick={() => {
              setCurrentAudit(record);
              setAuditModal(true);
            }}
          >
            审核
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Form form={form} layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item name="spuName">
          <Input placeholder="商品名称" />
        </Form.Item>
        <Form.Item name="auditStatus">
          {/* 🔥 修复：使用 Select.Option 替代弃用语法 */}
          <Select placeholder="审核状态">
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
      </Form>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={{ current: page, total }}
        onChange={(p) => setPage(p.current!)}
      />

      <Modal
        open={auditModal}
        title="类目审核"
        onCancel={() => setAuditModal(false)}
        footer={[
          <Button onClick={() => handleAudit(1)} type="primary">
            通过
          </Button>,
          <Button danger onClick={() => handleAudit(2)}>
            驳回
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="auditRemark" label="审核意见">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
