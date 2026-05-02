import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/admin' },
  { label: 'Users', icon: 'pi pi-users', path: '/admin/users' },
  { label: 'Providers', icon: 'pi pi-briefcase', path: '/admin/providers' },
  { label: 'Services', icon: 'pi pi-list', path: '/admin/services' },
  { label: 'Categories', icon: 'pi pi-tags', path: '/admin/categories' },
];

export default function AdminLayout() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<Menu>(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems = [
    {
      label: 'View Marketplace',
      icon: 'pi pi-external-link',
      command: () => navigate('/'),
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar" style={{ background: '#1e293b' }}>
        <div className="sidebar-logo" style={{ borderColor: '#334155' }}>
          <Link to="/admin" className="no-underline text-white">
            <i className="pi pi-shield mr-2"></i>
            Admin Panel
          </Link>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  style={{
                    color: location.pathname === item.path ? '#818cf8' : '#94a3b8',
                    background: location.pathname === item.path ? 'rgba(129, 140, 248, 0.1)' : 'transparent',
                  }}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="main-with-sidebar flex-grow-1 surface-ground">
        {/* Header */}
        <header className="provider-header">
          <div>
            <h1 className="text-xl font-semibold m-0">Admin Dashboard</h1>
          </div>
          <div className="flex align-items-center gap-3">
            <div
              className="flex align-items-center gap-2 cursor-pointer"
              onClick={(e) => menuRef.current?.toggle(e)}
            >
              <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
              <span className="font-medium">{user?.firstName || 'Admin'}</span>
              <i className="pi pi-chevron-down text-sm"></i>
            </div>
            <Menu model={userMenuItems} popup ref={menuRef} />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
