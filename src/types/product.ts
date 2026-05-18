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
