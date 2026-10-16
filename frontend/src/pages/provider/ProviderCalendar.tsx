import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { availabilityApi, providerServicesApi, providerBookingsApi } from '../../api/client';
import { Service, Booking } from '../../types';

interface BlockedDate {
  id: string;
  date: Date;
  serviceId?: string;
  serviceName?: string;
  reason?: string;
}

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
  const [blockReason, setBlockReason] = useState('');
  const [dialogServiceId, setDialogServiceId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [unblockTarget, setUnblockTarget] = useState<BlockedDate | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [selectedMonth, services]);

  const loadServices = async () => {
    try {
      const response = await providerServicesApi.getAll();
      setServices(response.data.data?.services || []);
    } catch (error) {
      console.error('Failed to load services', error);
    }
  };

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      const targetServiceIds = services.map((s) => s.id);

      const serviceNameById = new Map(services.map((s) => [s.id, s.name]));

      const [blockedResponses, bookingsRes] = await Promise.all([
        Promise.all(
          targetServiceIds.map((sid) =>
            availabilityApi
              .getBlockedDates(sid, startIso, endIso)
              .then((res) => ({ sid, res }))
              .catch(() => ({ sid, res: null as any })),
          ),
        ),
        providerBookingsApi.getCalendar(startIso, endIso),
      ]);

      const allBlocked: BlockedDate[] = [];
      blockedResponses.forEach(({ sid, res }) => {
        const list =
          res?.data?.data?.blockedDates || res?.data?.blockedDates || [];
        list.forEach((d: any) => {
          allBlocked.push({
            id: d.id,
            date: new Date(d.date),
            serviceId: d.serviceId ?? sid,
            serviceName: d.service?.name ?? serviceNameById.get(sid),
            reason: d.reason,
          });
        });
      });
      setBlockedDates(allBlocked);
      setBookings(bookingsRes.data.data?.events || bookingsRes.data.data?.bookings || []);
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
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }

      const targets = blockAllServices
        ? services.map((s) => s.id)
        : dialogServiceId
          ? [dialogServiceId]
          : [];

      if (targets.length === 0) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Select a service',
          detail: 'Pick a service or enable "Block for all services"',
        });
        return;
      }

      const existingKeys = new Set(
        blockedDates.map((b) => `${b.serviceId}:${toLocalKey(b.date)}`),
      );

      let newBlocks = 0;
      let skipped = 0;
      const requests: Promise<any>[] = [];

      for (const sid of targets) {
        const freshDates = dates.filter((date) => !existingKeys.has(`${sid}:${date}`));
        skipped += dates.length - freshDates.length;
        if (freshDates.length === 0) continue;
        newBlocks += freshDates.length;
        const payload = freshDates.map((date) => ({
          date,
          ...(blockReason ? { reason: blockReason } : {}),
        }));
        requests.push(availabilityApi.blockDates(sid, payload));
      }

      if (newBlocks === 0) {
        toast.current?.show({
          severity: 'info',
          summary: 'Nothing to block',
          detail: 'All selected dates are already blocked for the chosen scope.',
        });
        return;
      }

      await Promise.all(requests);

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail:
          skipped > 0
            ? `${newBlocks} new block${newBlocks > 1 ? 's' : ''} added • ${skipped} already existed`
            : `${newBlocks} block${newBlocks > 1 ? 's' : ''} added successfully`,
      });

      setBlockDialogVisible(false);
      setDateRange(null);
      setBlockReason('');
      setDialogServiceId(null);
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
    setUnblockTarget(blockedDate);
  };

  const confirmUnblock = async () => {
    if (!unblockTarget?.serviceId) return;
    setUnblocking(true);
    try {
      await availabilityApi.unblockDate(unblockTarget.serviceId, unblockTarget.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Date unblocked',
      });
      setUnblockTarget(null);
      loadCalendarData();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to unblock date',
      });
    } finally {
      setUnblocking(false);
    }
  };

  const toLocalKey = (input: Date | string): string => {
    const d = input instanceof Date ? input : new Date(input);
    const plain = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input);
    const y = plain ? d.getUTCFullYear() : d.getFullYear();
    const m = plain ? d.getUTCMonth() : d.getMonth();
    const day = plain ? d.getUTCDate() : d.getDate();
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDateInfo = (date: Date, respectFilter = false) => {
    const dateStr = toLocalKey(date);
    let blocks = blockedDates.filter((b) => toLocalKey(b.date) === dateStr);
    let dayBookings = bookings.filter(
      (b) => toLocalKey(b.eventDate as unknown as string) === dateStr,
    );
    if (respectFilter && selectedService) {
      blocks = blocks.filter((b) => b.serviceId === selectedService);
      dayBookings = dayBookings.filter((b) => b.service?.id === selectedService);
    }
    return { blocks, bookings: dayBookings };
  };

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const blockedCount = blockedDates.length;
    const now = new Date();
    const upcoming = bookings.filter(
      (b) => b.status === 'confirmed' && new Date(b.eventDate) >= now,
    ).length;
    return { confirmed, pending, blockedCount, upcoming };
  }, [bookings, blockedDates]);

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'confirmed' && new Date(b.eventDate) >= new Date())
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 5),
    [bookings],
  );

  const dateTemplate = (date: { day: number; month: number; year: number; selectable: boolean }) => {
    const d = new Date(date.year, date.month, date.day);
    const { blocks, bookings: dayBookings } = getDateInfo(d, true);
    const hasBookings = dayBookings.length > 0;
    const hasBlocks = blocks.length > 0;

    const modifierClass = hasBlocks
      ? 'is-blocked'
      : hasBookings
        ? 'is-booked'
        : '';

    return (
      <div className={`calendar-cell ${modifierClass}`}>
        <span className="calendar-cell-day">{date.day}</span>
        {(hasBookings || hasBlocks) && (
          <div className="calendar-cell-dots">
            {hasBookings && (
              <span
                className="calendar-cell-dot calendar-cell-dot--booking"
                title={`${dayBookings.length} booking${dayBookings.length > 1 ? 's' : ''}`}
              />
            )}
            {hasBlocks && (
              <span
                className="calendar-cell-dot calendar-cell-dot--blocked"
                title={`Blocked (${blocks.length})`}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading && services.length === 0) {
    return (
      <div>
        <Skeleton width="240px" height="2rem" className="mb-4" />
        <div className="grid mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="col-12 sm:col-6 lg:col-3">
              <Skeleton height="88px" borderRadius="12px" />
            </div>
          ))}
        </div>
        <div className="grid">
          <div className="col-12 lg:col-8">
            <Skeleton height="500px" borderRadius="12px" />
          </div>
          <div className="col-12 lg:col-4">
            <Skeleton height="500px" borderRadius="12px" />
          </div>
        </div>
      </div>
    );
  }

  const statusChip = (status?: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      confirmed: { bg: '#dcfce7', color: '#16a34a', label: 'Confirmed' },
      pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
      completed: { bg: '#e0e7ff', color: '#4f46e5', label: 'Completed' },
      cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    };
    const cfg = map[status || ''] || { bg: '#f3f4f6', color: '#4b5563', label: status || '—' };
    return (
      <span
        className="calendar-status-chip"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="calendar-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="calendar-header">
        <div>
          <h2 className="calendar-title">Calendar & Availability</h2>
          <p className="calendar-subtitle">
            Track your bookings, block days off, and stay ahead of your schedule.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dropdown
            value={selectedService}
            onChange={(e) => setSelectedService(e.value)}
            options={services.map((s) => ({ label: s.name, value: s.id }))}
            placeholder="Filter by service"
            className="calendar-service-filter"
          />
          <Button
            label="Block Dates"
            icon="pi pi-ban"
            onClick={() => setBlockDialogVisible(true)}
          />
        </div>
      </div>

      <div className="grid mb-3">
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="services-stat-card">
            <div className="services-stat-icon" style={{ backgroundColor: '#dcfce7' }}>
              <i className="pi pi-check-circle text-xl" style={{ color: '#16a34a' }} />
            </div>
            <div className="flex flex-column">
              <span className="text-sm text-color-secondary">Confirmed (month)</span>
              <span className="text-2xl font-bold text-color">{stats.confirmed}</span>
            </div>
          </div>
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="services-stat-card">
            <div className="services-stat-icon" style={{ backgroundColor: '#fef3c7' }}>
              <i className="pi pi-clock text-xl" style={{ color: '#d97706' }} />
            </div>
            <div className="flex flex-column">
              <span className="text-sm text-color-secondary">Pending</span>
              <span className="text-2xl font-bold text-color">{stats.pending}</span>
            </div>
          </div>
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="services-stat-card">
            <div className="services-stat-icon" style={{ backgroundColor: '#fee2e2' }}>
              <i className="pi pi-ban text-xl" style={{ color: '#dc2626' }} />
            </div>
            <div className="flex flex-column">
              <span className="text-sm text-color-secondary">Blocked days</span>
              <span className="text-2xl font-bold text-color">{stats.blockedCount}</span>
            </div>
          </div>
        </div>
        <div className="col-12 sm:col-6 lg:col-3">
          <div className="services-stat-card">
            <div className="services-stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
              <i className="pi pi-calendar text-xl" style={{ color: '#4f46e5' }} />
            </div>
            <div className="flex flex-column">
              <span className="text-sm text-color-secondary">Upcoming</span>
              <span className="text-2xl font-bold text-color">{stats.upcoming}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 lg:col-8">
          <div className="calendar-card">
            <Calendar
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.value as Date)}
              inline
              className="w-full calendar-inline"
              dateTemplate={dateTemplate}
              viewDate={selectedMonth}
              onViewDateChange={(e) => setSelectedMonth(e.value as Date)}
            />

            <div className="calendar-legend">
              <div className="calendar-legend-item">
                <span className="calendar-cell-dot calendar-cell-dot--booking" />
                <span>Booking</span>
              </div>
              <div className="calendar-legend-item">
                <span className="calendar-cell-dot calendar-cell-dot--blocked" />
                <span>Blocked</span>
              </div>
              <div className="calendar-legend-item">
                <span className="calendar-legend-swatch calendar-legend-swatch--today" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 lg:col-4">
          {selectedDate && (() => {
            const { blocks, bookings: dayBookings } = getDateInfo(selectedDate);
            return (
              <div className="calendar-side-card mb-3">
                <div className="calendar-side-head">
                  <span className="calendar-side-caption">Selected date</span>
                  <h3>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <span className="calendar-side-year">
                    {selectedDate.getFullYear()}
                  </span>
                </div>

                {blocks.length > 0 && (
                  <div className="calendar-section">
                    <div className="calendar-section-head">
                      <i className="pi pi-ban" style={{ color: '#dc2626' }} />
                      <span>Blocked services</span>
                      <span className="calendar-section-count">{blocks.length}</span>
                    </div>
                    <div className="calendar-block-list">
                      {blocks.map((block) => (
                        <div key={block.id} className="calendar-block-item">
                          <div className="flex-1 min-w-0">
                            <p className="calendar-block-service-name">
                              {block.serviceName || 'Service'}
                            </p>
                            {block.reason && (
                              <p className="calendar-block-service">{block.reason}</p>
                            )}
                          </div>
                          <Button
                            icon="pi pi-unlock"
                            className="p-button-rounded p-button-text p-button-sm"
                            tooltip="Unblock"
                            tooltipOptions={{ position: 'top' }}
                            onClick={() => handleUnblockDate(block)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dayBookings.length > 0 && (
                  <div className="calendar-section">
                    <div className="calendar-section-head">
                      <i className="pi pi-calendar-plus" style={{ color: '#16a34a' }} />
                      <span>Bookings</span>
                      <span className="calendar-section-count">{dayBookings.length}</span>
                    </div>
                    <div className="calendar-booking-list">
                      {dayBookings.map((booking) => (
                        <div key={booking.id} className="calendar-booking-item">
                          <div className="calendar-booking-avatar">
                            {(booking.client?.firstName?.[0] || '?').toUpperCase()}
                          </div>
                          <div className="calendar-booking-body">
                            <div className="calendar-booking-name">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </div>
                            <div className="calendar-booking-service">
                              {booking.service?.name}
                            </div>
                          </div>
                          {statusChip(booking.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {blocks.length === 0 && dayBookings.length === 0 && (
                  <div className="calendar-side-empty">
                    <i className="pi pi-calendar-plus" />
                    <p>No bookings on this date</p>
                    <span>The day is fully available.</span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="calendar-side-card">
            <div className="calendar-side-head">
              <span className="calendar-side-caption">Coming up</span>
              <h3>Upcoming Bookings</h3>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="calendar-side-empty">
                <i className="pi pi-inbox" />
                <p>No upcoming bookings</p>
                <span>Your confirmed bookings will appear here.</span>
              </div>
            ) : (
              <div className="calendar-upcoming-list">
                {upcomingBookings.map((booking) => {
                  const d = new Date(booking.eventDate);
                  return (
                    <div key={booking.id} className="calendar-upcoming-item">
                      <div className="calendar-upcoming-date">
                        <span className="calendar-upcoming-month">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="calendar-upcoming-day">{d.getDate()}</span>
                      </div>
                      <div className="calendar-upcoming-body">
                        <div className="calendar-upcoming-name">
                          {booking.service?.name}
                        </div>
                        <div className="calendar-upcoming-client">
                          <i className="pi pi-user" />
                          <span>
                            {booking.client?.firstName} {booking.client?.lastName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        visible={blockDialogVisible}
        onHide={() => setBlockDialogVisible(false)}
        style={{ width: '520px' }}
        breakpoints={{ '640px': '95vw' }}
        showHeader={false}
        contentClassName="block-dialog-content"
        className="block-dialog"
        dismissableMask
      >
        {(() => {
          const startDate = dateRange?.[0];
          const endDate = dateRange?.[1];
          const dayCount =
            startDate && endDate
              ? Math.round(
                  (new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() -
                    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1
              : startDate
                ? 1
                : 0;

          const affectedBookings =
            startDate && bookings.length > 0
              ? bookings.filter((b) => {
                  const bd = new Date(b.eventDate);
                  const rangeEnd = endDate || startDate;
                  return bd >= startDate && bd <= rangeEnd;
                }).length
              : 0;

          const fmt = (d: Date) =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          const targetsCount = blockAllServices
            ? services.length
            : dialogServiceId
              ? 1
              : 0;

          const targetIds = blockAllServices
            ? services.map((s) => s.id)
            : dialogServiceId
              ? [dialogServiceId]
              : [];

          let existingBlocks = 0;
          if (startDate && targetIds.length > 0) {
            const rangeEnd = endDate || startDate;
            const existingKeys = new Set(
              blockedDates.map((b) => `${b.serviceId}:${toLocalKey(b.date)}`),
            );
            for (
              let d = new Date(startDate);
              d <= rangeEnd;
              d.setDate(d.getDate() + 1)
            ) {
              const key = toLocalKey(d);
              for (const sid of targetIds) {
                if (existingKeys.has(`${sid}:${key}`)) existingBlocks += 1;
              }
            }
          }

          const totalIntended = dayCount * targetsCount;
          const newBlocks = Math.max(0, totalIntended - existingBlocks);

          return (
            <>
              <div className="block-dialog-header">
                <div className="block-dialog-icon">
                  <i className="pi pi-ban" />
                </div>
                <div className="flex-1">
                  <h3 className="block-dialog-title">Block Dates</h3>
                  <p className="block-dialog-subtitle">
                    Prevent bookings on specific days — perfect for holidays, personal time, or maintenance.
                  </p>
                </div>
                <button
                  type="button"
                  className="block-dialog-close"
                  onClick={() => setBlockDialogVisible(false)}
                  aria-label="Close"
                >
                  <i className="pi pi-times" />
                </button>
              </div>

              <div className="block-dialog-body">
                <div>
                  <div className="block-dialog-field-head">
                    <label className="services-form-label m-0">Date range</label>
                    {dayCount > 0 && (
                      <span className="block-dialog-daycount">
                        {dayCount} day{dayCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {startDate && (
                    <div className="block-dialog-range">
                      <div className="block-dialog-range-item">
                        <span>From</span>
                        <strong>{fmt(startDate)}</strong>
                      </div>
                      <i className="pi pi-arrow-right block-dialog-range-arrow" />
                      <div className="block-dialog-range-item">
                        <span>To</span>
                        <strong>{endDate ? fmt(endDate) : fmt(startDate)}</strong>
                      </div>
                    </div>
                  )}
                  <Calendar
                    value={dateRange}
                    onChange={(e) => setDateRange(e.value as Date[])}
                    selectionMode="range"
                    inline
                    minDate={new Date()}
                    className="w-full calendar-inline"
                  />
                </div>

                {affectedBookings > 0 && (
                  <div className="block-dialog-warning">
                    <i className="pi pi-exclamation-triangle" />
                    <div>
                      <strong>Heads up</strong>
                      <p>
                        {affectedBookings} existing booking{affectedBookings > 1 ? 's are' : ' is'} scheduled
                        in this range. Blocking won't cancel them — only prevents new bookings.
                      </p>
                    </div>
                  </div>
                )}

                {existingBlocks > 0 && (
                  <div className="block-dialog-warning block-dialog-warning--info">
                    <i className="pi pi-info-circle" />
                    <div>
                      <strong>Already blocked</strong>
                      <p>
                        {existingBlocks} of the selected date/service combinations {existingBlocks > 1 ? 'are' : 'is'}{' '}
                        already blocked and will be skipped.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="services-form-label">Apply to</label>
                  <div className="block-dialog-scope">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={blockAllServices}
                      className={`block-dialog-scope-option ${blockAllServices ? 'is-active' : ''}`}
                      onClick={() => setBlockAllServices(true)}
                    >
                      <div className="block-dialog-scope-icon">
                        <i className="pi pi-globe" />
                      </div>
                      <div className="text-left">
                        <div className="block-dialog-scope-title">All services</div>
                        <div className="block-dialog-scope-sub">
                          Blocks {services.length} service{services.length === 1 ? '' : 's'}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!blockAllServices}
                      className={`block-dialog-scope-option ${!blockAllServices ? 'is-active' : ''}`}
                      onClick={() => setBlockAllServices(false)}
                    >
                      <div className="block-dialog-scope-icon">
                        <i className="pi pi-list" />
                      </div>
                      <div className="text-left">
                        <div className="block-dialog-scope-title">One service</div>
                        <div className="block-dialog-scope-sub">Pick a specific listing</div>
                      </div>
                    </button>
                  </div>
                  {!blockAllServices && (
                    <Dropdown
                      value={dialogServiceId}
                      onChange={(e) => setDialogServiceId(e.value)}
                      options={services.map((s) => ({ label: s.name, value: s.id }))}
                      placeholder="Select a service"
                      className="w-full mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="services-form-label">
                    Reason <span className="block-dialog-optional">Optional</span>
                  </label>
                  <InputTextarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g., Holiday, personal time off, equipment maintenance..."
                    rows={2}
                    autoResize
                    className="w-full"
                  />
                </div>
              </div>

              <div className="block-dialog-footer">
                <div className="block-dialog-footer-summary">
                  {dayCount > 0 && targetsCount > 0 ? (
                    newBlocks > 0 ? (
                      <span>
                        Adding <strong>{newBlocks} new block{newBlocks > 1 ? 's' : ''}</strong>
                        {existingBlocks > 0 && (
                          <> ({existingBlocks} already blocked)</>
                        )}
                      </span>
                    ) : (
                      <span>All selected dates are already blocked</span>
                    )
                  ) : (
                    <span>Select dates and scope to continue</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    label="Cancel"
                    className="p-button-text"
                    onClick={() => setBlockDialogVisible(false)}
                  />
                  <Button
                    label="Block Dates"
                    icon="pi pi-ban"
                    onClick={handleBlockDates}
                    disabled={dayCount === 0 || targetsCount === 0 || newBlocks === 0}
                  />
                </div>
              </div>
            </>
          );
        })()}
      </Dialog>

      <Dialog
        visible={!!unblockTarget}
        onHide={() => !unblocking && setUnblockTarget(null)}
        style={{ width: '440px' }}
        breakpoints={{ '640px': '95vw' }}
        showHeader={false}
        contentClassName="unblock-dialog-content"
        className="unblock-dialog"
        dismissableMask={!unblocking}
      >
        {unblockTarget && (
          <>
            <div className="unblock-dialog-header">
              <div className="unblock-dialog-icon">
                <i className="pi pi-unlock" />
              </div>
              <h3 className="unblock-dialog-title">Unblock this date?</h3>
              <p className="unblock-dialog-subtitle">
                Customers will be able to book this date again.
              </p>
            </div>

            <div className="unblock-dialog-body">
              <div className="unblock-dialog-detail">
                <div className="unblock-dialog-detail-icon">
                  <i className="pi pi-calendar" />
                </div>
                <div>
                  <span className="unblock-dialog-detail-label">Date</span>
                  <strong>
                    {unblockTarget.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              </div>

              {unblockTarget.serviceName && (
                <div className="unblock-dialog-detail">
                  <div className="unblock-dialog-detail-icon">
                    <i className="pi pi-briefcase" />
                  </div>
                  <div>
                    <span className="unblock-dialog-detail-label">Service</span>
                    <strong>{unblockTarget.serviceName}</strong>
                  </div>
                </div>
              )}

              {unblockTarget.reason && (
                <div className="unblock-dialog-detail">
                  <div className="unblock-dialog-detail-icon">
                    <i className="pi pi-info-circle" />
                  </div>
                  <div>
                    <span className="unblock-dialog-detail-label">Reason</span>
                    <strong>{unblockTarget.reason}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="unblock-dialog-footer">
              <Button
                label="Cancel"
                className="p-button-text"
                onClick={() => setUnblockTarget(null)}
                disabled={unblocking}
              />
              <Button
                label="Unblock"
                icon="pi pi-unlock"
                onClick={confirmUnblock}
                loading={unblocking}
                severity="success"
              />
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
