import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Card, Table, Tag, Skeleton } from 'antd';
import {
  AppstoreOutlined,
  ScheduleOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  RightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../stores/auth';
import { pageResources } from '../../api/resources';
import { pageAdminReservations } from '../../api/reservations';
import { listResourceTypes } from '../../api/resource-type';
import { listSlots } from '../../api/slots';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; text: string }> = {
  BOOKED: { color: 'blue', text: '已预约' },
  CANCELLED: { color: 'default', text: '已取消' },
  FINISHED: { color: 'green', text: '已完成' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resourceCount, setResourceCount] = useState(0);
  const [typeCount, setTypeCount] = useState(0);
  const [todaySlots, setTodaySlots] = useState(0);
  const [recentReservations, setRecentReservations] = useState<any[]>([]);

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    Promise.all([
      pageResources({ size: 1 }),
      listResourceTypes(),
      listSlots({ reserveDate: today }),
      pageAdminReservations({ current: 1, size: 5 }),
    ])
      .then(([resRes, typeRes, slotRes, bookingRes]) => {
        setResourceCount(resRes.data.total);
        setTypeCount(typeRes.data.length);
        setTodaySlots(slotRes.data.length);
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
    { label: '资源总数', value: resourceCount, icon: <AppstoreOutlined />, gradient: 'linear-gradient(135deg, #5b5af7, #818cf8)', bg: '#eef0ff' },
    { label: '资源类型', value: typeCount, icon: <TagsOutlined />, gradient: 'linear-gradient(135deg, #10b981, #34d399)', bg: '#ecfdf5' },
    { label: '今日时段', value: todaySlots, icon: <ScheduleOutlined />, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', bg: '#fffbeb' },
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
          {greeting}，{user?.nickname || '管理员'}
        </h2>
        <p>今天是 {today} — 系统运行正常，请及时处理资源与时段管理</p>
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
          <Card title={<span style={{ fontWeight: 700, fontSize: 15 }}>快捷管理</span>} style={{ height: '100%', borderTop: '3px solid #5b5af7' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button type="primary" block size="large" icon={<PlusOutlined />} onClick={() => navigate('/admin/slots')}>
                创建预约时段
              </Button>
              <Button block size="large" icon={<AppstoreOutlined />} onClick={() => navigate('/admin/resources')}>
                管理资源
              </Button>
              <Button block size="large" icon={<TagsOutlined />} onClick={() => navigate('/admin/resource-types')}>
                管理资源类型
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card
            title={<span style={{ fontWeight: 700, fontSize: 15 }}>最新预约</span>}
            extra={
              <Button type="link" onClick={() => navigate('/admin/reservations')}>
                查看全部 <RightOutlined />
              </Button>
            }
          >
            {recentReservations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <UnorderedListOutlined />
                </div>
                <h4>暂无预约记录</h4>
                <p>目前还没有任何预约，创建时段后学生即可预约</p>
                <Button type="primary" onClick={() => navigate('/admin/slots')}>
                  创建预约时段
                </Button>
              </div>
            ) : (
              <Table
                rowKey="id"
                dataSource={recentReservations}
                pagination={false}
                size="small"
                columns={[
                  { title: '用户', dataIndex: 'nickname', width: 80 },
                  { title: '资源', dataIndex: 'resourceName', ellipsis: true },
                  { title: '日期', dataIndex: 'reserveDate', width: 110 },
                  { title: '时段', key: 'time', width: 130, render: (_: unknown, r: any) => `${r.startTime} - ${r.endTime}` },
                  { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => {
                    const info = statusMap[s] || { color: 'default', text: s };
                    return <Tag color={info.color}>{info.text}</Tag>;
                  }},
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
