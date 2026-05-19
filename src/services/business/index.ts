import axios from "@/axios";
import type { MerchantShop } from "@/types/user";
import type {
  MerchantSpuParams,
  ProductSpu,
  ProductSku,
} from "@/types/product";

/**
 * 获取所有商家用户列表
 */
export async function getAllMerchants() {
  try {
    const res = await axios.get("user/merchant");
    return res.data.data;
  } catch (error) {
    console.error("获取商家列表失败：", error);
    return [];
  }
}

/**
 * 获取商家及其店铺信息列表（入驻审核列表）
 */
export async function getAllMerchantsAndShop() {
  try {
    const res = await axios.get("user/merchantShop");
    if (res.data.code === 403) {
      throw new Error(res.data.message);
    }
    return res.data.data;
  } catch (error) {
    console.error("获取商家及店铺信息失败：", error);
    return [];
  }
}
// 审核通过
export async function auditPass(data: MerchantShop) {
  return axios.put("shop/audit/pass", data);
}

// 审核驳回
export async function auditReject(data: MerchantShop) {
  return axios.put(`shop/audit/reject`, data);
}

// 1. 获取商品列表（async/await）
export const getSpuList = async (params: MerchantSpuParams) => {
  console.log(params);
  const res = await axios.post("product/productInfo", params);
  console.log("商品列表", res.data.data);
  return res.data.data;
};

// 2. 商品批量上下架
export const batchUpdateSpuStatus = async (data: {
  spuIds: string[];
  status: 0 | 1;
}) => {
  await axios.put("product/batch/status", data);
};

// 3. 删除商品
export const deleteSpu = async (id: string): Promise<void> => {
  await axios.delete(`business/spu/delete?id=${id}`);
};

// // 4. 查询SKU列表
// export const getSkuList = async (spuId: string): Promise<ProductSku[]> => {
//   return await axios.get(`business/sku/list?spuId=${spuId}`);
// };

// 5. 修改库存预警
export const updateWarnStock = async (data: {
  skuId: string;
  warnStock: number;
}) => {
  await axios.put("business/sku/stock/warn", data);
};
// 更新 SKU 信息
export const updateSkuInfo = async (data: ProductSku) => {
  console.log("修改SKU信息", data);

  await axios.put("product/updateSKU", data);
};
// 6. 新增商品（SPU + SKU）
export const addSpu = async (data: ProductSpu) => {
  await axios.post("product/addProduct", data);
};

// 7. 编辑商品（SPU）
export const editSpu = async (data) => {
  console.log("编辑商品", data);
  await axios.put("product/updateSPU", data);
};

// 8. 单个商品上下架
export const updateSpuStatus = async (data: {
  spuId: string;
  status: 0 | 1;
}): Promise<void> => {
  await axios.put("business/spu/status", data);
};
// 批量审核商品
export const batchAuditSpu = async (data: {
  spuIds: string[];
  auditStatus: 0 | 1 | 2;
}) => {
  await axios.put("product/batch/audit", data);
};
// ai标题优化
export const aiTitleOptimize = async (spuName: string) => {
  const res = await axios.post("optimize-title", spuName);
  console.log("ai标题优化", res.data.data);
  return res.data.data;
};