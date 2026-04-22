import { Typography } from "antd";
import React from "react";

const { Title } = Typography;

// 通用页面占位组件
const PagePlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div
      style={{
        padding: "24px",
        minHeight: "calc(100vh - 220px)",
        background: "#fff",
      }}
    >
      <Title level={3}>{title}</Title>
      <p style={{ color: "#999", marginTop: 16 }}>功能模块开发中...</p>
    </div>
  );
};

export default PagePlaceholder;
