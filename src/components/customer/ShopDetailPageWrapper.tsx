import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllMerchantsAndShop } from "@/services/business";
import type { MerchantShop } from "@/types/user";
import ShopDetailPage from "./ShopDetailPage/ShopDetailPage";

function ShopDetailPageWrapper() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<MerchantShop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) {
        navigate("/customer", { replace: true });
        return;
      }

      try {
        const shops = await getAllMerchantsAndShop();
        const foundShop = shops.find((s: MerchantShop) => s.shopId === shopId);

        if (foundShop) {
          setShop(foundShop);
        } else {
          navigate("/customer", { replace: true });
        }
      } catch (err) {
        console.error("获取店铺信息失败", err);
        navigate("/customer", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
        加载中...
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
        店铺不存在
      </div>
    );
  }

  return <ShopDetailPage shop={shop} onBack={() => navigate("/customer")} />;
}

export default ShopDetailPageWrapper;
