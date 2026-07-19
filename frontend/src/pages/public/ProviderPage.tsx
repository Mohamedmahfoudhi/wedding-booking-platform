import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { providersApi, servicesApi } from '../../api/client';
import { ProviderProfile, Service, Review } from '../../types';
import { useAppSelector } from '../../store/hooks';

export default function ProviderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (id) {
      loadProvider();
    }
  }, [id]);

  const loadProvider = async () => {
    try {
      const response = await providersApi.getBySlug(id!);
      const providerData = response.data.data?.provider;
      if (!providerData) {
        navigate('/404');
        return;
      }
      setProvider(providerData);
      const providerServices: Service[] = providerData.services || [];
      setServices(providerServices);
      await loadReviews(providerServices);
    } catch (error) {
      console.error('Failed to load provider', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (providerServices: Service[]) => {
    if (providerServices.length === 0) return;
    try {
      const responses = await Promise.all(
        providerServices.map((s) => servicesApi.getReviews(s.id)),
      );
      const all: Review[] = responses.flatMap(
        (r) => r.data.data?.reviews || [],
      );
      setReviews(all);
      setTotalReviews(all.length);
      if (all.length > 0) {
        const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Failed to load reviews', error);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/account/messages?provider=${id}`);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="grid">
          <div className="col-12 md:col-4">
            <Card>
              <Skeleton height="200px" className="mb-4" />
              <Skeleton width="60%" className="mb-3" />
              <Skeleton width="40%" />
            </Card>
          </div>
          <div className="col-12 md:col-8">
            <Card>
              <Skeleton height="300px" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container py-4 text-center">
        <h2>Provider not found</h2>
        <Link to="/search">
          <Button label="Browse Services" />
        </Link>
      </div>
    );
  }

  return (
    <div className="surface-ground min-h-screen py-4">
      <div className="container">
        <div className="grid">
          {/* Provider Info Sidebar */}
          <div className="col-12 lg:col-4">
            <Card className="sticky" style={{ top: '80px' }}>
              <div className="text-center mb-4">
                <div
                  className="w-8rem h-8rem border-circle bg-primary flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    backgroundImage: provider.logo ? `url(${provider.logo})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!provider.logo && (
                    <span className="text-4xl text-white font-bold">
                      {provider.businessName?.charAt(0) || 'P'}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{provider.businessName}</h2>
                <div className="flex align-items-center justify-content-center gap-2 mb-3">
                  <Rating value={avgRating} readOnly cancel={false} />
                  <span className="text-color-secondary">
                    ({totalReviews} reviews)
                  </span>
                </div>
                {provider.verified && (
                  <span className="inline-flex align-items-center gap-1 text-green-600 bg-green-100 px-3 py-1 border-round">
                    <i className="pi pi-verified" />
                    Verified Provider
                  </span>
                )}
              </div>

              <Divider />

              <div className="mb-4">
                {provider.phone && (
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-phone text-color-secondary" />
                    <span>{provider.phone}</span>
                  </div>
                )}
                {provider.website && (
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-globe text-color-secondary" />
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                      Website
                    </a>
                  </div>
                )}
                {provider.address && (
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-map-marker text-color-secondary" />
                    <span>{provider.address}</span>
                  </div>
                )}
                {provider.city && (
                  <div className="flex align-items-center gap-2 mb-3">
                    <i className="pi pi-building text-color-secondary" />
                    <span>{provider.city}</span>
                  </div>
                )}
              </div>

              <Button
                label="Contact Provider"
                icon="pi pi-comments"
                className="w-full"
                onClick={handleContact}
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-12 lg:col-8">
            <Card>
              <TabView>
                <TabPanel header="About">
                  <h3 className="mt-0">About {provider.businessName}</h3>
                  <p className="line-height-3 text-color-secondary">
                    {provider.description || 'No description provided.'}
                  </p>

                  {provider.yearsInBusiness && (
                    <div className="mt-4">
                      <span className="font-medium">Years in Business: </span>
                      <span className="text-color-secondary">{provider.yearsInBusiness} years</span>
                    </div>
                  )}
                </TabPanel>

                <TabPanel header={`Services (${services.length})`}>
                  {services.length > 0 ? (
                    <div className="grid">
                      {services.map((service) => (
                        <div key={service.id} className="col-12 md:col-6">
                          <Link to={`/services/${service.id}`} className="no-underline">
                            <Card className="service-card h-full">
                              <div
                                className="border-round mb-3"
                                style={{
                                  backgroundImage: `url(${service.images?.[0]?.url || '/placeholder-service.jpg'})`,
                                  height: '150px',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              />
                              <span className="text-xs surface-200 border-round px-2 py-1 mb-2 inline-block">
                                {service.category?.name}
                              </span>
                              <h4 className="text-lg font-semibold mb-2 text-color">{service.name}</h4>
                              <div className="flex align-items-center justify-content-between">
                                <div className="flex align-items-center gap-1">
                                  <Rating value={service.avgRating || 0} readOnly cancel={false} stars={5} />
                                  <span className="text-xs text-color-secondary">
                                    ({service.reviewCount || 0})
                                  </span>
                                </div>
                                <span className="font-bold text-primary">
                                  {service.basePrice} TND
                                </span>
                              </div>
                            </Card>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-color-secondary text-center py-4">
                      No services available yet.
                    </p>
                  )}
                </TabPanel>

                <TabPanel header={`Reviews (${totalReviews})`}>
                  {reviews.length > 0 ? (
                    <div className="flex flex-column gap-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="surface-ground p-4 border-round">
                          <div className="flex justify-content-between mb-2">
                            <div className="flex align-items-center gap-2">
                              <div className="w-2rem h-2rem border-circle bg-primary flex align-items-center justify-content-center text-white">
                                {review.user?.firstName?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <span className="font-medium block">
                                  {review.user?.firstName} {review.user?.lastName}
                                </span>
                                <span className="text-xs text-color-secondary">
                                  {review.service?.name}
                                </span>
                              </div>
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
                    <p className="text-color-secondary text-center py-4">
                      No reviews yet.
                    </p>
                  )}
                </TabPanel>
              </TabView>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
