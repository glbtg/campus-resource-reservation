import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Select, Input, Tag, Card, type TablePaginationConfig } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { pageResources } from '../../api/resources';
import { listResourceTypes } from '../../api/resource-type';
import type { CampusResourceVO, ResourceTypeVO } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  OPEN: { color: 'green', text: '开放' },
  MAINTAIN: { color: 'orange', text: '维护中' },
  DISABLED: { color: 'red', text: '已停用' },
};

export default function ResourceList() {
  const navigate = useNavigate();
  const [data, setData] = useState<CampusResourceVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [types, setTypes] = useState<ResourceTypeVO[]>([]);
  const [filters, setFilters] = useState<{ typeId?: number; keyword?: string; status?: string }>({});

  useEffect(() => {
    listResourceTypes().then((res) => setTypes(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    pageResources({ ...filters, current: page, size: pageSize })
      .then((res) => {
        setData(res.data.records);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, pageSize, filters]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current || 1);
    setPageSize(pagination.pageSize || 10);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '资源名称', dataIndex: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'typeName', width: 120 },
    { title: '校区', dataIndex: 'campus', width: 100 },
    { title: '楼栋', dataIndex: 'building', width: 100 },
    { title: '房间/编号', dataIndex: 'roomNo', width: 120 },
    { title: '容量', dataIndex: 'capacity', width: 80 },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: string) => {
        const info = statusMap[s] || { color: 'default', text: s };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 100, fixed: 'right' as const,
      render: (_: unknown, record: CampusResourceVO) => (
        <a onClick={() => navigate(`/student/resources/${record.id}`)}>查看时段</a>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h3>资源浏览</h3>
        <p>浏览校园内所有可预约的资源，筛选并查看可用时段</p>
      </div>
      <Card>
        <div className="filter-bar">
          <span className="filter-bar-label">筛选</span>
          <Select
            placeholder="资源类型"
            allowClear
            style={{ width: 160 }}
            options={types.map((t) => ({ label: t.name, value: t.id }))}
            onChange={(val) => setFilters((f) => ({ ...f, typeId: val }))}
          />
          <Input
            placeholder="搜索名称/楼栋/房间"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            allowClear
            onPressEnter={(e) => setFilters((f) => ({ ...f, keyword: (e.target as HTMLInputElement).value }))}
            onBlur={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '开放', value: 'OPEN' },
              { label: '维护中', value: 'MAINTAIN' },
              { label: '已停用', value: 'DISABLED' },
            ]}
            onChange={(val) => setFilters((f) => ({ ...f, status: val }))}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
}
