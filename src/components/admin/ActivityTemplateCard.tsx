import React from "react";
import { Card, Row, Col, Button, Tag, Space } from "antd";
import type { ActivityTemplate } from "@/types/product";

interface TemplateCardProps {
  // 模板列表
  templateList: ActivityTemplate[];
  // 选中模板的回调：把模板配置抛给父组件
  onSelectTemplate: (config: ActivityTemplate["defaultConfig"]) => void;
}

const ActivityTemplateCard: React.FC<TemplateCardProps> = ({
  templateList,
  onSelectTemplate,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2>📋 选择活动场景模板（推荐618大促）</h2>
      <Row gutter={16}>
        {templateList.map((item) => (
          <Col span={8} key={item.id}>
            <Card hoverable size="default">
              <Space align="center" size={12}>
                {item.icon}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    {item.name}
                  </div>
                  <Tag color="blue">{item.theme}</Tag>
                </div>
              </Space>
              <div style={{ margin: "12px 0" }}>
                <p>适用商家：{item.defaultConfig.targetMerchantType}</p>
                <p>主力类目：{item.defaultConfig.targetCategory.join("、")}</p>
              </div>
              <Button
                type="primary"
                block
                onClick={() => onSelectTemplate(item.defaultConfig)}
              >
                使用此模板（自动填充表单）
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ActivityTemplateCard;
