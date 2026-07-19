import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';
import { adminApi } from '../../api/client';

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalServices: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingServices: number;
  pendingProviders: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, revenueResponse, servicesResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRevenueChart(6),
        adminApi.getServices({ page: 1, limit: 5, status: 'pending' }),
      ]);

      setStats(statsResponse.data.data.stats);
      setRevenueData(revenueResponse.data.data.data || []);
      setPendingServices(servicesResponse.data.data.services || []);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartData = {
    labels: revenueData.map((m) => m.month),
    datasets: [
      {
        label: 'Revenue (TND)',
        data: revenueData.map((m) => m.revenue),
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
      legend: { display: false },
    },
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <div className="grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="col-12 md:col-6 lg:col-4 xl:col-2">
            <Card>
              <Skeleton height="80px" />
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid">
      {/* Stats Cards */}
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-blue-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-users text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Total Users</p>
              <p className="text-2xl font-bold m-0">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-purple-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-briefcase text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Providers</p>
              <p className="text-2xl font-bold m-0">{stats?.totalProviders || 0}</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-indigo-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-list text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Services</p>
              <p className="text-2xl font-bold m-0">{stats?.totalServices || 0}</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-green-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-calendar text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Bookings</p>
              <p className="text-2xl font-bold m-0">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-teal-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-wallet text-teal-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Revenue</p>
              <p className="text-2xl font-bold m-0">{stats?.totalRevenue || 0} TND</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-12 md:col-6 lg:col-4 xl:col-2">
        <Card className="h-full">
          <div className="flex align-items-center">
            <div className="w-3rem h-3rem border-circle bg-yellow-100 flex align-items-center justify-content-center mr-3">
              <i className="pi pi-clock text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-color-secondary text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold m-0">{stats?.pendingServices || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart */}
      <div className="col-12">
        <Card>
          <h3 className="mt-0 mb-4">Revenue Trend (Last 6 Months)</h3>
          <div style={{ height: '300px' }}>
            <Chart type="line" data={revenueChartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Pending Services */}
      <div className="col-12">
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">Pending Services</h3>
            <Link to="/admin/services?status=pending">
              <Button label="View All" icon="pi pi-arrow-right" iconPos="right" className="p-button-text" />
            </Link>
          </div>
          {pendingServices.length > 0 ? (
            <DataTable value={pendingServices} responsiveLayout="scroll">
              <Column field="name" header="Service" />
              <Column field="provider.businessName" header="Provider" />
              <Column field="category.name" header="Category" />
              <Column
                field="basePrice"
                header="Price"
                body={(row) => `${row.basePrice} TND`}
              />
              <Column
                field="status"
                header="Status"
                body={(row) => <Tag value={row.status} severity={getStatusSeverity(row.status)} />}
              />
              <Column
                body={(row) => (
                  <Link to={`/admin/services?id=${row.id}`}>
                    <Button icon="pi pi-eye" className="p-button-rounded p-button-text" />
                  </Link>
                )}
              />
            </DataTable>
          ) : (
            <div className="text-center py-4 text-color-secondary">
              No pending services
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
