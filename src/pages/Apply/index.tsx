import { useState } from "react";
import { Form, Input, Button, Select, message } from "antd";
import {
  ShopOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { applyShop } from "@/services/auth";
import type { ShopInfo } from "@/types/user";

// 移除 Option 导入（已废弃）

const Apply = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 店铺类型选项（格式适配 Select 的 options 属性）
  const shopTypeOptions = [
    { label: "便利店", value: "convenience" },
    { label: "生鲜超市", value: "fresh" },
    { label: "药店", value: "pharmacy" },
    { label: "零食店", value: "snack" },
    { label: "其他", value: "other" },
  ];

  // 提交入驻申请
  const handleSubmit = async (values: ShopInfo) => {
    try {
        setLoading(true);
        // const shop: ShopInfo = {
        //   status: 2,
        //   ...values,
        // };
      const res = await applyShop(values);
      if (res === 200) {
        message.success("入驻申请提交成功，等待审核！");
        form.resetFields();
          // 提交成功后跳转商户页（或登录页，根据业务调整）
        //   应该跳转到得审核界面
        navigate("/waitApply", { replace: true });
      }
    } catch (error) {
      console.error("入驻申请提交失败:", error);
      message.error((error as Error).message || "提交失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-container">
      {/* 头部（复用原有样式） */}
      <header className="register-header">
        <div className="header-left">
          <span className="brand-name">Vecino即时零售</span>
          <span className="divider">|</span>
          <span className="brand-subtitle">商家服务平台</span>
        </div>
      </header>

      {/* 入驻表单主体 */}
      <main className="apply-main">
        <div className="apply-form-wrapper">
          <div className="apply-tabs">
            <div className="apply-tab-active">商户入驻申请</div>
          </div>

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
            {/* 店铺名称 */}
            <Form.Item
              name="shopName"
                label="店铺名称"
              rules={[
                { required: true, message: "店铺名称不能为空", whitespace: true },
                {
                  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_·-]{2,30}$/,
                  message: "2-30位，支持中文、数字、字母、下划线、·、-",
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

            {/* 店铺类型（核心修改：移除 Option 子组件，改用 options 属性） */}
            <Form.Item
              name="shopType"
              label="店铺类型"
              rules={[{ required: true, message: "店铺类型不能为空" }]}
            >
              <Select
                prefix={<TagsOutlined />}
                placeholder="请选择店铺类型"
                allowClear
                options={shopTypeOptions} // 直接传入选项数组
              />
            </Form.Item>

            {/* 营业执照编号 */}
            <Form.Item
              name="businessLicense"
              label="营业执照注册号"
              rules={[
                { required: true, message: "营业执照注册号不能为空" },
                {
                  pattern: /^[A-Z0-9]{6,20}$/,
                  message: "6-20位大写字母/数字组合",
                },
              ]}
            >
              <Input
                prefix={<FileTextOutlined />}
                placeholder="请输入营业执照注册号"
                maxLength={20}
                showCount
              />
            </Form.Item>

            {/* 法人姓名 */}
            <Form.Item
              name="legalPerson"
              label="经营者/法定代表人"
              rules={[
                {
                  required: true,
                  message: "经营者/法定代表人不能为空",
                  whitespace: true,
                },
                {
                  pattern: /^[\u4e00-\u9fa5]{2,10}$/,
                  message: "2-10位中文姓名",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入营业执照中的法人姓名"
                maxLength={10}
                showCount
              />
            </Form.Item>

            {/* 店铺地址 */}
            <Form.Item
              name="address"
              label="店铺地址"
              rules={[
                { required: true, message: "店铺地址不能为空", whitespace: true },
                {
                  pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_·-]{5,100}$/,
                  message: "5-100位，支持中文、数字、字母、下划线、·、-",
                },
              ]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="请输入详细店铺地址"
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
                提交入驻申请
              </Button>
            </Form.Item>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Apply;
