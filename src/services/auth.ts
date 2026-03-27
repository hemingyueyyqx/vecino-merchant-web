// src/api/auth.ts
import axios from '@/axios';
import { type RoleValue, type User } from '@/types/user';
import { setUserSessionStorage } from './utils';



// 登录接口
export async function login({ account, password }: User) {
    try {
      console.log("login", { account, password })
      const resp = await axios.post('login', {
        account,
        password
      });
      console.log(resp);  
    const us = resp.data.data;
    const token = resp.headers.token;
    const role: RoleValue = resp.headers.role as RoleValue;
    console.log(",,,," + role);
    const message = resp.data.message
    console.log("mmmmmmm" + message);
    if (!us || !token || !role) {
      //ElMessage.error('登录失败！' + message)
      throw "登录错误";
    }
      sessionStorage.setItem("token", token);
      setUserSessionStorage(us, role);
      return role;
    } catch (error) {
      console.error('登录接口请求失败:', error);
      throw error;
    }
}
// 注册接口
export async function register({ account, role, nickname, password, phone }: User) {
    try {
      console.log("registerApi", { account, role, nickname, password, phone })
      const response = await axios.post('register', {
        account,
        role,
        nickname,
        password,
        phone
      });
      console.log(response);
      const data = response.data;
  
      return data.code;
    } catch (error) {
      console.error('注册接口请求失败:', error);
      throw error;
    }
  }
  // 重置密码接口
  export async function resetPassword({ account, password }: User) {
    try {
      console.log("resetPasswordApi", { account, password })
      const response = await axios.post('resetPassword', {
        account,
        password
      });
      console.log(response);
      const data = response.data;
      return data.code;
    } catch (error) {
      console.error('重置密码接口请求失败:', error);
      throw error;
    }
  }
  
  
  
  