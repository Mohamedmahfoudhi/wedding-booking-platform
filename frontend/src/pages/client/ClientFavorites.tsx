import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { favoritesApi } from '../../api/client';
import { Service } from '../../types';

export default function ClientFavorites() {
  const toast = useRef<Toast>(null);
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getAll();
      const items = response.data.data?.favorites || [];
      const services: Service[] = items.map((f: any) => f.service || f);
      setFavorites(services);
    } catch (error) {
      console.error('Failed to load favorites', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load favorites',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (service: Service) => {
    confirmDialog({
      message: `Remove "${service.name}" from favorites?`,
      header: 'Remove favorite',
      icon: 'pi pi-heart',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await favoritesApi.remove(service.id);
          setFavorites((prev) => prev.filter((f) => f.id !== service.id));
          toast.current?.show({
            severity: 'info',
            summary: 'Removed',
            detail: 'Service removed from favorites',
          });
        } catch {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove from favorites',
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="surface-ground min-h-screen">
        <div className="dashboard-hero dashboard-hero--compact">
          <div className="container">
            <Skeleton width="120px" height="1rem" className="mb-2" />
            <Skeleton width="220px" height="1.875rem" />
          </div>
        </div>
        <div className="container py-4 dashboard-content">
          <div className="grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 md:col-6 lg:col-3">
                <Skeleton height="300px" style={{ borderRadius: 12 }} />
              </div>
            ))}
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
          <h1 className="dashboard-hero-title">My Favorites</h1>
          <div className="dashboard-hero-row">
            <span className="dashboard-hero-chip">
              <i className="pi pi-heart-fill" />
              {favorites.length} saved
            </span>
          </div>
        </div>
      </div>

      <div className="container py-4 dashboard-content">
        {favorites.length === 0 ? (
          <div className="dashboard-panel">
            <div className="dashboard-empty" style={{ padding: '3rem 1rem' }}>
              <div className="dashboard-empty-icon">
                <i className="pi pi-heart" />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
                No favorites yet
              </h3>
              <p>Start saving services you love to find them easily later.</p>
              <Link to="/search">
                <Button label="Browse services" icon="pi pi-search" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid">
            {favorites.map((service) => (
              <div key={service.id} className="col-12 md:col-6 lg:col-3">
                <div className="favorite-card-wrapper">
                  <Button
                    icon="pi pi-heart-fill"
                    className="favorite-remove-btn p-button-rounded p-button-danger"
                    tooltip="Remove from favorites"
                    tooltipOptions={{ position: 'left' }}
                    onClick={() => handleRemoveFavorite(service)}
                  />
                  <Link to={`/services/${service.id}`} className="provider-service-card">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
