import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { useAppSelector } from '../../store/hooks';
import { bookingsApi, favoritesApi, notificationsApi } from '../../api/client';
import { Booking, Service, Notification } from '../../types';

export default function ClientDashboard() {
  const navigate = useNavigate();
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
    <Link to={`/services/${rowData.service?.id}`} className="text-primary no-underline">
      {rowData.service?.name}
    </Link>
  );

  if (loading) {
    return (
      <div className="surface-ground min-h-screen p-4">
        <div className="container">
          <Skeleton width="200px" height="2rem" className="mb-4" />
          <div className="grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 md:col-6 lg:col-3">
                <Card>
                  <Skeleton height="100px" />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ground min-h-screen">
      <div className="container py-4">
        <h1 className="text-3xl font-bold mb-4">
          Welcome back, {user?.firstName}!
        </h1>

        {/* Quick Stats */}
        <div className="grid mb-4">
          <div className="col-12 md:col-6 lg:col-3">
            <Card className="h-full">
              <div className="flex align-items-center">
                <div className="w-3rem h-3rem border-circle bg-blue-100 flex align-items-center justify-content-center mr-3">
                  <i className="pi pi-calendar text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-color-secondary text-sm mb-1">Upcoming Bookings</p>
                  <p className="text-2xl font-bold m-0">
                    {recentBookings.filter((b) => b.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <Card className="h-full">
              <div className="flex align-items-center">
                <div className="w-3rem h-3rem border-circle bg-yellow-100 flex align-items-center justify-content-center mr-3">
                  <i className="pi pi-clock text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-color-secondary text-sm mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold m-0">
                    {recentBookings.filter((b) => b.status === 'pending').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <Card className="h-full">
              <div className="flex align-items-center">
                <div className="w-3rem h-3rem border-circle bg-pink-100 flex align-items-center justify-content-center mr-3">
                  <i className="pi pi-heart text-pink-600 text-xl" />
                </div>
                <div>
                  <p className="text-color-secondary text-sm mb-1">Favorites</p>
                  <p className="text-2xl font-bold m-0">{favorites.length}</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <Card className="h-full">
              <div className="flex align-items-center">
                <div className="w-3rem h-3rem border-circle bg-green-100 flex align-items-center justify-content-center mr-3">
                  <i className="pi pi-check-circle text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-color-secondary text-sm mb-1">Completed</p>
                  <p className="text-2xl font-bold m-0">
                    {recentBookings.filter((b) => b.status === 'completed').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid">
          {/* Recent Bookings */}
          <div className="col-12 lg:col-8">
            <Card>
              <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0">Recent Bookings</h2>
                <Link to="/account/bookings">
                  <Button label="View All" icon="pi pi-arrow-right" iconPos="right" className="p-button-text" />
                </Link>
              </div>

              {recentBookings.length > 0 ? (
                <DataTable value={recentBookings} responsiveLayout="scroll">
                  <Column field="service.name" header="Service" body={serviceTemplate} />
                  <Column field="eventDate" header="Date" body={dateTemplate} />
                  <Column field="status" header="Status" body={statusTemplate} />
                  <Column field="total" header="Total" body={(row) => `${row.total} TND`} />
                </DataTable>
              ) : (
                <div className="text-center py-4">
                  <i className="pi pi-calendar text-4xl text-color-secondary mb-3" />
                  <p className="text-color-secondary">No bookings yet</p>
                  <Link to="/search">
                    <Button label="Browse Services" icon="pi pi-search" />
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Notifications */}
          <div className="col-12 lg:col-4">
            <Card>
              <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0">Notifications</h2>
              </div>

              {notifications.length > 0 ? (
                <div className="flex flex-column gap-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-round ${notification.isRead ? 'surface-ground' : 'surface-100'}`}
                    >
                      <div className="flex align-items-start gap-2">
                        <i className={`pi ${notification.isRead ? 'pi-bell' : 'pi-bell text-primary'}`} />
                        <div>
                          <p className="font-medium m-0 mb-1">{notification.title}</p>
                          <p className="text-sm text-color-secondary m-0">{notification.message}</p>
                          <p className="text-xs text-color-secondary mt-2 mb-0">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-color-secondary text-center">No notifications</p>
              )}
            </Card>
          </div>
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <Card className="mt-4">
            <div className="flex justify-content-between align-items-center mb-4">
              <h2 className="text-xl font-bold m-0">My Favorites</h2>
              <Link to="/account/favorites">
                <Button label="View All" icon="pi pi-arrow-right" iconPos="right" className="p-button-text" />
              </Link>
            </div>

            <div className="grid">
              {favorites.slice(0, 4).map((service) => (
                <div key={service.id} className="col-12 md:col-6 lg:col-3">
                  <Link to={`/services/${service.id}`} className="no-underline">
                    <Card className="h-full service-card">
                      <div
                        className="border-round mb-3"
                        style={{
                          backgroundImage: `url(${service.images?.[0]?.url || '/placeholder-service.jpg'})`,
                          height: '120px',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <h4 className="m-0 mb-1 text-color">{service.name}</h4>
                      <p className="text-primary font-bold m-0">{service.basePrice} TND</p>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
