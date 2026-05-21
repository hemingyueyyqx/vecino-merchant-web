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
import { CloseOutline } from "antd-mobile-icons";
import { getSpuList } from "@/services/business";
import type { ProductSpu, ProductSku } from "@/types/product";
import type { MerchantShop } from "@/types/user";
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

  const handleConfirmAddToCart = () => {
    if (!selectedSku) {
      Toast.show({ content: "请选择规格", position: "top" });
      return;
    }
    // 🔥 新增：验证数量
    if (quantity <= 0) {
      Toast.show({ content: "请输入有效的数量", position: "top" });
      return;
    }

    // 🔥 新增：检查库存
    if (quantity > selectedSku.stockNum) {
      Toast.show({
        content: `库存不足，最多可购买 ${selectedSku.stockNum} 件`,
        position: "top",
      });
      return;
    }
    Toast.show({
      content: `已将 ${selectedProduct?.spuName} 加入购物车`,
      position: "top",
    });
    setSkuPopupVisible(false);
  };;

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
                      <img
                        src={
                          product.mainImage ||
                          "https://picsum.photos/200/200?random=1"
                        }
                        alt={product.spuName}
                        className="product-image"
                      />
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
          setSkuPopupVisible(false)
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
                setSkuPopupVisible(false)
              }}
              style={{ fontSize: 20, cursor: "pointer" }}
            />
          </div>

          {selectedProduct && (
            <>
              <div className="product-preview">
                <Image
                  src={
                    selectedProduct.mainImage || "https://picsum.photos/100/100"
                  }
                  fit="cover"
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                />
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
                    )}
                />
                  
              </div>
            </>
          )}
        </div>
      </Popup>

      {/* 商品详情弹窗 */}
      <Popup
        visible={detailPopupVisible}
        position="bottom"
        onMaskClick={() => {
          setDetailPopupVisible(false)
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
              <Image
                src={
                  selectedProduct.mainImage || "https://picsum.photos/300/300"
                }
                fit="cover"
                style={{ width: "100%", height: 200, borderRadius: 8 }}
              />

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
