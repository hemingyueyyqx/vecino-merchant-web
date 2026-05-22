import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Card,
  Space,
  Typography,
  Image,
  Divider,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  CommentOutlined,
  RobotOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ShakeOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import {
  getReviewDetail,
  aiReviewAnalysis,
  replyReview,
} from "@/services/business";
import type { Review } from "@/types/order";

const { Title, Text } = Typography;
const { TextArea } = Input;

// 评价等级类型
export type ReviewLevel = "good" | "medium" | "bad";

// 评价数据类型定义
export interface ReviewItem extends Review {
  key: string;
}

const ReviewManagement: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm<{ replyContent: string }>();
  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [filterLevel, setFilterLevel] = useState<ReviewLevel | "">("");
  const [searchText, setSearchText] = useState<string>("");
  const [replyModal, setReplyModal] = useState<boolean>(false);
  const [currentReview, setCurrentReview] = useState<ReviewItem | null>(null);
  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const [analysis, setAnalysis] = useState<{
    text?: string;
  }>({});
  const [aiLoading, setAiLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await getReviewDetail();
      const list: ReviewItem[] = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            key: item.reviewId || item.orderId || item.orderNo || "",
          }))
        : [];
      return list;
    } catch (err) {
      console.error("获取评价列表失败", err);
      message.error("获取评价列表失败");
      return [];
    }
  };

  // 获取评价列表
  useEffect(() => {
    const initData = async () => {
      const reviews = await fetchReviews();
      setReviewList(reviews);
    };
    initData();
  }, []);

  // 将 reviewType 转换为 level
  const getLevelFromType = (reviewType?: number): ReviewLevel => {
    if (reviewType === 1) return "good";
    if (reviewType === 2) return "medium";
    return "bad";
  };

  // 筛选数据 - 修复后的逻辑
  const filteredList = reviewList.filter((item) => {
    // 评价类型筛选
    const hasLevelFilter =
      typeof filterLevel === "string" && filterLevel !== "";
    const matchLevel = hasLevelFilter
      ? getLevelFromType(item.reviewType) === filterLevel
      : true;

    // 搜索筛选
    const hasSearchText = searchText && searchText.trim() !== "";
    const matchSearch = hasSearchText
      ? item.content?.includes(searchText) ||
        item.nickname?.includes(searchText)
      : true;

    return matchLevel && matchSearch;
  });

  // 打开回复弹窗
  const handleOpenReply = (record: ReviewItem) => {
    setCurrentReview(record);
    setAnalysis({});
    form.setFieldValue("replyContent", "");
    setReplyModal(true);
  };

  // 获取AI分析结果与智能回复
  const handleGetAIResult = async () => {
    if (!currentReview?.reviewId) return;

    setAiLoading(true);
    try {
      const result = await aiReviewAnalysis(currentReview.reviewId);
      const analysisResult = result["AI分析结果"];
      const replyResult = result["AI智能回复"];

      if (analysisResult) {
        setAnalysis({ text: analysisResult });
      }
      if (replyResult) {
        form.setFieldValue("replyContent", replyResult);
      }
      message.success("AI分析完成");
    } catch (err) {
      console.error("AI分析失败", err);
      message.error("AI分析失败");
    } finally {
      setAiLoading(false);
    }
  };

  // 提交回复
  const handleSubmitReply = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      if (!currentReview?.reviewId) {
        setLoading(false);
        return;
      }
      replyReview(
        currentReview.reviewId,
        values.replyContent,
        analysis.text || "",
      )
        .then(() => {
          setReviewList((prev) =>
            prev.map((item) =>
              item.reviewId === currentReview?.reviewId
                ? {
                    ...item,
                    replyContent: values.replyContent,
                    updateTime: new Date().toISOString(),
                  }
                : item,
            ),
          );
          setReplyModal(false);
          message.success("评价回复成功");
        })
        .catch((err) => {
          console.error("回复失败", err);
          message.error("回复失败");
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  // 关闭弹窗时清空数据
  const handleCloseModal = () => {
    setReplyModal(false);
    setCurrentReview(null);
    setAnalysis({});
    form.resetFields();
  };

  // 格式化时间
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "--";
    return dateStr.replace("T", " ");
  };

  // 表格列配置
  const columns: TableProps<ReviewItem>["columns"] = [
    {
      title: "用户信息",
      dataIndex: "nickname",
      key: "nickname",
      render: (name) => (
        <Space>
          <Image
            src="https://picsum.photos/id/64/40/40"
            width={32}
            preview={false}
            style={{ borderRadius: "50%" }}
          />
          <Text>{name || "--"}</Text>
        </Space>
      ),
    },
    {
      title: "评价内容",
      dataIndex: "content",
      key: "content",
      width: 320,
      render: (text, record) => (
        <div>
          <Text>{text || "--"}</Text>
          {record.image && (
            <div style={{ marginTop: 8 }}>
              <Image
                src={record.image}
                width={60}
                height={60}
                style={{ borderRadius: 4, objectFit: "cover" }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "评价类型",
      dataIndex: "reviewType",
      key: "reviewType",
      render: (reviewType) => {
        const level = getLevelFromType(reviewType);
        const config = {
          good: { color: "green", text: "好评" },
          medium: { color: "gold", text: "中评" },
          bad: { color: "red", text: "差评" },
        };
        return <Tag color={config[level].color}>{config[level].text}</Tag>;
      },
    },
    {
      title: "评价时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (time) => formatTime(time),
    },
    {
      title: "回复状态",
      dataIndex: "replyContent",
      key: "replyStatus",
      render: (content) => (
        <Tag color={content ? "green" : "orange"}>
          {content ? "已回复" : "未回复"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          {!record.replyContent && (
            <Button
              type="primary"
              size="small"
              icon={<CommentOutlined />}
              onClick={() => handleOpenReply(record)}
            >
              回复评价
            </Button>
          )}
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenReply(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "20px 24px",
        background: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* 页面头部 */}
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            评价管理 & AI智能回复
          </Title>
        }
        style={{ marginBottom: 20 }}
      >
        <Space wrap size={16}>
          {/* 修复后的 Select 组件 */}
          <Select
            placeholder="筛选评价类型"
            style={{ width: 160 }}
            value={filterLevel || undefined}
            onChange={(value) => {
              setFilterLevel(value ? (value as ReviewLevel) : "");
            }}
            allowClear
            options={[
              { value: "good", label: "好评" },
              { value: "medium", label: "中评" },
              { value: "bad", label: "差评" },
            ]}
          />
          <Input
            placeholder="搜索评价内容/用户名"
            style={{ width: 260 }}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Space>
      </Card>

      {/* 评价列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="key"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* AI智能回复弹窗 */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: "#1890ff" }} />
            <span>AI智能评价回复</span>
          </Space>
        }
        open={replyModal}
        onCancel={handleCloseModal}
        footer={
          currentReview?.replyContent
            ? null
            : [
                <Button key="cancel" onClick={handleCloseModal}>
                  取消
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  loading={loading}
                  onClick={handleSubmitReply}
                  icon={<CheckCircleOutlined />}
                >
                  提交回复
                </Button>,
              ]
        }
        width={650}
        destroyOnClose
      >
        {currentReview && (
          <div>
            {/* 评价详情 */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>用户评价：</Text>
              <p style={{ margin: "8px 0" }}>{currentReview.content || "--"}</p>
              {currentReview.image && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Image
                    src={currentReview.image}
                    width={80}
                    height={80}
                    style={{ borderRadius: 4 }}
                  />
                </div>
              )}
            </div>

            {/* 已回复状态：显示AI分析结果和回复内容 */}
            {currentReview.replyContent && (
              <>
                {/* AI分析结果 */}
                {currentReview.analysis && (
                  <Card
                    size="small"
                    style={{ marginBottom: 16, background: "#fff7f6" }}
                  >
                    <Text strong style={{ color: "#ff4d4f" }}>
                      🔍 AI分析结果
                    </Text>
                    <Divider style={{ margin: "8px 0" }} />
                    <p
                      style={{
                        margin: "4px 0",
                        color: "#666",
                        lineHeight: 1.6,
                      }}
                    >
                      {currentReview.analysis}
                    </p>
                  </Card>
                )}

                {/* 回复内容 */}
                <Card size="small" style={{ background: "#e6f7ff" }}>
                  <Text strong style={{ color: "#1890ff" }}>
                    💬 商家回复
                  </Text>
                  <Divider style={{ margin: "8px 0" }} />
                  <p
                    style={{ margin: "4px 0", color: "#666", lineHeight: 1.6 }}
                  >
                    {currentReview.replyContent}
                  </p>
                </Card>
              </>
            )}

            {/* 未回复状态：显示获取AI分析按钮和表单 */}
            {!currentReview.replyContent && (
              <>
                {/* 获取AI分析按钮 */}
                <Button
                  type="dashed"
                  size="large"
                  icon={<ShakeOutlined />}
                  onClick={handleGetAIResult}
                  loading={aiLoading}
                  style={{ width: "100%", marginBottom: 16 }}
                >
                  点击获取AI分析结果与智能回复
                </Button>

                {/* AI分析结果 */}
                {analysis.text && (
                  <Card
                    size="small"
                    style={{ marginBottom: 16, background: "#fff7f6" }}
                  >
                    <Text strong style={{ color: "#ff4d4f" }}>
                      🔍 AI分析结果
                    </Text>
                    <Divider style={{ margin: "8px 0" }} />
                    <p
                      style={{
                        margin: "4px 0",
                        color: "#666",
                        lineHeight: 1.6,
                      }}
                    >
                      {analysis.text}
                    </p>
                  </Card>
                )}

                {/* AI回复编辑 */}
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="replyContent"
                    label={
                      <Space>
                        <RobotOutlined />
                        <span>AI智能回复模板</span>
                      </Space>
                    }
                    rules={[{ required: true, message: "请输入回复内容" }]}
                  >
                    <TextArea rows={6} placeholder="请编辑回复内容" />
                  </Form.Item>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    💡 点击上方按钮获取AI智能回复，可直接修改或自定义编辑
                  </Text>
                </Form>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagement;
