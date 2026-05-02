import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useRef } from 'react';

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/account' },
  { label: 'My Bookings', icon: 'pi pi-calendar', path: '/account/bookings' },
  { label: 'Favorites', icon: 'pi pi-heart', path: '/account/favorites' },
  { label: 'Messages', icon: 'pi pi-comments', path: '/account/messages' },
];

export default function ClientLayout() {
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
    <div className="min-h-screen surface-ground">
      {/* Header */}
      <header className="surface-card shadow-1 sticky top-0 z-5">
        <div className="container flex align-items-center justify-content-between py-3">
          <Link to="/" className="flex align-items-center gap-2 no-underline">
            <i className="pi pi-heart-fill text-primary text-2xl"></i>
            <span className="text-xl font-bold text-primary">WeddingBook</span>
          </Link>

          <nav className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`no-underline flex align-items-center gap-2 px-3 py-2 border-round ${
                  location.pathname === item.path
                    ? 'text-primary bg-primary-50'
                    : 'text-color-secondary hover:text-primary'
                }`}
              >
                <i className={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex align-items-center gap-2">
            <div
              className="flex align-items-center gap-2 cursor-pointer"
              onClick={(e) => menuRef.current?.toggle(e)}
            >
              <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <span className="font-medium hidden md:block">{user?.firstName}</span>
              <i className="pi pi-chevron-down text-sm"></i>
            </div>
            <Menu model={userMenuItems} popup ref={menuRef} />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden surface-card border-bottom-1 surface-border">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 no-underline flex align-items-center gap-2 px-4 py-3 ${
                location.pathname === item.path
                  ? 'text-primary border-bottom-2 border-primary'
                  : 'text-color-secondary'
              }`}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="surface-card border-top-1 surface-border mt-6">
        <div className="container py-4 text-center text-color-secondary">
          <p>&copy; 2024 WeddingBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
