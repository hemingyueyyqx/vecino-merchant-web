import { useEffect, useState } from "react";
import { Form, Input, Button, Select, message, Alert } from "antd";
import {
  ShopOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { applyShop, findShop } from "@/services/auth";
import type { ShopInfo } from "@/types/user";

const Apply = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [auditReason, setAuditReason] = useState("");
  // ✅ 修复1：定义严格的 TS 类型
  const [originalValues, setOriginalValues] = useState<ShopInfo | null>(null);

  const shopTypeOptions = [
    { label: "便利店", value: "convenience" },
    { label: "生鲜超市", value: "fresh" },
    { label: "药店", value: "pharmacy" },
    { label: "零食店", value: "snack" },
    { label: "其他", value: "other" },
  ];

  useEffect(() => {
    const loadShopInfo = async () => {
      try {
        const res = await findShop();
        const shop = res?.shopInfo;
        if (!shop) return;

        if (shop.status === 1) {
          setIsReject(true);
          setAuditReason(shop.auditReason || "未填写驳回原因");
          setOriginalValues(shop);
          form.setFieldsValue(shop);
        }
      } catch {
        console.log("未查询到店铺信息，全新入驻");
      }
    };
    loadShopInfo();
  }, [form]);

  // 提交函数（完整修复）
  const handleSubmit = async (values: ShopInfo) => {
    try {
      setLoading(true);

      // ✅ 修复2：增加类型守卫，确保 originalValues 是对象
      if (isReject && originalValues) {
        const hasChanged = Object.keys(values).some((key) => {
          return (
            values[key as keyof ShopInfo] !==
            originalValues[key as keyof ShopInfo]
          );
        });

        if (!hasChanged) {
          message.warning("请修改店铺信息后重新提交！");
          setLoading(false);
          return;
        }
      }

      let submitData: ShopInfo;
      // ✅ 修复3：解构前判断非空，彻底解决 spread 报错
      if (isReject && originalValues) {
        // 修改提交：合并原始字段 + 新表单值
        submitData = { ...originalValues, ...values };
      } else {
        // 新增提交
        submitData = values;
      }

      await applyShop(submitData);
      message.success(
        isReject ? "修改成功，重新提交审核！" : "申请提交成功，等待审核！",
      );
      navigate("/waitApply", { replace: true });
    } catch (error) {
      message.error((error as Error).message || "提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-container">
      <header className="register-header">
        <div className="header-left">
          <span className="brand-name">Vecino即时零售</span>
          <span className="divider">|</span>
          <span className="brand-subtitle">商家服务平台</span>
        </div>
      </header>

      <main className="apply-main">
        <div className="apply-form-wrapper">
          <div className="apply-tabs">
            <div className="apply-tab-active">商户入驻申请</div>
          </div>

          {isReject && (
            <Alert
              title="入驻申请已被驳回"
              description={auditReason}
              type="warning"
              showIcon
              style={{ marginBottom: 20 }}
            />
          )}

          <Form
            form={form}
            name="shop_apply"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            className="apply-form"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item
              name="shopName"
              label="店铺名称"
              rules={[
                { required: true, message: "店铺名称不能为空" },
                {
                  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_·-]{2,30}$/,
                  message: "格式不正确",
                },
              ]}
            >
              <Input
                prefix={<ShopOutlined />}
                placeholder="请输入店铺名称"
                maxLength={30}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="shopType"
              label="店铺类型"
              rules={[{ required: true, message: "店铺类型不能为空" }]}
            >
              <Select
                prefix={<TagsOutlined />}
                placeholder="请选择店铺类型"
                allowClear
                options={shopTypeOptions}
              />
            </Form.Item>

            <Form.Item
              name="businessLicense"
              label="营业执照注册号"
              rules={[
                { required: true, message: "不能为空" },
                { pattern: /^[A-Z0-9]{6,20}$/, message: "格式不正确" },
              ]}
            >
              <Input
                prefix={<FileTextOutlined />}
                placeholder="请输入"
                maxLength={20}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="legalPerson"
              label="经营者/法定代表人"
              rules={[
                { required: true, message: "不能为空" },
                {
                  pattern: /^[\u4e00-\u9fa5]{2,10}$/,
                  message: "请输入中文姓名",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="法人姓名"
                maxLength={10}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="店铺地址"
              rules={[
                { required: true, message: "店铺地址不能为空" },
                {
                  pattern: /^[\u4e00-\u9fa5\w\s\-_·，、]{5,100}$/,
                  message: "格式不正确",
                },
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="详细地址"
                maxLength={100}
                showCount
              />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 18, offset: 6 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="apply-button"
              >
                {isReject ? "修改并重新提交" : "提交入驻申请"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Apply;
