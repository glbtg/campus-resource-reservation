import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Card, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { listResourceTypes, createResourceType, updateResourceType } from '../../api/resource-type';
import type { ResourceTypeVO } from '../../types';

export default function ResourceTypes() {
  const [data, setData] = useState<ResourceTypeVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; record: ResourceTypeVO | null }>({ open: false, record: null });
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    listResourceTypes()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    form.resetFields();
    setModal({ open: true, record: null });
  };

  const openEdit = (record: ResourceTypeVO) => {
    form.setFieldsValue(record);
    setModal({ open: true, record });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (modal.record) {
        await updateResourceType(modal.record.id, values);
        message.success('修改成功');
      } else {
        await createResourceType(values);
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

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '名称', dataIndex: 'name', width: 200 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (s: number) => <Tag color={s === 1 ? 'green' : 'default'}>{s === 1 ? '启用' : '停用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: ResourceTypeVO) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h3>资源类型管理</h3>
        <p>管理校园资源分类，如自习室、实验室、运动场馆等</p>
      </div>
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 15 }}>资源类型列表</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增类型</Button>}
      >
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
      <Modal
        title={modal.record ? '编辑资源类型' : '新增资源类型'}
        open={modal.open}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, record: null })}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="如：自习空间" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="简要描述" rows={2} />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Space>
              <Button onClick={() => form.setFieldValue('status', 1)} type={form.getFieldValue('status') === 1 ? 'primary' : 'default'}>启用</Button>
              <Button onClick={() => form.setFieldValue('status', 0)} type={form.getFieldValue('status') === 0 ? 'primary' : 'default'}>停用</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </Card>
    </div>
  );
}
