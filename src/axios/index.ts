import { getToken } from "@/services/utils";
import type { ResultVO } from "@/types/utils";
import axios from "axios";
// import { message } from "antd";

// 配置了 axios.defaults.baseURL，默认使用 /api/ 作为基地址。
axios.defaults.baseURL = "/api/";

// 请求拦截器
axios.interceptors.request.use(
  (req) => {
    console.log("请求拦截器", req);
    const auth = getToken();
    // 判断,用于避免header包含authorization属性但数据值为空
    if (auth && req.headers) {
      req.headers.token = auth;
    }
    return req;
  },
  (error) => {
    return Promise.reject(new Error("请求失败！" + error));
  }
);


// 响应拦截器
axios.interceptors.response.use(
  (resp) => {
    console.log("到响应拦截器辣！");
    //Blob 是 Binary Large Object（二进制大对象）的缩写，它是 JavaScript 中用于表示不可变的原始二进制数据的对象。Blob 对象可以包含多种类型的数据，如文本、图片、音频、视频等，并且可以方便地进行文件操作。
    if (resp.config.responseType == "blob") {
      return resp;
    }

    const data: ResultVO<object> = resp.data;
    console.log("resp.data", resp.data);
    console.log("code", data.code);
    if (data.code < 300) {
      // 将resp.data转成对象
      // parseObject(resp.data);
      //console.log("这里是登陆成功~");
      // console.log(resp);
      // console.log(resp.data);
      // message.success("登录成功！！")
      return resp;
    }
    if (data.code >= 400) {
      //message.error( data.message);
      throw new Error(data.message || '请求失败');
    }
    return resp;
  },
  // 全局处理异常信息。即，http状态码不是200
  // (error) => {
  //   message.error("error!!!");
  //   return Promise.reject(error.message);
  // }
);
//提供了一组异步函数：useGet、usePost、usePut、usePatch 和 useDelete，分别封装了对应的 HTTP 方法。
export const get = async <T>(url: string) => {
  const resp = await axios.get<ResultVO<T>>(url);
  return resp.data.data;
};

export const post = async <T>(url: string, data: unknown) => {
  const resp = await axios.post<ResultVO<T>>(url, data);
  return resp.data.data;
};
//需要请求体的情况
// 在大多数实际应用场景中，PUT 请求是需要携带请求体的。因为 PUT 请求的核心用途是更新资源，而更新操作通常需要提供新的数据来替换或修改目标资源的现有内容。
// 示例场景：假设你有一个用户信息管理系统，用户的信息存储在服务器的某个资源路径下。当用户需要更新自己的姓名、邮箱等信息时，就可以使用 PUT 请求将新的用户信息作为请求体发送到服务器。
export const put = async <T>(url: string, data: unknown) => {
  const resp = await axios.put<ResultVO<T>>(url, data);
  return resp.data.data;
};

export const patch = async <T>(url: string, data: unknown) => {
  const resp = await axios.patch<ResultVO<T>>(url, data);
  return resp.data.data;
};
//在 RESTful 架构风格里，DELETE 请求主要用于删除指定的资源，一般通过请求的 URL 来标识要删除的资源，所以多数场景下不需要请求体。例如，要删除用户 ID 为 123 的用户信息，请求的 URL 可能设计为 https://example.com/api/users/123，服务器根据这个 URL 就能明确要删除的资源，不需要额外的请求体数据。
// export const deleteMethod = async <T>(url: string) => {
//   const resp = await axios.delete<ResultVO<T>>(url);
//   return resp.data;
// };

export default axios;