import { useEffect, useState } from "react";
import { Form, Input, Button, message, Alert,Upload } from "antd";
import {
  ShopOutlined,
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { applyShop, findShop } from "@/services/auth";
import type { ShopInfo } from "@/types/user";
import ShopCategorySelect from "@/components/ShopCategorySelect"
// ✅ 修复1：补齐缺失的 UploadFile 类型导入（解决爆红核心问题）
import type { UploadFile } from "antd/es/upload/interface";
import { BASE_URL } from "@/services/constant";

const Apply = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [auditReason, setAuditReason] = useState("");
  // 新增：图片文件列表，用于回显、上传控制
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // ✅ 修复1：定义严格的 TS 类型
  const [originalValues, setOriginalValues] = useState<ShopInfo | null>(null);

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
          // 仅这一行适配类目回显，其余完全保留
          const categoryValue = [
            shop.firstCategory,
            shop.secondCategory,
          ].filter(Boolean);
          form.setFieldsValue({ ...shop, category: categoryValue });
          // 新增：驳回编辑时，回显营业执照图片
          if (shop.businessImage) {
            setFileList([
              {
                uid: "1",
                name: "营业执照图片",
                status: "done",
                url: shop.businessImage.startsWith("http")
                  ? shop.businessImage
                  : BASE_URL + shop.businessImage,
              },
            ]);
          }
        }
      } catch {
        console.log("未查询到店铺信息，全新入驻");
      }
    };
    loadShopInfo();
  }, [form]);
  // 新增：图片上传监听事件（核心：拿到后端返回的图片路径，绑定表单）
  const handleUploadChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    const { file, fileList } = info;
    // 更新文件列表，用于页面回显
    setFileList(fileList);

    // 上传成功：后端返回图片URL，自动赋值给表单 businessImage 字段
    if (file.status === "done") {
      // 适配后端返回格式，取图片路径
      const imgUrl = file.response?.imgPath || file.response?.data;
      if (imgUrl) {
        form.setFieldValue("businessImage", imgUrl);
        message.success("营业执照上传成功");
      }
    }

    // 上传失败提示
    if (file.status === "error") {
      message.error("营业执照上传失败，请重新上传");
    }

    // 文件删除：清空表单字段
    if (fileList.length === 0) {
      form.setFieldValue("businessImage", "");
    }
  };

  // 提交函数（完整修复）
  // 提交函数（100%保留你的原有逻辑 | 无category字段传给后端）
  const handleSubmit = async (values: ShopInfo & { category?: string[] }) => {
    try {
      setLoading(true);

      // 🔥 核心：拆分级联类目，删除category临时字段，不传给后端
      const { category, ...restValues } = values;
      const [firstCategory, secondCategory] = category || [];
      // 组装最终表单值（无category字段）
      const formValues = {
        ...restValues,
        firstCategory: firstCategory || "",
        secondCategory: secondCategory || "",
      };

      // ✅ 你的原有逻辑：完全保留，无任何修改
      if (isReject && originalValues) {
        const hasChanged = Object.keys(formValues).some((key) => {
          return (
            formValues[key as keyof ShopInfo] !==
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
      // ✅ 你的原有逻辑：完全保留，无任何修改
      if (isReject && originalValues) {
        // 修改提交：合并原始字段 + 新表单值
        submitData = { ...originalValues, ...formValues };
      } else {
        // 新增提交
        submitData = formValues;
      }
      // 最终 submitData 自动携带 businessImage 图片路径，传给后端
      console.log("最终提交数据（含图片路径）：", submitData);
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
            <div className="apply-tab-active">商家入驻申请</div>
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
              name="category"
              label="经营类目"
              rules={[{ required: true, message: "请选择经营类目" }]}
            >
              <ShopCategorySelect />
            </Form.Item>
            <Form.Item name="businessImage" label="营业执照">
              <Upload
                action="/api/upload" // 替换为实际的上传接口
                listType="picture-card"
                maxCount={1}
                onChange={handleUploadChange}
                fileList={fileList}
                // beforeUpload={() => false} // 阻止自动上传，仅预览
              >
                {fileList.length === 0 && (
                  <div>
                    <UploadOutlined
                      style={{ fontSize: 24, color: "#1890ff" }}
                    />
                    <div style={{ marginTop: 8 }}>上传营业执照</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item
              name="businessLicense"
              label="营业执照注册号"
              rules={[
                { required: true, message: "不能为空" },
                {
                  pattern: /^[0-9A-Z]{18}$/,
                  message: "请输入18位数字和大写字母",
                },
              ]}
            >
              <Input
                prefix={<FileTextOutlined />}
                placeholder="请输入18位营业执照注册号"
                maxLength={18}
                showCount
                onChange={(e) => {
                  // 自动转换为大写
                  e.target.value = e.target.value.toUpperCase();
                }}
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
};;;;;;

export default Apply;
