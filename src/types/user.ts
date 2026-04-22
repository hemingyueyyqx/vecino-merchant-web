/**
 * 通用基础类型（终极极简版，兼容 erasableSyntaxOnly）
 */
// 通用状态正常0/禁用1/待审核2
export type Status = 0 | 1 | 2;


/**
 * 角色标识（type + 常量对象）
 */

export const RoleConst = {
  BUSINESS: 'Sj08',
  ADMIN: 'Js09' ,
  CUSTOMER: 'lM07',
};
export type RoleValue = (typeof RoleConst)[keyof typeof RoleConst]
/**
 * 基础用户信息（包含所有用户通用字段，含角色）
 * 👉 平台管理员/普通用户直接用这个接口，商户用户继承后加专属字段
 */
export interface User {
  id?: string;
  account?: string; // 登录账号
  nickname?: string; // 昵称/姓名
  phone?: string; // 手机号
  password?: string; // 密码
  confirmPassword?: string; // 确认密码
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
  role?: RoleValue; // 所有用户的通用角色字段
}


/**
 * 店铺基础信息
 */
export interface ShopInfo {
  id?: string;
  // 店铺所属商户ID
  businessId?: string;
  shopName?: string;
  shopType?: string;
  businessLicense?: string;
  legalPerson?:string;
  address?: string;
  status?: Status;
}
// 商家及其店铺信息
export interface MerchantShop {
  userId: string;
  shopId: string;
  nickname: string;
  shopName: string;
  account: string;
  legalPerson: string;
  phone: string;
  shopType: string;
  address: string;
  businessLicense: string;
  status: number;
  updateTime?: string;
  auditReason?: string;
}

/**
 * C端收货地址
 */
export interface Address {
  id?: string; 
  // 用户ID
  customerId?: string;   
  address?: string;
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间    
}

/**
 * 订单配送状态(后续移到订单模块)
 */
export type DeliveryStatus = 'pending' | 'delivering' | 'completed' | 'canceled';