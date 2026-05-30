import axios from "@/axios";

import type {
  PageResult,
  ProductCategory,
  ProductCategoryAudit,
  AdminAuditParams,
} from "@/types/product";

// ============= 类目管理 =============
// 获取类目树形结构
export const getCategoryTree = async (): Promise<ProductCategory[]> => {
  const res = await axios.get("admin/category/tree");
  return res.data.data;
};

// 新增类目
export const addCategory = async (
  data: Partial<ProductCategory>,
): Promise<void> => {
  await axios.post("admin/category/add", data);
};

// 编辑类目
export const editCategory = async (
  data: Partial<ProductCategory>,
): Promise<void> => {
  await axios.put("admin/category/edit", data);
};

// 删除类目
export const deleteCategory = async (id: string): Promise<void> => {
  await axios.delete(`admin/category/delete?id=${id}`);
};

// ============= 类目审核 =============
// 获取审核列表
export const getAuditList = async (
  params: AdminAuditParams,
): Promise<PageResult<ProductCategoryAudit>> => {
  return await axios.get("admin/category/audit/list", { params });
};

// 审核通过
export const auditPass = async (data: {
  auditId: string;
  spuId: string;
  newCategoryId: string;
}): Promise<void> => {
  await axios.put("admin/category/audit/pass", data);
};

// 审核驳回
export const auditReject = async (data: {
  auditId: string;
  auditRemark: string;
}): Promise<void> => {
  await axios.put("admin/category/audit/reject", data);
};

// 获取审核详情
export const getAuditDetail = async (
  id: string,
): Promise<ProductCategoryAudit> => {
  return await axios.get(`admin/category/audit/detail?auditId=${id}`);
};
export const batchUpdateAuditSpuStatus = async (data: {
  spuIds: string[];
  auditStatus: 0 | 1 | 2;
  auditRemark?: string;
}) => {
  await axios.put("product/batch/audit", data);
};