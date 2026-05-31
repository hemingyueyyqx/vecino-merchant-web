/**
 * 1. 商品类目表 product_category
 */
export interface ProductCategory {
  id: string;
  categoryName: string;
  parentId: string;
  level: 1 | 2 | 3;
  sort: number;
  attrStandard?: string;
  status: 0 | 1;
  createTime: string;
  updateTime: string;
}

/**
 * 2. 商品SPU表 product_spu
 */
export interface ProductSpu {
  spuId?: string;
  shopId?: string;
  spuName?: string;
  mainImage?: string;
  detail?: string;
  auditStatus?: 0 | 1 | 2;
  auditRemark?: string;
  spuStatus?: 0 | 1;
  createTime?: string;
  skuList?: ProductSku[];
  shopName?: string; // 新增 店铺名称
}

/**
 * 3. 商品SKU表 product_sku
 */
export interface ProductSku {
  id?: string;
  spuId?: string;
  specAttr?: string;
  price?: number;
  stockNum?: number;
  warnStock?: number;
  status?: 0 | 1;
  createTime?: string;
  updateTime?: string;
}

/**
 * 4. 类目审核记录表 product_category_audit
 */
export interface ProductCategoryAudit {
  id: string;
  spuId: string;
  oldCategoryId?: string;
  newCategoryId: string;
  applyUserId: string;
  auditUserId?: string;
  auditStatus: 0 | 1 | 2;
  auditRemark?: string;
  auditTime?: string;
  createTime: string;
  updateTime: string;
  spuName?: string;
  oldCategoryName?: string;
  newCategoryName?: string;
}
export interface Coupon {
  couponId?: string;
  couponName?: string;
  couponType?: 0 | 1 ;
  fullAmount?: number;
  reduceAmount?: number;
  discount?: number;
  wmkAmount?: number;
  totalCount: number;
  startTime?: string;
  endTime?: string;
  createTime?: string;
  updateTime?: string;
  shopId?: string;
  shopName?: string; // 新增 店铺名称
  couponStatus?: 0 | 1;
  auditStatus?: 0 | 1 | 2;
  auditRemark?: string;
}
/** 活动基础配置DTO（前后端统一字段） */
export interface ActivityConfigDTO {
  // 基础信息
  activityName: string;
  activityTheme: string; // 活动主题：618/双11等
  activityType: string; // 活动玩法：FULL_REDUCTION/COUPON/SECKILL
  startTime: string;
  endTime: string;
  // 营销规则（面向商家+用户）
  fullReductionRule: string; // 满减规则
  targetCategory: string[]; // 参与类目（商家类目）
  targetMerchantType: string; // 目标商家：全店/旗舰店/新店
  budget: number;
  activityDesc: string; // 商家端活动说明
}

/** 预设活动模板（618/开学季等） */
export interface ActivityTemplate {
  id: string;
  name: string;
  theme: string;
  icon: React.ReactNode;
  // 模板默认配置（一键回填到表单）
  defaultConfig: ActivityConfigDTO;
}

/** AI校验结果项 */
export interface AiCheckResult {
  type: "success" | "warning" | "info" | "error";
  content: string;
}

// -------------------------- 优化：无 any 分页参数 --------------------------
// 基础分页参数（固定字段）
interface BasePage {
  page: number;
  size: number;
}

// 商家商品列表查询参数
export interface MerchantSpuParams extends BasePage {
  spuName?: string;
  status?: 0 | 1;
  auditStatus?: 0 | 1 | 2;
}

// 平台类目审核查询参数
export interface AdminAuditParams extends BasePage {
  spuName?: string;
  auditStatus?: 0 | 1 | 2;
}

// 通用分页返回（泛型 无 any）
export interface PageResult<T> {
  list: T[];
  total: number;
}
