import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { providerBookingsApi } from '../../api/client';
import { Booking, BookingStatus } from '../../types';

export default function ProviderBookings() {
  const [searchParams] = useSearchParams();
  const toast = useRef<Toast>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialogVisible, setRejectDialogVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (bookingId && bookings.length > 0) {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setDetailsVisible(true);
      }
    }
  }, [searchParams, bookings]);

  const loadBookings = async () => {
    try {
      const response = await providerBookingsApi.getAll();
      setBookings(response.data.data?.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load bookings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (booking: Booking) => {
    setProcessing(true);
    try {
      await providerBookingsApi.confirm(booking.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Confirmed',
        detail: 'Booking confirmed successfully',
      });
      loadBookings();
      setDetailsVisible(false);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to confirm booking',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;

    setProcessing(true);
    try {
      await providerBookingsApi.reject(selectedBooking.id, rejectReason);
      toast.current?.show({
        severity: 'info',
        summary: 'Rejected',
        detail: 'Booking rejected',
      });
      loadBookings();
      setRejectDialogVisible(false);
      setDetailsVisible(false);
      setRejectReason('');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject booking',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async (booking: Booking) => {
    confirmDialog({
      message: 'Mark this booking as completed?',
      header: 'Complete Booking',
      icon: 'pi pi-check-circle',
      accept: async () => {
        try {
          await providerBookingsApi.complete(booking.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Completed',
            detail: 'Booking marked as completed',
          });
          loadBookings();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to complete booking',
          });
        }
      },
    });
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
      case 'rejected':
        return 'danger';
      default:
        return null;
    }
  };

  const filterBookings = (status: string | null) => {
    if (!status) return bookings;
    return bookings.filter((b) => b.status === status);
  };

  const clientTemplate = (rowData: Booking) => (
    <div className="flex align-items-center gap-2">
      <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white text-sm">
        {rowData.client?.firstName?.charAt(0) || 'U'}
      </div>
      <div>
        <p className="m-0 font-medium">
          {rowData.client?.firstName} {rowData.client?.lastName}
        </p>
        <p className="m-0 text-xs text-color-secondary">{rowData.client?.email}</p>
      </div>
    </div>
  );

  const actionsTemplate = (rowData: Booking) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text"
        onClick={() => {
          setSelectedBooking(rowData);
          setDetailsVisible(true);
        }}
      />
      {rowData.status === BookingStatus.PENDING && (
        <>
          <Button
            icon="pi pi-check"
            className="p-button-rounded p-button-text p-button-success"
            onClick={() => handleConfirm(rowData)}
          />
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-text p-button-danger"
            onClick={() => {
              setSelectedBooking(rowData);
              setRejectDialogVisible(true);
            }}
          />
        </>
      )}
      {rowData.status === BookingStatus.CONFIRMED && (
        <Button
          icon="pi pi-check-circle"
          className="p-button-rounded p-button-text"
          onClick={() => handleComplete(rowData)}
          tooltip="Mark as completed"
        />
      )}
    </div>
  );

  const BookingsTable = ({ data }: { data: Booking[] }) => (
    <DataTable value={data} responsiveLayout="scroll" paginator rows={10} emptyMessage="No bookings found">
      <Column header="Client" body={clientTemplate} />
      <Column field="service.name" header="Service" />
      <Column
        field="eventDate"
        header="Event Date"
        body={(row) => new Date(row.eventDate).toLocaleDateString()}
        sortable
      />
      <Column field="total" header="Total" body={(row) => `${row.total} TND`} sortable />
      <Column
        field="status"
        header="Status"
        body={(row) => <Tag value={row.status} severity={getStatusSeverity(row.status)} />}
      />
      <Column body={actionsTemplate} style={{ width: '150px' }} />
    </DataTable>
  );

  if (loading) {
    return (
      <div>
        <Skeleton width="200px" height="2rem" className="mb-4" />
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

      <h2 className="text-2xl font-bold mb-4">Bookings</h2>

      <Card>
        <TabView>
          <TabPanel header={`All (${bookings.length})`}>
            <BookingsTable data={filterBookings(null)} />
          </TabPanel>
          <TabPanel header={`Pending (${filterBookings(BookingStatus.PENDING).length})`}>
            <BookingsTable data={filterBookings(BookingStatus.PENDING)} />
          </TabPanel>
          <TabPanel header={`Confirmed (${filterBookings(BookingStatus.CONFIRMED).length})`}>
            <BookingsTable data={filterBookings(BookingStatus.CONFIRMED)} />
          </TabPanel>
          <TabPanel header={`Completed (${filterBookings(BookingStatus.COMPLETED).length})`}>
            <BookingsTable data={filterBookings(BookingStatus.COMPLETED)} />
          </TabPanel>
        </TabView>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog
        header="Booking Details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '600px' }}
        footer={
          selectedBooking?.status === BookingStatus.PENDING && (
            <div className="flex justify-content-end gap-2">
              <Button
                label="Reject"
                icon="pi pi-times"
                className="p-button-danger p-button-outlined"
                onClick={() => {
                  setRejectDialogVisible(true);
                }}
              />
              <Button
                label="Confirm Booking"
                icon="pi pi-check"
                onClick={() => handleConfirm(selectedBooking)}
                loading={processing}
              />
            </div>
          )
        }
      >
        {selectedBooking && (
          <div className="flex flex-column gap-4">
            <div className="grid">
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Client</p>
                <p className="font-medium m-0">
                  {selectedBooking.client?.firstName} {selectedBooking.client?.lastName}
                </p>
                <p className="text-sm text-color-secondary m-0">{selectedBooking.client?.email}</p>
                <p className="text-sm text-color-secondary m-0">{selectedBooking.client?.phone}</p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Service</p>
                <p className="font-medium m-0">{selectedBooking.service?.name}</p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Event Date</p>
                <p className="font-medium m-0">
                  {new Date(selectedBooking.eventDate).toLocaleDateString()}
                </p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Status</p>
                <Tag
                  value={selectedBooking.status}
                  severity={getStatusSeverity(selectedBooking.status)}
                />
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Total Price</p>
                <p className="font-bold text-primary m-0">{selectedBooking.total} TND</p>
              </div>
              <div className="col-6">
                <p className="text-color-secondary text-sm mb-1">Booking Source</p>
                <p className="m-0">{selectedBooking.source || 'Marketplace'}</p>
              </div>
            </div>

            {selectedBooking.notes && (
              <div>
                <p className="text-color-secondary text-sm mb-1">Client Notes</p>
                <p className="m-0 surface-ground p-3 border-round">
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            {selectedBooking.packages && selectedBooking.packages.length > 0 && (
              <div>
                <p className="text-color-secondary text-sm mb-2">Selected Packages</p>
                <div className="flex flex-column gap-2">
                  {selectedBooking.packages.map((pkg) => (
                    <div key={pkg.id} className="flex justify-content-between surface-ground p-3 border-round">
                      <span>{pkg.name}</span>
                      <span className="font-medium">{pkg.price} TND</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject Booking"
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
              label="Reject Booking"
              icon="pi pi-times"
              className="p-button-danger"
              onClick={handleReject}
              loading={processing}
            />
          </div>
        }
      >
        <p className="text-color-secondary mb-3">
          Please provide a reason for rejecting this booking (optional):
        </p>
        <InputTextarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          className="w-full"
          placeholder="e.g., Date not available, service fully booked..."
        />
      </Dialog>
    </div>
  );
}
