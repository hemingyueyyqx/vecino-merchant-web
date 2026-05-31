import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
  Space,
} from "antd";
import { ShopOutlined, BulbOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
// 引入子组件
import ActivityTemplateCard from "./ActivityTemplateCard";
import ActivityAIRuleChecker from "./ActivityAIRuleChecker";
// 类型 & 接口
import type {
  ActivityConfigDTO,
  ActivityTemplate,
  AiCheckResult,
} from "@/types/product";
import {
  checkActivityRuleByAi,
  createPlatformActivity,
} from "@/services/admin";

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

// 时间格式化常量
const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

// ===================== 1. 预设模板（618+七夕+中秋）=====================
const TEMPLATE_LIST: ActivityTemplate[] = [
  {
    id: "618_sale",
    name: "618年中大促",
    theme: "618平台大促",
    icon: <ShopOutlined style={{ fontSize: 28, color: "#f5222d" }} />,
    defaultConfig: {
      activityName: "2026 618平台跨店大促",
      activityTheme: "618年中大促",
      activityType: "FULL_REDUCTION",
      startTime: "2026-06-15 00:00:00",
      endTime: "2026-06-20 23:59:59",
      fullReductionRule: "全场满300减50，可叠加店铺券",
      targetCategory: ["美妆护肤", "数码家电", "服饰鞋包"],
      targetMerchantType: "全部商家",
      budget: 1000000,
      activityDesc:
        "618大促面向平台全品类商家开放，报名商家可获得首页流量加权、搜索曝光倾斜，请合理设置商品价格，避免亏损。",
    },
  },
  {
    id: "qixi_festival",
    name: "七夕浪漫礼遇季",
    theme: "七夕情人节活动",
    icon: <ShopOutlined style={{ fontSize: 28, color: "#ff69b4" }} />,
    defaultConfig: {
      activityName: "2026七夕浪漫礼遇季",
      activityTheme: "七夕情人节",
      activityType: "COUPON",
      startTime: "2026-08-01 00:00:00",
      endTime: "2026-08-10 23:59:59",
      fullReductionRule: "情侣专区满520减131，美妆礼盒9折优惠",
      targetCategory: ["美妆护肤", "服饰鞋包", "礼品饰品"],
      targetMerchantType: "全部商家",
      budget: 500000,
      activityDesc:
        "七夕情人节专属活动，主打礼品、美妆、服饰类目，报名商家可获得节日专属流量扶持，提升转化。",
    },
  },
  {
    id: "mid_autumn",
    name: "中秋团圆特惠节",
    theme: "中秋节团圆活动",
    icon: <ShopOutlined style={{ fontSize: 28, color: "#ff9500" }} />,
    defaultConfig: {
      activityName: "2026中秋团圆特惠节",
      activityTheme: "中秋团圆",
      activityType: "FULL_REDUCTION",
      startTime: "2026-09-15 00:00:00",
      endTime: "2026-10-08 23:59:59",
      fullReductionRule: "食品礼盒满200减50，全品类跨店满199减30",
      targetCategory: ["食品生鲜", "美妆护肤", "家居用品"],
      targetMerchantType: "全部商家",
      budget: 600000,
      activityDesc:
        "中秋节主打礼盒、食品、家居类目，报名商家可享受首页节日专区曝光，助力节日销量爆发。",
    },
  },
];

// ===================== 2. 主页面 =====================
const ActivityCreatePage: React.FC = () => {
  // 全局状态
  const [form] = Form.useForm<
    ActivityConfigDTO & { timeRange: [Dayjs, Dayjs] }
  >();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultList, setAiResultList] = useState<AiCheckResult[]>([]);

  // 1. 选择模板：回填表单 + 时间选择器回显
  const handleSelectTemplate = (templateConfig: ActivityConfigDTO) => {
    // 把模板字符串时间转为 Dayjs 数组，给 RangePicker 回显
    const timeRange: [Dayjs, Dayjs] = [
      dayjs(templateConfig.startTime, DATE_FORMAT),
      dayjs(templateConfig.endTime, DATE_FORMAT),
    ];

    // 一次性赋值所有字段（含时间选择器）
    form.setFieldsValue({
      ...templateConfig,
      timeRange,
    });

    message.success("模板已自动填充到表单！");
    setAiResultList([]);
  };

  // 2. 表单值变化监听：时间选择器修改后，自动同步 startTime / endTime
  const handleFormValueChange = (
    changedValues: Partial<{ timeRange?: [Dayjs, Dayjs] }>,
  ) => {
    const { timeRange } = changedValues;
    if (timeRange && Array.isArray(timeRange) && timeRange.length === 2) {
      const [start, end] = timeRange;
      if (start && end) {
        form.setFieldsValue({
          startTime: start.format(DATE_FORMAT),
          endTime: end.format(DATE_FORMAT),
        });
      }
    }
  };

  // 3. AI 校验规则
  const handleAiCheckRule = async () => {
    try {
      const formValues = await form.validateFields();
      setAiLoading(true);
      const res = await checkActivityRuleByAi(formValues);
      setAiResultList(res);
    } catch (err) {
      message.error("获取表单配置失败，请检查必填项");
    } finally {
      setAiLoading(false);
    }
  };

  // 4. 提交活动：成功后清空表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("提交给后端的完整参数：", values);
      await createPlatformActivity(values);
      message.success("平台活动创建成功！");
      form.resetFields();
      setAiResultList([]);
    } catch (err) {
      message.error("活动提交失败，请检查表单");
    }
  };

  // 5. 关闭AI抽屉：清空校验结果
  const handleCloseDrawer = () => {
    setAiDrawerOpen(false);
    setAiResultList([]);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0" }}>
      {/* 模板选择子组件 */}
      <ActivityTemplateCard
        templateList={TEMPLATE_LIST}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* 主表单：监听全局值变化 */}
      <Form
        form={form}
        layout="vertical"
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        style={{ background: "#fff", padding: 24, borderRadius: 6 }}
        onValuesChange={handleFormValueChange}
      >
        <Form.Item
          label="活动名称"
          name="activityName"
          rules={[{ required: true }]}
        >
          <Input placeholder="请填写平台活动名称" />
        </Form.Item>

        <Form.Item
          label="活动主题"
          name="activityTheme"
          rules={[{ required: true }]}
        >
          <Input placeholder="如：618年中大促" />
        </Form.Item>

        <Form.Item
          label="活动玩法"
          name="activityType"
          rules={[{ required: true }]}
        >
          <Select placeholder="选择营销玩法">
            <Option value="FULL_REDUCTION">跨店满减</Option>
            <Option value="COUPON">平台券活动</Option>
            <Option value="SECKILL">限时秒杀</Option>
          </Select>
        </Form.Item>

        {/* 核心改动：RangePicker 绑定 form 字段 timeRange，支持回显 + 编辑 */}
        <Form.Item
          label="活动时间"
          name="timeRange"
          rules={[{ required: true }]}
        >
          <RangePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        {/* 隐藏字段：专门给后端接口传参，不渲染UI */}
        <Form.Item name="startTime" noStyle />
        <Form.Item name="endTime" noStyle />

        <Form.Item
          label="满减/优惠规则"
          name="fullReductionRule"
          rules={[{ required: true }]}
        >
          <TextArea rows={2} placeholder="填写面向用户&商家的优惠规则" />
        </Form.Item>

        <Form.Item
          label="目标参与类目"
          name="targetCategory"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            placeholder="选择可参与的商家类目"
            style={{ width: "100%" }}
          >
            <Option value="美妆护肤">美妆护肤</Option>
            <Option value="数码家电">数码家电</Option>
            <Option value="服饰鞋包">服饰鞋包</Option>
            <Option value="食品生鲜">食品生鲜</Option>
            <Option value="礼品饰品">礼品饰品</Option>
            <Option value="家居用品">家居用品</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="目标商家群体"
          name="targetMerchantType"
          rules={[{ required: true }]}
        >
          <Select placeholder="选择可报名的商家类型">
            <Option value="全部商家">全部商家</Option>
            <Option value="旗舰店">仅旗舰店</Option>
            <Option value="新入驻商家">新入驻商家</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="活动预算(元)"
          name="budget"
          rules={[{ required: true }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            placeholder="活动总预算"
          />
        </Form.Item>

        <Form.Item
          label="商家端活动说明"
          name="activityDesc"
          rules={[{ required: true }]}
        >
          <TextArea
            rows={3}
            placeholder="给报名商家的活动规则、权益、注意事项"
          />
        </Form.Item>

        <Form.Item>
          <Space size="middle">
            <Button type="primary" onClick={handleSubmit}>
              提交创建活动
            </Button>
            <Button
              icon={<BulbOutlined />}
              onClick={() => setAiDrawerOpen(true)}
            >
              打开AI规则校验助手
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* AI规则校验子组件 */}
      <ActivityAIRuleChecker
        open={aiDrawerOpen}
        onClose={handleCloseDrawer}
        currentActivityConfig={form.getFieldsValue() as ActivityConfigDTO}
        checkResult={aiResultList}
        loading={aiLoading}
        onCheckRule={handleAiCheckRule}
      />
    </div>
  );
};

export default ActivityCreatePage;
