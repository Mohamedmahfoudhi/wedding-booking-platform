import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Rating } from 'primereact/rating';
import { Galleria } from 'primereact/galleria';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import { servicesApi, bookingsApi, favoritesApi, availabilityApi, reviewsApi } from '../../api/client';
import { Service, ServicePackage, Review, Availability } from '../../types';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
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
      setService(response.data);
    } catch (error) {
      console.error('Failed to load service', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await reviewsApi.getByService(id!);
      setReviews(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load reviews', error);
    }
  };

  const loadAvailability = async () => {
    try {
      const response = await availabilityApi.getByService(id!);
      setAvailability(response.data);
      // Get blocked dates for the next 6 months
      const blockedResponse = await availabilityApi.getBlockedDates(id!, {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setBlockedDates(blockedResponse.data.map((d: string) => new Date(d)));
    } catch (error) {
      console.error('Failed to load availability', error);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await favoritesApi.check(id!);
      setIsFavorite(response.data.isFavorite);
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
      const totalPrice = calculateTotalPrice();
      await bookingsApi.create({
        serviceId: id!,
        eventDate: selectedDate.toISOString(),
        packageIds: selectedPackages,
        notes: bookingNotes,
        totalPrice,
      });
      toast.current?.show({ severity: 'success', summary: 'Booking request sent!' });
      setBookingDialogVisible(false);
      navigate('/account/bookings');
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Booking failed',
        detail: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    let total = service?.basePrice || 0;
    selectedPackages.forEach((pkgId) => {
      const pkg = service?.packages?.find((p) => p.id === pkgId);
      if (pkg) total += pkg.price;
    });
    return total;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Check if date is in blocked dates
    return blockedDates.some(
      (blocked) =>
        blocked.getFullYear() === date.getFullYear() &&
        blocked.getMonth() === date.getMonth() &&
        blocked.getDate() === date.getDate()
    );
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
      <div className="container py-4">
        <Skeleton height="400px" className="mb-4" />
        <Skeleton width="60%" height="2rem" className="mb-3" />
        <Skeleton width="40%" className="mb-4" />
        <Skeleton height="200px" />
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

  return (
    <div className="surface-ground min-h-screen">
      <Toast ref={toast} />

      <div className="container py-4">
        <div className="grid">
          {/* Left Column - Images and Details */}
          <div className="col-12 lg:col-8">
            {/* Image Gallery */}
            <Card className="mb-4">
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
                <div
                  className="flex align-items-center justify-content-center surface-200"
                  style={{ height: '400px' }}
                >
                  <i className="pi pi-image text-6xl text-color-secondary" />
                </div>
              )}
            </Card>

            {/* Service Info */}
            <Card className="mb-4">
              <div className="flex align-items-start justify-content-between mb-4">
                <div>
                  <span className="text-sm surface-200 border-round px-2 py-1 mr-2">
                    {service.category?.name}
                  </span>
                  <h1 className="text-3xl font-bold mt-3 mb-2">{service.name}</h1>
                  <div className="flex align-items-center gap-3 text-color-secondary">
                    <div className="flex align-items-center gap-1">
                      <i className="pi pi-map-marker" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex align-items-center gap-1">
                      <Rating value={service.avgRating || 0} readOnly cancel={false} />
                      <span>({service.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                <Button
                  icon={isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
                  className={`p-button-rounded ${isFavorite ? 'p-button-danger' : 'p-button-outlined'}`}
                  onClick={toggleFavorite}
                />
              </div>

              <TabView>
                <TabPanel header="Description">
                  <p className="line-height-3">{service.description}</p>
                </TabPanel>
                <TabPanel header="Packages">
                  {service.packages && service.packages.length > 0 ? (
                    <div className="grid">
                      {service.packages.map((pkg: ServicePackage) => (
                        <div key={pkg.id} className="col-12 md:col-6">
                          <Card className="h-full">
                            <h4 className="m-0 mb-2">{pkg.name}</h4>
                            <p className="text-color-secondary mb-3">{pkg.description}</p>
                            <p className="text-xl font-bold text-primary m-0">
                              +{pkg.price} TND
                            </p>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-color-secondary">No additional packages available</p>
                  )}
                </TabPanel>
                <TabPanel header={`Reviews (${reviews.length})`}>
                  {reviews.length > 0 ? (
                    <div className="flex flex-column gap-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="surface-ground p-4 border-round">
                          <div className="flex justify-content-between mb-2">
                            <div className="flex align-items-center gap-2">
                              <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white">
                                {review.user?.firstName?.charAt(0) || 'U'}
                              </div>
                              <span className="font-medium">
                                {review.user?.firstName} {review.user?.lastName}
                              </span>
                            </div>
                            <Rating value={review.rating} readOnly cancel={false} />
                          </div>
                          <p className="m-0 line-height-3">{review.comment}</p>
                          <p className="text-sm text-color-secondary mt-2 mb-0">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          {review.providerResponse && (
                            <div className="mt-3 pl-4 border-left-3 surface-border">
                              <p className="text-sm font-medium mb-1">Provider Response:</p>
                              <p className="text-sm m-0">{review.providerResponse}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-color-secondary">No reviews yet</p>
                  )}
                </TabPanel>
              </TabView>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="col-12 lg:col-4">
            <Card className="sticky" style={{ top: '80px' }}>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-primary m-0">
                  {service.basePrice} TND
                </p>
                <p className="text-color-secondary">Starting price</p>
              </div>

              <Divider />

              <div className="mb-4">
                <h4 className="mt-0 mb-3">Select Date</h4>
                <Calendar
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.value as Date)}
                  inline
                  minDate={new Date()}
                  disabledDates={blockedDates}
                  className="w-full"
                />
              </div>

              {service.packages && service.packages.length > 0 && (
                <>
                  <Divider />
                  <div className="mb-4">
                    <h4 className="mt-0 mb-3">Add-ons</h4>
                    {service.packages.map((pkg: ServicePackage) => (
                      <div key={pkg.id} className="flex align-items-center gap-2 mb-2">
                        <Checkbox
                          inputId={pkg.id}
                          checked={selectedPackages.includes(pkg.id)}
                          onChange={(e) => {
                            if (e.checked) {
                              setSelectedPackages([...selectedPackages, pkg.id]);
                            } else {
                              setSelectedPackages(selectedPackages.filter((id) => id !== pkg.id));
                            }
                          }}
                        />
                        <label htmlFor={pkg.id} className="flex-grow-1">
                          {pkg.name}
                        </label>
                        <span className="text-primary">+{pkg.price} TND</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Divider />

              <div className="flex justify-content-between mb-4">
                <span className="font-bold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {calculateTotalPrice()} TND
                </span>
              </div>

              <Button
                label="Book Now"
                icon="pi pi-calendar-plus"
                className="w-full mb-3"
                onClick={() => setBookingDialogVisible(true)}
                disabled={!selectedDate}
              />

              <Button
                label="Contact Provider"
                icon="pi pi-comments"
                className="w-full p-button-outlined"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  navigate(`/account/messages?provider=${service.provider?.id}`);
                }}
              />

              <Divider />

              {/* Provider Info */}
              <Link to={`/providers/${service.provider?.id}`} className="no-underline">
                <div className="flex align-items-center gap-3 cursor-pointer hover:surface-100 p-2 border-round">
                  <div className="w-3rem h-3rem border-circle bg-primary flex align-items-center justify-content-center text-white text-xl">
                    {service.provider?.businessName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <p className="font-medium m-0 text-color">
                      {service.provider?.businessName}
                    </p>
                    <p className="text-sm text-color-secondary m-0">View Profile</p>
                  </div>
                  <i className="pi pi-chevron-right ml-auto text-color-secondary" />
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog
        header="Confirm Booking"
        visible={bookingDialogVisible}
        onHide={() => setBookingDialogVisible(false)}
        style={{ width: '500px' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setBookingDialogVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Confirm Booking"
              icon="pi pi-check"
              onClick={handleBooking}
              loading={bookingLoading}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-4">
          <div className="surface-ground p-3 border-round">
            <p className="font-medium mb-2">{service.name}</p>
            <p className="text-color-secondary mb-2">
              <i className="pi pi-calendar mr-2" />
              {selectedDate?.toLocaleDateString()}
            </p>
            {selectedPackages.length > 0 && (
              <p className="text-color-secondary mb-0">
                <i className="pi pi-plus-circle mr-2" />
                {selectedPackages.length} add-on(s) selected
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2">Notes for Provider</label>
            <InputTextarea
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              rows={3}
              className="w-full"
              placeholder="Any special requests or details..."
            />
          </div>

          <div className="flex justify-content-between surface-100 p-3 border-round">
            <span className="font-bold">Total Amount:</span>
            <span className="text-xl font-bold text-primary">
              {calculateTotalPrice()} TND
            </span>
          </div>

          <p className="text-sm text-color-secondary m-0">
            By confirming, you agree to our terms of service. A deposit may be required
            to complete the booking.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
