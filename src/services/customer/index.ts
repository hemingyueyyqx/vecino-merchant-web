import axios from "@/axios";
import type { Order, Review } from "@/types/order";

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
// 添加订单
export const addOrder = async (data: Order) => {
  console.log("添加订单参数:", data);
  await axios.post(`addOrder`, data);
};
// 获取订单列表
export const getOrderList = async () => {
  const res = await axios.get('getOrderList');
  console.log(res.data.data);
  return res.data.data;
};
// 取消订单
export const cancelOrder = async (orderId: string) => {
  await axios.post(`cancelOrder?orderId=${orderId}`);
};

// 确认收货
export const confirmReceipt = async (orderId: string) => {
  await axios.post(`confirmOrder?orderId=${orderId}`);
};
// 添加评价
export const addReview = async (data: Review) => {
  console.log("添加评价参数:", data);
  await axios.post(`addComment`, data);
};
// 获取评价
export const getReview = async (orderId: string) => {
  const res = await axios.get(`getReview?orderId=${orderId}`);
  console.log(res.data.data);
  return res.data.data;
};
