import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/provider' },
  { label: 'Services', icon: 'pi pi-list', path: '/provider/services' },
  { label: 'Bookings', icon: 'pi pi-calendar', path: '/provider/bookings' },
  { label: 'Calendar', icon: 'pi pi-calendar-plus', path: '/provider/calendar' },
  { label: 'Reviews', icon: 'pi pi-star', path: '/provider/reviews' },
  { label: 'Settings', icon: 'pi pi-cog', path: '/provider/settings' },
];

export default function ProviderLayout() {
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
    {
      label: 'Profile Settings',
      icon: 'pi pi-user',
      command: () => navigate('/provider/settings'),
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
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link to="/provider" className="no-underline text-primary">
            <i className="pi pi-heart-fill mr-2"></i>
            WeddingBook
          </Link>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-top-1 surface-border">
          <Link to="/provider/services/new" className="no-underline">
            <Button
              label="Add Service"
              icon="pi pi-plus"
              className="w-full"
            />
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-with-sidebar flex-grow-1">
        {/* Header */}
        <header className="provider-header">
          <div>
            <h1 className="text-xl font-semibold m-0">Provider Dashboard</h1>
          </div>
          <div className="flex align-items-center gap-3">
            <Button
              icon="pi pi-bell"
              className="p-button-text p-button-rounded"
            />
            <Button
              icon="pi pi-comments"
              className="p-button-text p-button-rounded"
              onClick={() => navigate('/account/messages')}
            />
            <div
              className="flex align-items-center gap-2 cursor-pointer"
              onClick={(e) => menuRef.current?.toggle(e)}
            >
              <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <span className="font-medium">{user?.firstName}</span>
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
