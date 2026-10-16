import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { providerServicesApi } from '../../api/client';
import { Service } from '../../types';

type StatusFilter = 'all' | 'approved' | 'pending' | 'draft' | 'rejected';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'draft', label: 'Draft' },
  { key: 'rejected', label: 'Rejected' },
];

export default function ProviderServices() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await providerServicesApi.getAll();
      setServices(response.data.data?.services || []);
    } catch (error) {
      console.error('Failed to load services', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load services',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (service: Service) => {
    confirmDialog({
      message: `Are you sure you want to delete "${service.name}"?`,
      header: 'Delete Service',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await providerServicesApi.delete(service.id);
          setServices(services.filter((s) => s.id !== service.id));
          toast.current?.show({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Service deleted successfully',
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete service',
          });
        }
      },
    });
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const newIsActive = !service.isActive;
      await providerServicesApi.update(service.id, { isActive: newIsActive });
      setServices(services.map((s) => (s.id === service.id ? { ...s, isActive: newIsActive } : s)));
      toast.current?.show({
        severity: 'success',
        summary: 'Updated',
        detail: `Service is now ${newIsActive ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update service',
      });
    }
  };

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const pending = services.filter((s) => s.status === 'pending').length;
    const rated = services.filter((s) => Number(s.avgRating) > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + Number(s.avgRating), 0) / rated.length
        : 0;
    return { total, active, pending, avgRating };
  }, [services]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: services.length,
      approved: 0,
      pending: 0,
      draft: 0,
      rejected: 0,
    };
    services.forEach((s) => {
      if (s.status in counts) counts[s.status as StatusFilter] += 1;
    });
    return counts;
  }, [services]);

  const filteredServices = useMemo(() => {
    if (statusFilter === 'all') return services;
    return services.filter((s) => s.status === statusFilter);
  }, [services, statusFilter]);

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'info';
      case 'rejected':
        return 'danger';
      default:
        return null;
    }
  };

  const imageTemplate = (rowData: Service) => (
    <div
      className="border-round overflow-hidden shadow-1"
      style={{
        width: '64px',
        height: '48px',
        backgroundImage: `url(${rowData.images?.[0]?.url || '/placeholder-service.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'var(--surface-200)',
      }}
    />
  );

  const nameTemplate = (rowData: Service) => (
    <div className="flex flex-column">
      <span className="font-semibold text-color">{rowData.name}</span>
      {rowData.location && (
        <span className="text-sm text-color-secondary mt-1">
          <i className="pi pi-map-marker text-xs mr-1" />
          {rowData.location}
        </span>
      )}
    </div>
  );

  const priceTemplate = (rowData: Service) => (
    <span className="font-semibold">{Number(rowData.basePrice).toLocaleString()} TND</span>
  );

  const statusTemplate = (rowData: Service) => (
    <div className="flex flex-column gap-1 align-items-start">
      <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />
      {!rowData.isActive && (
        <span className="text-xs text-color-secondary">
          <i className="pi pi-eye-slash text-xs mr-1" />
          Hidden
        </span>
      )}
    </div>
  );

  const ratingTemplate = (rowData: Service) => (
    <div className="flex align-items-center gap-2">
      <i className="pi pi-star-fill text-yellow-500" />
      <span className="font-medium">{parseFloat(String(rowData.avgRating || 0)).toFixed(1)}</span>
      <span className="text-sm text-color-secondary">({rowData.reviewCount || 0})</span>
    </div>
  );

  const actionsTemplate = (rowData: Service) => (
    <div className="flex gap-2 justify-content-end">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text p-button-sm"
        onClick={() => navigate(`/provider/services/${rowData.id}/edit`)}
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon={rowData.isActive ? 'pi pi-eye-slash' : 'pi pi-eye'}
        className="p-button-rounded p-button-text p-button-sm"
        onClick={() => handleToggleActive(rowData)}
        tooltip={rowData.isActive ? 'Deactivate' : 'Activate'}
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger p-button-sm"
        onClick={() => handleDelete(rowData)}
        tooltip="Delete"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  const StatCard = ({
    label,
    value,
    icon,
    iconBg,
    iconColor,
  }: {
    label: string;
    value: string | number;
    icon: string;
    iconBg: string;
    iconColor: string;
  }) => (
    <div className="services-stat-card">
      <div className="services-stat-icon" style={{ backgroundColor: iconBg }}>
        <i className={`${icon} text-xl`} style={{ color: iconColor }} />
      </div>
      <div className="flex flex-column">
        <span className="text-sm text-color-secondary">{label}</span>
        <span className="text-2xl font-bold text-color">{value}</span>
      </div>
    </div>
  );

  const pageHeader = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
      <div>
        <h2 className="text-3xl font-bold m-0 text-color">My Services</h2>
        <p className="text-color-secondary mt-2 mb-0">
          Manage your listings, track their status, and keep customers coming back.
        </p>
      </div>
      <Link to="/provider/services/new">
        <Button label="Add Service" icon="pi pi-plus" className="w-full md:w-auto" />
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div>
        {pageHeader}
        <div className="grid mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="col-12 sm:col-6 lg:col-3">
              <Skeleton height="88px" borderRadius="12px" />
            </div>
          ))}
        </div>
        <Skeleton height="480px" borderRadius="12px" />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      {pageHeader}

      <div className="grid mb-4">
        <div className="col-12 sm:col-6 lg:col-3">
          <StatCard
            label="Total Services"
            value={stats.total}
            icon="pi pi-list"
            iconBg="#e0e7ff"
            iconColor="#4f46e5"
          />
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <StatCard
            label="Active"
            value={stats.active}
            icon="pi pi-check-circle"
            iconBg="#dcfce7"
            iconColor="#16a34a"
          />
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon="pi pi-clock"
            iconBg="#fef3c7"
            iconColor="#d97706"
          />
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <StatCard
            label="Avg Rating"
            value={stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : '—'}
            icon="pi pi-star-fill"
            iconBg="#ffedd5"
            iconColor="#f97316"
          />
        </div>
      </div>

      {services.length === 0 ? (
        <div className="services-table-card">
          <div className="text-center py-6 px-4">
            <div
              className="inline-flex align-items-center justify-content-center border-circle mb-4"
              style={{ width: '80px', height: '80px', backgroundColor: 'var(--primary-color-light)' }}
            >
              <i className="pi pi-list text-4xl" style={{ color: 'var(--primary-color)' }} />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No services yet</h3>
            <p className="text-color-secondary mb-4 max-w-30rem mx-auto">
              Create your first service to start receiving bookings and grow your business.
            </p>
            <Link to="/provider/services/new">
              <Button label="Add Your First Service" icon="pi pi-plus" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="services-toolbar">
            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`services-filter-chip ${statusFilter === f.key ? 'is-active' : ''}`}
                  >
                    {f.label}
                    <span className="chip-count">{statusCounts[f.key]}</span>
                  </button>
                ))}
              </div>
              <span className="p-input-icon-left w-full md:w-20rem">
                <i className="pi pi-search" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search services..."
                  className="w-full"
                />
              </span>
            </div>
          </div>

          <div className="services-table-card">
            <DataTable
              value={filteredServices}
              className="services-table"
              paginator
              rows={10}
              rowsPerPageOptions={[10, 25, 50]}
              paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
              currentPageReportTemplate="Showing {first}–{last} of {totalRecords}"
              globalFilter={globalFilter}
              globalFilterFields={['name', 'category.name', 'location', 'status']}
              emptyMessage={
                <div className="text-center py-4">
                  <i className="pi pi-inbox text-4xl text-color-secondary mb-3 block" />
                  <p className="text-color-secondary m-0">No services match your filters.</p>
                </div>
              }
              stripedRows={false}
              rowHover
            >
              <Column header="" body={imageTemplate} style={{ width: '90px' }} />
              <Column field="name" header="Name" body={nameTemplate} sortable />
              <Column field="category.name" header="Category" sortable />
              <Column field="basePrice" header="Price" body={priceTemplate} sortable />
              <Column field="status" header="Status" body={statusTemplate} sortable />
              <Column field="avgRating" header="Rating" body={ratingTemplate} sortable />
              <Column
                header=""
                body={actionsTemplate}
                style={{ width: '170px', textAlign: 'right' }}
              />
            </DataTable>
          </div>
        </>
      )}
    </div>
  );
}
