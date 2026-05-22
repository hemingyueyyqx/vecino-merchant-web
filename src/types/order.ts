
export interface Order {
    orderId?: string;
    orderNo?: string;
  customerId?: string;
  shopId?: string;
  shopName?: string;
    spuId?: string;
    spuName?: string;
    mainImage?: string;
    skuId?: string;
  specAttr?: string;
  price?: number;
    quantity?: number;
    totalAmount?: number;
    address?: string;
  orderStatus?: 0 | 1|2|3|4|5;
  createTime?: string;
  updateTime?: string;
}
// 评价类型
export interface Review {
  reviewId?: string;
  shopId?: string;
  orderId?: string;
  orderNo?: string;
  content?: string;
  customerId?: string;
  nickname?: string;
  image?: string;
  createTime?: string;
  updateTime?: string;
    reviewType?: number;
    // ai分析结果
    analysis?: string;
  // 评价回复
  replyContent?: string;
}
