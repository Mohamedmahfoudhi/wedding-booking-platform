import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { useAppSelector } from '../../store/hooks';
import { bookingsApi, favoritesApi, notificationsApi } from '../../api/client';
import { Booking, Service, Notification } from '../../types';

export default function ClientDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bookingsRes, favoritesRes, notificationsRes] = await Promise.all([
        bookingsApi.getMyBookings(1, 5),
        favoritesApi.getAll(1, 4),
        notificationsApi.getAll(1, 5),
      ]);

      setRecentBookings(bookingsRes.data.data?.bookings || []);
      setFavorites(favoritesRes.data.data?.favorites || favoritesRes.data.data?.services || []);
      setNotifications(notificationsRes.data.data?.notifications || []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return null;
    }
  };

  const statusTemplate = (rowData: Booking) => (
    <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />
  );

  const dateTemplate = (rowData: Booking) => (
    <span>{new Date(rowData.eventDate).toLocaleDateString()}</span>
  );

  const serviceTemplate = (rowData: Booking) => (
    <Link to={`/services/${rowData.service?.id}`} className="text-primary no-underline font-medium">
      {rowData.service?.name}
    </Link>
  );

  const totalTemplate = (rowData: Booking) => (
    <span className="font-semibold">{Number(rowData.total ?? 0).toLocaleString()} TND</span>
  );

  if (loading) {
    return (
      <div className="surface-ground min-h-screen">
        <div className="dashboard-hero">
          <div className="container">
            <Skeleton width="140px" height="1rem" className="mb-2" />
            <Skeleton width="260px" height="2.25rem" />
          </div>
        </div>
        <div className="container py-4 dashboard-content">
          <div className="grid mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 md:col-6 lg:col-3">
                <div className="dashboard-stat">
                  <Skeleton shape="circle" size="48px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="0.9rem" className="mb-2" />
                    <Skeleton width="40%" height="1.5rem" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid">
            <div className="col-12 lg:col-8">
              <div className="dashboard-panel">
                <Skeleton height="240px" />
              </div>
            </div>
            <div className="col-12 lg:col-4">
              <div className="dashboard-panel">
                <Skeleton height="240px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcoming = recentBookings.filter((b) => b.status === 'confirmed').length;
  const pending = recentBookings.filter((b) => b.status === 'pending').length;
  const completed = recentBookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="surface-ground min-h-screen">
      <div className="dashboard-hero">
        <div className="container">
          <p className="dashboard-hero-greeting">Welcome back</p>
          <h1 className="dashboard-hero-title">{user?.firstName || 'there'} 👋</h1>
          <p className="dashboard-hero-subtitle">
            Here's a quick look at your bookings, favorites, and recent activity.
          </p>
        </div>
      </div>

      <div className="container py-4 dashboard-content">
        {/* Quick Stats */}
        <div className="grid mb-4">
          <div className="col-12 md:col-6 lg:col-3">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon dashboard-stat-icon--blue">
                <i className="pi pi-calendar" />
              </div>
              <div>
                <p className="dashboard-stat-label">Upcoming</p>
                <p className="dashboard-stat-value">{upcoming}</p>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon dashboard-stat-icon--amber">
                <i className="pi pi-clock" />
              </div>
              <div>
                <p className="dashboard-stat-label">Pending</p>
                <p className="dashboard-stat-value">{pending}</p>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon dashboard-stat-icon--pink">
                <i className="pi pi-heart" />
              </div>
              <div>
                <p className="dashboard-stat-label">Favorites</p>
                <p className="dashboard-stat-value">{favorites.length}</p>
              </div>
            </div>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon dashboard-stat-icon--green">
                <i className="pi pi-check-circle" />
              </div>
              <div>
                <p className="dashboard-stat-label">Completed</p>
                <p className="dashboard-stat-value">{completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          {/* Recent Bookings */}
          <div className="col-12 lg:col-8">
            <div className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2 className="dashboard-panel-title">Recent Bookings</h2>
                <Link to="/account/bookings">
                  <Button label="View all" icon="pi pi-arrow-right" iconPos="right" className="p-button-text p-button-sm" />
                </Link>
              </div>

              {recentBookings.length > 0 ? (
                <DataTable value={recentBookings} responsiveLayout="scroll">
                  <Column field="service.name" header="Service" body={serviceTemplate} />
                  <Column field="eventDate" header="Date" body={dateTemplate} />
                  <Column field="status" header="Status" body={statusTemplate} />
                  <Column field="total" header="Total" body={totalTemplate} />
                </DataTable>
              ) : (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <i className="pi pi-calendar" />
                  </div>
                  <p>No bookings yet. Browse the catalog to get started.</p>
                  <Link to="/search">
                    <Button label="Browse services" icon="pi pi-search" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="col-12 lg:col-4">
            <div className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2 className="dashboard-panel-title">Notifications</h2>
              </div>

              {notifications.length > 0 ? (
                <div className="flex flex-column gap-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`dashboard-notification ${notification.isRead ? '' : 'dashboard-notification--unread'}`}
                    >
                      <div className="dashboard-notification-icon">
                        <i className="pi pi-bell" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="dashboard-notification-title">{notification.title}</p>
                        <p className="dashboard-notification-message">{notification.message}</p>
                        <p className="dashboard-notification-date">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <i className="pi pi-bell" />
                  </div>
                  <p>You're all caught up.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="dashboard-panel mt-4">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">My Favorites</h2>
              <Link to="/account/favorites">
                <Button label="View all" icon="pi pi-arrow-right" iconPos="right" className="p-button-text p-button-sm" />
              </Link>
            </div>

            <div className="grid">
              {favorites.slice(0, 4).map((service) => (
                <div key={service.id} className="col-12 md:col-6 lg:col-3">
                  <Link to={`/services/${service.id}`} className="dashboard-favorite">
                    <div
                      className="dashboard-favorite-image"
                      style={{
                        backgroundImage: service.images?.[0]?.url
                          ? `url(${service.images[0].url})`
                          : undefined,
                      }}
                    >
                      {!service.images?.[0]?.url && (
                        <div className="flex align-items-center justify-content-center h-full text-color-secondary">
                          <i className="pi pi-image text-3xl" />
                        </div>
                      )}
                    </div>
                    <div className="dashboard-favorite-body">
                      <h4 className="dashboard-favorite-name">{service.name}</h4>
                      <p className="dashboard-favorite-price">
                        {Number(service.basePrice ?? 0).toLocaleString()} TND
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
