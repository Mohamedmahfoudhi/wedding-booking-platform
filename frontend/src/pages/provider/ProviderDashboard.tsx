import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
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
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 md:col-6 lg:col-3">
            <Card>
              <Skeleton height="80px" />
            </Card>
          </div>
        ))}
        <div className="col-12 lg:col-8">
          <Card>
            <Skeleton height="300px" />
          </Card>
        </div>
        <div className="col-12 lg:col-4">
          <Card>
            <Skeleton height="300px" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Stats Cards */}
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-blue-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-calendar text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Total Bookings</p>
              <p className="text-2xl font-bold m-0">{stats?.totalBookings || 0}</p>
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
              <p className="text-2xl font-bold m-0">{stats?.pendingBookings || 0}</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-green-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-wallet text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold m-0">{stats?.totalRevenue || 0} TND</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-3">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-purple-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-list text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Active Services</p>
              <p className="text-2xl font-bold m-0">{stats?.totalServices || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <div className="col-12 lg:col-8">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">Booking Trends</h3>
          </div>
          <div style={{ height: '300px' }}>
            <Chart type="line" data={chartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="col-12 lg:col-4">
        <Card>
          <h3 className="mt-0 mb-4">Quick Actions</h3>
          <div className="flex flex-column gap-3">
            <Link to="/provider/services/new" className="no-underline">
              <Button
                label="Add New Service"
                icon="pi pi-plus"
                className="w-full p-button-outlined"
              />
            </Link>
            <Link to="/provider/calendar" className="no-underline">
              <Button
                label="Manage Calendar"
                icon="pi pi-calendar"
                className="w-full p-button-outlined"
              />
            </Link>
            <Link to="/provider/bookings" className="no-underline">
              <Button
                label="View All Bookings"
                icon="pi pi-list"
                className="w-full p-button-outlined"
              />
            </Link>
            <Link to="/provider/settings" className="no-underline">
              <Button
                label="Update Profile"
                icon="pi pi-user"
                className="w-full p-button-outlined"
              />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">Recent Booking Requests</h3>
            <Link to="/provider/bookings">
              <Button
                label="View All"
                icon="pi pi-arrow-right"
                iconPos="right"
                className="p-button-text"
              />
            </Link>
          </div>

          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <DataTable value={stats.recentBookings} responsiveLayout="scroll">
              <Column
                field="client.firstName"
                header="Client"
                body={(row) => `${row.client?.firstName} ${row.client?.lastName}`}
              />
              <Column field="service.name" header="Service" />
              <Column
                field="eventDate"
                header="Event Date"
                body={(row) => new Date(row.eventDate).toLocaleDateString()}
              />
              <Column field="total" header="Total" body={(row) => `${row.total} TND`} />
              <Column
                field="status"
                header="Status"
                body={(row) => <Tag value={row.status} severity={getStatusSeverity(row.status)} />}
              />
              <Column
                body={(row) => (
                  <Link to={`/provider/bookings?id=${row.id}`}>
                    <Button icon="pi pi-eye" className="p-button-rounded p-button-text" />
                  </Link>
                )}
                style={{ width: '60px' }}
              />
            </DataTable>
          ) : (
            <div className="text-center py-4 text-color-secondary">
              No recent bookings
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
