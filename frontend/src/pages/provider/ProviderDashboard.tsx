import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { providersApi, providerBookingsApi } from '../../api/client';
import { Booking } from '../../types';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalServices: number;
  monthlyBookings: { month: string; count: number }[];
  recentBookings: Booking[];
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [dashboardRes, recentBookingsRes] = await Promise.all([
        providersApi.getDashboardStats(),
        providerBookingsApi.getAll(1, 5),
      ]);

      const dashboardStats = dashboardRes.data.data?.stats || dashboardRes.data.data || {};
      setStats({
        ...dashboardStats,
        recentBookings: recentBookingsRes.data.data?.bookings || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
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

  const chartData = {
    labels: stats?.monthlyBookings?.map((m) => m.month) || [],
    datasets: [
      {
        label: 'Bookings',
        data: stats?.monthlyBookings?.map((m) => m.count) || [],
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#6366f1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  if (loading) {
    return (
      <div>
        <div className="grid mb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-12 md:col-6 lg:col-3">
              <Skeleton height="88px" style={{ borderRadius: 14 }} />
            </div>
          ))}
        </div>
        <div className="grid">
          <div className="col-12 lg:col-8">
            <Skeleton height="340px" style={{ borderRadius: 14 }} />
          </div>
          <div className="col-12 lg:col-4">
            <Skeleton height="340px" style={{ borderRadius: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = Number(stats?.totalRevenue ?? 0);

  return (
    <div>
      {/* Stats Tiles */}
      <div className="grid mb-3">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="dashboard-stat">
            <div className="dashboard-stat-icon dashboard-stat-icon--blue">
              <i className="pi pi-calendar" />
            </div>
            <div>
              <p className="dashboard-stat-label">Total Bookings</p>
              <p className="dashboard-stat-value">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="dashboard-stat">
            <div className="dashboard-stat-icon dashboard-stat-icon--amber">
              <i className="pi pi-clock" />
            </div>
            <div>
              <p className="dashboard-stat-label">Pending Requests</p>
              <p className="dashboard-stat-value">{stats?.pendingBookings || 0}</p>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="dashboard-stat">
            <div className="dashboard-stat-icon dashboard-stat-icon--green">
              <i className="pi pi-wallet" />
            </div>
            <div>
              <p className="dashboard-stat-label">Revenue</p>
              <p className="dashboard-stat-value">
                {totalRevenue.toLocaleString()} <small style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-color-secondary)' }}>TND</small>
              </p>
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="dashboard-stat">
            <div className="dashboard-stat-icon dashboard-stat-icon--pink">
              <i className="pi pi-briefcase" />
            </div>
            <div>
              <p className="dashboard-stat-label">Active Services</p>
              <p className="dashboard-stat-value">{stats?.totalServices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
        {/* Chart */}
        <div className="col-12 lg:col-8">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">Booking Trends</h2>
            </div>
            {chartData.labels.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Chart type="line" data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="dashboard-empty" style={{ padding: '2.5rem 1rem' }}>
                <div className="dashboard-empty-icon">
                  <i className="pi pi-chart-line" />
                </div>
                <p>No booking data yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12 lg:col-4">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">Quick Actions</h2>
            </div>
            <div className="flex flex-column gap-2">
              <Link to="/provider/services/new" className="no-underline">
                <Button
                  label="Add new service"
                  icon="pi pi-plus"
                  className="w-full"
                />
              </Link>
              <Link to="/provider/calendar" className="no-underline">
                <Button
                  label="Manage calendar"
                  icon="pi pi-calendar"
                  className="w-full p-button-outlined"
                />
              </Link>
              <Link to="/provider/bookings" className="no-underline">
                <Button
                  label="View all bookings"
                  icon="pi pi-list"
                  className="w-full p-button-outlined"
                />
              </Link>
              <Link to="/provider/settings" className="no-underline">
                <Button
                  label="Update profile"
                  icon="pi pi-user"
                  className="w-full p-button-outlined"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="col-12">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h2 className="dashboard-panel-title">Recent Booking Requests</h2>
              <Link to="/provider/bookings">
                <Button
                  label="View all"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  className="p-button-text p-button-sm"
                />
              </Link>
            </div>

            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <DataTable value={stats.recentBookings} responsiveLayout="scroll">
                <Column
                  field="client.firstName"
                  header="Client"
                  body={(row) => (
                    <span className="font-medium">
                      {row.client?.firstName} {row.client?.lastName}
                    </span>
                  )}
                />
                <Column field="service.name" header="Service" />
                <Column
                  field="eventDate"
                  header="Event Date"
                  body={(row) => new Date(row.eventDate).toLocaleDateString()}
                />
                <Column
                  field="total"
                  header="Total"
                  body={(row) => (
                    <span className="font-semibold">
                      {Number(row.total ?? 0).toLocaleString()} TND
                    </span>
                  )}
                />
                <Column
                  field="status"
                  header="Status"
                  body={(row) => (
                    <Tag value={row.status} severity={getStatusSeverity(row.status) ?? undefined} />
                  )}
                />
                <Column
                  body={(row) => (
                    <Link to={`/provider/bookings?id=${row.id}`}>
                      <Button
                        icon="pi pi-eye"
                        className="p-button-rounded p-button-text"
                        tooltip="View details"
                        tooltipOptions={{ position: 'left' }}
                      />
                    </Link>
                  )}
                  style={{ width: '60px' }}
                />
              </DataTable>
            ) : (
              <div className="dashboard-empty" style={{ padding: '2rem 1rem' }}>
                <div className="dashboard-empty-icon">
                  <i className="pi pi-calendar" />
                </div>
                <p>No recent bookings yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
