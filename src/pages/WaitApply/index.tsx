import { useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { findShop } from "../../services/auth";
import { getRole } from "@/services/utils";
import { RoleConst } from "../../types/user";

const WaitApply = () => {
  const navigate = useNavigate();

  // 页面加载/刷新时自动校验店铺状态
  useEffect(() => {
    const checkShopStatus = async () => {
      try {
        // 调用接口获取店铺信息
        const shopData = await findShop();
        const shopInfo = shopData?.shopInfo;


        // 无店铺信息 → 异常
        if (!shopInfo) {
          message.error("店铺信息异常，请重新入驻");
          navigate("/apply", { replace: true });
          return;
        }

        // 根据状态跳转
        switch (shopInfo.status) {
          case 0:
            // 审核通过 → 进入商家后台
            {
              // 加这个大括号
              // 审核通过 → 进入商家后台
              const role = getRole();
              if (role === RoleConst.BUSINESS) {
                navigate("/business", { replace: true });
              }
            }
            break;
          case 1:
            // 已驳回 → 修改申请
            message.warning("店铺申请被驳回，请修改信息重新提交");
            navigate("/apply", { replace: true });
            break;
          case 2:
            // 待审核 → 留在当前页
            break;
          default:
            message.error("店铺状态异常，请联系管理员");
            navigate("/apply", { replace: true });
        }
      } catch {
        message.error("状态校验失败，请重新登录");
        navigate("/login", { replace: true });
      }
    };

    // 执行检查
    checkShopStatus();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>店铺入驻申请正在审核中，请耐心等待!</h1>
    </div>
  );
};

export default WaitApply;
