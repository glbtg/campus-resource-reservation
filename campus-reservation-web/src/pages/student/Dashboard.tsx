import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Card, Table, Tag, Skeleton } from 'antd';
import {
  AppstoreOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../stores/auth';
import { pageResources } from '../../api/resources';
import { pageMyReservations } from '../../api/reservations';
import { listResourceTypes } from '../../api/resource-type';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; text: string }> = {
  BOOKED: { color: 'blue', text: '已预约' },
  CANCELLED: { color: 'default', text: '已取消' },
  FINISHED: { color: 'green', text: '已完成' },
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resourceCount, setResourceCount] = useState(0);
  const [typeCount, setTypeCount] = useState(0);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      pageResources({ status: 'OPEN', size: 1 }),
      listResourceTypes(),
      pageMyReservations({ current: 1, size: 5 }),
    ])
      .then(([resRes, typeRes, bookingRes]) => {
        setResourceCount(resRes.data.total);
        setTypeCount(typeRes.data.length);
        setRecentReservations(bookingRes.data.records);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = dayjs().format('YYYY年M月D日');
  const greeting = (() => {
    const h = dayjs().hour();
    if (h < 12) return '上午好';
    if (h < 18) return '下午好';
    return '晚上好';
  })();

  const statsData = [
    {
      label: '可用资源',
      value: resourceCount,
      icon: <AppstoreOutlined />,
      gradient: 'linear-gradient(135deg, #5b5af7 0%, #818cf8 100%)',
      bg: '#eef0ff',
    },
    {
      label: '资源类型',
      value: typeCount,
      icon: <CheckCircleOutlined />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      bg: '#ecfdf5',
    },
    {
      label: '近期预约',
      value: recentReservations.length,
      icon: <ScheduleOutlined />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      bg: '#fffbeb',
    },
  ];

  if (loading) {
    return (
      <div>
        <div style={{ borderRadius: 16, background: 'linear-gradient(135deg, #e2e8f0, #f1f5f9)', height: 140, marginBottom: 24 }} />
        <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h2>
          {greeting}，{user?.nickname || '同学'}
        </h2>
        <p>
          今天是 {today} — 校园资源预约系统为你提供便捷的资源预约服务
        </p>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, idx) => (
          <Col xs={24} sm={8} key={stat.label}>
            <div className="stat-card" style={{ animation: `fadeInUp 0.4s ease ${idx * 0.1}s both` }}>
              <div
                className="stat-card-icon"
                style={{
                  background: stat.gradient,
                  color: '#fff',
                  boxShadow: `0 8px 20px ${stat.bg}`,
                }}
              >
                {stat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-card-value">{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: stat.gradient.split(' ')[1] || '#5b5af7',
                opacity: 0.6,
              }}>
                →
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Quick actions + recent bookings */}
      <Row gutter={[20, 20]}>
        <Col xs={24} md={8}>
          <Card
            title={<span style={{ fontWeight: 700, fontSize: 15 }}>快捷操作</span>}
            style={{ height: '100%', borderTop: '3px solid #5b5af7' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button
                type="primary"
                block
                size="large"
                icon={<AppstoreOutlined />}
                onClick={() => navigate('/student/resources')}
              >
                浏览可用资源
              </Button>
              <Button
                block
                size="large"
                icon={<ScheduleOutlined />}
                onClick={() => navigate('/student/reservations')}
              >
                查看我的预约
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card
            title={<span style={{ fontWeight: 700, fontSize: 15 }}>近期预约</span>}
            extra={
              <Button type="link" onClick={() => navigate('/student/reservations')}>
                查看全部 <RightOutlined />
              </Button>
            }
          >
            {recentReservations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ScheduleOutlined />
                </div>
                <h4>暂无预约记录</h4>
                <p>你还没有预约任何资源，去浏览可用资源并开始预约吧</p>
                <Button type="primary" onClick={() => navigate('/student/resources')}>
                  去看看资源
                </Button>
              </div>
            ) : (
              <Table
                rowKey="id"
                dataSource={recentReservations}
                pagination={false}
                size="small"
                columns={[
                  { title: '资源', dataIndex: 'resourceName', ellipsis: true },
                  { title: '日期', dataIndex: 'reserveDate', width: 110 },
                  {
                    title: '时段', key: 'time', width: 130,
                    render: (_: unknown, r: any) => `${r.startTime} - ${r.endTime}`,
                  },
                  {
                    title: '状态', dataIndex: 'status', width: 80,
                    render: (s: string) => {
                      const info = statusMap[s] || { color: 'default', text: s };
                      return <Tag color={info.color}>{info.text}</Tag>;
                    },
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
