// src/pages/Login/Login.tsx
import { useState, useCallback, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { User, RoleValue } from '../../types/user'
import { RoleConst } from '../../types/user'

import { login } from '../../services/auth'
import { getToken, getRole } from '@/services/utils'

import './Login.css'



const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false) 
  const [accountForm] = Form.useForm()

   // 根据角色跳转对应页面（缓存函数）
    const navigateByRole = useCallback((role: RoleValue) => {
      switch (role) {
        case RoleConst.BUSINESS:
          navigate('/business', { replace: true })
          break
        case RoleConst.ADMIN:
          navigate('/admin', { replace: true })
          break
        case RoleConst.CUSTOMER:
          navigate('/customer', { replace: true })
          break
        default:
          message.error('未知的角色类型，请联系管理员')
      }
    }, [navigate])
  
    // 页面挂载时检查登录状态，已登录则跳转对应角色页面
    useEffect(() => {
      const token = getToken()
      const role = getRole()
      if (token && role) {
        navigateByRole(role)
      }
    }, [navigateByRole])
  // 账号密码登录提交
  const handleAccountLogin = async (values: User) => {
    try {
      setLoading(true)
      // 调用真实登录接口
      const role = await login({
        account: values.account || '',
        password: values.password || ''
      })
      message.success('登录成功！')
      navigateByRole(role)
    } catch (error) {
      message.error((error as Error).message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="header-left">
          <span className="brand-name">Vecino即时零售</span>
          <span className="divider">|</span>
          <span className="brand-subtitle">商家服务平台</span>
        </div>
      </header>

      <main className="login-main">
        <div className="login-form-wrapper">
           <div className="login-tabs">
            <div className="login-tab-active">账号登录</div>
          </div>
          {/* 直接渲染账号密码登录表单，移除Tabs */}
          <Form
            form={accountForm}
            name="account_login"
            onFinish={handleAccountLogin}
            autoComplete="off"
            size="large"
            className="login-form"
          >
            <Form.Item
              name="account"
              rules={[
                { required: true, message: '请输入账号' },
                { pattern: /^[a-zA-Z0-9_]{5,20}$/, message: '账号为5-20位数字、字母或下划线' }
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
                { pattern: /^.{6,20}$/, message: '密码为6-20位字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="输入密码"
              />
            </Form.Item>

            <div className="login-links">
              <span className='link' onClick={() => navigate('/reset-password')}>忘记密码</span>
              {/* <span className="link-divider">|</span>
              <span className='link' onClick={() => navigate('/forget-account')}>忘记账号</span> */}
            </div>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                className="login-button"
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>

            <div className="login-footer">
              <span 
                className="register-btn" 
                onClick={() => navigate('/register')}
              >
                注册账号，免费入驻
              </span>
            </div>
          </Form>
        </div>
      </main>
    </div>
  )
}

export default Login