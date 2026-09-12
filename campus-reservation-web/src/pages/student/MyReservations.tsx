import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Input, message, Card, Select, DatePicker, type TablePaginationConfig } from 'antd';
import { pageMyReservations, cancel } from '../../api/reservations';
import type { ReservationVO } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  BOOKED: { color: 'blue', text: '已预约' },
  CANCELLED: { color: 'default', text: '已取消' },
  FINISHED: { color: 'green', text: '已完成' },
};

export default function MyReservations() {
  const [data, setData] = useState<ReservationVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{ status?: string; startDate?: string; endDate?: string }>({});
  const [cancelModal, setCancelModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [cancelReason, setCancelReason] = useState('');

  const fetchData = () => {
    setLoading(true);
    pageMyReservations({ ...filters, current: page, size: pageSize })
      .then((res) => {
        setData(res.data.records);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, pageSize, filters]);

  const handleCancel = async () => {
    if (cancelModal.id == null) return;
    try {
      await cancel(cancelModal.id, cancelReason || undefined);
      message.success('取消成功');
      setCancelModal({ open: false, id: null });
      setCancelReason('');
      fetchData();
    } catch {
      // handled by interceptor
    }
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const columns = [
    { title: '预约单号', dataIndex: 'reservationNo', width: 200, ellipsis: true },
    { title: '资源名称', dataIndex: 'resourceName', width: 180 },
    { title: '日期', dataIndex: 'reserveDate', width: 120 },
    { title: '时段', key: 'time', width: 140, render: (_: unknown, r: ReservationVO) => `${r.startTime} - ${r.endTime}` },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: string) => {
        const info = statusMap[s] || { color: 'default', text: s };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    { title: '取消原因', dataIndex: 'cancelReason', width: 160, ellipsis: true },
    { title: '预约时间', dataIndex: 'createTime', width: 180 },
    {
      title: '操作', key: 'action', width: 100, fixed: 'right' as const,
      render: (_: unknown, record: ReservationVO) => (
        <Button
          danger
          size="small"
          disabled={record.status !== 'BOOKED'}
          onClick={() => setCancelModal({ open: true, id: record.id })}
        >
          取消
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h3>我的预约</h3>
        <p>查看和管理你的所有预约记录</p>
      </div>
      <Card>
        <div className="filter-bar">
          <span className="filter-bar-label">筛选</span>
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '已预约', value: 'BOOKED' },
              { label: '已取消', value: 'CANCELLED' },
              { label: '已完成', value: 'FINISHED' },
            ]}
            onChange={(val) => setFilters((f) => ({ ...f, status: val }))}
          />
          <DatePicker
            placeholder="开始日期"
            onChange={(d) => setFilters((f) => ({ ...f, startDate: d ? d.format('YYYY-MM-DD') : undefined }))}
          />
          <DatePicker
            placeholder="结束日期"
            onChange={(d) => setFilters((f) => ({ ...f, endDate: d ? d.format('YYYY-MM-DD') : undefined }))}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          onChange={handleTableChange}
        />
      </Card>
      <Modal
        title="取消预约"
        open={cancelModal.open}
        onOk={handleCancel}
        onCancel={() => setCancelModal({ open: false, id: null })}
        okText="确认取消"
        cancelText="暂不取消"
      >
        <p>确定取消该预约吗？取消后不可恢复。</p>
        <Input.TextArea
          placeholder="取消原因（选填）"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={2}
        />
      </Modal>
    </div>
  );
}
