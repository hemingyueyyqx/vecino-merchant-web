
// 结果类型
export interface ResultVO<T> {
  code: number;
  message?: string;
  data: T;
}