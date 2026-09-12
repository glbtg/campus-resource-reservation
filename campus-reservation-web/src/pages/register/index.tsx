import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined, PhoneOutlined } from '@ant-design/icons';
import { register } from '../../api/auth';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: {
    username: string;
    password: string;
    nickname: string;
    phone?: string;
  }) => {
    setLoading(true);
    try {
      await register(values.username, values.password, values.nickname, values.phone);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated gradient background */}
      <div style={styles.bgDecor}>
        <div style={{ ...styles.blob, ...styles.blob1 }} />
        <div style={{ ...styles.blob, ...styles.blob2 }} />
        <div style={{ ...styles.blob, ...styles.blob3 }} />
        <div style={{ ...styles.blob, ...styles.blob4 }} />
      </div>
      <div style={styles.decorativeGrid} />

      {/* Glass card */}
      <div style={styles.card}>
        <div style={styles.cardAccent} />
        <div style={styles.logoWrap}>
          <div style={styles.logo}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
        </div>

        <Title level={2} style={styles.title}>创建账号</Title>
        <Text style={styles.subtitle}>注册后即可预约校园内的自习室、实验室等资源</Text>

        <Form onFinish={onFinish} size="large" autoComplete="off" style={{ marginTop: 36 }}>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '4-20位字母、数字、下划线' },
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="用户名" style={styles.input} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 32, message: '密码长度 6-32 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="密码" style={styles.input} />
          </Form.Item>
          <Form.Item name="nickname" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input prefix={<SmileOutlined style={{ color: '#94a3b8' }} />} placeholder="昵称" style={styles.input} />
          </Form.Item>
          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="手机号（选填）" style={styles.input} />
          </Form.Item>
          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={styles.button}>
              注 册
            </Button>
          </Form.Item>
        </Form>

        <div style={styles.footer}>
          <Text style={{ color: '#94a3b8' }}>已有账号？</Text>{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>返回登录</Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #f0f3ff 0%, #f6f7fb 40%, #edfafd 70%, #f0f3ff 100%)',
    backgroundSize: '200% 200%',
    animation: 'bgPulse 15s ease infinite',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecor: { position: 'absolute', inset: 0, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: '50%', filter: 'blur(90px)', opacity: 0.45 },
  blob1: {
    width: 550, height: 550,
    background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    top: -60, left: -80,
    animation: 'float 8s ease-in-out infinite',
  },
  blob2: {
    width: 450, height: 450,
    background: 'linear-gradient(135deg, #67e8f9, #06b6d4)',
    bottom: -80, right: -60,
    animation: 'float 10s ease-in-out infinite 2s',
  },
  blob3: {
    width: 380, height: 380,
    background: 'linear-gradient(135deg, #818cf8, #5b5af7)',
    top: '45%', left: '35%',
    animation: 'float 12s ease-in-out infinite 3s',
  },
  blob4: {
    width: 220, height: 220,
    background: 'linear-gradient(135deg, #e0e7ff, #a5b4fc)',
    top: '15%', right: '12%',
    animation: 'float 7s ease-in-out infinite 1s',
  },
  decorativeGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.03) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    width: 430,
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: 24,
    padding: '52px 48px 44px',
    boxShadow: '0 30px 70px rgba(15,23,42,0.08), 0 10px 25px rgba(139,92,246,0.05), 0 0 0 1px rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.6)',
    zIndex: 1,
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #8b5cf6 0%, #5b5af7 50%, #06b6d4 100%)',
    borderRadius: '24px 24px 0 0',
    opacity: 0.9,
  },
  logoWrap: { display: 'flex', justifyContent: 'center', marginBottom: 28 },
  logo: {
    width: 58, height: 58, borderRadius: 16,
    background: 'linear-gradient(135deg, #8b5cf6 0%, #5b5af7 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(91,90,247,0.35), 0 0 24px rgba(91,90,247,0.15)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  title: { textAlign: 'center', marginBottom: 6, fontWeight: 800, fontSize: 28, letterSpacing: '-0.5px', color: '#0f172a' },
  subtitle: { display: 'block', textAlign: 'center', color: '#64748b', fontSize: 14, lineHeight: 1.6 },
  input: { borderRadius: 10, height: 48, fontSize: 14 },
  button: { borderRadius: 12, height: 50, fontSize: 16, fontWeight: 700, letterSpacing: 3 },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 14 },
};
