import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Galleria } from 'primereact/galleria';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Skeleton } from 'primereact/skeleton';
import { Toast } from 'primereact/toast';
import { useAppSelector } from '../../store/hooks';
import { servicesApi, bookingsApi, favoritesApi, availabilityApi } from '../../api/client';
import { Service, ServicePackage, Review } from '../../types';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useRef<Toast>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking state
  const [bookingDialogVisible, setBookingDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadService();
      loadReviews();
      loadAvailability();
      if (isAuthenticated) {
        checkFavorite();
      }
    }
  }, [id, isAuthenticated]);

  const loadService = async () => {
    try {
      const response = await servicesApi.getById(id!);
      const svc = response.data.data?.service;
      if (!svc) {
        navigate('/404');
        return;
      }
      setService(svc);
    } catch (error) {
      console.error('Failed to load service', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await servicesApi.getReviews(id!);
      setReviews(response.data.data?.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews', error);
    }
  };

  const loadAvailability = async () => {
    try {
      const now = new Date();
      const horizonEnd = new Date(now);
      horizonEnd.setDate(now.getDate() + 180);

      const [scheduleRes, blockedRes] = await Promise.all([
        servicesApi.getAvailability(id!),
        availabilityApi.getPublicBlockedDates(
          id!,
          now.toISOString(),
          horizonEnd.toISOString(),
        ),
      ]);

      const schedule = scheduleRes.data.data?.schedule || [];

      // Always honor explicit blocked dates from the provider.
      const explicitBlocks: Date[] = (
        blockedRes.data.data?.blockedDates || []
      ).map((b: { date: string }) => new Date(b.date));

      const blockedSet = new Set(
        explicitBlocks.map((d) => d.toISOString().slice(0, 10)),
      );

      // If the provider has set a weekly schedule, also block days-of-week
      // that aren't in that schedule. Otherwise leave all other days open.
      const hasSchedule = Array.isArray(schedule) && schedule.length > 0;
      const scheduledDays = new Set<number>(
        hasSchedule
          ? schedule
              .filter((s: { isAvailable: boolean }) => s.isAvailable)
              .map((s: { dayOfWeek: number }) => s.dayOfWeek)
          : [],
      );

      const blocked: Date[] = [...explicitBlocks];
      if (hasSchedule) {
        for (let i = 0; i < 180; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() + i);
          const iso = d.toISOString().slice(0, 10);
          if (blockedSet.has(iso)) continue;
          if (!scheduledDays.has(d.getDay())) blocked.push(new Date(d));
        }
      }
      setBlockedDates(blocked);
    } catch (error) {
      console.error('Failed to load availability', error);
      setBlockedDates([]);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesApi.check(id!);
      setIsFavorite(response.data.data?.isFavorite ?? false);
    } catch (error) {
      console.error('Failed to check favorite status', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(id!);
        setIsFavorite(false);
        toast.current?.show({ severity: 'info', summary: 'Removed from favorites' });
      } else {
        await favoritesApi.add(id!);
        setIsFavorite(true);
        toast.current?.show({ severity: 'success', summary: 'Added to favorites' });
      }
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Action failed' });
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedDate) {
      toast.current?.show({ severity: 'warn', summary: 'Please select a date' });
      return;
    }

    setBookingLoading(true);
    try {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const payload: Record<string, unknown> = {
        serviceId: id!,
        eventDate: `${yyyy}-${mm}-${dd}`,
      };
      if (selectedPackages[0]) payload.packageId = selectedPackages[0];
      if (bookingNotes.trim()) payload.notes = bookingNotes.trim();
      await bookingsApi.create(payload);
      toast.current?.show({ severity: 'success', summary: 'Booking request sent!' });
      setBookingDialogVisible(false);
      navigate('/account/bookings');
    } catch (error: any) {
      console.error('Booking failed:', error.response?.data || error);
      const errList: string[] | undefined = error.response?.data?.errors;
      const detail = errList && errList.length > 0
        ? errList.join(' • ')
        : error.response?.data?.message || 'Please try again';
      toast.current?.show({
        severity: 'error',
        summary: 'Booking failed',
        detail,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    let total = Number(service?.basePrice ?? 0);
    selectedPackages.forEach((pkgId) => {
      const pkg = service?.packages?.find((p) => p.id === pkgId);
      if (pkg) total += Number(pkg.price);
    });
    return total;
  };

  const itemTemplate = (item: { url: string }) => {
    return (
      <img
        src={item.url}
        alt="Service"
        style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
      />
    );
  };

  const thumbnailTemplate = (item: { url: string }) => {
    return (
      <img
        src={item.url}
        alt="Service thumbnail"
        style={{ width: '80px', height: '60px', objectFit: 'cover' }}
      />
    );
  };

  if (loading) {
    return (
      <div className="service-page">
        <div className="container">
          <Skeleton height="420px" className="mb-4" style={{ borderRadius: 14 }} />
          <div className="grid">
            <div className="col-12 lg:col-8">
              <Skeleton height="240px" style={{ borderRadius: 14 }} />
            </div>
            <div className="col-12 lg:col-4">
              <Skeleton height="420px" style={{ borderRadius: 14 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-4 text-center">
        <h2>Service not found</h2>
        <Link to="/search">
          <Button label="Browse Services" />
        </Link>
      </div>
    );
  }

  const toggleAddon = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId],
    );
  };

  return (
    <div className="service-page">
      <Toast ref={toast} />

      <div className="container">
        {/* Breadcrumb */}
        <nav className="service-breadcrumb">
          <Link to="/">Home</Link>
          <i className="pi pi-chevron-right" />
          <Link to="/search">Services</Link>
          {service.category?.name && (
            <>
              <i className="pi pi-chevron-right" />
              <Link to={`/search?category=${service.category.slug ?? ''}`}>
                {service.category.name}
              </Link>
            </>
          )}
          <i className="pi pi-chevron-right" />
          <span className="text-color">{service.name}</span>
        </nav>

        <div className="grid">
          {/* Left column */}
          <div className="col-12 lg:col-8">
            {/* Gallery */}
            <div className="service-card service-gallery">
              {service.images && service.images.length > 0 ? (
                <Galleria
                  value={service.images}
                  numVisible={5}
                  style={{ maxWidth: '100%' }}
                  item={itemTemplate}
                  thumbnail={thumbnailTemplate}
                  showThumbnails={service.images.length > 1}
                />
              ) : (
                <div className="service-gallery-empty">
                  <i className="pi pi-image" />
                </div>
              )}
            </div>

            {/* Service info card */}
            <div className="service-card service-card--pad">
              <div className="service-head">
                <div className="service-head-main">
                  {service.category?.name && (
                    <span className="service-chip">{service.category.name}</span>
                  )}
                  <h1 className="service-title">{service.name}</h1>
                  <div className="service-meta">
                    {service.location && (
                      <span className="service-meta-item">
                        <i className="pi pi-map-marker" />
                        {service.location}
                      </span>
                    )}
                    <span className="service-meta-item">
                      <Rating value={Number(service.avgRating) || 0} readOnly cancel={false} />
                      <span>({service.reviewCount || 0} reviews)</span>
                    </span>
                  </div>
                </div>
                <Button
                  icon={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
                  className={`service-fav-btn p-button-rounded ${isFavorite ? 'p-button-danger' : 'p-button-outlined'}`}
                  tooltip={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  tooltipOptions={{ position: 'left' }}
                  onClick={toggleFavorite}
                />
              </div>

              <TabView>
                <TabPanel header="Description">
                  <div className="service-section">
                    {service.description ? (
                      <p>{service.description}</p>
                    ) : (
                      <div className="service-empty">
                        <i className="pi pi-align-left" />
                        <p>No description provided.</p>
                      </div>
                    )}
                  </div>
                </TabPanel>

                <TabPanel header={`Packages (${service.packages?.length ?? 0})`}>
                  {service.packages && service.packages.length > 0 ? (
                    <div className="service-package-grid">
                      {service.packages.map((pkg: ServicePackage) => (
                        <div key={pkg.id} className="service-package">
                          <h4 className="service-package-name">{pkg.name}</h4>
                          {pkg.description && (
                            <p className="service-package-desc">{pkg.description}</p>
                          )}
                          <p className="service-package-price">
                            +{Number(pkg.price).toLocaleString()} TND
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="service-empty">
                      <i className="pi pi-box" />
                      <p>No additional packages available.</p>
                    </div>
                  )}
                </TabPanel>

                <TabPanel header={`Reviews (${reviews.length})`}>
                  {reviews.length > 0 ? (
                    <div>
                      {reviews.map((review) => (
                        <div key={review.id} className="service-review">
                          <div className="service-review-head">
                            <div className="service-review-user">
                              <div className="service-review-avatar">
                                {review.client?.firstName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="service-review-name">
                                  {review.client?.firstName} {review.client?.lastName}
                                </div>
                                <span className="service-review-date">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Rating value={review.rating} readOnly cancel={false} />
                          </div>
                          {review.comment && (
                            <p className="service-review-comment">{review.comment}</p>
                          )}
                          {review.providerResponse && (
                            <div className="service-review-response">
                              <span className="service-review-response-label">
                                Provider response
                              </span>
                              <p>{review.providerResponse}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="service-empty">
                      <i className="pi pi-comment" />
                      <p>No reviews yet.</p>
                    </div>
                  )}
                </TabPanel>
              </TabView>
            </div>
          </div>

          {/* Right column - booking sidebar */}
          <div className="col-12 lg:col-4">
            <div className="service-booking">
              <div className="service-booking-price">
                <span className="service-booking-price-label">Starting from</span>
                <p className="service-booking-price-value">
                  {Number(service.basePrice ?? 0).toLocaleString()}
                  <small>TND</small>
                </p>
              </div>

              <div className="service-booking-section">
                <label className="service-booking-label">Select a date</label>
                <Calendar
                  value={selectedDate}
                  onChange={(e) => setSelectedDate((e.value as Date) ?? null)}
                  inline
                  minDate={new Date()}
                  disabledDates={blockedDates}
                  className="service-booking-calendar w-full"
                />
              </div>

              {service.packages && service.packages.length > 0 && (
                <div className="service-booking-section">
                  <label className="service-booking-label">Add-ons</label>
                  {service.packages.map((pkg: ServicePackage) => {
                    const active = selectedPackages.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        className={`service-addon ${active ? 'service-addon--active' : ''}`}
                        onClick={() => toggleAddon(pkg.id)}
                        role="button"
                      >
                        <i
                          className={active ? 'pi pi-check-circle text-primary' : 'pi pi-circle'}
                          style={{ fontSize: '1.1rem' }}
                        />
                        <span className="service-addon-name">{pkg.name}</span>
                        <span className="service-addon-price">
                          +{Number(pkg.price).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="service-booking-total">
                <span className="service-booking-total-label">Total</span>
                <span className="service-booking-total-value">
                  {calculateTotalPrice().toLocaleString()} TND
                </span>
              </div>

              <Button
                label="Book Now"
                icon="pi pi-calendar-plus"
                className="w-full mb-2"
                onClick={() => setBookingDialogVisible(true)}
                disabled={!selectedDate}
              />

              <Button
                label="Contact Provider"
                icon="pi pi-comments"
                className="w-full p-button-outlined"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: location } });
                    return;
                  }
                  navigate(`/account/messages?provider=${service.provider?.id}`);
                }}
              />

              <Link to={`/providers/${service.provider?.id}`} className="service-provider-card">
                <div className="service-provider-avatar">
                  {service.provider?.businessName?.charAt(0) || 'P'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="service-provider-name">{service.provider?.businessName}</p>
                  <p className="service-provider-link">View profile</p>
                </div>
                <i className="pi pi-chevron-right text-color-secondary" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Booking Dialog */}
      <Dialog
        header="Confirm your booking"
        visible={bookingDialogVisible}
        onHide={() => setBookingDialogVisible(false)}
        style={{ width: '500px' }}
        footer={
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setBookingDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Confirm booking"
              icon="pi pi-check"
              onClick={handleBooking}
              loading={bookingLoading}
            />
          </>
        }
      >
        <div>
          <div className="confirm-booking-summary">
            <p className="confirm-booking-summary-title">{service.name}</p>
            <div className="confirm-booking-summary-row">
              <i className="pi pi-calendar" />
              {selectedDate?.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            {selectedPackages.length > 0 && (
              <div className="confirm-booking-summary-row">
                <i className="pi pi-plus-circle" />
                {selectedPackages.length} add-on{selectedPackages.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          <div className="field">
            <label className="service-booking-label">Notes for provider</label>
            <InputTextarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Any special requests or details..."
            />
          </div>

          <div className="confirm-booking-total">
            <span className="confirm-booking-total-label">Total amount</span>
            <span className="confirm-booking-total-value">
              {calculateTotalPrice().toLocaleString()} TND
            </span>
          </div>

          <p className="confirm-booking-note">
            By confirming, you agree to our terms of service. A deposit may be required to
            complete the booking.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
