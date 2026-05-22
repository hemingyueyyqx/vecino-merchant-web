import { useState, useEffect } from "react";
import {
  NavBar,
  Card,
  Tag,
  PullToRefresh,
  Toast,
  Button,
  Image,
  Popup,
  Input,
} from "antd-mobile";
import {
  ClockCircleOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  TruckOutline,
  SmileOutline,
  StarOutline,
} from "antd-mobile-icons";
import {
  getOrderList,
  cancelOrder,
  confirmReceipt,
  addReview,
  getReview,
} from "@/services/customer";
import { updateOrderStatus } from "@/services/business"; // 导入 updateOrderStatus 接口
import type { Order, Review } from "@/types/order";
import "./index.css";

const getStatusText = (status?: number) => {
  const statusMap: Record<number, string> = {
    0: "已取消",
    1: "待接单",
    2: "备货中",
    3: "配送中",
    4: "交易完成待评价",
    5: "交易完成已评价", // 新增状态
  };
  return statusMap[status || 0] || "未知状态";
};

const getStatusColor = (status?: number) => {
  const colorMap: Record<number, string> = {
    0: "danger",
    1: "warning",
    2: "primary",
    3: "success",
    4: "default",
    5: "success", // 已评价状态颜色
  };
  return colorMap[status || 0] || "default";
};

const getStatusIcon = (status?: number) => {
  switch (status) {
    case 0:
      return <CloseCircleOutline />;
    case 1:
      return <ClockCircleOutline />;
    case 2:
      return <ClockCircleOutline />;
    case 3:
      return <TruckOutline />;
    case 4:
      return <CheckCircleOutline />;
    case 5:
      return <StarOutline />; // 已评价状态图标
    default:
      return null;
  }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "--";
  return dateStr.replace("T", " ");
};

const EmptyState = () => (
  <div className="empty-state">
    <SmileOutline
      style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}
    />
    <div className="empty-text">暂无订单</div>
  </div>
);

function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewType, setReviewType] = useState<number>(1);

  // 取消订单确认弹窗
  const [cancelConfirmVisible, setCancelConfirmVisible] = useState(false);
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | undefined>();

  // 评价弹窗
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentOrderForReview, setCurrentOrderForReview] =
    useState<Order | null>(null);
  const [reviewForm, setReviewForm] = useState<Partial<Review>>({
    reviewType: 1,
    content: "",
    image: "",
  });

  // 评价详情弹窗
  const [reviewDetailVisible, setReviewDetailVisible] = useState(false);
  const [currentReviewDetail, setCurrentReviewDetail] = useState<Review | null>(
    null,
  );
  const [reviewDetailLoading, setReviewDetailLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await getOrderList();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("获取订单列表失败", err);
      Toast.show({ content: "加载订单失败", icon: "fail" });
      return [];
    }
  };

  useEffect(() => {
    const initOrders = async () => {
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);
    };
    initOrders();
  }, []);

  const onRefresh = async () => {
    const data = await fetchOrders();
    setOrders(data);
    Toast.show({ content: "刷新成功" });
  };

  // 取消订单相关
  const handleShowCancelConfirm = (orderId?: string) => {
    setOrderIdToCancel(orderId);
    setCancelConfirmVisible(true);
  };

  const handleCancelConfirm = () => {
    setCancelConfirmVisible(false);
    setOrderIdToCancel(undefined);
  };

  const handleConfirmCancel = async () => {
    if (!orderIdToCancel) return;

    try {
      await cancelOrder(orderIdToCancel);
      Toast.show({ content: "取消订单成功", icon: "success" });
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("取消订单失败", err);
      Toast.show({ content: "取消订单失败", icon: "fail" });
    } finally {
      setCancelConfirmVisible(false);
      setOrderIdToCancel(undefined);
    }
  };

  // 确认收货
  const handleConfirmReceipt = async (orderId?: string) => {
    if (!orderId) return;
    try {
      await confirmReceipt(orderId);
      Toast.show({ content: "确认收货成功", icon: "success" });
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("确认收货失败", err);
      Toast.show({ content: "确认收货失败", icon: "fail" });
    }
  };

  // 去评价
  const handleOpenReviewModal = (order: Order) => {
    setCurrentOrderForReview(order);
    setReviewForm({
      content: "",
      image: "",
    });
    setReviewType(1); // 重置为好评
    setReviewModalVisible(true);
  };

  // 提交评价 - 修改后：评价成功后调用 updateOrderStatus 将状态改为5
  const handleSubmitReview = async () => {
    if (!currentOrderForReview || !reviewForm.content?.trim()) {
      Toast.show({ content: "请填写评价内容", icon: "fail" });
      return;
    }

    try {
      const reviewData: Review = {
        shopId: currentOrderForReview.shopId,
        orderId: currentOrderForReview.orderId,
        orderNo: currentOrderForReview.orderNo,
        content: reviewForm.content.trim(),
        image: reviewForm.image?.trim() || undefined,
        reviewType: reviewType,
      };

      // 1. 提交评价
      await addReview(reviewData);

      // 2. 评价成功后更新订单状态为5（已评价）
      if (currentOrderForReview.orderId) {
        await updateOrderStatus(currentOrderForReview.orderId, 5);
      }

      Toast.show({ content: "评价成功", icon: "success" });
      setReviewModalVisible(false);
      setCurrentOrderForReview(null);

      // 3. 刷新订单列表
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("评价失败", err);
      Toast.show({ content: "评价失败", icon: "fail" });
    }
  };

  // 查看评价详情
  const handleOpenReviewDetail = async (orderId?: string) => {
    if (!orderId) return;

    setReviewDetailLoading(true);
    try {
      const data = await getReview(orderId);
      setCurrentReviewDetail(data || null);
      setReviewDetailVisible(true);
    } catch (err) {
      console.error("获取评价详情失败", err);
      Toast.show({ content: "获取评价详情失败", icon: "fail" });
    } finally {
      setReviewDetailLoading(false);
    }
  };

  const canCancelOrder = (status?: number) => status === 1 || status === 2;
  const canConfirmReceipt = (status?: number) => status === 3;
  const canReview = (status?: number) => status === 4; // 只有交易完成(4)才能评价

  // 获取评价类型文字
  const getReviewTypeText = (type?: number) => {
    const map: Record<number, string> = {
      1: "好评",
      2: "中评",
      3: "差评",
    };
    return map[type || 1] || "好评";
  };

  // 获取评价类型颜色
  const getReviewTypeColor = (type?: number) => {
    const map: Record<number, string> = {
      1: "#52c41a",
      2: "#faad14",
      3: "#ff4d4f",
    };
    return map[type || 1] || "#52c41a";
  };

  return (
    <div className="order-list-page">
      <NavBar back={null}>我的订单</NavBar>

      <PullToRefresh onRefresh={onRefresh}>
        <div className="order-list-container">
          {loading ? (
            <div className="loading-tip">加载中...</div>
          ) : orders.length === 0 ? (
            <EmptyState />
          ) : (
            orders.map((order) => (
              <Card key={order.orderId || order.orderNo} className="order-card">
                <div className="order-header">
                  <div className="order-no">订单编号：{order.orderNo}</div>
                  <Tag
                    color={getStatusColor(order.orderStatus)}
                    className="status-tag"
                  >
                    {getStatusIcon(order.orderStatus)}
                    {getStatusText(order.orderStatus)}
                  </Tag>
                </div>

                {order.shopName && (
                  <div className="order-shop">{order.shopName}</div>
                )}

                <div className="order-item">
                  <Image
                    src={order.mainImage || "https://picsum.photos/80/80"}
                    fit="cover"
                    className="item-image"
                  />
                  <div className="item-info">
                    <div className="item-name">{order.spuName || "--"}</div>
                    <div className="item-spec">
                      {order.specAttr || "默认规格"}
                    </div>
                    <div className="item-bottom">
                      <span className="item-price">
                        ¥{(order.price || 0).toFixed(2)}
                      </span>
                      <span className="item-quantity">
                        x{order.quantity || 1}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-time-info">
                  <div className="time-item">
                    <span className="time-label">下单时间：</span>
                    <span className="time-value">
                      {formatDateTime(order.createTime)}
                    </span>
                  </div>
                  <div className="time-item">
                    <span className="time-label">更新时间：</span>
                    <span className="time-value">
                      {formatDateTime(order.updateTime)}
                    </span>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    合计：
                    <span className="total-price">
                      ¥{(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="order-actions">
                    {canCancelOrder(order.orderStatus) && (
                      <Button
                        size="small"
                        fill="outline"
                        onClick={() => handleShowCancelConfirm(order.orderId)}
                        className="action-btn cancel-btn"
                      >
                        取消订单
                      </Button>
                    )}
                    {canConfirmReceipt(order.orderStatus) && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleConfirmReceipt(order.orderId)}
                        className="action-btn confirm-btn"
                      >
                        确认收货
                      </Button>
                    )}
                    {canReview(order.orderStatus) && (
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleOpenReviewModal(order)}
                        className="action-btn review-btn"
                      >
                        <StarOutline />
                        去评价
                      </Button>
                    )}
                  </div>
                </div>

                {/* 交易完成和已评价时显示查看评价按钮 */}
                {(order.orderStatus === 4 || order.orderStatus === 5) && (
                  <div className="review-detail-btn-wrapper">
                    <Button
                      size="small"
                      fill="outline"
                      onClick={() => handleOpenReviewDetail(order.orderId)}
                      className="review-detail-btn"
                    >
                      查看评价详情
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </PullToRefresh>

      {/* 取消订单确认弹窗 */}
      <Popup
        visible={cancelConfirmVisible}
        onMaskClick={handleCancelConfirm}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "24px",
          minHeight: "20vh",
        }}
      >
        <div className="cancel-confirm-content">
          <div className="cancel-confirm-title">确认取消订单</div>
          <div className="cancel-confirm-desc">
            确定要取消此订单吗？取消后订单将无法恢复。
          </div>
          <div className="cancel-confirm-actions">
            <Button
              block
              fill="outline"
              size="large"
              onClick={handleCancelConfirm}
              className="cancel-btn"
            >
              取消
            </Button>
            <Button
              block
              color="danger"
              size="large"
              onClick={handleConfirmCancel}
              className="confirm-btn"
            >
              确认取消
            </Button>
          </div>
        </div>
      </Popup>

      {/* 评价弹窗 */}
      <Popup
        visible={reviewModalVisible}
        onMaskClick={() => {
          setReviewModalVisible(false);
          setCurrentOrderForReview(null);
        }}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "24px",
          minHeight: "50vh",
        }}
      >
        <div className="review-modal-content">
          <div className="review-modal-title">评价订单</div>

          {/* 订单信息 */}
          {currentOrderForReview && (
            <div className="review-order-info">
              <div className="review-order-no">
                订单编号：{currentOrderForReview.orderNo}
              </div>
              <div className="review-product-name">
                {currentOrderForReview.spuName}
              </div>
            </div>
          )}

          {/* 评价类型选择 */}
          <div className="review-type-section">
            <div className="section-title">评价类型</div>
            <div className="review-type-buttons">
              <Button
                size="small"
                fill={reviewType === 1 ? "solid" : "outline"}
                color={reviewType === 1 ? "success" : "default"}
                onClick={() => setReviewType(1)}
                className={`review-type-btn ${reviewType === 1 ? "active" : ""}`}
              >
                好评
              </Button>
              <Button
                size="small"
                fill={reviewType === 2 ? "solid" : "outline"}
                color={reviewType === 2 ? "warning" : "default"}
                onClick={() => setReviewType(2)}
                className={`review-type-btn ${reviewType === 2 ? "active" : ""}`}
              >
                中评
              </Button>
              <Button
                size="small"
                fill={reviewType === 3 ? "solid" : "outline"}
                color={reviewType === 3 ? "danger" : "default"}
                onClick={() => setReviewType(3)}
                className={`review-type-btn ${reviewType === 3 ? "active" : ""}`}
              >
                差评
              </Button>
            </div>
          </div>

          {/* 图片链接输入 */}
          <div className="review-image-section">
            <div className="section-title">图片链接（可选）</div>
            <Input
              placeholder="请输入图片链接"
              value={reviewForm.image}
              onChange={(val) =>
                setReviewForm((prev) => ({ ...prev, image: val }))
              }
              className="review-image-input"
            />
          </div>

          {/* 评价内容 */}
          <div className="review-content-section">
            <div className="section-title">评价内容</div>
            <textarea
              placeholder="请输入评价内容..."
              value={reviewForm.content}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, content: e.target.value }))
              }
              className="review-textarea"
              rows={4}
            />
          </div>

          {/* 提交按钮 */}
          <div className="review-actions">
            <Button
              block
              fill="outline"
              size="large"
              onClick={() => {
                setReviewModalVisible(false);
                setCurrentOrderForReview(null);
              }}
              className="cancel-btn"
            >
              取消
            </Button>
            <Button
              block
              color="primary"
              size="large"
              onClick={handleSubmitReview}
              className="submit-btn"
            >
              提交评价
            </Button>
          </div>
        </div>
      </Popup>

      {/* 评价详情弹窗 */}
      <Popup
        visible={reviewDetailVisible}
        onMaskClick={() => setReviewDetailVisible(false)}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "24px",
          minHeight: "30vh",
        }}
      >
        <div className="review-detail-content">
          <div className="review-detail-title">评价详情</div>

          {reviewDetailLoading ? (
            <div className="loading-tip">加载中...</div>
          ) : currentReviewDetail ? (
            <>
              {/* 评价类型 */}
              <div className="review-detail-type">
                <span
                  className="review-type-badge"
                  style={{
                    backgroundColor: getReviewTypeColor(
                      currentReviewDetail.reviewType,
                    ),
                  }}
                >
                  {getReviewTypeText(currentReviewDetail.reviewType)}
                </span>
              </div>

              {/* 用户昵称 */}
              {currentReviewDetail.nickname && (
                <div className="review-detail-nickname">
                  <span className="nickname-label">评价人：</span>
                  <span className="nickname-value">
                    {currentReviewDetail.nickname}
                  </span>
                </div>
              )}

              {/* 评价时间 */}
              {currentReviewDetail.createTime && (
                <div className="review-detail-time">
                  {formatDateTime(currentReviewDetail.createTime)}
                </div>
              )}

              {/* 评价图片 */}
              {currentReviewDetail.image && (
                <div className="review-detail-image">
                  <Image
                    src={currentReviewDetail.image}
                    fit="cover"
                    style={{ width: "100%", height: 200, borderRadius: 8 }}
                  />
                </div>
              )}

              {/* 评价内容 */}
              <div className="review-detail-content-text">
                <div className="content-label">评价内容</div>
                <div className="content-value">
                  {currentReviewDetail.content || "--"}
                </div>
              </div>

              {/* 回复内容 */}
              {currentReviewDetail.replyContent && (
                <div className="review-detail-reply">
                  <div className="reply-label">商家回复</div>
                  <div className="reply-value">
                    {currentReviewDetail.replyContent}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-review-tip">暂无评价</div>
          )}
        </div>
      </Popup>
    </div>
  );
}

export default OrderListPage;
