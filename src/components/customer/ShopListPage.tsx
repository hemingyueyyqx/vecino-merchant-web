import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar,  Card, Button, Toast, PullToRefresh } from "antd-mobile";
import { AppOutline } from "antd-mobile-icons";
import { getAllMerchantsAndShop } from "@/services/business";
import type { MerchantShop } from "@/types/user";
import categoryOptions from "@/services/const";

interface ShopListPageProps {
  onEnterShop?: (shop: MerchantShop) => void;
}

const getCategoryLabel = (
  firstCategory?: string,
  secondCategory?: string,
): string => {
  if (!firstCategory || !secondCategory) return "未分类";

  const firstCat = categoryOptions.find((cat) => cat.value === firstCategory);
  if (!firstCat || !firstCat.children) return firstCategory;

  const secondCat = firstCat.children.find(
    (child) => child.value === secondCategory,
  );
  return secondCat ? secondCat.label : secondCategory;
};

function ShopListPage({ onEnterShop }: ShopListPageProps) {
  const navigate = useNavigate();
  const [shops, setShops] = useState<MerchantShop[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getAllMerchantsAndShop();
      const approvedShops = data.filter(
        (shop: MerchantShop) => shop.status === 0,
      );
      setShops(approvedShops);
    } catch (err) {
      console.error("获取店铺列表失败", err);
      Toast.show({ content: "加载店铺列表失败", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const onRefresh = async () => {
    await fetchShops();
    Toast.show({ content: "刷新成功" });
  };

  const handleEnterShop = (shop: MerchantShop) => {
    if (onEnterShop) {
      onEnterShop(shop);
    } else {
      navigate(`/customer/shop/${shop.shopId}`);
    }
  };

  return (
    <div className="shop-list-page">
      <NavBar back={null}>附近门店列表</NavBar>

      <PullToRefresh onRefresh={onRefresh}>
        <div className="shop-list-container">
          {loading ? (
            <div className="loading-tip">加载中...</div>
          ) : shops.length === 0 ? (
            <div className="empty-tip">暂无店铺</div>
          ) : (
            shops.map((shop) => (
              <Card key={shop.shopId} className="shop-card">
                <div className="shop-header">
                  <div className="shop-icon">
                    <AppOutline style={{ fontSize: 32, color: "#1677ff" }} />
                  </div>
                  <div className="shop-info">
                    <h3 className="shop-name">{shop.shopName}</h3>
                    <p className="shop-category">
                      品类：
                      {getCategoryLabel(
                        shop.firstCategory,
                        shop.secondCategory,
                      )}
                    </p>
                    <p className="shop-address">
                      {shop.address || "暂无地址信息"}
                    </p>
                  </div>
                </div>
                <div className="shop-action">
                  <Button
                    color="primary"
                    block
                    onClick={() => handleEnterShop(shop)}
                  >
                    进店逛逛
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}

export default ShopListPage;
