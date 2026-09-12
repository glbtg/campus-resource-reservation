import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, DatePicker, Table, Tag, Button, message, Spin, Progress, Typography } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, BankOutlined, NumberOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { getResourceDetail } from '../../api/resources';
import { listSlots } from '../../api/slots';
import { book } from '../../api/reservations';
import type { CampusResourceVO, ResourceSlotVO } from '../../types';

const { Text } = Typography;

const slotStatusMap: Record<string, { color: string; text: string }> = {
  OPEN: { color: 'green', text: '可预约' },
  FULL: { color: 'red', text: '已约满' },
  CLOSED: { color: 'default', text: '已关闭' },
};

const resourceStatusMap: Record<string, { color: string; text: string }> = {
  OPEN: { color: 'green', text: '开放' },
  MAINTAIN: { color: 'orange', text: '维护中' },
  DISABLED: { color: 'red', text: '已停用' },
};

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<CampusResourceVO | null>(null);
  const [slots, setSlots] = useState<ResourceSlotVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotLoading, setSlotLoading] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs().add(1, 'day'));
  const [booking, setBooking] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getResourceDetail(Number(id))
      .then((res) => setResource(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !date) return;
    setSlotLoading(true);
    listSlots({ resourceId: Number(id), reserveDate: date.format('YYYY-MM-DD') })
      .then((res) => setSlots(res.data))
      .catch(() => {})
      .finally(() => setSlotLoading(false));
  }, [id, date]);

  const handleBook = async (slotId: number) => {
    setBooking(slotId);
    try {
      await book(slotId);
      message.success('预约成功');
      listSlots({ resourceId: Number(id), reserveDate: date.format('YYYY-MM-DD') })
        .then((res) => setSlots(res.data))
        .catch(() => {});
    } catch {
      // handled by interceptor
    } finally {
      setBooking(null);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (!resource) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <Text type="secondary" style={{ fontSize: 16 }}>资源不存在或已被删除</Text>
          <br />
          <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/student/resources')}>
            返回资源列表
          </Button>
        </div>
      </Card>
    );
  }

  const statusInfo = resourceStatusMap[resource.status] || { color: 'default', text: resource.status };
  const availableSlots = slots.filter((s) => s.status === 'OPEN' && s.remainCapacity > 0).length;

  const slotColumns = [
    {
      title: '时段', key: 'time', width: 160,
      render: (_: unknown, r: ResourceSlotVO) => (
        <span style={{ fontWeight: 600, fontSize: 14 }}>{r.startTime} - {r.endTime}</span>
      ),
    },
    {
      title: '容量使用', key: 'capacity', width: 220,
      render: (_: unknown, r: ResourceSlotVO) => {
        const percent = r.totalCapacity > 0 ? Math.round(((r.totalCapacity - r.remainCapacity) / r.totalCapacity) * 100) : 0;
        const strokeColor = percent >= 100
          ? { '0%': '#ef4444', '100%': '#dc2626' }
          : percent > 70
            ? { '0%': '#f59e0b', '100%': '#fbbf24' }
            : { '0%': '#10b981', '100%': '#34d399' };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Progress
              percent={percent}
              size={['100%', 22]}
              style={{ flex: 1, margin: 0 }}
              strokeColor={strokeColor}
              trailColor="#f1f3f7"
              strokeLinecap="round"
              showInfo={false}
            />
            <Text style={{ fontSize: 12, whiteSpace: 'nowrap', color: '#64748b', fontWeight: 600, minWidth: 50 }}>
              {r.remainCapacity}/{r.totalCapacity}
            </Text>
          </div>
        );
      },
    },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (s: string) => {
        const info = slotStatusMap[s] || { color: 'default', text: s };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: ResourceSlotVO) => (
        <Button
          type="primary"
          size="small"
          loading={booking === record.id}
          disabled={record.status !== 'OPEN' || record.remainCapacity <= 0}
          onClick={() => handleBook(record.id)}
        >
          {record.status === 'FULL' || record.remainCapacity <= 0 ? '已满' : '预约'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/student/resources')}
        style={{ padding: 0, marginBottom: 20, fontWeight: 600, fontSize: 14 }}
      >
        返回资源列表
      </Button>

      {/* Resource Info */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>{resource.name}</span>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: '#64748b', fontSize: 13.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: '#eef0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5b5af7' }}>
                  <BankOutlined />
                </span>
                {resource.typeName}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <EnvironmentOutlined />
                </span>
                {resource.campus || '-'} {resource.building || ''} {resource.roomNo || ''}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <TeamOutlined />
                </span>
                容量 {resource.capacity}
              </span>
            </div>
            {resource.description && (
              <div style={{ marginTop: 16, padding: '14px 18px', background: '#f8fafc', borderRadius: 10, color: '#64748b', fontSize: 13, lineHeight: 1.7, border: '1px solid #f1f3f7' }}>
                {resource.description}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Slots */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>可预约时段</span>
            {!slotLoading && (
              <Tag color="blue" style={{ fontWeight: 600 }}>
                {availableSlots} 个可用
              </Tag>
            )}
          </div>
        }
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>选择日期：</Text>
            <DatePicker
              value={date}
              onChange={(d) => setDate(d || dayjs())}
              disabledDate={(d) => d.isBefore(dayjs(), 'day')}
              allowClear={false}
            />
          </div>
        }
      >
        <Table
          rowKey="id"
          columns={slotColumns}
          dataSource={slots}
          loading={slotLoading}
          pagination={false}
          locale={{
            emptyText: (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ScheduleOutlined />
                </div>
                <h4>该日期暂无可用时段</h4>
                <p>试试选择其他日期查看可预约的时段</p>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}

function ScheduleOutlined(props: any) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M928 160H704v-64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H384v-64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H96c-17.7 0-32 14.3-32 32v672c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 672H136V272h752v560z" />
      <path d="M320 384h-64c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-64c0-17.7-14.3-32-32-32zM544 384h-64c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-64c0-17.7-14.3-32-32-32zM768 384h-64c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32v-64c0-17.7-14.3-32-32-32z" />
    </svg>
  );
}
