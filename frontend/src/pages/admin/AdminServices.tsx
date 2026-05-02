import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { adminApi, categoriesApi } from '../../api/client';
import { Service, Category, ServiceStatus } from '../../types';

export default function AdminServices() {
  const [searchParams] = useSearchParams();
  const toast = useRef<Toast>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [first, setFirst] = useState(0);
  const [rows] = useState(10);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadServices();
  }, [first, statusFilter, categoryFilter]);

  useEffect(() => {
    const serviceId = searchParams.get('id');
    if (serviceId && services.length > 0) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setSelectedService(service);
        setDetailsVisible(true);
      }
    }
  }, [searchParams, services]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getServices({
        page: first / rows + 1,
        limit: rows,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: globalFilter || undefined,
      });
      setServices(response.data.data || response.data);
      setTotalRecords(response.data.total || (response.data.data || response.data).length);
    } catch (error) {
      console.error('Failed to load services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFirst(0);
    loadServices();
  };

  const handleApprove = async (service: Service) => {
    setProcessing(true);
    try {
      await adminApi.approveService(service.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Approved',
        detail: 'Service approved successfully',
      });
      loadServices();
      setDetailsVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve service',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedService) return;

    setProcessing(true);
    try {
      await adminApi.rejectService(selectedService.id, rejectReason);
      toast.current?.show({
        severity: 'info',
        summary: 'Rejected',
        detail: 'Service rejected',
      });
      loadServices();
      setRejectDialogVisible(false);
      setDetailsVisible(false);
      setRejectReason('');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject service',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleFeatured = async (service: Service) => {
    try {
      await adminApi.toggleFeatured(service.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Updated',
        detail: service.featured ? 'Service unfeatured' : 'Service featured',
      });
      loadServices();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update service',
      });
    }
  };

  const handleDelete = (service: Service) => {
    confirmDialog({
      message: 'Are you sure you want to delete this service?',
      header: 'Delete Service',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await adminApi.deleteService(service.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Service deleted successfully',
          });
          loadServices();
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

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'inactive':
        return 'secondary';
      default:
        return 'info';
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

  const actionsTemplate = (rowData: Service) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text"
        onClick={() => {
          setSelectedService(rowData);
          setDetailsVisible(true);
        }}
      />
      <Button
        icon={rowData.featured ? 'pi pi-star-fill' : 'pi pi-star'}
        className={`p-button-rounded p-button-text ${rowData.featured ? 'text-yellow-500' : ''}`}
        onClick={() => handleToggleFeatured(rowData)}
        tooltip={rowData.featured ? 'Unfeature' : 'Feature'}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const header = (
    <div className="flex flex-column md:flex-row gap-3 justify-content-between">
      <div className="flex gap-2 flex-wrap">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search services..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Dropdown
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.value)}
          options={statusOptions}
          placeholder="Status"
        />
        <Dropdown
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.value)}
          options={[{ label: 'All Categories', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.slug }))]}
          placeholder="Category"
        />
        <Button icon="pi pi-search" onClick={handleSearch} />
      </div>
      <span className="text-color-secondary">{totalRecords} services total</span>
    </div>
  );

  if (loading && services.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Services</h2>
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

      <h2 className="text-2xl font-bold mb-4">Services</h2>

      <Card>
        <DataTable
          value={services}
          responsiveLayout="scroll"
          paginator
          lazy
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={(e) => setFirst(e.first)}
          loading={loading}
          header={header}
          emptyMessage="No services found"
        >
          <Column header="Image" body={imageTemplate} style={{ width: '80px' }} />
          <Column field="name" header="Name" sortable />
          <Column field="provider.businessName" header="Provider" />
          <Column field="category.name" header="Category" />
          <Column field="basePrice" header="Price" body={(row) => `${row.basePrice} TND`} sortable />
          <Column
            field="status"
            header="Status"
            body={(row) => <Tag value={row.status} severity={getStatusSeverity(row.status)} />}
          />
          <Column
            field="featured"
            header="Featured"
            body={(row) =>
              row.featured ? <i className="pi pi-star-fill text-yellow-500" /> : <i className="pi pi-star text-color-secondary" />
            }
          />
          <Column body={actionsTemplate} style={{ width: '150px' }} />
        </DataTable>
      </Card>

      {/* Service Details Dialog */}
      <Dialog
        header="Service Details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '700px' }}
        footer={
          selectedService?.status === ServiceStatus.PENDING && (
            <div className="flex justify-content-end gap-2">
              <Button
                label="Reject"
                icon="pi pi-times"
                className="p-button-danger p-button-outlined"
                onClick={() => setRejectDialogVisible(true)}
              />
              <Button
                label="Approve"
                icon="pi pi-check"
                onClick={() => handleApprove(selectedService)}
                loading={processing}
              />
            </div>
          )
        }
      >
        {selectedService && (
          <TabView>
            <TabPanel header="Details">
              <div className="flex flex-column gap-4">
                {selectedService.images && selectedService.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedService.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={`Service ${i + 1}`}
                        className="border-round"
                        style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                )}

                <div className="grid">
                  <div className="col-12">
                    <h3 className="m-0">{selectedService.name}</h3>
                    <p className="text-color-secondary">{selectedService.description}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-color-secondary text-sm mb-1">Category</p>
                    <p className="m-0 font-medium">{selectedService.category?.name}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-color-secondary text-sm mb-1">Location</p>
                    <p className="m-0 font-medium">{selectedService.location}</p>
                  </div>
                  <div className="col-6">
                    <p className="text-color-secondary text-sm mb-1">Base Price</p>
                    <p className="m-0 font-bold text-primary">{selectedService.basePrice} TND</p>
                  </div>
                  <div className="col-6">
                    <p className="text-color-secondary text-sm mb-1">Status</p>
                    <Tag value={selectedService.status} severity={getStatusSeverity(selectedService.status)} />
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel header="Provider">
              <div className="flex align-items-center gap-3">
                {selectedService.provider?.logo ? (
                  <img
                    src={selectedService.provider.logo}
                    alt={selectedService.provider.businessName}
                    className="w-4rem h-4rem border-circle"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-4rem h-4rem border-circle bg-primary flex align-items-center justify-content-center">
                    <span className="text-2xl text-white font-bold">
                      {selectedService.provider?.businessName?.charAt(0) || 'P'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium m-0">{selectedService.provider?.businessName}</p>
                  <p className="text-color-secondary m-0">{selectedService.provider?.city}</p>
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject Service"
        visible={rejectDialogVisible}
        onHide={() => setRejectDialogVisible(false)}
        style={{ width: '400px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setRejectDialogVisible(false)}
            />
            <Button
              label="Reject"
              icon="pi pi-times"
              className="p-button-danger"
              onClick={handleReject}
              loading={processing}
            />
          </div>
        }
      >
        <p className="text-color-secondary mb-3">Provide a reason for rejection:</p>
        <InputTextarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          className="w-full"
          placeholder="Reason for rejection..."
        />
      </Dialog>
    </div>
  );
}
