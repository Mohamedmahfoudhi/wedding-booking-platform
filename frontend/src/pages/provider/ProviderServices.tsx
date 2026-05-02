import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { servicesApi } from '../../api/client';
import { Service, ServiceStatus } from '../../types';

export default function ProviderServices() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await servicesApi.getMyServices();
      setServices(response.data.data || response.data);
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
          await servicesApi.delete(service.id);
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

  const handleToggleStatus = async (service: Service) => {
    try {
      const newStatus = service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE;
      await servicesApi.updateStatus(service.id, newStatus);
      setServices(services.map((s) => (s.id === service.id ? { ...s, status: newStatus } : s)));
      toast.current?.show({
        severity: 'success',
        summary: 'Updated',
        detail: `Service is now ${newStatus}`,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update service status',
      });
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'pending':
        return 'info';
      case 'rejected':
        return 'danger';
      default:
        return null;
    }
  };

  const imageTemplate = (rowData: Service) => (
    <div
      className="w-4rem h-3rem border-round"
      style={{
        backgroundImage: `url(${rowData.images?.[0]?.url || '/placeholder-service.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );

  const statusTemplate = (rowData: Service) => (
    <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />
  );

  const actionsTemplate = (rowData: Service) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-text"
        onClick={() => navigate(`/provider/services/${rowData.id}/edit`)}
      />
      <Button
        icon={rowData.status === ServiceStatus.ACTIVE ? 'pi pi-eye-slash' : 'pi pi-eye'}
        className="p-button-rounded p-button-text"
        onClick={() => handleToggleStatus(rowData)}
        tooltip={rowData.status === ServiceStatus.ACTIVE ? 'Deactivate' : 'Activate'}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  const header = (
    <div className="flex justify-content-between align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search services..."
        />
      </span>
      <Link to="/provider/services/new">
        <Button label="Add Service" icon="pi pi-plus" />
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">My Services</h2>
        <Card>
          <Skeleton height="400px" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <h2 className="text-2xl font-bold mb-4">My Services</h2>

      <Card>
        {services.length === 0 ? (
          <div className="text-center py-6">
            <i className="pi pi-list text-5xl text-color-secondary mb-4" />
            <h3 className="text-xl mb-3">No services yet</h3>
            <p className="text-color-secondary mb-4">
              Create your first service to start receiving bookings
            </p>
            <Link to="/provider/services/new">
              <Button label="Add Your First Service" icon="pi pi-plus" />
            </Link>
          </div>
        ) : (
          <DataTable
            value={services}
            responsiveLayout="scroll"
            paginator
            rows={10}
            globalFilter={globalFilter}
            header={header}
            emptyMessage="No services found"
          >
            <Column header="Image" body={imageTemplate} style={{ width: '80px' }} />
            <Column field="name" header="Name" sortable />
            <Column field="category.name" header="Category" sortable />
            <Column field="basePrice" header="Price" body={(row) => `${row.basePrice} TND`} sortable />
            <Column field="status" header="Status" body={statusTemplate} sortable />
            <Column
              field="reviewCount"
              header="Reviews"
              body={(row) => (
                <span>
                  <i className="pi pi-star-fill text-yellow-500 mr-1" />
                  {row.avgRating?.toFixed(1) || '0'} ({row.reviewCount || 0})
                </span>
              )}
            />
            <Column body={actionsTemplate} style={{ width: '150px' }} />
          </DataTable>
        )}
      </Card>
    </div>
  );
}
