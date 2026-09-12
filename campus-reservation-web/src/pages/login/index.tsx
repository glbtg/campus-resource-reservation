import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../api/auth';
import { useAuth } from '../../stores/auth';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await login(values.username, values.password);
      const { token, user } = res.data;
      setAuth(
        { id: user.id, username: user.username, nickname: user.nickname, role: user.role as 'ADMIN' | 'STUDENT' },
        token,
      );
      message.success('登录成功');
      navigate(user.role === 'ADMIN' ? '/admin' : '/student');
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <Title level={2} style={styles.title}>欢迎回来</Title>
        <Text style={styles.subtitle}>登录校园资源预约系统，开始预约你需要的资源</Text>

        <Form onFinish={onFinish} size="large" autoComplete="off" style={{ marginTop: 36 }}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="用户名"
              style={styles.input}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="密码"
              style={styles.input}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={styles.button}>
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={styles.footer}>
          <Text style={{ color: '#94a3b8' }}>还没有账号？</Text>{' '}
          <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>创建账号</Link>
        </div>

        <div style={styles.hint}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>
            默认账号：admin / 123456（管理员）· student / 123456（学生）
          </Text>
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
  bgDecor: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(90px)',
    opacity: 0.45,
  },
  blob1: {
    width: 600,
    height: 600,
    background: 'linear-gradient(135deg, #818cf8, #5b5af7)',
    top: -120,
    right: -80,
    animation: 'float 8s ease-in-out infinite',
  },
  blob2: {
    width: 450,
    height: 450,
    background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    bottom: -100,
    left: -60,
    animation: 'float 10s ease-in-out infinite 1.5s',
  },
  blob3: {
    width: 350,
    height: 350,
    background: 'linear-gradient(135deg, #67e8f9, #06b6d4)',
    top: '35%',
    left: '45%',
    animation: 'float 12s ease-in-out infinite 2.5s',
  },
  blob4: {
    width: 250,
    height: 250,
    background: 'linear-gradient(135deg, #c084fc, #a78bfa)',
    top: '10%',
    left: '10%',
    animation: 'float 9s ease-in-out infinite 0.5s',
  },
  decorativeGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle, rgba(91,90,247,0.03) 1px, transparent 1px)',
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
    boxShadow: '0 30px 70px rgba(15,23,42,0.08), 0 10px 25px rgba(91,90,247,0.05), 0 0 0 1px rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.6)',
    zIndex: 1,
  },
  cardAccent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #5b5af7 0%, #8b5cf6 50%, #06b6d4 100%)',
    borderRadius: '24px 24px 0 0',
    opacity: 0.9,
  },
  logoWrap: { display: 'flex', justifyContent: 'center', marginBottom: 28 },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #5b5af7 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(91,90,247,0.35), 0 0 24px rgba(91,90,247,0.15)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: 800,
    fontSize: 28,
    letterSpacing: '-0.5px',
    color: '#0f172a',
  },
  subtitle: {
    display: 'block',
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    lineHeight: 1.6,
  },
  input: { borderRadius: 10, height: 48, fontSize: 14 },
  button: { borderRadius: 12, height: 50, fontSize: 16, fontWeight: 700, letterSpacing: 3 },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 14 },
  hint: {
    textAlign: 'center',
    marginTop: 28,
    padding: '12px 18px',
    background: 'rgba(91,90,247,0.04)',
    borderRadius: 10,
    border: '1px solid rgba(91,90,247,0.06)',
  },
};
