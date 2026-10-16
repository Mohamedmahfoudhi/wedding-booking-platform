import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { providersApi, servicesApi } from '../../api/client';
import { ProviderProfile, Service, Review } from '../../types';
import { useAppSelector } from '../../store/hooks';

export default function ProviderPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (slug) {
      loadProvider();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadProvider = async () => {
    try {
      const response = await providersApi.getBySlug(slug!);
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
    navigate(`/account/messages?provider=${provider?.id}`);
  };

  if (loading) {
    return (
      <div className="provider-page">
        <div className="provider-hero" />
        <div className="container">
          <div className="provider-identity">
            <Skeleton shape="circle" size="128px" />
            <div style={{ flex: 1, paddingBottom: '0.75rem' }}>
              <Skeleton width="260px" height="1.875rem" className="mb-2" />
              <Skeleton width="140px" height="1rem" />
            </div>
          </div>
          <div className="grid">
            <div className="col-12 lg:col-4">
              <Skeleton height="320px" style={{ borderRadius: 14 }} />
            </div>
            <div className="col-12 lg:col-8">
              <Skeleton height="320px" style={{ borderRadius: 14 }} />
            </div>
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
    <div className="provider-page">
      <div
        className="provider-hero"
        style={
          provider.coverImage
            ? { backgroundImage: `url(${provider.coverImage})` }
            : undefined
        }
      >
        <div className="provider-hero-action">
          <Button
            label="Contact provider"
            icon="pi pi-comments"
            onClick={handleContact}
          />
        </div>
      </div>

      <div className="container">
        <div className="provider-identity">
          <div className="provider-logo">
            <div
              className="provider-logo-inner"
              style={
                provider.logo
                  ? { backgroundImage: `url(${provider.logo})` }
                  : undefined
              }
            >
              {!provider.logo && (provider.businessName?.charAt(0) || 'P')}
            </div>
          </div>

          <div className="provider-identity-main">
            <h1 className="provider-name">{provider.businessName}</h1>
            <div className="provider-identity-meta">
              {totalReviews > 0 ? (
                <span className="provider-rating">
                  <i className="pi pi-star-fill" />
                  <strong>{avgRating.toFixed(1)}</strong>
                  <span className="provider-review-count">
                    ({totalReviews} review{totalReviews === 1 ? '' : 's'})
                  </span>
                </span>
              ) : (
                <span className="provider-badge">
                  <i className="pi pi-sparkles" />
                  New
                </span>
              )}
              {provider.isVerified && (
                <span className="provider-badge provider-badge--verified">
                  <i className="pi pi-verified" />
                  Verified
                </span>
              )}
              {provider.city && (
                <span className="provider-badge">
                  <i className="pi pi-map-marker" />
                  {provider.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="provider-stats">
          <div className="provider-stat">
            <div className="provider-stat-icon"><i className="pi pi-briefcase" /></div>
            <div>
              <p className="provider-stat-label">Services</p>
              <p className="provider-stat-value">{services.length}</p>
            </div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-icon"><i className="pi pi-star-fill" /></div>
            <div>
              <p className="provider-stat-label">Rating</p>
              <p className="provider-stat-value">{avgRating ? avgRating.toFixed(1) : '—'}</p>
            </div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-icon"><i className="pi pi-comment" /></div>
            <div>
              <p className="provider-stat-label">Reviews</p>
              <p className="provider-stat-value">{totalReviews}</p>
            </div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-icon"><i className="pi pi-calendar" /></div>
            <div>
              <p className="provider-stat-label">On platform since</p>
              <p className="provider-stat-value">
                {provider.createdAt
                  ? new Date(provider.createdAt).getFullYear()
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid">
          {/* Sidebar */}
          <div className="col-12 lg:col-4">
            <div className="provider-sidebar">
              <div className="provider-sidebar-section">
                <p className="provider-sidebar-title">Contact</p>
                {provider.phone && (
                  <div className="provider-contact-row">
                    <div className="provider-contact-icon"><i className="pi pi-phone" /></div>
                    <div>
                      <span className="provider-contact-label">Phone</span>
                      <p className="provider-contact-value">{provider.phone}</p>
                    </div>
                  </div>
                )}
                {provider.email && (
                  <div className="provider-contact-row">
                    <div className="provider-contact-icon"><i className="pi pi-envelope" /></div>
                    <div>
                      <span className="provider-contact-label">Email</span>
                      <p className="provider-contact-value">
                        <a href={`mailto:${provider.email}`}>{provider.email}</a>
                      </p>
                    </div>
                  </div>
                )}
                {provider.website && (
                  <div className="provider-contact-row">
                    <div className="provider-contact-icon"><i className="pi pi-globe" /></div>
                    <div>
                      <span className="provider-contact-label">Website</span>
                      <p className="provider-contact-value">
                        <a href={provider.website} target="_blank" rel="noopener noreferrer">
                          Visit site <i className="pi pi-external-link text-xs" />
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(provider.address || provider.city || provider.governorate) && (
                <div className="provider-sidebar-section">
                  <p className="provider-sidebar-title">Location</p>
                  <div className="provider-contact-row">
                    <div className="provider-contact-icon"><i className="pi pi-map-marker" /></div>
                    <div>
                      <span className="provider-contact-label">Address</span>
                      <p className="provider-contact-value">
                        {[provider.address, provider.city, provider.governorate]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="provider-sidebar-section">
                <Button
                  label="Send a message"
                  icon="pi pi-comments"
                  className="w-full"
                  onClick={handleContact}
                />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="col-12 lg:col-8">
            <div className="provider-main">
              <TabView>
                <TabPanel header="About">
                  <h3 className="provider-about-title">About {provider.businessName}</h3>
                  {provider.description ? (
                    <p className="provider-about-text">{provider.description}</p>
                  ) : (
                    <div className="service-empty">
                      <i className="pi pi-align-left" />
                      <p>No description provided.</p>
                    </div>
                  )}
                </TabPanel>

                <TabPanel header={`Services (${services.length})`}>
                  {services.length > 0 ? (
                    <div className="grid">
                      {services.map((service) => (
                        <div key={service.id} className="col-12 md:col-6">
                          <Link
                            to={`/services/${service.id}`}
                            className="provider-service-card"
                          >
                            <div
                              className="provider-service-image"
                              style={
                                service.images?.[0]?.url
                                  ? { backgroundImage: `url(${service.images[0].url})` }
                                  : undefined
                              }
                            >
                              {!service.images?.[0]?.url && (
                                <div className="provider-service-image-empty">
                                  <i className="pi pi-image" />
                                </div>
                              )}
                            </div>
                            <div className="provider-service-body">
                              {service.category?.name && (
                                <span className="provider-service-chip">
                                  {service.category.name}
                                </span>
                              )}
                              <h4 className="provider-service-name">{service.name}</h4>
                              <div className="provider-service-footer">
                                <span className="provider-service-rating">
                                  <Rating
                                    value={Number(service.avgRating) || 0}
                                    readOnly
                                    cancel={false}
                                    stars={5}
                                  />
                                  ({service.reviewCount || 0})
                                </span>
                                <span className="provider-service-price">
                                  {Number(service.basePrice ?? 0).toLocaleString()} TND
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="service-empty">
                      <i className="pi pi-briefcase" />
                      <p>No services available yet.</p>
                    </div>
                  )}
                </TabPanel>

                <TabPanel header={`Reviews (${totalReviews})`}>
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
                                  {review.service?.name && `${review.service.name} · `}
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
        </div>
      </div>
    </div>
  );
}
