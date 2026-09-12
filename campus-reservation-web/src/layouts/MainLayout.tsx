import { useState } from 'react';

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Badge, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ScheduleOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../stores/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const studentMenuItems = [
  { key: '/student', icon: <DashboardOutlined />, label: '首页概览' },
  { key: '/student/resources', icon: <AppstoreOutlined />, label: '资源浏览' },
  { key: '/student/reservations', icon: <ScheduleOutlined />, label: '我的预约' },
];

const adminMenuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '首页概览' },
  { key: '/admin/resource-types', icon: <TagsOutlined />, label: '资源类型' },
  { key: '/admin/resources', icon: <AppstoreOutlined />, label: '资源管理' },
  { key: '/admin/slots', icon: <ScheduleOutlined />, label: '时段管理' },
  { key: '/admin/reservations', icon: <UnorderedListOutlined />, label: '全部预约' },
];

const roleNameMap: Record<string, string> = {
  ADMIN: '管理员',
  STUDENT: '学生',
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const menuItems = isAdmin ? adminMenuItems : studentMenuItems;

  const selectedKey = menuItems.find(
    (item) =>
      location.pathname === item.key ||
      (item.key !== `/${isAdmin ? 'admin' : 'student'}` && location.pathname.startsWith(item.key)),
  )?.key || menuItems[0].key;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userDropdownItems = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '4px 0', minWidth: 120 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.nickname}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {roleNameMap[user?.role || ''] || '用户'}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const currentPageLabel = menuItems.find((m) => m.key === selectedKey)?.label || '';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        collapsedWidth={80}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '4px 0 30px rgba(0,0,0,0.18)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 74,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '0 20px' : '0 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #818cf8 0%, #5b5af7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(91,90,247,0.5), 0 0 20px rgba(91,90,247,0.2)',
              animation: 'glowPulse 3s ease-in-out infinite',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div
                style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                }}
              >
                校园预约
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}>
                Campus Reserve
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav style={{ padding: '8px 0' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderInlineEnd: 'none' }}
          />
        </nav>

        {/* Collapse Toggle */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: 'rgba(255,255,255,0.5)',
              width: '100%',
              fontSize: 16,
              height: 36,
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          />
        </div>
      </Sider>

      {/* Main Area */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            padding: '0 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 1px 8px rgba(15,23,42,0.04)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: 64,
          }}
        >
          {/* Page indicator */}
          <div>
            <Text style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>
              {currentPageLabel}
            </Text>
          </div>

          <Dropdown
            menu={{ items: userDropdownItems, onClick: ({ key }) => key === 'logout' && handleLogout() }}
            placement="bottomRight"
            trigger={['click']}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '6px 14px 6px 12px',
                borderRadius: 12,
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(91,90,247,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Avatar
                size={34}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#5b5af7',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(91,90,247,0.3)',
                }}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  {user?.nickname}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                  {roleNameMap[user?.role || ''] || '用户'}
                </div>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: '0 32px 40px', minHeight: 280 }}>
          <div style={{ marginTop: 24 }}>
            <div className="page-enter">
              <Outlet />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
