import axios from "@/axios";
import type { MerchantShop } from "@/types/user";

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
export async function auditPass(data:MerchantShop) {
    return axios.put("shop/audit/pass",data);
  }
  
  // 审核驳回
  export async function auditReject(data:MerchantShop) {
    return axios.put(`shop/audit/reject`, data);
  }
