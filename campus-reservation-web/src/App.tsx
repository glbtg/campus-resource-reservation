import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './stores/auth';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import StudentDashboard from './pages/student/Dashboard';
import ResourceList from './pages/student/ResourceList';
import ResourceDetail from './pages/student/ResourceDetail';
import MyReservations from './pages/student/MyReservations';
import AdminDashboard from './pages/admin/Dashboard';
import ResourceTypes from './pages/admin/ResourceTypes';
import Resources from './pages/admin/Resources';
import Slots from './pages/admin/Slots';
import AdminReservations from './pages/admin/Reservations';

const themeConfig = {
  token: {
    colorPrimary: '#5b5af7',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#5b5af7',
    colorTextBase: '#0f172a',
    colorBgBase: '#ffffff',
    colorFillAlter: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorBorder: '#e5e7ec',
    colorBorderSecondary: '#f1f3f7',
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeLG: 15,
    lineHeight: 1.6,
    controlHeight: 38,
    controlHeightLG: 44,
    controlHeightSM: 30,
    paddingContentHorizontal: 24,
    paddingContentVertical: 20,
    paddingLG: 24,
    marginLG: 24,
    fontWeightStrong: 700,
    boxShadow: '0 4px 6px -1px rgba(15,23,42,0.06), 0 2px 4px -2px rgba(15,23,42,0.04)',
    boxShadowSecondary: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
  },
  components: {
    Card: {
      paddingLG: 24,
      borderRadiusLG: 16,
      colorBorderSecondary: '#f1f3f7',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#f8fafc',
      headerColor: '#64748b',
      rowHoverBg: '#eef0ff',
      borderColor: '#f1f3f7',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      fontWeight: 600,
      primaryShadow: '0 4px 14px rgba(91,90,247,0.25)',
    },
    Input: {
      borderRadius: 8,
      controlHeight: 38,
      activeBorderColor: '#5b5af7',
      hoverBorderColor: '#d0d4dd',
    },
    Select: {
      borderRadius: 8,
      controlHeight: 38,
      optionSelectedBg: '#eef0ff',
    },
    Tag: {
      borderRadiusSM: 20,
    },
    Modal: {
      borderRadiusLG: 16,
      titleFontSize: 18,
      titleFontWeight: 700,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255,255,255,0.12)',
      darkItemHoverBg: 'rgba(255,255,255,0.08)',
      itemBorderRadius: 8,
    },
    Layout: {
      siderBg: '#1e1b4b',
    },
    Pagination: {
      itemActiveBg: '#5b5af7',
    },
    Tabs: {
      inkBarColor: '#5b5af7',
    },
    Form: {
      labelFontSize: 13,
      itemMarginBottom: 20,
    },
  },
};

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ role, children }: { role: 'ADMIN' | 'STUDENT'; children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/student" element={<RequireAuth><RequireRole role="STUDENT"><MainLayout /></RequireRole></RequireAuth>}>
                <Route index element={<StudentDashboard />} />
                <Route path="resources" element={<ResourceList />} />
                <Route path="resources/:id" element={<ResourceDetail />} />
                <Route path="reservations" element={<MyReservations />} />
              </Route>
              <Route path="/admin" element={<RequireAuth><RequireRole role="ADMIN"><MainLayout /></RequireRole></RequireAuth>}>
                <Route index element={<AdminDashboard />} />
                <Route path="resource-types" element={<ResourceTypes />} />
                <Route path="resources" element={<Resources />} />
                <Route path="slots" element={<Slots />} />
                <Route path="reservations" element={<AdminReservations />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
