import React, { useState } from "react";
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
} from "@ant-design/icons";
import type { TableProps } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 评价等级类型
export type ReviewLevel = "good" | "medium" | "bad";

// 评价数据类型定义
export interface ReviewItem {
  key: string;
  userName: string;
  userAvatar: string;
  content: string;
  images: string[];
  level: ReviewLevel;
  createTime: string;
  replyContent: string | null;
  replyTime: string | null;
  badKeywords?: string[]; // 差评关键词
  suggest?: string; // AI改进建议
}

// AI回复模板生成
const generateAIReply = (level: ReviewLevel, keywords?: string[]): string => {
  if (level === "good") {
    return "非常感谢您的好评与认可，我们会继续努力为您提供更优质的商品和服务，期待您的再次光临！";
  }
  if (level === "medium") {
    return "感谢您的评价，我们非常重视您的反馈，会持续优化服务细节，努力为您带来更好的消费体验！";
  }
  // 差评针对性回复
  const keywordText = keywords?.join("、") || "服务";
  return `非常抱歉给您带来了不好的体验，关于您反馈的${keywordText}问题我们高度重视，已立刻整改优化。感谢您的监督，我们会努力提升服务质量，期待再次为您服务！`;
};

const ReviewManagement: React.FC = () => {
  // 表单实例
  const [form] = Form.useForm<{ replyContent: string }>();
  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [filterLevel, setFilterLevel] = useState<ReviewLevel | "">("");
  const [searchText, setSearchText] = useState<string>("");
  const [replyModal, setReplyModal] = useState<boolean>(false);
  const [currentReview, setCurrentReview] = useState<ReviewItem | null>(null);

  // 模拟评价数据
  const [reviewList, setReviewList] = useState<ReviewItem[]>([
    {
      key: "1",
      userName: "阳光明媚",
      userAvatar: "https://picsum.photos/id/64/40/40",
      content: "商品新鲜度很高，配送速度特别快，包装完好，非常满意！",
      images: ["https://picsum.photos/id/292/200/200"],
      level: "good",
      createTime: "2025-05-20 14:30",
      replyContent:
        "非常感谢您的好评与认可，我们会继续努力为您提供更优质的商品和服务！",
      replyTime: "2025-05-20 15:10",
    },
    {
      key: "2",
      userName: "小吃货",
      userAvatar: "https://picsum.photos/id/65/40/40",
      content: "商品还可以，就是配送时间有点久，希望能改进一下。",
      images: [],
      level: "medium",
      createTime: "2025-05-20 13:20",
      replyContent: null,
      replyTime: null,
    },
    {
      key: "3",
      userName: "消费者小王",
      userAvatar: "https://picsum.photos/id/66/40/40",
      content: "商品质量有问题，包装破损，配送超时，服务态度也不好！",
      images: [
        "https://picsum.photos/id/429/200/200",
        "https://picsum.photos/id/430/200/200",
      ],
      level: "bad",
      badKeywords: ["商品质量", "包装破损", "配送超时", "服务态度"],
      suggest:
        "1. 加强商品出库质检，杜绝质量问题；2. 优化包装材质，防止破损；3. 提升配送时效，加强骑手管理；4. 强化客服服务意识培训。",
      createTime: "2025-05-20 10:15",
      replyContent: null,
      replyTime: null,
    },
  ]);

  // 筛选数据
  const filteredList = reviewList.filter((item) => {
    const matchLevel = filterLevel ? item.level === filterLevel : true;
    const matchSearch =
      item.content.includes(searchText) || item.userName.includes(searchText);
    return matchLevel && matchSearch;
  });

  // 打开回复弹窗
  const handleOpenReply = (record: ReviewItem) => {
    setCurrentReview(record);
    form.setFieldValue(
      "replyContent",
      generateAIReply(record.level, record.badKeywords),
    );
    setReplyModal(true);
  };

  // 提交回复
  const handleSubmitReply = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      setTimeout(() => {
        const newList = reviewList.map((item) => {
          if (item.key === currentReview?.key) {
            return {
              ...item,
              replyContent: values.replyContent,
              replyTime: new Date().toLocaleString("zh-CN"),
            };
          }
          return item;
        });
        setReviewList(newList);
        setReplyModal(false);
        message.success("评价回复成功");
        setLoading(false);
      }, 800);
    });
  };

  // 表格列配置
  const columns: TableProps<ReviewItem>["columns"] = [
    {
      title: "用户信息",
      dataIndex: "userName",
      key: "userName",
      render: (name, record) => (
        <Space>
          <Image
            src={record.userAvatar}
            width={32}
            preview={false}
            style={{ borderRadius: "50%" }}
          />
          <Text>{name}</Text>
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
          <Text>{text}</Text>
          {record.images.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {record.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img}
                  width={60}
                  height={60}
                  style={{ borderRadius: 4, objectFit: "cover" }}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "评价类型",
      dataIndex: "level",
      key: "level",
      render: (level) => {
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
          <Select
            placeholder="筛选评价类型"
            style={{ width: 160 }}
            value={filterLevel}
            onChange={(val) => setFilterLevel(val)}
            allowClear
          >
            <Option value="good">好评</Option>
            <Option value="medium">中评</Option>
            <Option value="bad">差评</Option>
          </Select>
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
        onCancel={() => setReplyModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setReplyModal(false)}>
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
        ]}
        width={650}
        destroyOnClose
      >
        {currentReview && (
          <div>
            {/* 评价详情 */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>用户评价：</Text>
              <p style={{ margin: "8px 0" }}>{currentReview.content}</p>
              {currentReview.images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {currentReview.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      width={80}
                      height={80}
                      style={{ borderRadius: 4 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* AI差评分析 */}
            {currentReview.level === "bad" && (
              <Card
                size="small"
                style={{ marginBottom: 16, background: "#fff7f6" }}
              >
                <Text strong style={{ color: "#ff4d4f" }}>
                  🔍 AI差评分析
                </Text>
                <Divider style={{ margin: "8px 0" }} />
                <div>
                  <Text>关键词：</Text>
                  {currentReview.badKeywords?.map((kw) => (
                    <Tag key={kw} color="red" style={{ marginBottom: 4 }}>
                      {kw}
                    </Tag>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text>改进建议：</Text>
                  <p style={{ margin: "4px 0", color: "#666" }}>
                    {currentReview.suggest}
                  </p>
                </div>
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
                💡 系统已自动生成合规礼貌的回复，可直接修改或自定义编辑
              </Text>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagement;
