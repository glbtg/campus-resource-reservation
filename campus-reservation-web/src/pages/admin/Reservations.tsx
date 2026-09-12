import { useEffect, useState } from 'react';
import { Table, Tag, Card, Select, DatePicker, type TablePaginationConfig } from 'antd';
import { pageAdminReservations } from '../../api/reservations';
import type { ReservationVO } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  BOOKED: { color: 'blue', text: '已预约' },
  CANCELLED: { color: 'default', text: '已取消' },
  FINISHED: { color: 'green', text: '已完成' },
};

export default function AdminReservations() {
  const [data, setData] = useState<ReservationVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{
    status?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const fetchData = () => {
    setLoading(true);
    pageAdminReservations({ ...filters, current: page, size: pageSize })
      .then((res) => {
        setData(res.data.records);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, pageSize, filters]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const columns = [
    { title: '预约单号', dataIndex: 'reservationNo', width: 200, ellipsis: true },
    { title: '用户名', dataIndex: 'username', width: 100 },
    { title: '昵称', dataIndex: 'nickname', width: 100 },
    { title: '资源', dataIndex: 'resourceName', width: 180, ellipsis: true },
    { title: '日期', dataIndex: 'reserveDate', width: 120 },
    { title: '时段', key: 'time', width: 140, render: (_: unknown, r: ReservationVO) => `${r.startTime} - ${r.endTime}` },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: string) => {
        const info = statusMap[s] || { color: 'default', text: s };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    { title: '取消原因', dataIndex: 'cancelReason', width: 140, ellipsis: true },
    { title: '预约时间', dataIndex: 'createTime', width: 180 },
  ];

  return (
    <div>
      <div className="page-header">
        <h3>全部预约记录</h3>
        <p>查看系统中所有用户的预约情况</p>
      </div>
      <Card title={<span style={{ fontWeight: 700, fontSize: 15 }}>预约列表</span>}>
        <div className="filter-bar">
          <span className="filter-bar-label">筛选</span>
          <Select
            placeholder="状态筛选"
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
          scroll={{ x: 1100 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
}
