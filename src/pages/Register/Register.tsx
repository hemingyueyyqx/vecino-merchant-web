// src/pages/Register/Register.tsx
import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined, SmileOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './Register.css'

import { register } from '../../services/auth'
import { RoleConst, type User } from '../../types/user'


const Register = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)


  
  // 提交注册
  const handleRegister = async (values: User) => {
    // 前端密码校验
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    
    try {
      setLoading(true)
      // 调用注册接口
      const res = await register({
        account: values.account,
        role: RoleConst.BUSINESS,
        nickname: values.nickname,
        password: values.password,
        phone: values.phone,
      })
      // 注册成功后，跳转登录页
      if (res === 200) {
        message.success(res.msg || '注册成功')
        navigate('/login', { replace: true })
      }
    } catch (error) {
      console.error('注册接口请求失败:', error);
      message.error((error as Error).message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <header className="register-header">
        <div className="header-left">
          <span className="brand-name">Vecino即时零售</span>
          <span className="divider">|</span>
          <span className="brand-subtitle">商家服务平台</span>
        </div>
      </header>

      <main className="register-main">
        <div className="register-form-wrapper">
          <div className="register-tabs">
            <div className="register-tab-active">账号注册</div>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            autoComplete="off"
            size="large"
            className="register-form"
          >
            <Form.Item
              name="nickname"
              rules={[
                { required: true, message: '请输入昵称/姓名',whitespace: true },
                { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_·-]{2,20}$/, message: '2-20位，支持中文、数字、字母、下划线、·、-，禁止空格' }
              ]}
            >
              <Input
                prefix={<SmileOutlined />}
                placeholder="输入昵称/姓名"
                maxLength={20}
                showCount
              />
            </Form.Item>
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
                placeholder="输入密码"
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

            <Form.Item
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
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="register-button"
              >
                注册
              </Button>
            </Form.Item>

            <div className="register-footer">
              <span>已有账号？</span>
              <span 
                className="login-btn" 
                onClick={() => navigate('/login')}
              >
                立即登录
              </span>
            </div>
          </Form>
        </div>
      </main>
    </div>
  )
}

export default Register