// src/components/merchant/ShopManage.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Space,
  message,
  Modal,
  Form,
  Card,
  Tag,
  Row,
  Col,
  Divider,
  Empty,
  Upload,
  Select,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import { findShop, applyShop } from "@/services/auth";
import { BASE_URL } from "@/services/constant";

// 店铺状态枚举
const SHOP_STATUS = {
  0: { text: "正常开店", color: "green" },
  1: { text: "禁用", color: "red" },
  2: { text: "待审核", color: "orange" },
};

// 一级类目列表
const FIRST_CATEGORY_LIST = [
  { code: "beauty", label: "美妆" },
  { code: "food", label: "美食" },
  { code: "daily", label: "日用品" },
  { code: "clothing", label: "服装" },
  { code: "digital", label: "数码" },
  { code: "home", label: "家居" },
  { code: "other", label: "其他" },
];

// 二级类目映射
const SECOND_CATEGORY_MAP: Record<string, { code: string; label: string }[]> = {
  beauty: [
    { code: "beauty_brand", label: "美妆品牌" },
    { code: "beauty_skincare", label: "护肤" },
    { code: "beauty_makeup", label: "彩妆" },
    { code: "beauty_hair", label: "美发" },
    { code: "beauty_body", label: "美体" },
  ],
  food: [
    { code: "food_drink", label: "饮品" },
    { code: "food_snack", label: "零食" },
    { code: "food_frozen", label: "冷冻食品" },
    { code: "food_dairy", label: "奶制品" },
    { code: "food_grain", label: "粮油" },
  ],
  daily: [
    { code: "daily_clean", label: "清洁用品" },
    { code: "daily_paper", label: "纸品" },
    { code: "daily_kitchen", label: "厨房用品" },
    { code: "daily_bathroom", label: "浴室用品" },
    { code: "daily_storage", label: "收纳用品" },
  ],
  clothing: [
    { code: "clothing_men", label: "男装" },
    { code: "clothing_women", label: "女装" },
    { code: "clothing_kids", label: "童装" },
    { code: "clothing_shoes", label: "鞋靴" },
    { code: "clothing_accessories", label: "配饰" },
  ],
  digital: [
    { code: "digital_phone", label: "手机" },
    { code: "digital_computer", label: "电脑" },
    { code: "digital_audio", label: "影音设备" },
    { code: "digital_accessories", label: "数码配件" },
    { code: "digital_smart", label: "智能设备" },
  ],
  home: [
    { code: "home_decoration", label: "装饰摆件" },
    { code: "home_textile", label: "家纺" },
    { code: "home_appliance", label: "小家电" },
    { code: "home_furniture", label: "家具" },
    { code: "home_garden", label: "园艺" },
  ],
  other: [
    { code: "other_sport", label: "运动户外" },
    { code: "other_toys", label: "玩具" },
    { code: "other_stationery", label: "文具" },
    { code: "other_gifts", label: "礼品" },
    { code: "other_books", label: "图书" },
  ],
};

// API 返回类型
interface ShopResponse {
  shopInfo: {
    id: string;
    shopName: string;
    firstCategory: string;
    secondCategory: string;
    businessId: string;
    address: string;
    businessLicense: string;
    businessImage?: string;
    legalPerson: string;
    status: number;
    auditReason: string;
    createTime: string;
    updateTime: string;
  };
  hasShop: boolean;
}

export default function ShopManage() {
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [shopData, setShopData] = useState<ShopResponse | null>(null);
  const [secondCategories, setSecondCategories] = useState<
    { code: string; label: string }[]
  >([]);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

  // 弹窗状态
  const [editModal, setEditModal] = useState<boolean>(false);

  // 获取店铺信息
  const fetchShop = useCallback(async () => {
    setLoading(true);
    try {
      const res = await findShop();
      if (res && res.hasShop && res.shopInfo) {
        setShopData(res);
      } else {
        setShopData(null);
      }
    } catch (err) {
      console.error("获取店铺信息失败", err);
      message.error("获取店铺信息失败");
      setShopData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理一级类目变化
  const handleFirstCategoryChange = (value: string) => {
    const secondList = SECOND_CATEGORY_MAP[value] || [];
    setSecondCategories(secondList);
    editForm.setFieldsValue({ secondCategory: undefined });
  };

  // 处理营业执照图片上传（参考 Apply 页面）
  const handleUploadChange = (info: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    const { file, fileList } = info;

    // 更新文件列表，用于页面回显
    setImageFileList(fileList);

    // 上传成功：后端返回图片URL，自动赋值给表单 businessImage 字段
    if (file.status === "done") {
      // 适配后端返回格式，取图片路径
      const imgUrl = file.response?.imgPath || file.response?.data;
      if (imgUrl) {
        editForm.setFieldValue("businessImage", imgUrl);
        message.success("营业执照上传成功");
      }
    }

    // 上传失败提示
    if (file.status === "error") {
      message.error("营业执照上传失败，请重新上传");
    }

    // 文件删除：清空表单字段
    if (fileList.length === 0) {
      editForm.setFieldValue("businessImage", "");
    }
  };

  // 打开编辑弹窗
  const handleOpenEdit = () => {
    if (!shopData?.shopInfo) return;
    const { shopInfo } = shopData;

    const secondList = SECOND_CATEGORY_MAP[shopInfo.firstCategory] || [];
    setSecondCategories(secondList);

    // 设置图片文件列表（参考 Apply 页面）
    if (shopInfo.businessImage) {
      setImageFileList([
        {
          uid: "-1",
          name: "营业执照.jpg",
          status: "done",
          url: shopInfo.businessImage.startsWith("http")
            ? shopInfo.businessImage
            : `${BASE_URL}${shopInfo.businessImage}`,
        },
      ]);
      // 设置表单字段
      editForm.setFieldValue("businessImage", shopInfo.businessImage);
    } else {
      setImageFileList([]);
      editForm.setFieldValue("businessImage", "");
    }

    editForm.setFieldsValue({
      shopName: shopInfo.shopName,
      firstCategory: shopInfo.firstCategory,
      secondCategory: shopInfo.secondCategory,
      address: shopInfo.address,
      businessLicense: shopInfo.businessLicense,
      legalPerson: shopInfo.legalPerson,
    });
    setEditModal(true);
  };

  // 提交编辑
  const handleSubmitEdit = async () => {
    try {
      const values = await editForm.validateFields();

      const shopDataUpdate = {
        id: shopData?.shopInfo.id,
        shopName: values.shopName,
        firstCategory: values.firstCategory,
        secondCategory: values.secondCategory,
        address: values.address,
        businessLicense: values.businessLicense,
        businessImage: values.businessImage, // 从表单获取图片路径
        legalPerson: values.legalPerson,
      };

      await applyShop(shopDataUpdate);
      message.success("修改成功");
      setEditModal(false);
      fetchShop();
    } catch (err) {
      message.error("修改失败");
    }
  };

  // 切换店铺状态
  const handleToggleStatus = async () => {
    if (!shopData?.shopInfo) return;

    const currentStatus = shopData.shopInfo.status;

    let newStatus: number;
    let actionText: string;

    if (currentStatus === 0) {
      newStatus = 1;
      actionText = "禁用店铺";
    } else if (currentStatus === 1) {
      newStatus = 2;
      actionText = "申请开通";
    } else {
      message.warning("店铺正在审核中，请等待审核结果");
      return;
    }

    try {
      console.log("更新店铺状态:", {
        shopId: shopData.shopInfo.id,
        status: newStatus,
      });
      message.success(`${actionText}成功`);
      fetchShop();
    } catch (err) {
      message.error("操作失败");
    }
  };

  // 获取状态按钮文本
  const getStatusButtonText = () => {
    if (!shopData?.shopInfo) return "";
    const status = shopData.shopInfo.status;

    if (status === 0) return "禁用店铺";
    if (status === 1) return "申请开通";
    return "审核中";
  };

  // 获取分类名称
  const getCategoryName = (category: string) => {
    const firstCat = FIRST_CATEGORY_LIST.find((cat) => cat.code === category);
    if (firstCat) return firstCat.label;

    for (const firstKey of Object.keys(SECOND_CATEGORY_MAP)) {
      const secondCat = SECOND_CATEGORY_MAP[firstKey].find(
        (cat) => cat.code === category,
      );
      if (secondCat) return secondCat.label;
    }

    return category;
  };

  // 获取图片完整路径
  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  return (
    <div style={{ padding: 20 }}>
      {/* 用户未创建店铺 */}
      {!shopData?.hasShop && (
        <Card>
          <Empty description="您还没有创建店铺" />
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Button type="primary">创建店铺</Button>
          </div>
        </Card>
      )}

      {/* 店铺信息展示 */}
      {shopData?.hasShop && shopData.shopInfo && (
        <Card>
          {/* 店铺基本信息头部 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", gap: 16 }}>
              {/* 店铺头像 */}
              <div style={{ position: "relative" }}>
                {shopData.shopInfo.businessImage ? (
                  <img
                    src={getImageUrl(shopData.shopInfo.businessImage)}
                    alt={shopData.shopInfo.shopName}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UploadOutlined style={{ fontSize: 40, color: "#ccc" }} />
                  </div>
                )}
                {/* <Upload
                  action="/api/upload"
                  accept="image/*"
                  showUploadList={false}
                  onChange={() => message.success("上传成功")}
                  style={{ position: "absolute", bottom: -8, right: -8 }}
                >
                  <Button size="small" icon={<UploadOutlined />} type="primary">
                    上传
                  </Button>
                </Upload> */}
              </div>
              {/* 店铺名称和状态 */}
              <div>
                <h2 style={{ marginBottom: 8 }}>
                  {shopData.shopInfo.shopName}
                </h2>
                <div style={{ display: "flex", gap: 12 }}>
                  <Tag
                    color={
                      SHOP_STATUS[
                        shopData.shopInfo.status as keyof typeof SHOP_STATUS
                      ]?.color || "gray"
                    }
                  >
                    {SHOP_STATUS[
                      shopData.shopInfo.status as keyof typeof SHOP_STATUS
                    ]?.text || "未知"}
                  </Tag>
                  <span style={{ color: "#666" }}>
                    分类：{getCategoryName(shopData.shopInfo.firstCategory)} /{" "}
                    {getCategoryName(shopData.shopInfo.secondCategory)}
                  </span>
                </div>
              </div>
            </div>
            {/* 操作按钮 */}
            <Space>
              <Button type="primary" onClick={handleOpenEdit}>
                <EditOutlined />
                编辑店铺
              </Button>
              {/* <Button
                onClick={handleToggleStatus}
                danger={shopData.shopInfo.status === 0}
                disabled={shopData.shopInfo.status === 2}
              >
                {getStatusButtonText()}
              </Button> */}
            </Space>
          </div>

          <Divider />

          {/* 店铺详细信息 */}
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div className="info-section">
                <h3>基本信息</h3>
                <div className="info-item">
                  <span className="label">法人：</span>
                  <span>{shopData.shopInfo.legalPerson}</span>
                </div>
                <div className="info-item">
                  <span className="label">营业执照号：</span>
                  <span>{shopData.shopInfo.businessLicense}</span>
                </div>
                <div className="info-item">
                  <span className="label">店铺地址：</span>
                  <span>{shopData.shopInfo.address}</span>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="info-section">
                <h3>其他信息</h3>
                <div className="info-item">
                  <span className="label">商家ID：</span>
                  <span>{shopData.shopInfo.businessId}</span>
                </div>
                <div className="info-item">
                  <span className="label">创建时间：</span>
                  <span>{shopData.shopInfo.createTime?.split("T")[0]}</span>
                </div>
                <div className="info-item">
                  <span className="label">更新时间：</span>
                  <span>{shopData.shopInfo.updateTime?.split("T")[0]}</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* 审核备注 */}
          {shopData.shopInfo.auditReason && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: "#fff7e6",
                borderRadius: 8,
              }}
            >
              <p>
                <strong>审核备注：</strong>
              </p>
              <p>{shopData.shopInfo.auditReason}</p>
            </div>
          )}
        </Card>
      )}

      {/* 编辑弹窗 */}
      <Modal
        open={editModal}
        title="编辑店铺信息"
        onCancel={() => setEditModal(false)}
        onOk={handleSubmitEdit}
        confirmLoading={loading}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="shopName"
            label="店铺名称"
            rules={[{ required: true, message: "请输入店铺名称" }]}
          >
            <Input placeholder="请输入店铺名称" />
          </Form.Item>

          {/* 一级类目选择 */}
          <Form.Item
            name="firstCategory"
            label="一级类目"
            rules={[{ required: true, message: "请选择一级类目" }]}
          >
            <Select
              placeholder="请选择一级类目"
              onChange={handleFirstCategoryChange}
            >
              {FIRST_CATEGORY_LIST.map((cat) => (
                <Select.Option key={cat.code} value={cat.code}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 二级类目选择 */}
          <Form.Item
            name="secondCategory"
            label="二级类目"
            rules={[{ required: true, message: "请选择二级类目" }]}
          >
            <Select placeholder="请选择二级类目">
              {secondCategories.map((cat) => (
                <Select.Option key={cat.code} value={cat.code}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="店铺地址"
            rules={[{ required: true, message: "请输入店铺地址" }]}
          >
            <Input placeholder="请输入店铺地址" />
          </Form.Item>

          {/* 营业执照号 */}
          <Form.Item
            name="businessLicense"
            label="营业执照号"
            rules={[{ required: true, message: "请输入营业执照号" }]}
          >
            <Input placeholder="请输入营业执照号" />
          </Form.Item>

          {/* 营业执照图片上传（参考 Apply 页面） */}
          <Form.Item label="营业执照图片">
            <Upload
              action="/api/upload"
              listType="picture-card"
              fileList={imageFileList}
              onChange={handleUploadChange}
              accept="image/*"
            >
              {imageFileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传营业执照图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* 隐藏字段用于存储图片路径 */}
          <Form.Item name="businessImage" />

          <Form.Item
            name="legalPerson"
            label="法人"
            rules={[{ required: true, message: "请输入法人姓名" }]}
          >
            <Input placeholder="请输入法人姓名" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 样式 */}
      <style>{`
        .info-section {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
        }
        .info-section h3 {
          margin-bottom: 12px;
          font-size: 14px;
          color: #333;
        }
        .info-item {
          display: flex;
          margin-bottom: 8px;
        }
        .info-item .label {
          width: 80px;
          color: #999;
        }
        .info-item span:last-child {
          flex: 1;
          color: #333;
        }
      `}</style>
    </div>
  );
}
