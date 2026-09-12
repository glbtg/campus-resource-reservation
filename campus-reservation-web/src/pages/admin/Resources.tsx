import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Card, Tag, message, type TablePaginationConfig } from 'antd';
import { PlusOutlined, EditOutlined, PauseCircleOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { pageResources, createResource, updateResource, updateResourceStatus } from '../../api/resources';
import { listResourceTypes } from '../../api/resource-type';
import type { CampusResourceVO, ResourceTypeVO } from '../../types';

const statusMap: Record<string, { color: string; text: string }> = {
  OPEN: { color: 'green', text: '开放' },
  MAINTAIN: { color: 'orange', text: '维护中' },
  DISABLED: { color: 'red', text: '已停用' },
};

export default function Resources() {
  const [data, setData] = useState<CampusResourceVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [types, setTypes] = useState<ResourceTypeVO[]>([]);
  const [modal, setModal] = useState<{ open: boolean; record: CampusResourceVO | null }>({ open: false, record: null });
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    pageResources({ current: page, size: pageSize })
      .then((res) => { setData(res.data.records); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);
  useEffect(() => {
    listResourceTypes().then((res) => setTypes(res.data)).catch(() => {});
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ status: 'OPEN' });
    setModal({ open: true, record: null });
  };

  const openEdit = (record: CampusResourceVO) => {
    form.setFieldsValue({ ...record, typeId: record.typeId });
    setModal({ open: true, record });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (modal.record) {
        await updateResource(modal.record.id, values);
        message.success('修改成功');
      } else {
        await createResource(values);
        message.success('创建成功');
      }
      setModal({ open: false, record: null });
      fetchData();
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateResourceStatus(id, status);
      message.success('状态更新成功');
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
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', width: 200, ellipsis: true },
    { title: '类型', dataIndex: 'typeName', width: 100 },
    { title: '校区', dataIndex: 'campus', width: 80 },
    { title: '楼栋', dataIndex: 'building', width: 80 },
    { title: '容量', dataIndex: 'capacity', width: 60 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: string) => {
        const info = statusMap[s] || { color: 'default', text: s };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 220, fixed: 'right' as const,
      render: (_: unknown, record: CampusResourceVO) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          {record.status !== 'OPEN' && (
            <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(record.id, 'OPEN')}>开放</Button>
          )}
          {record.status !== 'MAINTAIN' && (
            <Button size="small" icon={<PauseCircleOutlined />} onClick={() => handleStatusChange(record.id, 'MAINTAIN')}>维护</Button>
          )}
          {record.status !== 'DISABLED' && (
            <Button size="small" icon={<StopOutlined />} onClick={() => handleStatusChange(record.id, 'DISABLED')}>停用</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h3>资源管理</h3>
        <p>管理校园内所有可预约资源，包括自习室、实验室、运动场馆等</p>
      </div>
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 15 }}>资源列表</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增资源</Button>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          onChange={handleTableChange}
        />
      <Modal
        title={modal.record ? '编辑资源' : '新增资源'}
        open={modal.open}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, record: null })}
        confirmLoading={submitting}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="typeId" label="资源类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="选择资源类型" options={types.map((t) => ({ label: t.name, value: t.id }))} />
          </Form.Item>
          <Form.Item name="name" label="资源名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：图书馆三楼静音自习区" />
          </Form.Item>
          <Space size="middle">
            <Form.Item name="campus" label="校区">
              <Input placeholder="如：主校区" />
            </Form.Item>
            <Form.Item name="building" label="楼栋">
              <Input placeholder="如：图书馆" />
            </Form.Item>
            <Form.Item name="roomNo" label="房间/编号">
              <Input placeholder="如：3F-A区" />
            </Form.Item>
          </Space>
          <Form.Item name="capacity" label="容量" rules={[{ required: true, message: '请输入容量' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="资源描述" />
          </Form.Item>
        </Form>
      </Modal>
      </Card>
    </div>
  );
}
