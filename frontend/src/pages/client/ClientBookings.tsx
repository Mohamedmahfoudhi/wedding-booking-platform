import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
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
    <div className="flex align-items-center gap-2">
      <div
        className="w-2rem h-2rem border-round"
        style={{
          backgroundImage: `url(${rowData.service?.images?.[0]?.url || '/placeholder-service.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Link to={`/services/${rowData.service?.id}`} className="text-primary no-underline">
        {rowData.service?.name}
      </Link>
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
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-text p-button-danger"
          onClick={() => handleCancelBooking(rowData)}
        />
      )}
    </div>
  );

  const filterBookings = (status: string | null) => {
    if (!status) return bookings;
    return bookings.filter((b) => b.status === status);
  };

  if (loading) {
    return (
      <div className="surface-ground min-h-screen p-4">
        <div className="container">
          <Skeleton width="200px" height="2rem" className="mb-4" />
          <Card>
            <Skeleton height="300px" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-ground min-h-screen">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="container py-4">
        <h1 className="text-3xl font-bold mb-4">My Bookings</h1>

        <Card>
          <TabView>
            <TabPanel header="All Bookings">
              <BookingTable
                bookings={filterBookings(null)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
            <TabPanel header="Upcoming">
              <BookingTable
                bookings={filterBookings(BookingStatus.CONFIRMED)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
            <TabPanel header="Pending">
              <BookingTable
                bookings={filterBookings(BookingStatus.PENDING)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
            <TabPanel header="Completed">
              <BookingTable
                bookings={filterBookings(BookingStatus.COMPLETED)}
                serviceTemplate={serviceTemplate}
                dateTemplate={dateTemplate}
                statusTemplate={statusTemplate}
                actionsTemplate={actionsTemplate}
              />
            </TabPanel>
          </TabView>
        </Card>
      </div>

      {/* Booking Details Dialog */}
      <Dialog
        header="Booking Details"
        visible={detailsVisible}
        onHide={() => setDetailsVisible(false)}
        style={{ width: '500px' }}
      >
        {selectedBooking && (
          <div className="flex flex-column gap-4">
            <div className="surface-ground p-4 border-round">
              <div className="flex align-items-center gap-3 mb-3">
                <div
                  className="w-4rem h-4rem border-round"
                  style={{
                    backgroundImage: `url(${selectedBooking.service?.images?.[0]?.url || '/placeholder-service.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div>
                  <h3 className="m-0 mb-1">{selectedBooking.service?.name}</h3>
                  <p className="text-color-secondary m-0">
                    by {selectedBooking.service?.provider?.businessName}
                  </p>
                </div>
              </div>

              <div className="grid">
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
                  <p className="text-color-secondary text-sm mb-1">Booking ID</p>
                  <p className="font-medium m-0">{selectedBooking.id.substring(0, 8)}</p>
                </div>
                <div className="col-6">
                  <p className="text-color-secondary text-sm mb-1">Total Price</p>
                  <p className="font-medium text-primary m-0">
                    {selectedBooking.total} TND
                  </p>
                </div>
              </div>
            </div>

            {selectedBooking.notes && (
              <div>
                <p className="text-color-secondary text-sm mb-1">Notes</p>
                <p className="m-0">{selectedBooking.notes}</p>
              </div>
            )}

            <div className="flex gap-2 justify-content-end">
              <Link to={`/services/${selectedBooking.service?.id}`}>
                <Button label="View Service" icon="pi pi-external-link" className="p-button-outlined" />
              </Link>
              <Link to={`/account/messages?booking=${selectedBooking.id}`}>
                <Button label="Contact Provider" icon="pi pi-comments" />
              </Link>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

interface BookingTableProps {
  bookings: Booking[];
  serviceTemplate: (rowData: Booking) => JSX.Element;
  dateTemplate: (rowData: Booking) => JSX.Element;
  statusTemplate: (rowData: Booking) => JSX.Element;
  actionsTemplate: (rowData: Booking) => JSX.Element;
}

function BookingTable({ bookings, serviceTemplate, dateTemplate, statusTemplate, actionsTemplate }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-6">
        <i className="pi pi-calendar text-4xl text-color-secondary mb-3" />
        <p className="text-color-secondary">No bookings found</p>
        <Link to="/search">
          <Button label="Browse Services" icon="pi pi-search" />
        </Link>
      </div>
    );
  }

  return (
    <DataTable value={bookings} responsiveLayout="scroll" paginator rows={10}>
      <Column header="Service" body={serviceTemplate} />
      <Column field="eventDate" header="Event Date" body={dateTemplate} sortable />
      <Column field="status" header="Status" body={statusTemplate} />
      <Column field="total" header="Total" body={(row) => `${row.total} TND`} sortable />
      <Column body={actionsTemplate} style={{ width: '120px' }} />
    </DataTable>
  );
}
