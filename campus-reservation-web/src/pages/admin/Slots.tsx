import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, InputNumber, Tag, message, Card, Space, Tabs, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { listSlots, createSlot, batchCreateSlots, closeSlot } from '../../api/slots';
import { pageResources } from '../../api/resources';
import type { ResourceSlotVO, CampusResourceVO } from '../../types';

const { Text } = Typography;

const statusMap: Record<string, { color: string; text: string }> = {
  OPEN: { color: 'green', text: '可预约' },
  FULL: { color: 'red', text: '已约满' },
  CLOSED: { color: 'default', text: '已关闭' },
};

export default function Slots() {
  const [data, setData] = useState<ResourceSlotVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<CampusResourceVO[]>([]);
  const [filters, setFilters] = useState<{ resourceId?: number; reserveDate?: string }>({});
  const [modal, setModal] = useState<{ open: boolean; tab: 'single' | 'batch' }>({ open: false, tab: 'single' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedResourceCapacity, setSelectedResourceCapacity] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    listSlots({
      resourceId: filters.resourceId,
      reserveDate: filters.reserveDate,
    })
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [filters]);

  useEffect(() => {
    pageResources({ size: 1000 }).then((res) => setResources(res.data.records)).catch(() => {});
  }, []);

  const handleResourceChange = (resourceId: number) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource) {
      setSelectedResourceCapacity(resource.capacity);
      form.setFieldValue('totalCapacity', resource.capacity);
    } else {
      setSelectedResourceCapacity(null);
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const baseData = {
        resourceId: values.resourceId,
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
        totalCapacity: values.totalCapacity,
      };
      let createdDate: string;
      if (modal.tab === 'single') {
        createdDate = (values.reserveDate as Dayjs).format('YYYY-MM-DD');
        await createSlot({ ...baseData, reserveDate: createdDate });
        message.success('创建成功');
      } else {
        const dates = (values.reserveDates as Dayjs[]).map((d) => d.format('YYYY-MM-DD'));
        createdDate = dates[0];
        await batchCreateSlots({ ...baseData, reserveDates: dates });
        message.success('批量创建成功');
      }
      // Auto-set filters to show the newly created slot(s)
      setFilters({ resourceId: values.resourceId, reserveDate: createdDate });
      setModal({ open: false, tab: 'single' });
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await closeSlot(id);
      message.success('已关闭');
      fetchData();
    } catch {
      // handled by interceptor
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '资源名称', dataIndex: 'resourceName', width: 200, ellipsis: true },
    { title: '日期', dataIndex: 'reserveDate', width: 120 },
    { title: '时段', key: 'time', width: 140, render: (_: unknown, r: ResourceSlotVO) => `${r.startTime} - ${r.endTime}` },
    { title: '总容量', dataIndex: 'totalCapacity', width: 80 },
    { title: '剩余', dataIndex: 'remainCapacity', width: 80 },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (s: string) => {
        const info = statusMap[s] || { color: 'default', text: s };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: ResourceSlotVO) => (
        <Button danger size="small" disabled={record.status === 'CLOSED'} onClick={() => handleClose(record.id)}>
          关闭
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'single',
      label: '单个创建',
      children: (
        <Form.Item name="reserveDate" label="预约日期" rules={[{ required: true, message: '请选择日期' }]}>
          <DatePicker style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
        </Form.Item>
      ),
    },
    {
      key: 'batch',
      label: '批量创建',
      children: (
        <Form.Item name="reserveDates" label="多个日期" rules={[{ required: true, message: '请选择日期' }]}>
          <DatePicker multiple style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
        </Form.Item>
      ),
    },
  ];

  const openCreate = () => {
    form.resetFields();
    setSelectedResourceCapacity(null);
    setModal({ open: true, tab: 'single' });
  };

  return (
    <div>
      <div className="page-header">
        <h3>时段管理</h3>
        <p>为资源创建可预约时段，支持单日创建和批量创建</p>
      </div>
      <Card
        title={<span style={{ fontWeight: 700, fontSize: 15 }}>时段列表</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增时段</Button>}
      >
        <div className="filter-bar">
          <span className="filter-bar-label">筛选</span>
          <Select
            showSearch
            placeholder="选择资源"
            allowClear
            style={{ width: 280 }}
            filterOption={(input, option) => (option?.label as string || '').includes(input)}
            options={resources.map((r) => ({ label: r.name, value: r.id }))}
            onChange={(val) => setFilters((f) => ({ ...f, resourceId: val }))}
          />
          <DatePicker
            placeholder="选择日期"
            onChange={(d) => setFilters((f) => ({ ...f, reserveDate: d ? d.format('YYYY-MM-DD') : undefined }))}
          />
        </div>
        <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
      <Modal
        title="新增预约时段"
        open={modal.open}
        onOk={handleOk}
        onCancel={() => setModal({ open: false, tab: 'single' })}
        confirmLoading={submitting}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="resourceId" label="资源" rules={[{ required: true, message: '请选择资源' }]}>
            <Select
              showSearch
              placeholder="选择资源"
              filterOption={(input, option) => (option?.label as string || '').includes(input)}
              options={resources.map((r) => ({ label: `${r.name}（容量 ${r.capacity}）`, value: r.id }))}
              onChange={(val) => handleResourceChange(val)}
            />
          </Form.Item>
          <Tabs
            activeKey={modal.tab}
            items={tabItems}
            onChange={(key) => { setModal((m) => ({ ...m, tab: key as 'single' | 'batch' })); }}
          />
          <Space size="middle">
            <Form.Item name="startTime" label="开始时间" rules={[{ required: true, message: '请选开始时间' }]}>
              <TimePicker format="HH:mm:ss" />
            </Form.Item>
            <Form.Item name="endTime" label="结束时间" rules={[{ required: true, message: '请选结束时间' }]}>
              <TimePicker format="HH:mm:ss" />
            </Form.Item>
          </Space>
          <Form.Item
            name="totalCapacity"
            label="容量"
            rules={[{ required: true, message: '请输入容量' }]}
            extra={
              selectedResourceCapacity != null
                ? `该资源最大容量为 ${selectedResourceCapacity}，时段容量不可超过此值`
                : '请先选择资源，容量将自动填充为资源容量'
            }
          >
            <InputNumber
              min={1}
              max={selectedResourceCapacity || undefined}
              style={{ width: '100%' }}
              placeholder={selectedResourceCapacity != null ? `不超过 ${selectedResourceCapacity}` : '请先选择资源'}
            />
          </Form.Item>
        </Form>
      </Modal>
      </Card>
    </div>
  );
}
