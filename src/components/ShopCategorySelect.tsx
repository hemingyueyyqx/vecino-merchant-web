import React from "react";
import { Cascader } from "antd";
import categoryOptions from "@/services/const"

// 一级+二级 分类数据源（完全按照你需求整理）




// 增加 value 和 onChange，支持表单提交/回显
const ShopCategorySelect: React.FC<{
    value?: string[];
    onChange?: (val: string[]) => void;
  }> = ({ value, onChange }) => {
    return (
      <Cascader
        value={value}
        onChange={onChange}
        options={categoryOptions}
        placeholder="请选择经营分类"
        style={{ width: 320 }}
        showCheckedStrategy="SHOW_CHILD"
        allowClear
      />
    );
  };

export default ShopCategorySelect;
