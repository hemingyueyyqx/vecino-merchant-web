import axios from "@/axios";

// 查看余额
export const getBalance = async () => {
    const res = await axios.get('user/getBalance');
    console.log(res.data.data);
  return res.data.data;
};
// 充值
export const recharge = async (data: number) => {
 await axios.post(`user/recharge?amount=${data}`);
};
// 获取用户信息
export const getUserInfo = async () => {
  const res = await axios.get('user/getUserInfo');
  console.log(res.data.data);
  return res.data.data;
};
// 新建/更新地址
export const updateAddress = async (address: string) => {
  await axios.post(`user/updateAddress?address=${address}`);
};