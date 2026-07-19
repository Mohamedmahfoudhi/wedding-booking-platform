import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { adminApi } from '../../api/client';
import { ProviderProfile } from '../../types';

export default function AdminProviders() {
  const toast = useRef<Toast>(null);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows] = useState(10);

  useEffect(() => {
    loadProviders();
  }, [first]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getProviders(
        first / rows + 1,
        rows,
        undefined,
        globalFilter || undefined
      );
      setProviders(response.data.data.providers || []);
      setTotalRecords(response.data.data.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load providers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFirst(0);
    loadProviders();
  };

  const handleVerify = async (provider: ProviderProfile) => {
    try {
      await adminApi.verifyProvider(provider.id, true);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Provider verified successfully',
      });
      loadProviders();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to verify provider',
      });
    }
  };

  const handleSuspend = (provider: ProviderProfile) => {
    confirmDialog({
      message: 'Are you sure you want to unverify this provider?',
      header: 'Unverify Provider',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await adminApi.verifyProvider(provider.id, false);
          toast.current?.show({
            severity: 'success',
            summary: 'Unverified',
            detail: 'Provider unverified successfully',
          });
          loadProviders();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to unverify provider',
          });
        }
      },
    });
  };

  const nameTemplate = (rowData: ProviderProfile) => (
    <div className="flex align-items-center gap-2">
      {rowData.logo ? (
        <img
          src={rowData.logo}
          alt={rowData.businessName}
          className="w-2rem h-2rem border-circle"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white text-sm">
          {rowData.businessName?.charAt(0) || 'P'}
        </div>
      )}
      <div>
        <p className="m-0 font-medium">{rowData.businessName}</p>
        <p className="m-0 text-xs text-color-secondary">{rowData.user?.email}</p>
      </div>
    </div>
  );

  const verifiedTemplate = (rowData: ProviderProfile) => (
    <Tag
      value={rowData.isVerified ? 'Verified' : 'Not Verified'}
      severity={rowData.isVerified ? 'success' : 'warning'}
      icon={rowData.isVerified ? 'pi pi-verified' : 'pi pi-clock'}
    />
  );

  const stripeTemplate = (rowData: ProviderProfile) => (
    <Tag
      value={rowData.stripeAccountId ? 'Connected' : 'Not Connected'}
      severity={rowData.stripeAccountId ? 'success' : 'secondary'}
    />
  );

  const actionsTemplate = (rowData: ProviderProfile) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text"
        onClick={() => {
          setSelectedProvider(rowData);
          setDetailsVisible(true);
        }}
      />
      {!rowData.isVerified && (
        <Button
          icon="pi pi-verified"
          className="p-button-rounded p-button-text p-button-success"
          onClick={() => handleVerify(rowData)}
          tooltip="Verify"
        />
      )}
      {rowData.isVerified && (
        <Button
          icon="pi pi-ban"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => handleSuspend(rowData)}
          tooltip="Unverify"
        />
      )}
    </div>
  );

  const header = (
    <div className="flex flex-column md:flex-row gap-3 justify-content-between">
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search providers..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </span>
        <Button icon="pi pi-search" onClick={handleSearch} />
      </div>
      <span className="text-color-secondary">{totalRecords} providers total</span>
    </div>
  );

  if (loading && providers.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Providers</h2>
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

      <h2 className="text-2xl font-bold mb-4">Providers</h2>

      <Card>
        <DataTable
          value={providers}
          responsiveLayout="scroll"
          paginator
          lazy
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={(e) => setFirst(e.first)}
          loading={loading}
          header={header}
          emptyMessage="No providers found"
        >
          <Column header="Business" body={nameTemplate} />
          <Column field="city" header="Location" />
          <Column field="phone" header="Phone" />
          <Column header="Verified" body={verifiedTemplate} />
          <Column header="Stripe" body={stripeTemplate} />
          <Column
            field="createdAt"
            header="Joined"
            body={(row) => new Date(row.createdAt).toLocaleDateString()}
          />
          <Column body={actionsTemplate} style={{ width: '150px' }} />
        </DataTable>
      </Card>

      {/* Provider Details Dialog */}
      <Dialog
        header="Provider Details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '600px' }}
      >
        {selectedProvider && (
          <div className="flex flex-column gap-4">
            <div className="flex align-items-center gap-4">
              {selectedProvider.logo ? (
                <img
                  src={selectedProvider.logo}
                  alt={selectedProvider.businessName}
                  className="w-5rem h-5rem border-circle"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-5rem h-5rem border-circle bg-primary flex align-items-center justify-content-center">
                  <span className="text-3xl text-white font-bold">
                    {selectedProvider.businessName?.charAt(0) || 'P'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="m-0">{selectedProvider.businessName}</h3>
                <p className="text-color-secondary m-0">{selectedProvider.user?.email}</p>
                <div className="flex gap-2 mt-2">
                  {selectedProvider.isVerified && (
                    <Tag value="Verified" severity="success" icon="pi pi-verified" />
                  )}
                  {selectedProvider.stripeAccountId && (
                    <Tag value="Stripe Connected" severity="success" />
                  )}
                </div>
              </div>
            </div>

            <div className="grid">
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Phone</p>
                <p className="m-0 font-medium">{selectedProvider.phone || '-'}</p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Website</p>
                <p className="m-0 font-medium">
                  {selectedProvider.website ? (
                    <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer">
                      {selectedProvider.website}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">City</p>
                <p className="m-0 font-medium">{selectedProvider.city || '-'}</p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Address</p>
                <p className="m-0 font-medium">{selectedProvider.address || '-'}</p>
              </div>
              <div className="col-12">
                <p className="text-color-secondary text-sm mb-1">Description</p>
                <p className="m-0">{selectedProvider.description || '-'}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-content-end">
              {!selectedProvider.isVerified && (
                <Button
                  label="Verify Provider"
                  icon="pi pi-verified"
                  onClick={() => {
                    handleVerify(selectedProvider);
                    setDetailsVisible(false);
                  }}
                />
              )}
              {selectedProvider.isVerified && (
                <Button
                  label="Unverify"
                  icon="pi pi-ban"
                  className="p-button-danger p-button-outlined"
                  onClick={() => {
                    handleSuspend(selectedProvider);
                    setDetailsVisible(false);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
