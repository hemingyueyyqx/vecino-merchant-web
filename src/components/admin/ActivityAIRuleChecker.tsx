import React from "react";
import { Drawer, Button, Spin, List, Alert } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import type{ ActivityConfigDTO, AiCheckResult } from "@/types/product";

interface AIRuleCheckerProps {
  open: boolean;
  onClose: () => void;
  currentActivityConfig: ActivityConfigDTO | null;
  checkResult: AiCheckResult[];
  loading: boolean;
  onCheckRule: () => void;
}

const ActivityAIRuleChecker: React.FC<AIRuleCheckerProps> = ({
  open,
  onClose,
  currentActivityConfig,
  checkResult,
  loading,
  onCheckRule,
}) => {
  return (
    <Drawer
      title="🤖 AI活动规则校验助手（面向商家适配）"
      open={open}
      onClose={onClose}
      width={420}
      maskClosable={false}
    >
      <Button
        type="primary"
        icon={<BulbOutlined />}
        loading={loading}
        onClick={onCheckRule}
        block
        disabled={!currentActivityConfig}
      >
        开始AI智能校验（商家毛利/合规/风险）
      </Button>

      {/* 修复1：Spin tip → description */}
      <Spin spinning={loading} description="大模型分析中...">
        <div style={{ marginTop: 24 }}>
          {checkResult.length === 0 ? (
            // 修复2：Alert message → title
            <Alert title="请点击上方按钮开始校验活动规则" type="info" />
          ) : (
            <List
              dataSource={checkResult}
              renderItem={(item) => (
                <List.Item>
                  {/* 修复2：Alert message → title */}
                  <Alert
                    title={item.content}
                    type={item.type}
                    showIcon
                    style={{ width: "100%" }}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Spin>
    </Drawer>
  );
};

export default ActivityAIRuleChecker;
