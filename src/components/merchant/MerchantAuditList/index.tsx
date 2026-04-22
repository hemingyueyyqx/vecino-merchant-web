import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Card,
  message,
  Modal,
  Descriptions,
  Form,
  Input,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  getAllMerchantsAndShop,
  auditPass,
  auditReject,
} from "@/services/business";
import { type MerchantShop } from "@/types/user";
import "./index.css";

const { Title } = Typography;

const MerchantAuditList = () => {
  const [data, setData] = useState<MerchantShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MerchantShop | null>(null);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [form] = Form.useForm();

  // 加载列表
  const fetchList = async () => {
    setLoading(true);
    const res = await getAllMerchantsAndShop();
    setData(res);
    setLoading(false);
  };

  // 修复 eslint 警告
  useEffect(() => {
    const init = async () => {
      await fetchList();
    };
    init();
  }, []);

  // 查看详情
  const showDetail = (record: MerchantShop) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 审核通过 —— 传整个 record 对象
  const handlePass = async (record: MerchantShop) => {
    console.log("对应行表格", record);
    
    Modal.confirm({
      title: "确认通过",
      content: "确定要通过该商家入驻申请吗？",
      onOk: async () => {
        // 重写字段：shopId → id
        const submitData = {
          ...record,
          id: record.shopId,
        };
        await auditPass(submitData);
        message.success("审核成功");
        fetchList();
      },
    });
  };

  // 驳回弹窗
  const showReject = (record: MerchantShop) => {
    setCurrentRecord(record);
    form.setFieldsValue({ auditReason: "" });
    setRejectVisible(true);
  };

  // 提交驳回 —— 把驳回理由放进对象，整体传给后端
  const handleRejectOk = async () => {
    const values = await form.validateFields();
    if (!currentRecord) return;

    const submitData = {
      ...currentRecord,
      id: currentRecord.shopId, //  shopId → id
      auditReason: values.auditReason,
    };
    console.log("对应行表格", submitData);

    await auditReject(submitData);
    message.success("已驳回");
    setRejectVisible(false);
    fetchList();
  };

  // 表格列
  const columns: ColumnsType<MerchantShop> = [
    { title: "店铺名称", dataIndex: "shopName", width: 170 },
    // { title: "商家账号", dataIndex: "account", width: 130 },
    // { title: "联系人", dataIndex: "nickname", width: 100 },
    { title: "法人", dataIndex: "legalPerson", width: 100 },
    // { title: "电话", dataIndex: "phone", width: 140 },

    // { title: "地址", dataIndex: "address", ellipsis: true, width: 200 },
    { title: "营业执照注册号", dataIndex: "businessLicense", width: 150 },
    {
      title: "店铺类型",
      dataIndex: "shopType",
      width: 120,
      render: (t) =>
        t === "convenience" ? "便利店" : t === "fresh" ? "生鲜" : t,
    },
    {
      title: "申请时间",
      dataIndex: "updateTime",
      width: 120,
      render: (time: string) => {
        if (!time) return "-";
        return time.split("T")[0];
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (s) => {
        if (s === 0) return <Tag color="green">已通过</Tag>;
        if (s === 1) return <Tag color="red">已驳回</Tag>;
        if (s === 2) return <Tag color="orange">待审核</Tag>;
        return <Tag>未知</Tag>;
      },
    },
    {
      title: "操作",
      width: 260,
      render: (_, r) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDetail(r)}
          >
            详情
          </Button>
          {r.status === 2 && (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#00b96b" }}
                onClick={() => handlePass(r)}
              >
                通过
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                style={{ color: "#ff4d4f" }}
                onClick={() => showReject(r)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="audit-page">
      <Card className="card">
        <div className="header">
          <Title level={5}>商家入驻审核</Title>
        </div>

        <Table
          rowKey={(r) => r.shopId}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
        />

        {/* 详情弹窗 */}
        <Modal
          open={detailVisible}
          title="店铺详情"
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={600}
        >
          {currentRecord && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="店铺名称">
                {currentRecord.shopName}
              </Descriptions.Item>
              <Descriptions.Item label="商家账号">
                {currentRecord.account}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">
                {currentRecord.nickname}
              </Descriptions.Item>
              <Descriptions.Item label="法人">
                {currentRecord.legalPerson}
              </Descriptions.Item>
              <Descriptions.Item label="电话">
                {currentRecord.phone}
              </Descriptions.Item>
              <Descriptions.Item label="店铺类型">
                {currentRecord.shopType === "convenience" ? "便利店" : "生鲜"}
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                {currentRecord.address}
              </Descriptions.Item>
              <Descriptions.Item label="营业执照">
                {currentRecord.businessLicense}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态">
                {currentRecord.status === 0
                  ? "已通过"
                  : currentRecord.status === 1
                    ? "已驳回"
                    : "待审核"}
              </Descriptions.Item>
              {
                <Descriptions.Item label="审核意见">
                  {currentRecord.auditReason || "暂无"}
                </Descriptions.Item>
              }
            </Descriptions>
          )}
        </Modal>

        {/* 驳回弹窗 */}
        <Modal
          open={rejectVisible}
          title="驳回申请"
          onCancel={() => setRejectVisible(false)}
          onOk={handleRejectOk}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="auditReason"
              label="驳回理由"
              rules={[{ required: true, message: "请输入驳回理由" }]}
            >
              <Input.TextArea rows={4} placeholder="请输入驳回原因" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default MerchantAuditList;
