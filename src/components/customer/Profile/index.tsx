import { useState, useEffect } from "react";
import {
  NavBar,
  Card,
  Button,
  Toast,
  Popup,
  Input,
  Space,
  List,
  Popover,
} from "antd-mobile";
import {
  PayCircleOutline,
  AddCircleOutline,
  UserOutline,
  PhoneFill,
  LocationOutline,
} from "antd-mobile-icons";
import {
  getBalance,
  recharge,
  getUserInfo,
  updateAddress,
} from "@/services/customer";
import type { UserInfo } from "@/types/user";
import "./index.css";

function ProfilePage() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [rechargePopupVisible, setRechargePopupVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [addressPopupVisible, setAddressPopupVisible] = useState(false);
  const [addressInput, setAddressInput] = useState<string>("");
  const [userLoading, setUserLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const data = await getBalance();
      setBalance(data || 0);
    } catch (err) {
      console.error("获取余额失败", err);
      Toast.show({ content: "加载余额失败", icon: "fail" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    setUserLoading(true);
    try {
      const data = await getUserInfo();
      setUserInfo(data);
      if (data?.address) {
        setAddressInput(data.address);
      }
    } catch (err) {
      console.error("获取用户信息失败", err);
      Toast.show({ content: "加载用户信息失败", icon: "fail" });
    } finally {
      setUserLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchBalance();
  //   fetchUserInfo();
  // }, []);
  useEffect(() => {
    // 用异步函数包裹，避免同步 setState，警告直接消失
    const initPageData = async () => {
      await fetchBalance();
      await fetchUserInfo();
    };
    // 执行初始化
    initPageData();
  }, []);

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount);

    if (!rechargeAmount || isNaN(amount) || amount <= 0) {
      Toast.show({ content: "请输入有效的充值金额", icon: "fail" });
      return;
    }

    if (amount > 10000) {
      Toast.show({ content: "单次充值金额不能超过10000元", icon: "fail" });
      return;
    }

    try {
      await recharge(amount);
      Toast.show({ content: "充值成功", icon: "success" });
      setRechargePopupVisible(false);
      setRechargeAmount("");
      await fetchBalance();
    } catch (err) {
      console.error("充值失败", err);
      Toast.show({ content: "充值失败，请重试", icon: "fail" });
    }
  };

  const handleCloseRechargePopup = () => {
    setRechargePopupVisible(false);
    setRechargeAmount("");
  };

  const handleOpenAddressPopup = () => {
    setAddressPopupVisible(true);
  };

  const handleCloseAddressPopup = () => {
    setAddressPopupVisible(false);
    if (userInfo?.address) {
      setAddressInput(userInfo.address);
    } else {
      setAddressInput("");
    }
  };

  const handleSaveAddress = async () => {
    if (!addressInput || addressInput.trim() === "") {
      Toast.show({ content: "请输入地址信息", icon: "fail" });
      return;
    }

    try {
      await updateAddress(addressInput.trim());
      Toast.show({
        content: userInfo?.address ? "地址更新成功" : "地址新建成功",
        icon: "success",
      });
      setAddressPopupVisible(false);
      await fetchUserInfo();
    } catch (err) {
      console.error("保存地址失败", err);
      Toast.show({ content: "保存地址失败，请重试", icon: "fail" });
    }
  };

  return (
    <div className="profile-page">
      <NavBar back={null}>个人中心</NavBar>

      <div className="profile-content">
        <Card className="balance-card">
          <div className="balance-header">
            <PayCircleOutline style={{ fontSize: 32, color: "#1677ff" }} />
            <div className="balance-info">
              <div className="balance-label">账户余额</div>
              <div className="balance-amount">
                {loading ? (
                  <span className="loading-text">加载中...</span>
                ) : (
                  `¥${balance.toFixed(2)}`
                )}
              </div>
            </div>
          </div>
          <Button
            block
            color="primary"
            size="large"
            onClick={() => setRechargePopupVisible(true)}
            className="recharge-button"
          >
            <Space>
              <AddCircleOutline />
              立即充值
            </Space>
          </Button>
        </Card>

        <Card className="info-card">
          <List>
            <List.Item
              prefix={<UserOutline />}
              description={
                userLoading ? "加载中..." : userInfo?.nickname || "--"
              }
              className="custom-list-item"
            >
              用户昵称
            </List.Item>
            <List.Item
              prefix={<PhoneFill />}
              description={userLoading ? "加载中..." : userInfo?.phone || "--"}
            >
              手机号
            </List.Item>
            <List.Item
              prefix={<LocationOutline />}
              description={
                userLoading ? (
                  "加载中..."
                ) : userInfo?.address ? (
                  // <span className="address-text">{userInfo.address}</span>
                  <Popover
                    content={userInfo.address}
                    placement="bottom-start"
                    mode="dark"
                    trigger="click"
                  >
                    <span className="address-text">{userInfo.address}</span>
                    {/* <Button>点我</Button> */}
                  </Popover>
                ) : (
                  "--"
                )
              }
              extra={
                <Button
                  size="mini"
                  fill="outline"
                  onClick={handleOpenAddressPopup}
                >
                  {userInfo?.address ? "更新" : "新建"}
                </Button>
              }
            >
              收货地址
            </List.Item>
          </List>
        </Card>
      </div>

      <Popup
        visible={rechargePopupVisible}
        position="bottom"
        onMaskClick={handleCloseRechargePopup}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          minHeight: "40vh",
          padding: "20px",
        }}
      >
        <div className="recharge-popup">
          <div className="popup-title">账户充值</div>

          <div className="recharge-form">
            <div className="form-label">充值金额</div>
            <Input
              type="number"
              placeholder="请输入充值金额"
              value={rechargeAmount}
              onChange={(val) => setRechargeAmount(val)}
              className="recharge-input"
              clearable
            />
            <div className="input-suffix">元</div>
          </div>

          <div className="quick-amounts">
            <div className="quick-label">快捷金额</div>
            <div className="amount-buttons">
              {[50, 100, 200, 500].map((amount) => (
                <Button
                  key={amount}
                  size="small"
                  fill="outline"
                  onClick={() => setRechargeAmount(amount.toString())}
                  className={`amount-btn ${
                    rechargeAmount === amount.toString() ? "active" : ""
                  }`}
                >
                  ¥{amount}
                </Button>
              ))}
            </div>
          </div>

          <div className="popup-actions">
            <Button
              block
              fill="outline"
              size="large"
              onClick={handleCloseRechargePopup}
              className="cancel-btn"
            >
              取消
            </Button>
            <Button
              block
              color="primary"
              size="large"
              onClick={handleRecharge}
              className="confirm-btn"
            >
              确认充值
            </Button>
          </div>
        </div>
      </Popup>

      <Popup
        visible={addressPopupVisible}
        position="bottom"
        onMaskClick={handleCloseAddressPopup}
        bodyStyle={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          minHeight: "30vh",
          padding: "20px",
        }}
      >
        <div className="address-popup">
          <div className="popup-title">
            {userInfo?.address ? "更新地址" : "新建地址"}
          </div>

          <div className="address-form">
            <div className="form-label">收货地址</div>
            {/* <Input
              placeholder="请输入详细的收货地址"
              value={addressInput}
              onChange={(val) => setAddressInput(val)}
              className="address-input"
              clearable
              rows={3}
            /> */}
            <textarea
              placeholder="请输入详细的收货地址"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="address-input"
              rows={3} // 现在完全支持，不报错
            />
          </div>

          <div className="popup-actions">
            <Button
              block
              fill="outline"
              size="large"
              onClick={handleCloseAddressPopup}
              className="cancel-btn"
            >
              取消
            </Button>
            <Button
              block
              color="primary"
              size="large"
              onClick={handleSaveAddress}
              className="confirm-btn"
            >
              保存
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
}

export default ProfilePage;
