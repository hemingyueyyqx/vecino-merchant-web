import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  NavBar,
  Grid,
  Card,
  Button,
  Toast,
  PullToRefresh,
  Popup,
  Image,
} from "antd-mobile";
import {
  CloseOutline,
  UserOutline,
  PhoneFill,
  LocationOutline,
} from "antd-mobile-icons";
import { getSpuList } from "@/services/business";
import { BASE_URL } from "@/services/constant";
import type { ProductSpu, ProductSku } from "@/types/product";
import type { MerchantShop, UserInfo } from "@/types/user";
import { getUserInfo } from "@/services/customer";
import { addOrder, getBalance } from "@/services/customer";

import "./ShopDetailPage.css";

interface ShopDetailPageProps {
  shop: MerchantShop;
  onBack: () => void;
}

function ShopDetailPage({ shop, onBack }: ShopDetailPageProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSpu[]>([]);
  const [loading, setLoading] = useState(false);

  const [skuPopupVisible, setSkuPopupVisible] = useState(false);
  const [detailPopupVisible, setDetailPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSpu | null>(
    null,
  );
  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  // 余额信息
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // 支付确认弹窗
  const [payConfirmVisible, setPayConfirmVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // 🔥 修复点1：删除useCallback，直接在useEffect内实现请求逻辑
  useEffect(() => {
    // 定义异步函数
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {
          shopId: shop.shopId,
          spuStatus: 1,
        };
        const res = await getSpuList(params);
        setProducts(res || []);
      } catch (err) {
        console.error("获取商品列表失败", err);
        Toast.show({ content: "加载商品失败", position: "top" });
      } finally {
        setLoading(false);
      }
    };

    // 执行请求
    loadProducts();
  }, [shop.shopId]); // 仅依赖店铺ID，最稳定
  // 新增：获取用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      setUserLoading(true);
      try {
        const data = await getUserInfo();
        setUserInfo(data);
      } catch (err) {
        console.error("获取用户信息失败", err);
        Toast.show({ content: "加载用户信息失败", position: "top" });
      } finally {
        setUserLoading(false);
      }
    };
    loadUserInfo();
  }, []);
  // 获取余额
  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const data = await getBalance();
      setBalance(data || 0);
      return data || 0;
    } catch (err) {
      console.error("获取余额失败", err);
      Toast.show({ content: "获取余额失败", position: "top" });
      return 0;
    } finally {
      setBalanceLoading(false);
    }
  };
  // 🔥 修复点2：刷新函数复用请求逻辑
  const onRefresh = async () => {
    setLoading(true);
    try {
      const params = {
        shopId: shop.shopId,
        spuStatus: 1,
      };
      const res = await getSpuList(params);
      setProducts(res || []);
      Toast.show({ content: "刷新成功", position: "top" });
    } catch {
      Toast.show({ content: "刷新失败", position: "top" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: ProductSpu) => {
    setSelectedProduct(product);
    setSelectedSku(product.skuList?.[0] || null);
    setSkuPopupVisible(true);
  };

  const handleCardClick = (product: ProductSpu) => {
    setSelectedProduct(product);
    setDetailPopupVisible(true);
  };

  // 确认下单 - 新增余额校验和支付确认
  const handleConfirmAddToCart = async () => {
    // 1. 校验规格
    if (!selectedSku) {
      Toast.show({ content: "请选择规格", position: "top" });
      return;
    }

    // 2. 校验数量
    if (quantity <= 0) {
      Toast.show({ content: "请输入有效的数量", position: "top" });
      return;
    }

    // 3. 校验库存
    if (quantity > selectedSku.stockNum) {
      Toast.show({
        content: `库存不足，最多可购买 ${selectedSku.stockNum} 件`,
        position: "top",
      });
      return;
    }

    // 4. 计算总金额
    const amount = (selectedSku.price || 0) * quantity;
    setTotalAmount(amount);

    // 5. 获取并校验余额
    const currentBalance = await fetchBalance();
    if (currentBalance < amount) {
      Toast.show({
        content: `余额不足，当前余额 ¥${currentBalance.toFixed(2)}，需要 ¥${amount.toFixed(2)}`,
        position: "top",
      });
      return;
    }

    // 6. 显示支付确认弹窗
    setPayConfirmVisible(true);
  };
  // 确认支付
  const handleConfirmPay = async () => {
    if (!selectedProduct || !selectedSku || !userInfo) return;

    try {
      // 构建订单参数
      const orderParams = {
        shopId: shop.shopId,
        shopName: shop.shopName,
        spuId: selectedProduct.spuId,
        spuName: selectedProduct.spuName,
        mainImage: selectedProduct.mainImage,
        skuId: selectedSku.id,
        specAttr: selectedSku.specAttr,
        price: selectedSku.price,
        quantity: quantity,
        totalAmount: totalAmount,
        address: userInfo.address,
      };

      // 调用下单接口
      await addOrder(orderParams);

      Toast.show({ content: "下单成功", icon: "success", position: "top" });

      // 关闭弹窗
      setPayConfirmVisible(false);
      setSkuPopupVisible(false);
      setSelectedSku(null);
      setQuantity(1);

      // 刷新余额
      await fetchBalance();
      // 刷新订单列表
      onRefresh();
      // 刷新购物车
    } catch (err) {
      console.error("下单失败", err);
      Toast.show({ content: "下单失败，请重试", position: "top" });
    }
  };

  // 取消支付
  const handleCancelPay = () => {
    setPayConfirmVisible(false);
  };
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/customer");
    }
  };

  // ———— 以下UI渲染代码完全不变 ————
  return (
    <div className="shop-detail-page">
      <NavBar onBack={handleBack}>{shop.shopName}</NavBar>

      <PullToRefresh onRefresh={onRefresh}>
        <div className="product-list-container">
          {loading ? (
            <div className="loading-tip">加载中...</div>
          ) : products.length === 0 ? (
            <div className="empty-tip">该店铺暂无商品</div>
          ) : (
            <Grid columns={2} gap={12}>
              {products.map((product) => (
                <Grid.Item key={product.spuId}>
                  <Card
                    className="product-card"
                    onClick={() => handleCardClick(product)}
                  >
                    <div className="product-image-wrapper">
                      {product.mainImage ? (
                        <img
                          src={
                            product.mainImage.startsWith("http")
                              ? product.mainImage
                              : `${BASE_URL}${product.mainImage}`
                          }
                          alt={product.spuName}
                          className="product-image"
                        />
                      ) : (
                        <div className="no-image">-</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h4 className="product-name" title={product.spuName}>
                        {product.spuName}
                      </h4>
                      <div className="product-footer">
                        <span className="product-price">
                          ¥{(product.skuList?.[0]?.price || 0).toFixed(2)}
                        </span>
                        <Button
                          size="mini"
                          color="primary"
                          fill="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          下单
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Grid.Item>
              ))}
            </Grid>
          )}
        </div>
      </PullToRefresh>

      {/* 规格选择弹窗 */}
      <Popup
        visible={skuPopupVisible}
        onMaskClick={() => {
          setSelectedSku(null);
          setQuantity(1);
          setSkuPopupVisible(false);
        }}
        bodyStyle={{
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          minHeight: "40vh",
        }}
      >
        <div className="sku-popup-content">
          <div className="popup-header">
            <h3>选择规格</h3>
            <CloseOutline
              onClick={() => {
                setSelectedSku(null);
                setQuantity(1);
                setSkuPopupVisible(false);
              }}
              style={{ fontSize: 20, cursor: "pointer" }}
            />
          </div>
          <div className="user-info-section">
            <div className="section-title">
              <UserOutline style={{ marginRight: 8 }} />
              收货信息
            </div>
            {userLoading ? (
              <div className="loading-text">加载中...</div>
            ) : userInfo ? (
              <div className="user-info-content">
                <div className="user-info-item">
                  <UserOutline className="info-icon" />
                  <span className="info-label">昵称:</span>
                  <span className="info-value">
                    {userInfo.nickname || "--"}
                  </span>
                </div>
                <div className="user-info-item">
                  <PhoneFill className="info-icon" />
                  <span className="info-label">手机号:</span>
                  <span className="info-value">{userInfo.phone || "--"}</span>
                </div>
                <div className="user-info-item">
                  <LocationOutline className="info-icon" />
                  <span className="info-label">地址:</span>
                  <span className="info-value">
                    {userInfo.address || "请添加收货地址"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-user-info">未获取到用户信息</div>
            )}
          </div>

          {selectedProduct && (
            <>
              <div className="product-preview">
                {selectedProduct.mainImage ? (
                  <Image
                    src={
                      selectedProduct.mainImage.startsWith("http")
                        ? selectedProduct.mainImage
                        : `${BASE_URL}${selectedProduct.mainImage}`
                    }
                    fit="cover"
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    -
                  </div>
                )}
                <div className="preview-info">
                  <div className="preview-name">{selectedProduct.spuName}</div>
                  <div className="preview-price">
                    ¥{(selectedSku?.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="sku-selector">
                <div className="sku-label">规格</div>
                <div className="sku-options">
                  {selectedProduct.skuList?.map((sku) => (
                    <div
                      key={sku.id}
                      className={`sku-option ${
                        selectedSku?.id === sku.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedSku(sku)}
                    >
                      {sku.specAttr || "默认规格"}
                      {sku.stockNum !== undefined && (
                        <span className="stock-info">
                          (库存: {sku.stockNum})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* 🔥 新增：数量选择器 */}
              <div className="quantity-section">
                <div className="quantity-label">数量</div>
                <div className="quantity-controls">
                  <Button
                    size="mini"
                    fill="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <div className="quantity-value">{quantity}</div>
                  <Button
                    size="mini"
                    fill="outline"
                    onClick={() => {
                      if (selectedSku && quantity < selectedSku.stockNum) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={selectedSku && quantity >= selectedSku.stockNum}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="popup-footer">
                <Button
                  block
                  color="primary"
                  size="large"
                  onClick={handleConfirmAddToCart}
                  children={
                    selectedSku ? (
                      <span>
                        确认下单 (¥{(selectedSku.price * quantity).toFixed(2)})
                      </span>
                    ) : (
                      "确认下单"
                    )
                  }
                />
              </div>
            </>
          )}
        </div>
      </Popup>
      {/* 支付确认弹窗 */}
      <Popup
        visible={payConfirmVisible}
        onMaskClick={handleCancelPay}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "24px",
          minHeight: "30vh",
        }}
      >
        <div className="pay-confirm-content">
          <div className="pay-confirm-title">确认支付</div>

          <div className="pay-confirm-amount">
            <span className="amount-label">订单金额</span>
            <span className="amount-value">¥{totalAmount.toFixed(2)}</span>
          </div>

          <div className="pay-confirm-balance">
            <span className="balance-label">当前余额</span>
            <span className="balance-value">¥{balance.toFixed(2)}</span>
          </div>

          <div className="pay-confirm-tip">
            确认支付后，将从您的账户余额中扣除相应金额
          </div>

          <div className="pay-confirm-actions">
            <Button
              block
              fill="outline"
              size="large"
              onClick={handleCancelPay}
              className="cancel-btn"
            >
              取消
            </Button>
            <Button
              block
              color="primary"
              size="large"
              onClick={handleConfirmPay}
              className="confirm-btn"
            >
              确认支付 ¥{totalAmount.toFixed(2)}
            </Button>
          </div>
        </div>
      </Popup>

      {/* 商品详情弹窗 */}
      <Popup
        visible={detailPopupVisible}
        position="bottom"
        onMaskClick={() => {
          setDetailPopupVisible(false);
        }}
        bodyStyle={{
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div className="detail-popup-content">
          <div className="popup-header">
            <h3>商品详情</h3>
            <CloseOutline
              onClick={() => setDetailPopupVisible(false)}
              style={{ fontSize: 20, cursor: "pointer" }}
            />
          </div>

          {selectedProduct && (
            <div className="product-detail">
              {selectedProduct.mainImage ? (
                <Image
                  src={
                    selectedProduct.mainImage.startsWith("http")
                      ? selectedProduct.mainImage
                      : `${BASE_URL}${selectedProduct.mainImage}`
                  }
                  fit="cover"
                  style={{ width: "100%", height: 200, borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 8,
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  -
                </div>
              )}

              <div className="detail-info">
                <h2 className="detail-name">{selectedProduct.spuName}</h2>

                <div className="detail-price">
                  <span className="price-label">价格:</span>
                  <span className="price-value">
                    ¥{(selectedProduct.skuList?.[0]?.price || 0).toFixed(2)}
                  </span>
                </div>

                {selectedProduct.skuList &&
                  selectedProduct.skuList.length > 0 && (
                    <div className="detail-specs">
                      <div className="specs-label">可选规格:</div>
                      <div className="specs-list">
                        {selectedProduct.skuList.map((sku, index) => (
                          <div key={sku.id || index} className="spec-item">
                            <span>{sku.specAttr || "默认规格"}</span>
                            <span className="spec-price">
                              ¥{(sku.price || 0).toFixed(2)}
                            </span>
                            {sku.stockNum !== undefined && (
                              <span className="spec-stock">
                                库存: {sku.stockNum}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedProduct.detail && (
                  <div className="detail-description">
                    <div className="description-label">商品描述:</div>
                    <div
                      className="description-content"
                      dangerouslySetInnerHTML={{
                        __html: selectedProduct.detail,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Popup>
    </div>
  );
}

export default ShopDetailPage;
