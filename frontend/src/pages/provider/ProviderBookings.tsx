import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { providerBookingsApi } from '../../api/client';
import { Booking, BookingStatus } from '../../types';

type Severity = 'success' | 'info' | 'warning' | 'danger' | null;

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
    } catch {
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
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reject booking',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = (booking: Booking) => {
    confirmDialog({
      message: 'Mark this booking as completed?',
      header: 'Complete booking',
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
        } catch {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to complete booking',
          });
        }
      },
    });
  };

  const getStatusSeverity = (status: string): Severity => {
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

  const filterBookings = (status: string | null) =>
    status === null ? bookings : bookings.filter((b) => b.status === status);

  const counts = {
    all: bookings.length,
    pending: filterBookings(BookingStatus.PENDING).length,
    confirmed: filterBookings(BookingStatus.CONFIRMED).length,
    completed: filterBookings(BookingStatus.COMPLETED).length,
  };

  const clientTemplate = (rowData: Booking) => (
    <div className="booking-service-cell">
      <div className="conversation-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
        {rowData.client?.firstName?.charAt(0) || 'U'}
      </div>
      <div className="booking-service-info">
        <span className="booking-service-name" style={{ cursor: 'default' }}>
          {rowData.client?.firstName} {rowData.client?.lastName}
        </span>
        <span className="booking-service-meta">{rowData.client?.email}</span>
      </div>
    </div>
  );

  const actionsTemplate = (rowData: Booking) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-text"
        tooltip="View details"
        tooltipOptions={{ position: 'top' }}
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
            tooltip="Confirm"
            tooltipOptions={{ position: 'top' }}
            onClick={() => handleConfirm(rowData)}
          />
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-text p-button-danger"
            tooltip="Reject"
            tooltipOptions={{ position: 'top' }}
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
          tooltip="Mark as completed"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleComplete(rowData)}
        />
      )}
    </div>
  );

  const BookingsTable = ({ data }: { data: Booking[] }) => {
    if (data.length === 0) {
      return (
        <div className="dashboard-empty">
          <div className="dashboard-empty-icon">
            <i className="pi pi-calendar" />
          </div>
          <p>No bookings in this view.</p>
        </div>
      );
    }
    return (
      <DataTable value={data} responsiveLayout="scroll" paginator rows={10}>
        <Column header="Client" body={clientTemplate} />
        <Column field="service.name" header="Service" />
        <Column
          field="eventDate"
          header="Event Date"
          body={(row) => new Date(row.eventDate).toLocaleDateString()}
          sortable
        />
        <Column
          field="total"
          header="Total"
          body={(row) => (
            <span className="font-semibold">
              {Number(row.total ?? 0).toLocaleString()} TND
            </span>
          )}
          sortable
        />
        <Column
          field="status"
          header="Status"
          body={(row) => (
            <Tag value={row.status} severity={getStatusSeverity(row.status) ?? undefined} />
          )}
        />
        <Column body={actionsTemplate} style={{ width: '150px' }} />
      </DataTable>
    );
  };

  if (loading) {
    return (
      <div>
        <Skeleton width="180px" height="1.75rem" className="mb-4" />
        <Skeleton height="420px" style={{ borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <h2 className="text-2xl font-bold mb-4">Bookings</h2>

      <div className="dashboard-panel">
        <TabView>
          <TabPanel header={`All (${counts.all})`}>
            <BookingsTable data={filterBookings(null)} />
          </TabPanel>
          <TabPanel header={`Pending (${counts.pending})`}>
            <BookingsTable data={filterBookings(BookingStatus.PENDING)} />
          </TabPanel>
          <TabPanel header={`Confirmed (${counts.confirmed})`}>
            <BookingsTable data={filterBookings(BookingStatus.CONFIRMED)} />
          </TabPanel>
          <TabPanel header={`Completed (${counts.completed})`}>
            <BookingsTable data={filterBookings(BookingStatus.COMPLETED)} />
          </TabPanel>
        </TabView>
      </div>

      {/* Booking Details Dialog */}
      <Dialog
        header="Booking details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '600px' }}
        className="booking-dialog"
        footer={
          selectedBooking?.status === BookingStatus.PENDING && (
            <div className="flex justify-content-end gap-2">
              <Button
                label="Reject"
                icon="pi pi-times"
                className="p-button-danger p-button-outlined"
                onClick={() => setRejectDialogVisible(true)}
              />
              <Button
                label="Confirm booking"
                icon="pi pi-check"
                onClick={() => handleConfirm(selectedBooking)}
                loading={processing}
              />
            </div>
          )
        }
      >
        {selectedBooking && (
          <ProviderBookingDetails
            booking={selectedBooking}
            statusSeverity={getStatusSeverity(selectedBooking.status)}
          />
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject booking"
        visible={rejectDialogVisible}
        onHide={() => setRejectDialogVisible(false)}
        style={{ width: '420px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setRejectDialogVisible(false)}
            />
            <Button
              label="Reject booking"
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

function ProviderBookingDetails({
  booking,
  statusSeverity,
}: {
  booking: Booking;
  statusSeverity: Severity;
}) {
  const total = Number(booking.total ?? 0);
  const subtotal = Number(booking.subtotal ?? 0);
  const discount = Number(booking.discount ?? 0);
  const deposit = Number(booking.depositAmount ?? 0);

  return (
    <div>
      <div className="booking-dialog-hero">
        <div className="conversation-avatar" style={{ width: 72, height: 72, fontSize: '1.75rem' }}>
          {booking.client?.firstName?.charAt(0) || 'U'}
        </div>
        <div className="booking-dialog-hero-info">
          {booking.bookingNumber && (
            <span className="booking-dialog-hero-number">#{booking.bookingNumber}</span>
          )}
          <h3 className="booking-dialog-hero-title">
            {booking.client?.firstName} {booking.client?.lastName}
          </h3>
          <p className="booking-dialog-hero-sub">{booking.service?.name}</p>
        </div>
        <div className="booking-dialog-status">
          <Tag value={booking.status} severity={statusSeverity ?? undefined} />
        </div>
      </div>

      <div className="booking-dialog-body">
        <div className="booking-dialog-section">
          <p className="booking-dialog-section-title">
            <i className="pi pi-user" /> Client
          </p>
          <div className="booking-dialog-info-grid">
            <div className="booking-dialog-info">
              <div className="booking-dialog-info-icon"><i className="pi pi-envelope" /></div>
              <div>
                <span className="booking-dialog-info-label">Email</span>
                <p className="booking-dialog-info-value" style={{ wordBreak: 'break-all', fontSize: '0.8125rem' }}>
                  {booking.client?.email || '—'}
                </p>
              </div>
            </div>
            <div className="booking-dialog-info">
              <div className="booking-dialog-info-icon"><i className="pi pi-phone" /></div>
              <div>
                <span className="booking-dialog-info-label">Phone</span>
                <p className="booking-dialog-info-value">{booking.client?.phone || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-dialog-section">
          <p className="booking-dialog-section-title">
            <i className="pi pi-calendar" /> Event
          </p>
          <div className="booking-dialog-info-grid">
            <div className="booking-dialog-info">
              <div className="booking-dialog-info-icon"><i className="pi pi-calendar" /></div>
              <div>
                <span className="booking-dialog-info-label">Event date</span>
                <p className="booking-dialog-info-value">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {typeof booking.guestCount === 'number' && (
              <div className="booking-dialog-info">
                <div className="booking-dialog-info-icon"><i className="pi pi-users" /></div>
                <div>
                  <span className="booking-dialog-info-label">Guests</span>
                  <p className="booking-dialog-info-value">{booking.guestCount}</p>
                </div>
              </div>
            )}
            <div className="booking-dialog-info">
              <div className="booking-dialog-info-icon"><i className="pi pi-tag" /></div>
              <div>
                <span className="booking-dialog-info-label">Source</span>
                <p className="booking-dialog-info-value">{booking.source || 'Marketplace'}</p>
              </div>
            </div>
            <div className="booking-dialog-info">
              <div className="booking-dialog-info-icon"><i className="pi pi-clock" /></div>
              <div>
                <span className="booking-dialog-info-label">Received</span>
                <p className="booking-dialog-info-value">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {booking.package && (
          <div className="booking-dialog-section">
            <p className="booking-dialog-section-title">
              <i className="pi pi-box" /> Package
            </p>
            <div className="booking-dialog-info">
              <div className="booking-dialog-info-icon"><i className="pi pi-star" /></div>
              <div style={{ flex: 1 }}>
                <span className="booking-dialog-info-label">Selected add-on</span>
                <p className="booking-dialog-info-value">
                  {booking.package.name}
                  {typeof booking.package.price !== 'undefined' && (
                    <span className="text-color-secondary font-normal text-sm ml-2">
                      +{Number(booking.package.price).toLocaleString()} TND
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="booking-dialog-section">
          <p className="booking-dialog-section-title">
            <i className="pi pi-wallet" /> Payment summary
          </p>
          <div className="booking-dialog-price">
            <div className="booking-dialog-price-row">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} TND</span>
            </div>
            {discount > 0 && (
              <div className="booking-dialog-price-row booking-dialog-price-row--discount">
                <span>Discount</span>
                <span>− {discount.toLocaleString()} TND</span>
              </div>
            )}
            {deposit > 0 && !booking.fullyPaid && (
              <div className="booking-dialog-price-row">
                <span>Deposit {booking.depositPaid ? '(paid)' : '(due)'}</span>
                <span>{deposit.toLocaleString()} TND</span>
              </div>
            )}
            <div className="booking-dialog-price-row booking-dialog-price-row--total">
              <span>Total</span>
              <span>{total.toLocaleString()} TND</span>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="booking-dialog-alert">
            <span className="booking-dialog-alert-label">Client notes</span>
            <p className="booking-dialog-alert-text">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
