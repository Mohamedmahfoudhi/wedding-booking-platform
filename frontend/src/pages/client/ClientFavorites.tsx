import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
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
      setFavorites(response.data.data || response.data);
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
      header: 'Remove Favorite',
      icon: 'pi pi-heart',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await favoritesApi.remove(service.id);
          setFavorites(favorites.filter((f) => f.id !== service.id));
          toast.current?.show({
            severity: 'info',
            summary: 'Removed',
            detail: 'Service removed from favorites',
          });
        } catch (error) {
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
      <div className="surface-ground min-h-screen p-4">
        <div className="container">
          <Skeleton width="200px" height="2rem" className="mb-4" />
          <div className="grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 md:col-6 lg:col-3">
                <Card>
                  <Skeleton height="150px" className="mb-3" />
                  <Skeleton width="70%" className="mb-2" />
                  <Skeleton width="50%" />
                </Card>
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

      <div className="container py-4">
        <h1 className="text-3xl font-bold mb-4">My Favorites</h1>

        {favorites.length === 0 ? (
          <Card className="text-center py-6">
            <i className="pi pi-heart text-5xl text-color-secondary mb-4" />
            <h3 className="text-xl mb-3">No favorites yet</h3>
            <p className="text-color-secondary mb-4">
              Start adding services to your favorites to easily find them later
            </p>
            <Link to="/search">
              <Button label="Browse Services" icon="pi pi-search" />
            </Link>
          </Card>
        ) : (
          <div className="grid">
            {favorites.map((service) => (
              <div key={service.id} className="col-12 md:col-6 lg:col-3">
                <Card className="h-full">
                  <div className="relative">
                    <div
                      className="border-round mb-3"
                      style={{
                        backgroundImage: `url(${service.images?.[0]?.url || '/placeholder-service.jpg'})`,
                        height: '180px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <Button
                      icon="pi pi-heart-fill"
                      className="p-button-rounded p-button-danger absolute"
                      style={{ top: '8px', right: '8px' }}
                      onClick={() => handleRemoveFavorite(service)}
                    />
                  </div>

                  <Link to={`/services/${service.id}`} className="no-underline">
                    <span className="text-xs surface-200 border-round px-2 py-1 mb-2 inline-block">
                      {service.category?.name}
                    </span>
                    <h3 className="text-lg font-semibold mb-2 text-color">{service.name}</h3>
                  </Link>

                  <p className="text-color-secondary text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex align-items-center justify-content-between mb-3">
                    <div className="flex align-items-center gap-1">
                      <Rating value={service.avgRating || 0} readOnly cancel={false} stars={5} />
                      <span className="text-xs text-color-secondary">
                        ({service.reviewCount || 0})
                      </span>
                    </div>
                    <span className="font-bold text-primary">{service.basePrice} TND</span>
                  </div>

                  <Link to={`/services/${service.id}`} className="w-full no-underline">
                    <Button
                      label="View Details"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      className="w-full p-button-outlined"
                    />
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
