// src/pages/ResetPassword/index.tsx
import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './index.css'
import { type User } from '@/types/user'

import {  resetPassword } from '@/services/auth'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

    
  // 提交重置密码
  const handleResetPassword = async (values: User) => {
    // 前端密码校验
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    
    try {
      setLoading(true)
      // 调用重置密码接口
      const res = await resetPassword({
        account: values.account,
        password: values.password,       
      })
      // 重置密码成功后，跳转登录页
      if (res === 200) {
        message.success(res.msg || '重置密码成功')
        navigate('/login', { replace: true })
      }
    } catch (error) {
      console.error('重置密码接口请求失败:', error);
      message.error((error as Error).message || '重置密码失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <header className="reset-password-header">
        <div className="header-left">
          <span className="brand-name">Vecino即时零售</span>
          <span className="divider">|</span>
          <span className="brand-subtitle">商家服务平台</span>
        </div>
      </header>

      <main className="reset-password-main">
        <div className="reset-password-form-wrapper">
          <div className="reset-password-tabs">
            <div className="reset-password-tab-active">重置密码</div>
          </div>

          <Form
            form={form}
            name="resetPassword"
            onFinish={handleResetPassword}
            autoComplete="off"
            size="large"
            className="reset-password-form"
          >

            <Form.Item
              name="account"
              rules={[
                { required: true, message: '请输入账号' },
                { pattern: /^[a-zA-Z0-9_]{5,20}$/, message: '5-20位数字、字母或下划线' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="输入账号"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { pattern: /^.{6,20}$/, message: '6~20位，大小写字母、数字、符号' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="输入新密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[{ required: true, message: '请再次输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>

            {/* <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="输入手机号"
                maxLength={11}
              />
            </Form.Item> */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="reset-password-button"
              >
                提交
              </Button>
            </Form.Item>

          </Form>
        </div>
      </main>
    </div>
  )
}

export default ResetPassword
