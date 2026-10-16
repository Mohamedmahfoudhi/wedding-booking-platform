import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { bookingsApi } from '../../api/client';
import { Booking, BookingStatus } from '../../types';

export default function ClientBookings() {
  const toast = useRef<Toast>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingsApi.getMyBookings();
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

  const handleCancelBooking = (booking: Booking) => {
    confirmDialog({
      message: 'Are you sure you want to cancel this booking?',
      header: 'Cancel Booking',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await bookingsApi.cancel(booking.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Booking Cancelled',
            detail: 'Your booking has been cancelled',
          });
          loadBookings();
        } catch (error: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to cancel booking',
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
    <div className="booking-service-cell">
      <div
        className="booking-service-thumb"
        style={{
          backgroundImage: rowData.service?.images?.[0]?.url
            ? `url(${rowData.service.images[0].url})`
            : undefined,
        }}
      />
      <div className="booking-service-info">
        <Link to={`/services/${rowData.service?.id}`} className="booking-service-name">
          {rowData.service?.name}
        </Link>
        {rowData.service?.provider?.businessName && (
          <span className="booking-service-meta">
            by {rowData.service.provider.businessName}
          </span>
        )}
      </div>
    </div>
  );

  const totalTemplate = (rowData: Booking) => (
    <span className="font-semibold">{Number(rowData.total ?? 0).toLocaleString()} TND</span>
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
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-text p-button-danger"
          tooltip="Cancel booking"
          tooltipOptions={{ position: 'top' }}
          onClick={() => handleCancelBooking(rowData)}
        />
      )}
    </div>
  );

  const filterBookings = (status: string | null) =>
    status === null ? bookings : bookings.filter((b) => b.status === status);

  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
    pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
    completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
  };

  if (loading) {
    return (
      <div className="surface-ground min-h-screen">
        <div className="dashboard-hero dashboard-hero--compact">
          <div className="container">
            <Skeleton width="140px" height="1rem" className="mb-2" />
            <Skeleton width="220px" height="1.875rem" />
          </div>
        </div>
        <div className="container py-4 dashboard-content">
          <div className="dashboard-panel">
            <Skeleton height="320px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ground min-h-screen">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="dashboard-hero dashboard-hero--compact">
        <div className="container">
          <p className="dashboard-hero-greeting">Account</p>
          <h1 className="dashboard-hero-title">My Bookings</h1>
          <div className="dashboard-hero-row">
            <span className="dashboard-hero-chip">
              <i className="pi pi-calendar" />
              {counts.all} total
            </span>
            <span className="dashboard-hero-chip">
              <i className="pi pi-check-circle" />
              {counts.confirmed} upcoming
            </span>
            <span className="dashboard-hero-chip">
              <i className="pi pi-clock" />
              {counts.pending} pending
            </span>
          </div>
        </div>
      </div>

      <div className="container py-4 dashboard-content">
        <div className="dashboard-panel">
          <TabView>
            <TabPanel header={`All (${counts.all})`}>
              <BookingTable
                bookings={filterBookings(null)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                totalTemplate={totalTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
            <TabPanel header={`Upcoming (${counts.confirmed})`}>
              <BookingTable
                bookings={filterBookings(BookingStatus.CONFIRMED)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                totalTemplate={totalTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
            <TabPanel header={`Pending (${counts.pending})`}>
              <BookingTable
                bookings={filterBookings(BookingStatus.PENDING)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                totalTemplate={totalTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
            <TabPanel header={`Completed (${counts.completed})`}>
              <BookingTable
                bookings={filterBookings(BookingStatus.COMPLETED)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                totalTemplate={totalTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
          </TabView>
        </div>
      </div>

      <Dialog
        header="Booking details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '560px' }}
        className="booking-dialog"
      >
        {selectedBooking && (
          <BookingDetailsBody
            booking={selectedBooking}
            statusSeverity={getStatusSeverity(selectedBooking.status)}
          />
        )}
      </Dialog>
    </div>
  );
}

type Severity = 'success' | 'info' | 'warning' | 'danger' | null;

function BookingDetailsBody({ booking, statusSeverity }: { booking: Booking; statusSeverity: Severity }) {
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const formatTime = (t?: string) => {
    if (!t) return null;
    const [h, m] = t.split(':');
    return `${h.padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}`;
  };

  const timeRange =
    booking.startTime && booking.endTime
      ? `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`
      : booking.startTime
        ? formatTime(booking.startTime)
        : null;

  const subtotal = Number(booking.subtotal ?? 0);
  const discount = Number(booking.discount ?? 0);
  const total = Number(booking.total ?? 0);
  const deposit = Number(booking.depositAmount ?? 0);

  let paymentClass = 'booking-dialog-payment--unpaid';
  let paymentIcon = 'pi pi-clock';
  let paymentLabel = 'Awaiting payment';
  if (booking.status === 'cancelled') {
    paymentClass = 'booking-dialog-payment--cancelled';
    paymentIcon = 'pi pi-ban';
    paymentLabel = 'Booking cancelled';
  } else if (booking.fullyPaid) {
    paymentClass = 'booking-dialog-payment--paid';
    paymentIcon = 'pi pi-check-circle';
    paymentLabel = 'Paid in full';
  } else if (booking.depositPaid) {
    paymentClass = 'booking-dialog-payment--deposit';
    paymentIcon = 'pi pi-wallet';
    paymentLabel = `Deposit paid${deposit ? ` · ${deposit.toLocaleString()} TND` : ''}`;
  }

  return (
    <div>
      <div className="booking-dialog-hero">
        <div
          className="booking-dialog-hero-thumb"
          style={{
            backgroundImage: booking.service?.images?.[0]?.url
              ? `url(${booking.service.images[0].url})`
              : undefined,
          }}
        />
        <div className="booking-dialog-hero-info">
          {booking.bookingNumber && (
            <span className="booking-dialog-hero-number">#{booking.bookingNumber}</span>
          )}
          <h3 className="booking-dialog-hero-title">{booking.service?.name}</h3>
          <p className="booking-dialog-hero-sub">
            by {booking.service?.provider?.businessName ?? booking.provider?.businessName ?? 'Provider'}
          </p>
        </div>
        <div className="booking-dialog-status">
          <Tag value={booking.status} severity={statusSeverity ?? undefined} />
        </div>
      </div>

      <div className="booking-dialog-body">
        <div className={`booking-dialog-payment ${paymentClass}`}>
          <i className={paymentIcon} />
          <span>{paymentLabel}</span>
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
                <p className="booking-dialog-info-value">{formatDate(booking.eventDate)}</p>
              </div>
            </div>
            {timeRange && (
              <div className="booking-dialog-info">
                <div className="booking-dialog-info-icon"><i className="pi pi-clock" /></div>
                <div>
                  <span className="booking-dialog-info-label">Time</span>
                  <p className="booking-dialog-info-value">{timeRange}</p>
                </div>
              </div>
            )}
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
                <span className="booking-dialog-info-label">Booked on</span>
                <p className="booking-dialog-info-value">{formatDate(booking.createdAt)}</p>
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
            <span className="booking-dialog-alert-label">Your notes</span>
            <p className="booking-dialog-alert-text">{booking.notes}</p>
          </div>
        )}

        {booking.status === 'cancelled' && booking.cancellationReason && (
          <div className="booking-dialog-alert booking-dialog-alert--danger">
            <span className="booking-dialog-alert-label">Cancellation reason</span>
            <p className="booking-dialog-alert-text">{booking.cancellationReason}</p>
          </div>
        )}

        <div className="booking-dialog-actions">
          <Link to={`/services/${booking.service?.id}`}>
            <Button label="View service" icon="pi pi-external-link" className="p-button-outlined" />
          </Link>
          <Link to={`/account/messages?booking=${booking.id}`}>
            <Button label="Contact provider" icon="pi pi-comments" />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface BookingTableProps {
  bookings: Booking[];
  serviceTemplate: (rowData: Booking) => JSX.Element;
  dateTemplate: (rowData: Booking) => JSX.Element;
  statusTemplate: (rowData: Booking) => JSX.Element;
  totalTemplate: (rowData: Booking) => JSX.Element;
  actionsTemplate: (rowData: Booking) => JSX.Element;
}

function BookingTable({
  bookings,
  serviceTemplate,
  dateTemplate,
  statusTemplate,
  totalTemplate,
  actionsTemplate,
}: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="dashboard-empty">
        <div className="dashboard-empty-icon">
          <i className="pi pi-calendar" />
        </div>
        <p>No bookings found in this view.</p>
        <Link to="/search">
          <Button label="Browse services" icon="pi pi-search" />
        </Link>
      </div>
    );
  }

  return (
    <DataTable value={bookings} responsiveLayout="scroll" paginator rows={10}>
      <Column header="Service" body={serviceTemplate} />
      <Column field="eventDate" header="Event Date" body={dateTemplate} sortable />
      <Column field="status" header="Status" body={statusTemplate} />
      <Column field="total" header="Total" body={totalTemplate} sortable />
      <Column body={actionsTemplate} style={{ width: '120px' }} />
    </DataTable>
  );
}
