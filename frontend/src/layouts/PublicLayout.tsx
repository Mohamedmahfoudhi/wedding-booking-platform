import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Badge } from 'primereact/badge';
import { useRef, useState, useEffect } from 'react';
import { notificationsApi, messagesApi } from '../api/client';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const menuRef = useRef<Menu>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadCounts();
    }
  }, [isAuthenticated]);

  const loadCounts = async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Failed to load notification count');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems = [
    {
      label: 'My Account',
      icon: 'pi pi-user',
      command: () => navigate('/account'),
    },
    {
      label: 'My Bookings',
      icon: 'pi pi-calendar',
      command: () => navigate('/account/bookings'),
    },
    {
      label: 'My Favorites',
      icon: 'pi pi-heart',
      command: () => navigate('/account/favorites'),
    },
    {
      label: 'Messages',
      icon: 'pi pi-comments',
      command: () => navigate('/account/messages'),
    },
    { separator: true },
    ...(user?.role === 'provider'
      ? [
          {
            label: 'Provider Dashboard',
            icon: 'pi pi-chart-bar',
            command: () => navigate('/provider'),
          },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          {
            label: 'Admin Dashboard',
            icon: 'pi pi-cog',
            command: () => navigate('/admin'),
          },
        ]
      : []),
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen flex flex-column">
      {/* Header */}
      <header className="surface-card shadow-1 sticky top-0 z-5">
        <div className="container flex align-items-center justify-content-between py-3">
          {/* Logo */}
          <Link to="/" className="flex align-items-center gap-2 no-underline">
            <i className="pi pi-heart-fill text-primary text-2xl"></i>
            <span className="text-xl font-bold text-primary">WeddingBook</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-4">
            <Link to="/search" className="text-color-secondary hover:text-primary no-underline">
              Find Services
            </Link>
            <Link to="/categories/salles-des-fetes" className="text-color-secondary hover:text-primary no-underline">
              Venues
            </Link>
            <Link to="/categories/photographes" className="text-color-secondary hover:text-primary no-underline">
              Photographers
            </Link>
          </nav>

          {/* Auth buttons */}
          <div className="flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  icon="pi pi-bell"
                  className="p-button-text p-button-rounded"
                  onClick={() => navigate('/account')}
                >
                  {notificationCount > 0 && (
                    <Badge value={notificationCount} severity="danger" />
                  )}
                </Button>
                <Button
                  label={user?.firstName || 'Account'}
                  icon="pi pi-user"
                  className="p-button-outlined"
                  onClick={(e) => menuRef.current?.toggle(e)}
                />
                <Menu model={userMenuItems} popup ref={menuRef} />
              </>
            ) : (
              <>
                <Button
                  label="Login"
                  className="p-button-text"
                  onClick={() => navigate('/login')}
                />
                <Button
                  label="Sign Up"
                  onClick={() => navigate('/register')}
                />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="surface-card border-top-1 surface-border mt-6">
        <div className="container py-5">
          <div className="grid">
            <div className="col-12 md:col-4">
              <div className="flex align-items-center gap-2 mb-3">
                <i className="pi pi-heart-fill text-primary text-xl"></i>
                <span className="text-xl font-bold">WeddingBook</span>
              </div>
              <p className="text-color-secondary line-height-3">
                Your one-stop marketplace for all wedding services in Tunisia.
                Find the perfect vendors for your special day.
              </p>
            </div>
            <div className="col-12 md:col-2">
              <h4 className="mb-3">Categories</h4>
              <ul className="list-none p-0 m-0">
                <li className="mb-2">
                  <Link to="/categories/salles-des-fetes" className="text-color-secondary hover:text-primary">
                    Venues
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/categories/photographes" className="text-color-secondary hover:text-primary">
                    Photographers
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/categories/traiteurs" className="text-color-secondary hover:text-primary">
                    Caterers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-12 md:col-2">
              <h4 className="mb-3">For Vendors</h4>
              <ul className="list-none p-0 m-0">
                <li className="mb-2">
                  <Link to="/register?role=provider" className="text-color-secondary hover:text-primary">
                    Join as Vendor
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/provider" className="text-color-secondary hover:text-primary">
                    Vendor Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-12 md:col-4">
              <h4 className="mb-3">Contact</h4>
              <p className="text-color-secondary mb-2">
                <i className="pi pi-envelope mr-2"></i>
                contact@weddingbook.tn
              </p>
              <p className="text-color-secondary mb-3">
                <i className="pi pi-phone mr-2"></i>
                +216 XX XXX XXX
              </p>
              <div className="flex gap-2">
                <Button icon="pi pi-facebook" className="p-button-rounded p-button-text" />
                <Button icon="pi pi-instagram" className="p-button-rounded p-button-text" />
                <Button icon="pi pi-twitter" className="p-button-rounded p-button-text" />
              </div>
            </div>
          </div>
          <div className="border-top-1 surface-border mt-4 pt-4 text-center text-color-secondary">
            <p>&copy; 2024 WeddingBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
