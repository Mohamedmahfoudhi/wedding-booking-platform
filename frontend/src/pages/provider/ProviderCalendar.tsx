import { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { availabilityApi, servicesApi, bookingsApi } from '../../api/client';
import { Service, Booking } from '../../types';

interface BlockedDate {
  id: string;
  date: Date;
  serviceId?: string;
  serviceName?: string;
  reason?: string;
}

const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ProviderCalendar() {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockDialogVisible, setBlockDialogVisible] = useState(false);
  const [dateRange, setDateRange] = useState<Date[] | null>(null);
  const [blockAllServices, setBlockAllServices] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [selectedService, selectedMonth]);

  const loadServices = async () => {
    try {
      const response = await servicesApi.getMyServices();
      setServices(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load services', error);
    }
  };

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const [blockedRes, bookingsRes] = await Promise.all([
        availabilityApi.getBlockedDates(selectedService || undefined, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
        bookingsApi.getProviderBookings({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          serviceId: selectedService || undefined,
        }),
      ]);

      setBlockedDates(
        (blockedRes.data || []).map((d: any) => ({
          id: d.id,
          date: new Date(d.date),
          serviceId: d.serviceId,
          serviceName: d.service?.name,
          reason: d.reason,
        }))
      );
      setBookings(bookingsRes.data.data || bookingsRes.data);
    } catch (error) {
      console.error('Failed to load calendar data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async () => {
    if (!dateRange || dateRange.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select dates to block',
      });
      return;
    }

    try {
      const dates = [];
      const startDate = dateRange[0];
      const endDate = dateRange[1] || dateRange[0];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
      }

      await availabilityApi.blockDates({
        dates,
        serviceId: blockAllServices ? undefined : selectedService,
      });

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Dates blocked successfully',
      });

      setBlockDialogVisible(false);
      setDateRange(null);
      loadCalendarData();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to block dates',
      });
    }
  };

  const handleUnblockDate = (blockedDate: BlockedDate) => {
    confirmDialog({
      message: 'Are you sure you want to unblock this date?',
      header: 'Unblock Date',
      icon: 'pi pi-calendar',
      accept: async () => {
        try {
          await availabilityApi.unblockDate(blockedDate.id);
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Date unblocked',
          });
          loadCalendarData();
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to unblock date',
          });
        }
      },
    });
  };

  const getDateInfo = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const blocked = blockedDates.find(
      (b) => b.date.toISOString().split('T')[0] === dateStr
    );
    const dayBookings = bookings.filter(
      (b) => new Date(b.eventDate).toISOString().split('T')[0] === dateStr
    );
    return { blocked, bookings: dayBookings };
  };

  const dateTemplate = (date: { day: number; month: number; year: number }) => {
    const d = new Date(date.year, date.month, date.day);
    const { blocked, bookings: dayBookings } = getDateInfo(d);

    return (
      <div
        className={`w-full h-full flex flex-column align-items-center justify-content-center
          ${blocked ? 'bg-red-100' : dayBookings.length > 0 ? 'bg-green-100' : ''}`}
        style={{ minHeight: '40px' }}
      >
        <span>{date.day}</span>
        {dayBookings.length > 0 && (
          <span className="text-xs text-green-700">{dayBookings.length} booking(s)</span>
        )}
        {blocked && <span className="text-xs text-red-700">Blocked</span>}
      </div>
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  if (loading && services.length === 0) {
    return (
      <div>
        <Skeleton width="200px" height="2rem" className="mb-4" />
        <Card>
          <Skeleton height="500px" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-2xl font-bold m-0">Calendar & Availability</h2>
        <Button
          label="Block Dates"
          icon="pi pi-ban"
          onClick={() => setBlockDialogVisible(true)}
        />
      </div>

      <div className="grid">
        <div className="col-12 lg:col-8">
          <Card>
            <div className="mb-4">
              <Dropdown
                value={selectedService}
                onChange={(e) => setSelectedService(e.value)}
                options={[
                  { label: 'All Services', value: null },
                  ...services.map((s) => ({ label: s.name, value: s.id })),
                ]}
                placeholder="Filter by service"
                className="w-full md:w-20rem"
              />
            </div>

            <Calendar
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.value as Date)}
              inline
              className="w-full"
              dateTemplate={dateTemplate}
              onViewDateChange={(e) => setSelectedMonth(e.value as Date)}
            />

            <div className="flex gap-4 mt-4">
              <div className="flex align-items-center gap-2">
                <div className="w-1rem h-1rem border-round bg-green-100" />
                <span className="text-sm">Has Bookings</span>
              </div>
              <div className="flex align-items-center gap-2">
                <div className="w-1rem h-1rem border-round bg-red-100" />
                <span className="text-sm">Blocked</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 lg:col-4">
          {/* Selected Date Info */}
          {selectedDate && (
            <Card className="mb-4">
              <h3 className="mt-0 mb-3">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>

              {(() => {
                const { blocked, bookings: dayBookings } = getDateInfo(selectedDate);
                return (
                  <>
                    {blocked && (
                      <div className="surface-ground p-3 border-round mb-3">
                        <div className="flex justify-content-between align-items-center">
                          <div>
                            <p className="font-medium text-red-600 m-0">
                              <i className="pi pi-ban mr-2" />
                              Blocked
                            </p>
                            {blocked.serviceName && (
                              <p className="text-sm text-color-secondary mt-1 mb-0">
                                Service: {blocked.serviceName}
                              </p>
                            )}
                          </div>
                          <Button
                            icon="pi pi-unlock"
                            className="p-button-rounded p-button-text"
                            onClick={() => handleUnblockDate(blocked)}
                          />
                        </div>
                      </div>
                    )}

                    {dayBookings.length > 0 ? (
                      <div className="flex flex-column gap-2">
                        {dayBookings.map((booking) => (
                          <div key={booking.id} className="surface-ground p-3 border-round">
                            <p className="font-medium m-0 mb-1">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </p>
                            <p className="text-sm text-color-secondary m-0">
                              {booking.service?.name}
                            </p>
                            <p className="text-sm m-0 mt-1">
                              <span
                                className={`inline-block px-2 py-1 border-round text-xs ${
                                  booking.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {booking.status}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : !blocked ? (
                      <p className="text-color-secondary">No bookings for this date</p>
                    ) : null}
                  </>
                );
              })()}
            </Card>
          )}

          {/* Upcoming Bookings */}
          <Card>
            <h3 className="mt-0 mb-3">Upcoming Bookings</h3>
            {bookings
              .filter((b) => b.status === 'confirmed' && new Date(b.eventDate) >= new Date())
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="surface-ground p-3 border-round mb-2">
                  <div className="flex justify-content-between">
                    <p className="font-medium m-0">{booking.service?.name}</p>
                    <span className="text-sm text-color-secondary">
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-color-secondary m-0 mt-1">
                    {booking.client?.firstName} {booking.client?.lastName}
                  </p>
                </div>
              ))}
            {bookings.filter((b) => b.status === 'confirmed' && new Date(b.eventDate) >= new Date())
              .length === 0 && <p className="text-color-secondary">No upcoming bookings</p>}
          </Card>
        </div>
      </div>

      {/* Block Dates Dialog */}
      <Dialog
        header="Block Dates"
        visible={blockDialogVisible}
        onHide={() => setBlockDialogVisible(false)}
        style={{ width: '400px' }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setBlockDialogVisible(false)}
            />
            <Button label="Block Dates" icon="pi pi-ban" onClick={handleBlockDates} />
          </div>
        }
      >
        <div className="flex flex-column gap-4">
          <div>
            <label className="block font-medium mb-2">Select Date Range</label>
            <Calendar
              value={dateRange}
              onChange={(e) => setDateRange(e.value as Date[])}
              selectionMode="range"
              inline
              minDate={new Date()}
              className="w-full"
            />
          </div>

          <div className="flex align-items-center gap-2">
            <Checkbox
              inputId="blockAll"
              checked={blockAllServices}
              onChange={(e) => setBlockAllServices(e.checked || false)}
            />
            <label htmlFor="blockAll">Block for all services</label>
          </div>

          {!blockAllServices && (
            <Dropdown
              value={selectedService}
              onChange={(e) => setSelectedService(e.value)}
              options={services.map((s) => ({ label: s.name, value: s.id }))}
              placeholder="Select a service"
              className="w-full"
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}
